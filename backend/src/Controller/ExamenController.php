<?php

namespace App\Controller;

use App\Document\Examen;
use App\Document\InscriptionExamen;
use App\Document\User;
use App\Repository\ExamenRepository;
use App\Repository\InscriptionExamenRepository;
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
        private ExamenRepository $examenRepository,
        private InscriptionExamenRepository $inscriptionRepository
    ) {}

    // ========== ÉTUDIANT : liste des examens publiés ==========
    #[Route('/publies', name: 'examen_list_publies', methods: ['GET'])]
    #[IsGranted('ROLE_ETUDIANT')]
    public function listPublished(): JsonResponse
    {
        /** @var User $user */
        $user = $this->getUser();
        $examens = $this->examenRepository->findPublished();

        $data = array_map(function (Examen $e) use ($user) {
            $inscrit = $this->inscriptionRepository->isInscrit($e->getId(), $user->getId());

            return [
                'id' => $e->getId(),
                'titre' => $e->getTitre(),
                'instructions' => $e->getInstructions(),
                'duree' => $e->getDuree(),
                'pointsTotaux' => $e->getPointsTotaux(),
                'pointsDePassage' => $e->getPointsDePassage(),
                'statut' => $e->getStatut(),
                'dateCreation' => $e->getDateCreation()?->format('Y-m-d H:i'),
                'questionsCount' => count($e->getQuestions()),
                'inscrit' => $inscrit, // ← nouveau
            ];
        }, $examens);

        return $this->json($data);
    }

    // ========== ÉTUDIANT : s'inscrire à un examen ==========
    #[Route('/{id}/inscrire', name: 'examen_inscrire', methods: ['POST'])]
    #[IsGranted('ROLE_ETUDIANT')]
    public function inscrire(string $id): JsonResponse
    {
        $examen = $this->examenRepository->find($id);
        if (!$examen) {
            return $this->json(['error' => 'Examen introuvable'], 404);
        }

        if ($examen->getStatut() !== 'publié') {
            return $this->json(['error' => 'Cet examen n\'est pas encore publié'], 400);
        }

        /** @var User $user */
        $user = $this->getUser();

        // Déjà inscrit ?
        if ($this->inscriptionRepository->isInscrit($id, $user->getId())) {
            return $this->json(['error' => 'Vous êtes déjà inscrit à cet examen'], 400);
        }

        $inscription = new InscriptionExamen();
        $inscription->setExamenId($id);
        $inscription->setEtudiantId($user->getId());

        $this->dm->persist($inscription);
        $this->dm->flush();

        return $this->json([
            'message' => 'Inscription réussie. Vous pouvez maintenant passer l\'examen.',
            'inscriptionId' => $inscription->getId(),
        ], 201);
    }

    // ========== ÉTUDIANT : détail d’un examen (seulement si inscrit) ==========
    #[Route('/{id}/etudiant', name: 'examen_show_etudiant', methods: ['GET'])]
    #[IsGranted('ROLE_ETUDIANT')]
    public function showForEtudiant(string $id): JsonResponse
    {
        $examen = $this->examenRepository->find($id);
        if (!$examen) {
            return $this->json(['error' => 'Examen introuvable'], 404);
        }

        if ($examen->getStatut() !== 'publié') {
            return $this->json(['error' => 'Cet examen n\'est pas publié'], 403);
        }

        /** @var User $user */
        $user = $this->getUser();

        if (!$this->inscriptionRepository->isInscrit($id, $user->getId())) {
            return $this->json(['error' => 'Vous devez vous inscrire à cet examen avant de le consulter'], 403);
        }

        return $this->json([
            'id' => $examen->getId(),
            'titre' => $examen->getTitre(),
            'instructions' => $examen->getInstructions(),
            'duree' => $examen->getDuree(),
            'pointsTotaux' => $examen->getPointsTotaux(),
            'pointsDePassage' => $examen->getPointsDePassage(),
            'statut' => $examen->getStatut(),
            'questions' => $examen->getQuestions(), // ← questions visibles seulement si inscrit
            'dateCreation' => $examen->getDateCreation()?->format('Y-m-d H:i'),
        ]);
    }

    // ========== ÉTUDIANT : soumettre les réponses (uniquement si inscrit) ==========
    #[Route('/{id}/soumettre', name: 'examen_soumettre', methods: ['POST'])]
    #[IsGranted('ROLE_ETUDIANT')]
    public function soumettre(string $id, Request $request): JsonResponse
    {
        $examen = $this->examenRepository->find($id);
        if (!$examen) {
            return $this->json(['error' => 'Examen introuvable'], 404);
        }

        /** @var User $user */
        $user = $this->getUser();

        $inscription = $this->inscriptionRepository->findByExamenAndEtudiant($id, $user->getId());
        if (!$inscription) {
            return $this->json(['error' => 'Vous devez être inscrit pour soumettre cet examen'], 403);
        }

        if ($inscription->getStatut() === 'soumis' || $inscription->getStatut() === 'terminé') {
            return $this->json(['error' => 'Vous avez déjà soumis cet examen'], 400);
        }

        $data = json_decode($request->getContent(), true);
        $reponses = $data['reponses'] ?? [];

        // Ici tu peux calculer le score, enregistrer les réponses, etc.
        // Pour l’instant on met juste le statut à "soumis"

        $inscription->setStatut('soumis');
        $inscription->setDateSoumission(new \DateTimeImmutable());

        // Optionnel : stocker les réponses dans l’inscription
        // $inscription->setReponses($reponses);

        $this->dm->flush();

        return $this->json([
            'message' => 'Examen soumis avec succès',
            'statut' => $inscription->getStatut(),
        ]);
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