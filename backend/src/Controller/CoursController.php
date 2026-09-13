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
use Symfony\Contracts\HttpClient\HttpClientInterface;

#[Route('/api/cours')]
class CoursController extends AbstractController
{
    private const DEBUG_MODE = true;

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
        private HttpClientInterface $httpClient,
    ) {}

    /**
     * Génère une description de cours avec OpenRouter (IA gratuite)
     * La description est générée selon le TITRE + la LANGUE du cours
     */
    #[Route('/generer-description', name: 'cours_generer_description', methods: ['POST'])]
    #[IsGranted('ROLE_MEDECIN')]
    public function genererDescription(Request $request): JsonResponse
    {
        try {
            $data = json_decode($request->getContent(), true);

            if (!is_array($data)) {
                return $this->json(['error' => 'Données invalides.'], 400);
            }

            $titre = trim($data['titre'] ?? '');
            $langue = trim($data['langueCours'] ?? '');

            // Titre et langue sont OBLIGATOIRES
            if ($titre === '') {
                return $this->json(['error' => 'Le titre du cours est requis pour générer une description.'], 400);
            }

            if ($langue === '') {
                return $this->json(['error' => 'La langue du cours est requise pour générer une description.'], 400);
            }

            $niveau = $data['niveauCours'] ?? null;
            $duree  = $data['duree'] ?? null;

            $apiKey = $_ENV['OPENROUTER_API_KEY'] ?? null;
            if (!$apiKey) {
                return $this->json(['error' => 'Clé API OpenRouter non configurée sur le serveur.'], 500);
            }

            // Prompt fort qui force la langue
            $prompt = "Tu es un expert médical et pédagogue expérimenté.\n\n";
            $prompt .= "Génère une description concise, professionnelle et engageante (2 à 4 phrases maximum) pour un cours médical.\n\n";
            $prompt .= "Titre du cours : « {$titre} »\n";
            $prompt .= "Langue OBLIGATOIRE de la description : {$langue}\n";

            if ($niveau) {
                $prompt .= "Niveau : {$niveau}\n";
            }
            if ($duree) {
                $prompt .= "Durée approximative : {$duree} minutes\n";
            }

            $prompt .= "\nRègles strictes :\n";
            $prompt .= "- La description DOIT être entièrement rédigée en {$langue}.\n";
            $prompt .= "- Elle doit être claire, informative et adaptée à des patients ou des professionnels de santé.\n";
            $prompt .= "- Aucun markdown, aucun titre, aucune introduction, aucune conclusion.\n";
            $prompt .= "- Réponds uniquement avec le texte de la description.";

            $response = $this->httpClient->request('POST', 'https://openrouter.ai/api/v1/chat/completions', [
                'headers' => [
                    'Authorization' => 'Bearer ' . $apiKey,
                    'Content-Type'  => 'application/json',
                    'HTTP-Referer'  => 'http://localhost:5173',
                    'X-Title'       => 'Tbibna - Génération description cours',
                ],
                'json' => [
                    'model' => 'openrouter/free',
                    'messages' => [
                        [
                            'role' => 'system',
                            'content' => "Tu es un assistant spécialisé dans la rédaction de contenus pédagogiques médicaux. Tu réponds UNIQUEMENT avec le texte de la description dans la langue demandée, sans aucun autre texte.",
                        ],
                        [
                            'role' => 'user',
                            'content' => $prompt,
                        ],
                    ],
                    'temperature' => 0.7,
                    'max_tokens'  => 400,
                ],
                'timeout' => 45,
            ]);

            $statusCode = $response->getStatusCode();
            $body = $response->toArray(false);

            if ($statusCode !== 200) {
                $rawMessage = $body['error']['message'] ?? ($body['message'] ?? 'Erreur inconnue de l\'API OpenRouter');

                if ($statusCode === 402 || stripos($rawMessage, 'insufficient') !== false || stripos($rawMessage, 'credits') !== false) {
                    return $this->json([
                        'error' => 'Crédits OpenRouter insuffisants ou limite gratuite atteinte. Réessayez plus tard.'
                    ], 402);
                }

                if ($statusCode === 401) {
                    return $this->json(['error' => 'Clé API OpenRouter invalide ou expirée.'], 401);
                }

                if ($statusCode === 429) {
                    return $this->json(['error' => 'Trop de requêtes. Attendez quelques secondes et réessayez.'], 429);
                }

                return $this->json(['error' => 'Erreur IA : ' . $rawMessage], 502);
            }

            $description = trim($body['choices'][0]['message']['content'] ?? '');

            if ($description === '') {
                return $this->json(['error' => 'Aucune description générée par l\'IA.'], 502);
            }

            return $this->json([
                'description' => $description,
            ]);
        } catch (\Throwable $e) {
            return $this->handleException($e);
        }
    }

    #[Route('', name: 'cours_create', methods: ['POST'])]
    #[IsGranted('ROLE_MEDECIN')]
    public function create(Request $request): JsonResponse
    {
        try {
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
            $cours->setStatut('en_attente');

            $this->dm->persist($cours);
            $this->dm->flush();

            return $this->json([
                'message' => 'Cours ajouté avec succès. Il sera visible après validation par un administrateur.',
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
                    'statut' => $cours->getStatut(),
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
                'statut' => $c->getStatut(),
                'dateCreation' => $c->getDateCreation()?->format('Y-m-d H:i'),
            ], $coursList);

            return $this->json($result);
        } catch (\Throwable $e) {
            return $this->handleException($e);
        }
    }

    #[Route('/public', name: 'cours_public_list', methods: ['GET'])]
    public function publicList(): JsonResponse
    {
        try {
            $coursList = $this->coursRepository->findBy(
                ['statut' => 'approuve'],
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

    #[Route('/admin/en-attente', name: 'cours_admin_pending', methods: ['GET'])]
    #[IsGranted('ROLE_ADMIN')]
    public function adminPending(): JsonResponse
    {
        try {
            $coursList = $this->coursRepository->findBy(
                ['statut' => 'en_attente'],
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
                'statut' => $c->getStatut(),
                'dateCreation' => $c->getDateCreation()?->format('Y-m-d H:i'),
                'medecin' => $c->getMedecin() ? [
                    'id' => $c->getMedecin()->getId(),
                ] : null,
            ], $coursList);

            return $this->json($result);
        } catch (\Throwable $e) {
            return $this->handleException($e);
        }
    }

    #[Route('/{id}/approuver', name: 'cours_approve', methods: ['POST'])]
    #[IsGranted('ROLE_ADMIN')]
    public function approve(string $id): JsonResponse
    {
        try {
            $cours = $this->coursRepository->find($id);
            if (!$cours) {
                return $this->json(['error' => 'Cours introuvable.'], 404);
            }

            $cours->setStatut('approuve');
            $this->dm->flush();

            return $this->json(['message' => 'Cours approuvé avec succès.']);
        } catch (\Throwable $e) {
            return $this->handleException($e);
        }
    }

    #[Route('/{id}/rejeter', name: 'cours_reject', methods: ['POST'])]
    #[IsGranted('ROLE_ADMIN')]
    public function reject(string $id): JsonResponse
    {
        try {
            $cours = $this->coursRepository->find($id);
            if (!$cours) {
                return $this->json(['error' => 'Cours introuvable.'], 404);
            }

            $cours->setStatut('rejete');
            $this->dm->flush();

            return $this->json(['message' => 'Cours rejeté.']);
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

            if ($cours->getStatut() === 'approuve') {
                return $this->json(['error' => 'Un cours déjà approuvé ne peut plus être modifié.'], 400);
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

            if ($cours->getStatut() === 'rejete') {
                $cours->setStatut('en_attente');
            }

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