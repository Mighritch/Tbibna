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
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[Route('/api/examens')]
class ExamenController extends AbstractController
{
    public function __construct(
        private readonly DocumentManager $dm,
        private readonly ExamenRepository $examenRepository,
        private readonly InscriptionExamenRepository $inscriptionRepository
    ) {}

    #[Route('/publies', name: 'examen_list_publies', methods: ['GET'])]
    #[IsGranted('ROLE_ETUDIANT')]
    public function listPublished(): JsonResponse
    {
        /** @var User|null $user */
        $user = $this->getUser();
        if (!$user) {
            return $this->json(['error' => 'Utilisateur non authentifié'], Response::HTTP_UNAUTHORIZED);
        }

        $examens = $this->examenRepository->findPublished();

        $data = array_map(function (Examen $e) use ($user) {
            $inscrit = $this->inscriptionRepository->isInscrit(
                $e->getId(),
                $user->getId()
            );

            $questions = $e->getQuestions();
            $questionsCount = is_countable($questions) ? count($questions) : 0;

            return [
                'id' => $e->getId(),
                'titre' => $e->getTitre(),
                'instructions' => $e->getInstructions(),
                'duree' => $e->getDuree(),
                'pointsTotaux' => $e->getPointsTotaux(),
                'pointsDePassage' => $e->getPointsDePassage(),
                'statut' => $e->getStatut(),
                'dateCreation' => $e->getDateCreation()?->format('Y-m-d H:i'),
                'questionsCount' => $questionsCount,
                'inscrit' => $inscrit,
            ];
        }, $examens);

        return $this->json($data);
    }

    #[Route('/{id}/inscrire', name: 'examen_inscrire', methods: ['POST'])]
    #[IsGranted('ROLE_ETUDIANT')]
    public function inscrire(string $id): JsonResponse
    {
        $examen = $this->examenRepository->find($id);

        if (!$examen) {
            return $this->json(['error' => 'Examen introuvable'], Response::HTTP_NOT_FOUND);
        }

        if ($examen->getStatut() !== 'publié') {
            return $this->json([
                'error' => 'Cet examen n\'est pas encore publié'
            ], Response::HTTP_BAD_REQUEST);
        }

        /** @var User|null $user */
        $user = $this->getUser();
        if (!$user) {
            return $this->json(['error' => 'Utilisateur non authentifié'], Response::HTTP_UNAUTHORIZED);
        }

        if ($this->inscriptionRepository->isInscrit($id, $user->getId())) {
            return $this->json([
                'error' => 'Vous êtes déjà inscrit à cet examen'
            ], Response::HTTP_BAD_REQUEST);
        }

        $inscription = new InscriptionExamen();
        $inscription->setExamenId($id);
        $inscription->setEtudiantId($user->getId());

        $this->dm->persist($inscription);
        $this->dm->flush();

        return $this->json([
            'message' => 'Inscription réussie. Vous pouvez maintenant passer l\'examen.',
            'inscriptionId' => $inscription->getId(),
        ], Response::HTTP_CREATED);
    }

