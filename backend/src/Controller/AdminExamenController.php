<?php

namespace App\Controller;

use App\Document\Examen;
use App\Repository\ExamenRepository;
use Doctrine\ODM\MongoDB\DocumentManager;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[Route('/api/admin/examens')]
#[IsGranted('ROLE_ADMIN')]
class AdminExamenController extends AbstractController
{
    public function __construct(
        private DocumentManager $dm,
        private ExamenRepository $examenRepository
    ) {}

    /**
     * Liste de tous les examens (pour l'admin)
     */
    #[Route('', name: 'admin_examen_list', methods: ['GET'])]
    public function list(): JsonResponse
    {
        $examens = $this->examenRepository->findAllOrdered();

        $data = array_map(fn(Examen $e) => [
            'id' => $e->getId(),
            'titre' => $e->getTitre(),
            'instructions' => $e->getInstructions(),
            'duree' => $e->getDuree(),
            'pointsTotaux' => $e->getPointsTotaux(),
            'pointsDePassage' => $e->getPointsDePassage(),
            'statut' => $e->getStatut(),
            'medecinId' => $e->getMedecinId(),
            'dateCreation' => $e->getDateCreation()?->format('Y-m-d H:i'),
            'dateModification' => $e->getDateModification()?->format('Y-m-d H:i'),
            'questionsCount' => count($e->getQuestions()),
        ], $examens);

        return $this->json($data);
    }

    /**
     * Voir un examen en détail
     */
    #[Route('/{id}', name: 'admin_examen_show', methods: ['GET'])]
    public function show(string $id): JsonResponse
    {
        $examen = $this->examenRepository->find($id);

        if (!$examen) {
            return $this->json(['error' => 'Examen introuvable'], 404);
        }

        return $this->json([
            'id' => $examen->getId(),
            'titre' => $examen->getTitre(),
            'instructions' => $examen->getInstructions(),
            'duree' => $examen->getDuree(),
            'pointsTotaux' => $examen->getPointsTotaux(),
            'pointsDePassage' => $examen->getPointsDePassage(),
            'statut' => $examen->getStatut(),
            'medecinId' => $examen->getMedecinId(),
            'questions' => $examen->getQuestions(),
            'dateCreation' => $examen->getDateCreation()?->format('Y-m-d H:i'),
            'dateModification' => $examen->getDateModification()?->format('Y-m-d H:i'),
        ]);
    }

    /**
     * Approuver / publier un examen
     */
    #[Route('/{id}/approve', name: 'admin_examen_approve', methods: ['PATCH'])]
    public function approve(string $id): JsonResponse
    {
        $examen = $this->examenRepository->find($id);

        if (!$examen) {
            return $this->json(['error' => 'Examen introuvable'], 404);
        }

        if ($examen->getStatut() === 'publié') {
            return $this->json(['message' => 'Cet examen est déjà publié'], 200);
        }

        $examen->setStatut('publié');
        $examen->setDateModification(new \DateTimeImmutable());
        $this->dm->flush();

        return $this->json([
            'id' => $examen->getId(),
            'statut' => $examen->getStatut(),
            'message' => 'Examen publié avec succès',
        ]);
    }

    /**
     * Rejeter / archiver un examen
     */
    #[Route('/{id}/reject', name: 'admin_examen_reject', methods: ['PATCH'])]
    public function reject(string $id): JsonResponse
    {
        $examen = $this->examenRepository->find($id);

        if (!$examen) {
            return $this->json(['error' => 'Examen introuvable'], 404);
        }

        $examen->setStatut('archivé');
        $examen->setDateModification(new \DateTimeImmutable());
        $this->dm->flush();

        return $this->json([
            'id' => $examen->getId(),
            'statut' => $examen->getStatut(),
            'message' => 'Examen rejeté / archivé',
        ]);
    }
}