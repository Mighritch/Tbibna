<?php

namespace App\Controller;

use App\Entity\User;
use App\Document\Cours;
use App\Repository\CoursRepository;
use App\Repository\MedecinRepository;
use Doctrine\ODM\MongoDB\DocumentManager;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[Route('/api/cours')]
class CoursController extends AbstractController
{
    public function __construct(
        private DocumentManager $dm,
        private CoursRepository $coursRepository,
        private MedecinRepository $medecinRepository,
    ) {}

    // =====================================================
    // Ajouter un cours (réservé au médecin connecté)
    // =====================================================
    #[Route('', name: 'cours_create', methods: ['POST'])]
    #[IsGranted('ROLE_MEDECIN')]
    public function create(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        // Validation basique des champs requis
        $requiredFields = ['titre', 'description', 'duree', 'langueCours', 'contenuCours', 'niveauCours'];
        foreach ($requiredFields as $field) {
            if (empty($data[$field]) && $data[$field] !== 0) {
                return $this->json(['error' => "Le champ '$field' est requis."], 400);
            }
        }

        // Récupérer le profil Médecin lié à l'utilisateur connecté
        /** @var User $user */
        $user = $this->getUser();
        $medecin = $this->medecinRepository->findOneBy(['utilisateur' => $user->getId()]);

        if (!$medecin) {
            return $this->json(['error' => 'Profil médecin introuvable.'], 404);
        }

        $cours = new Cours();
        $cours->setTitre($data['titre']);
        $cours->setDescription($data['description']);
        $cours->setDuree((int) $data['duree']);
        $cours->setLangueCours($data['langueCours']);
        $cours->setContenuCours($data['contenuCours']);
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
                'dateCreation' => $cours->getDateCreation()->format('Y-m-d H:i'),
            ],
        ], 201);
    }

    // =====================================================
    // Lister les cours du médecin connecté
    // =====================================================
    #[Route('/mes-cours', name: 'cours_mes_cours', methods: ['GET'])]
    #[IsGranted('ROLE_MEDECIN')]
    public function mesCours(): JsonResponse
    {
        /** @var User $user */
        $user = $this->getUser();
        $medecin = $this->medecinRepository->findOneBy(['utilisateur' => $user->getId()]);

        if (!$medecin) {
            return $this->json(['error' => 'Profil médecin introuvable.'], 404);
        }

        $coursList = $this->coursRepository->findBy(['medecin' => $medecin->getId()]);

        $result = array_map(fn(Cours $c) => [
            'id' => $c->getId(),
            'titre' => $c->getTitre(),
            'description' => $c->getDescription(),
            'duree' => $c->getDuree(),
            'langueCours' => $c->getLangueCours(),
            'niveauCours' => $c->getNiveauCours(),
            'dateCreation' => $c->getDateCreation()?->format('Y-m-d H:i'),
        ], $coursList);

        return $this->json($result);
    }

    // =====================================================
    // Modifier un cours (uniquement le médecin propriétaire)
    // =====================================================
    #[Route('/{id}', name: 'cours_update', methods: ['PUT'])]
    #[IsGranted('ROLE_MEDECIN')]
    public function update(string $id, Request $request): JsonResponse
    {
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

        if (isset($data['titre'])) $cours->setTitre($data['titre']);
        if (isset($data['description'])) $cours->setDescription($data['description']);
        if (isset($data['duree'])) $cours->setDuree((int) $data['duree']);
        if (isset($data['langueCours'])) $cours->setLangueCours($data['langueCours']);
        if (isset($data['contenuCours'])) $cours->setContenuCours($data['contenuCours']);
        if (isset($data['niveauCours'])) $cours->setNiveauCours($data['niveauCours']);

        $this->dm->flush();

        return $this->json(['message' => 'Cours mis à jour avec succès.']);
    }

    // =====================================================
    // Supprimer un cours (uniquement le médecin propriétaire)
    // =====================================================
    #[Route('/{id}', name: 'cours_delete', methods: ['DELETE'])]
    #[IsGranted('ROLE_MEDECIN')]
    public function delete(string $id): JsonResponse
    {
        $cours = $this->coursRepository->find($id);
        if (!$cours) {
            return $this->json(['error' => 'Cours introuvable.'], 404);
        }

        /** @var User $user */
        $user = $this->getUser();
        if ($cours->getMedecin()?->getUtilisateur()?->getId() !== $user->getId()) {
            return $this->json(['error' => 'Accès refusé.'], 403);
        }

        $this->dm->remove($cours);
        $this->dm->flush();

        return $this->json(['message' => 'Cours supprimé avec succès.']);
    }
}