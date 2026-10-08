<?php

namespace App\Controller;

use App\Document\Examen;
use App\Document\User;
use App\Repository\ExamenRepository;
use Doctrine\ODM\MongoDB\DocumentManager;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[Route('/api/examens')]
class ExamenController extends AbstractController
{
    public function __construct(
        private DocumentManager $dm,
        private ExamenRepository $examenRepository
    ) {}

    // ========== ÉTUDIANT : liste des examens publiés ==========
    #[Route('/publies', name: 'examen_list_publies', methods: ['GET'])]
    #[IsGranted('ROLE_ETUDIANT')]
    public function listPublished(): JsonResponse
    {
        $examens = $this->examenRepository->findPublished();

        $data = array_map(fn(Examen $e) => [
            'id' => $e->getId(),
            'titre' => $e->getTitre(),
            'instructions' => $e->getInstructions(),
            'duree' => $e->getDuree(),
            'pointsTotaux' => $e->getPointsTotaux(),
            'pointsDePassage' => $e->getPointsDePassage(),
            'statut' => $e->getStatut(),
            'dateCreation' => $e->getDateCreation()?->format('Y-m-d H:i'),
            'questionsCount' => count($e->getQuestions()),
        ], $examens);

        return $this->json($data);
    }

    // ========== MÉDECIN : liste de ses examens ==========
    #[Route('', name: 'examen_list_medecin', methods: ['GET'])]
    #[IsGranted('ROLE_MEDECIN')]
    public function listForMedecin(): JsonResponse
    {
        /** @var User $user */
        $user = $this->getUser();
        $examens = $this->examenRepository->findByMedecin($user->getId());

        $data = array_map(fn(Examen $e) => [
            'id' => $e->getId(),
            'titre' => $e->getTitre(),
            'instructions' => $e->getInstructions(),
            'duree' => $e->getDuree(),
            'pointsTotaux' => $e->getPointsTotaux(),
            'pointsDePassage' => $e->getPointsDePassage(),
            'statut' => $e->getStatut(),
            'dateCreation' => $e->getDateCreation()?->format('Y-m-d H:i'),
            'questionsCount' => count($e->getQuestions()),
        ], $examens);

        return $this->json($data);
    }

    // ========== MÉDECIN : création ==========
    #[Route('', name: 'examen_create', methods: ['POST'])]
    #[IsGranted('ROLE_MEDECIN')]
    public function create(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);
        /** @var User $user */
        $user = $this->getUser();

        if (empty($data['titre']) || empty($data['duree'])) {
            return $this->json(['error' => 'Titre et durée sont obligatoires'], 400);
        }

        $examen = new Examen();
        $examen->setTitre($data['titre']);
        $examen->setInstructions($data['instructions'] ?? null);
        $examen->setDuree((int) $data['duree']);
        $examen->setPointsTotaux((int) ($data['pointsTotaux'] ?? 20));
        $examen->setPointsDePassage((int) ($data['pointsDePassage'] ?? 10));
        $examen->setMedecinId($user->getId());
        
        // STATUT TOUJOURS FORCÉ À "brouillon"
        $examen->setStatut('brouillon');
        
        $examen->setQuestions($data['questions'] ?? []);

        $this->dm->persist($examen);
        $this->dm->flush();

        return $this->json([
            'id' => $examen->getId(),
            'message' => 'Examen créé avec succès. Il est en attente de validation par un administrateur.',
            'statut' => $examen->getStatut(),
        ], 201);
    }

    // ========== MÉDECIN : détail d’un examen ==========
    #[Route('/{id}', name: 'examen_show', methods: ['GET'])]
    #[IsGranted('ROLE_MEDECIN')]
    public function show(string $id): JsonResponse
    {
        $examen = $this->examenRepository->find($id);
        if (!$examen) {
            return $this->json(['error' => 'Examen introuvable'], 404);
        }

        /** @var User $user */
        $user = $this->getUser();

        if ($examen->getMedecinId() !== $user->getId()) {
            return $this->json(['error' => 'Accès refusé'], 403);
        }

        return $this->json([
            'id' => $examen->getId(),
            'titre' => $examen->getTitre(),
            'instructions' => $examen->getInstructions(),
            'duree' => $examen->getDuree(),
            'pointsTotaux' => $examen->getPointsTotaux(),
            'pointsDePassage' => $examen->getPointsDePassage(),
            'statut' => $examen->getStatut(),
            'questions' => $examen->getQuestions(),
            'dateCreation' => $examen->getDateCreation()?->format('Y-m-d H:i'),
        ]);
    }
}