    #[Route('/{id}/etudiant', name: 'examen_show_etudiant', methods: ['GET'])]
    #[IsGranted('ROLE_ETUDIANT')]
    public function showForEtudiant(string $id): JsonResponse
    {
        $examen = $this->examenRepository->find($id);

        if (!$examen) {
            return $this->json(['error' => 'Examen introuvable'], Response::HTTP_NOT_FOUND);
        }

        if ($examen->getStatut() !== 'publié') {
            return $this->json(['error' => 'Cet examen n\'est pas publié'], Response::HTTP_FORBIDDEN);
        }

        /** @var User|null $user */
        $user = $this->getUser();
        if (!$user) {
            return $this->json(['error' => 'Utilisateur non authentifié'], Response::HTTP_UNAUTHORIZED);
        }

        if (!$this->inscriptionRepository->isInscrit($id, $user->getId())) {
            return $this->json([
                'error' => 'Vous devez vous inscrire à cet examen avant de le consulter'
            ], Response::HTTP_FORBIDDEN);
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

    #[Route('/{id}/soumettre', name: 'examen_soumettre', methods: ['POST'])]
    #[IsGranted('ROLE_ETUDIANT')]
    public function soumettre(string $id, Request $request): JsonResponse
    {
        $examen = $this->examenRepository->find($id);

        if (!$examen) {
            return $this->json(['error' => 'Examen introuvable'], Response::HTTP_NOT_FOUND);
        }

        /** @var User|null $user */
        $user = $this->getUser();
        if (!$user) {
            return $this->json(['error' => 'Utilisateur non authentifié'], Response::HTTP_UNAUTHORIZED);
        }

        $inscription = $this->inscriptionRepository->findByExamenAndEtudiant(
            $id,
            $user->getId()
        );

        if (!$inscription) {
            return $this->json([
                'error' => 'Vous devez être inscrit pour soumettre cet examen'
            ], Response::HTTP_FORBIDDEN);
        }

        if (in_array($inscription->getStatut(), ['soumis', 'terminé'], true)) {
            return $this->json([
                'error' => 'Vous avez déjà soumis cet examen'
            ], Response::HTTP_BAD_REQUEST);
        }

        try {
            $data = $request->toArray();
        } catch (\Throwable) {
            return $this->json(['error' => 'Format JSON invalide'], Response::HTTP_BAD_REQUEST);
        }

        if (!isset($data['reponses']) || !is_array($data['reponses'])) {
            return $this->json([
                'error' => 'Les réponses sont obligatoires et doivent être envoyées sous forme de tableau'
            ], Response::HTTP_BAD_REQUEST);
        }

        $inscription->setReponses($data['reponses']);
        $inscription->setStatut('soumis');
        $inscription->setDateSoumission(new \DateTimeImmutable());

        $this->dm->flush();

        return $this->json([
            'message' => 'Examen soumis avec succès',
            'statut' => $inscription->getStatut(),
        ]);
    }

    #[Route('', name: 'examen_list_medecin', methods: ['GET'])]
    #[IsGranted('ROLE_MEDECIN')]
    public function listForMedecin(): JsonResponse
    {
        /** @var User|null $user */
        $user = $this->getUser();
        if (!$user) {
            return $this->json(['error' => 'Utilisateur non authentifié'], Response::HTTP_UNAUTHORIZED);
        }

        $examens = $this->examenRepository->findByMedecin($user->getId());

        $data = array_map(function (Examen $e) {
            $questions = $e->getQuestions();
            $questionsCount = is_countable($questions) ? count($questions) : 0;

            return [
                'id' => $e->getId(),
                'titre' => $e->getTitre(),
                'instructions' => $e->getInstructions(),
                'duree' => $e->getDuree(),
                'pointsTotaux' => $e->getPointsTotaux(),
                'pointsDePassage' => $e->getPointsDePassage(),
                'statut' => $e->getStatut(),
                'dateCreation' => $e->getDateCreation()?->format('Y-m-d H:i'),
                'questionsCount' => $questionsCount,
            ];
        }, $examens);

        return $this->json($data);
    }

    #[Route('', name: 'examen_create', methods: ['POST'])]
    #[IsGranted('ROLE_MEDECIN')]
    public function create(Request $request): JsonResponse
    {
        try {
            $data = $request->toArray();
        } catch (\Throwable) {
            return $this->json(['error' => 'Format JSON invalide'], Response::HTTP_BAD_REQUEST);
        }

        /** @var User|null $user */
        $user = $this->getUser();
        if (!$user) {
            return $this->json(['error' => 'Utilisateur non authentifié'], Response::HTTP_UNAUTHORIZED);
        }

        if (empty($data['titre']) || empty($data['duree'])) {
            return $this->json([
                'error' => 'Titre et durée sont obligatoires'
            ], Response::HTTP_BAD_REQUEST);
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
        ], Response::HTTP_CREATED);
    }

    #[Route('/{id}', name: 'examen_show', methods: ['GET'])]
    #[IsGranted('ROLE_MEDECIN')]
    public function show(string $id): JsonResponse
    {
        $examen = $this->examenRepository->find($id);

        if (!$examen) {
            return $this->json(['error' => 'Examen introuvable'], Response::HTTP_NOT_FOUND);
        }

        /** @var User|null $user */
        $user = $this->getUser();
        if (!$user) {
            return $this->json(['error' => 'Utilisateur non authentifié'], Response::HTTP_UNAUTHORIZED);
        }

        if ($examen->getMedecinId() !== $user->getId()) {
            return $this->json(['error' => 'Accès refusé'], Response::HTTP_FORBIDDEN);
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