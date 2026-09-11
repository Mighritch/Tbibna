<?php

namespace App\Controller;

use App\Document\Cours;
use App\Document\User;
use App\Repository\CoursRepository;
use App\Repository\MedecinRepository;
use Doctrine\ODM\MongoDB\DocumentManager;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\File\Exception\FileException;
use Symfony\Component\HttpFoundation\File\UploadedFile;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;
use Symfony\Component\String\Slugger\SluggerInterface;

#[Route('/api/cours')]
class CoursController extends AbstractController
{
    // Passe à false une fois le bug corrigé et confirmé
    private const DEBUG_MODE = true;

    // Extensions et types MIME acceptés pour le contenu du cours
    private const ALLOWED_MIME_TYPES = [
        'application/pdf' => 'pdf',
        'application/msword' => 'word',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document' => 'word',
        'video/mp4' => 'video',
        'video/quicktime' => 'video',
        'video/x-msvideo' => 'video',
        'video/x-matroska' => 'video',
        'video/webm' => 'video',
    ];

    private const MAX_FILE_SIZE = 200 * 1024 * 1024; // 200 Mo

    public function __construct(
        private DocumentManager $dm,
        private CoursRepository $coursRepository,
        private MedecinRepository $medecinRepository,
        private SluggerInterface $slugger,
    ) {}

    #[Route('', name: 'cours_create', methods: ['POST'])]
    #[IsGranted('ROLE_MEDECIN')]
    public function create(Request $request): JsonResponse
    {
        try {
            // Les champs texte arrivent maintenant via multipart/form-data,
            // pas en JSON, puisqu'un fichier est envoyé en même temps.
            $data = $request->request->all();

            $required = ['titre', 'description', 'duree', 'langueCours', 'niveauCours'];
            foreach ($required as $field) {
                if (!isset($data[$field]) || $data[$field] === '' || $data[$field] === null) {
                    return $this->json(['error' => "Le champ '$field' est requis."], 400);
                }
            }

            /** @var UploadedFile|null $fichier */
            $fichier = $request->files->get('contenuFichier');

            if (!$fichier) {
                return $this->json(['error' => 'Le contenu du cours (PDF, Word ou vidéo) est requis.'], 400);
            }

            if (!$fichier->isValid()) {
                return $this->json(['error' => 'Le fichier envoyé est invalide ou incomplet.'], 400);
            }

            if ($fichier->getSize() > self::MAX_FILE_SIZE) {
                return $this->json(['error' => 'Le fichier dépasse la taille maximale autorisée (200 Mo).'], 400);
            }

            $mimeType = $fichier->getMimeType();
            if (!isset(self::ALLOWED_MIME_TYPES[$mimeType])) {
                return $this->json([
                    'error' => 'Format de fichier non supporté. Utilisez un PDF, un document Word ou une vidéo.',
                ], 400);
            }

            $typeContenu = self::ALLOWED_MIME_TYPES[$mimeType];

            /** @var User $user */
            $user = $this->getUser();
            $medecin = $this->medecinRepository->findOneBy(['utilisateur' => $user->getId()]);

            if (!$medecin) {
                return $this->json(['error' => 'Profil médecin introuvable.'], 404);
            }

            // Stockage du fichier sur le disque, dans public/uploads/cours
            $uploadDir = $this->getParameter('kernel.project_dir') . '/public/uploads/cours';
            if (!is_dir($uploadDir)) {
                mkdir($uploadDir, 0775, true);
            }

            $originalFilename = pathinfo($fichier->getClientOriginalName(), PATHINFO_FILENAME);
            $safeFilename = $this->slugger->slug($originalFilename);
            $newFilename = $safeFilename . '-' . uniqid() . '.' . $fichier->guessExtension();

            try {
                $fichier->move($uploadDir, $newFilename);
            } catch (FileException $e) {
                return $this->json(['error' => "Impossible d'enregistrer le fichier."], 500);
            }

            $cours = new Cours();
            $cours->setTitre(trim($data['titre']));
            $cours->setDescription(trim($data['description']));
            $cours->setDuree((int) $data['duree']);
            $cours->setLangueCours($data['langueCours']);
            $cours->setContenuCours('/uploads/cours/' . $newFilename);
            $cours->setNomOriginalFichier($fichier->getClientOriginalName());
            $cours->setTypeContenu($typeContenu);
            $cours->setNiveauCours($data['niveauCours']);
            $cours->setMedecin($medecin);

            $this->dm->persist($cours);
            $this->dm->flush();

            return $this->json([
                'message' => 'Cours ajouté avec succès.',
                'cours' => [
                    'id' => $cours->getId(),
                    'titre' => $cours->getTitre(),
                    'description' => $cours->getDescription(),
                    'duree' => $cours->getDuree(),
                    'langueCours' => $cours->getLangueCours(),
                    'niveauCours' => $cours->getNiveauCours(),
                    'contenuCours' => $cours->getContenuCours(),
                    'nomOriginalFichier' => $cours->getNomOriginalFichier(),
                    'typeContenu' => $cours->getTypeContenu(),
                    'dateCreation' => $cours->getDateCreation()?->format('Y-m-d H:i'),
                ],
            ], 201);
        } catch (\Throwable $e) {
            return $this->handleException($e);
        }
    }

    #[Route('/mes-cours', name: 'cours_mes_cours', methods: ['GET'])]
    #[IsGranted('ROLE_MEDECIN')]
    public function mesCours(): JsonResponse
    {
        try {
            /** @var User $user */
            $user = $this->getUser();

            if (!$user) {
                return $this->json(['error' => 'Utilisateur non authentifié.'], 401);
            }

            $medecin = $this->medecinRepository->findOneBy(['utilisateur' => $user->getId()]);

            if (!$medecin) {
                return $this->json(['error' => 'Profil médecin introuvable.'], 404);
            }

            $coursList = $this->coursRepository->findBy(
              ['medecin' => $medecin],
              ['dateCreation' => 'DESC']
            );

            $result = array_map(static fn(Cours $c) => [
                'id' => $c->getId(),
                'titre' => $c->getTitre(),
                'description' => $c->getDescription(),
                'duree' => $c->getDuree(),
                'langueCours' => $c->getLangueCours(),
                'niveauCours' => $c->getNiveauCours(),
                'contenuCours' => $c->getContenuCours(),
                'nomOriginalFichier' => $c->getNomOriginalFichier(),
                'typeContenu' => $c->getTypeContenu(),
                'dateCreation' => $c->getDateCreation()?->format('Y-m-d H:i'),
            ], $coursList);

            return $this->json($result);
        } catch (\Throwable $e) {
            return $this->handleException($e);
        }
    }

    #[Route('/{id}', name: 'cours_update', methods: ['PUT'])]
    #[IsGranted('ROLE_MEDECIN')]
    public function update(string $id, Request $request): JsonResponse
    {
        try {
            $cours = $this->coursRepository->find($id);
            if (!$cours) {
                return $this->json(['error' => 'Cours introuvable.'], 404);
            }

            /** @var User $user */
            $user = $this->getUser();
            if ($cours->getMedecin()?->getUtilisateur()?->getId() !== $user->getId()) {
                return $this->json(['error' => 'Accès refusé.'], 403);
            }

            $data = json_decode($request->getContent(), true);
            if (!is_array($data)) {
                return $this->json(['error' => 'JSON invalide'], 400);
            }

            if (isset($data['titre'])) $cours->setTitre(trim($data['titre']));
            if (isset($data['description'])) $cours->setDescription(trim($data['description']));
            if (isset($data['duree'])) $cours->setDuree((int) $data['duree']);
            if (isset($data['langueCours'])) $cours->setLangueCours($data['langueCours']);
            if (isset($data['niveauCours'])) $cours->setNiveauCours($data['niveauCours']);

            $this->dm->flush();

            return $this->json(['message' => 'Cours mis à jour avec succès.']);
        } catch (\Throwable $e) {
            return $this->handleException($e);
        }
    }

    #[Route('/{id}', name: 'cours_delete', methods: ['DELETE'])]
    #[IsGranted('ROLE_MEDECIN')]
    public function delete(string $id): JsonResponse
    {
        try {
            $cours = $this->coursRepository->find($id);
            if (!$cours) {
                return $this->json(['error' => 'Cours introuvable.'], 404);
            }

            /** @var User $user */
            $user = $this->getUser();
            if ($cours->getMedecin()?->getUtilisateur()?->getId() !== $user->getId()) {
                return $this->json(['error' => 'Accès refusé.'], 403);
            }

            // Supprime aussi le fichier physique associé, s'il existe
            $filePath = $this->getParameter('kernel.project_dir') . '/public' . $cours->getContenuCours();
            if ($cours->getContenuCours() && file_exists($filePath)) {
                @unlink($filePath);
            }

            $this->dm->remove($cours);
            $this->dm->flush();

            return $this->json(['message' => 'Cours supprimé avec succès.']);
        } catch (\Throwable $e) {
            return $this->handleException($e);
        }
    }

    private function handleException(\Throwable $e): JsonResponse
    {
        if (self::DEBUG_MODE) {
            return $this->json([
                'error' => 'Erreur serveur',
                'exception' => get_class($e),
                'message' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => explode("\n", $e->getTraceAsString()),
            ], 500);
        }

        return $this->json(['error' => 'Une erreur interne est survenue.'], 500);
    }
}