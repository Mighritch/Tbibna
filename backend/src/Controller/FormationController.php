<?php

namespace App\Controller;

use App\Document\Formation;
use App\Repository\FormationRepository;
use Doctrine\ODM\MongoDB\DocumentManager;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[Route('/api/formations')]
class FormationController extends AbstractController
{
    private const STATUTS = [
        Formation::STATUT_EN_ATTENTE,
        Formation::STATUT_ACCEPTEE,
        Formation::STATUT_REFUSEE,
    ];

    public function __construct(
        private DocumentManager $dm,
        private FormationRepository $repository
    ) {}

    /** Liste publique : uniquement les formations acceptées */
    #[Route('', name: 'api_formations_list', methods: ['GET'])]
    public function list(): JsonResponse
    {
        $formations = $this->repository->findAcceptees();

        return $this->json(array_map(fn(Formation $f) => $this->serialize($f), $formations));
    }

    /** Formations du médecin connecté (tous statuts) */
    #[Route('/mes-formations', name: 'api_formations_mine', methods: ['GET'])]
    #[IsGranted('ROLE_MEDECIN')]
    public function mine(): JsonResponse
    {
        $formations = $this->repository->findByCreator($this->getUser()->getUserIdentifier());

        return $this->json(array_map(fn(Formation $f) => $this->serialize($f), $formations));
    }

    /** Liste admin : toutes les formations (filtre optionnel ?statut=en_attente) */
    #[Route('/admin', name: 'api_formations_admin_list', methods: ['GET'])]
    #[IsGranted('ROLE_ADMIN')]
    public function adminList(Request $request): JsonResponse
    {
        $statut = $request->query->get('statut');
        if ($statut && !in_array($statut, self::STATUTS, true)) {
            return $this->json(['error' => 'Statut invalide'], 400);
        }

        $formations = $this->repository->findForAdmin($statut ?: null);

        return $this->json(array_map(fn(Formation $f) => $this->serialize($f), $formations));
    }

    /** Création (médecin) : la formation est en attente de validation */
    #[Route('', name: 'api_formations_create', methods: ['POST'])]
    #[IsGranted('ROLE_MEDECIN')]
    public function create(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        if (!is_array($data)) {
            return $this->json(['error' => 'Données invalides'], 400);
        }

        if (trim($data['titre'] ?? '') === '' || trim($data['description'] ?? '') === '') {
            return $this->json(['error' => 'Le titre et la description sont obligatoires'], 400);
        }

        $formation = new Formation();
        $formation
            ->setTitre(trim($data['titre']))
            ->setDescription(trim($data['description']))
            ->setDuree((int) ($data['duree'] ?? 0))
            ->setPrix((float) ($data['prix'] ?? 0))
            ->setGratuit((bool) ($data['gratuit'] ?? false))
            ->setObjectifs($data['objectifs'] ?? '')
            ->setStatut(Formation::STATUT_EN_ATTENTE) // toujours en attente
            ->setCreatedBy($this->getUser()->getUserIdentifier());

        try {
            if (!empty($data['dateDebut'])) {
                $formation->setDateDebut(new \DateTime($data['dateDebut']));
            }
            if (!empty($data['dateFin'])) {
                $formation->setDateFin(new \DateTime($data['dateFin']));
            }
        } catch (\Exception) {
            return $this->json(['error' => 'Date invalide'], 400);
        }

        $this->dm->persist($formation);
        $this->dm->flush();

        return $this->json($this->serialize($formation), 201);
    }

    /** Détail : visible si acceptée, ou si propriétaire / admin */
    #[Route('/{id}', name: 'api_formations_show', methods: ['GET'])]
    public function show(string $id): JsonResponse
    {
        $formation = $this->repository->find($id);

        if (!$formation) {
            return $this->json(['error' => 'Formation non trouvée'], 404);
        }

        if ($formation->getStatut() !== Formation::STATUT_ACCEPTEE && !$this->canManage($formation)) {
            return $this->json(['error' => 'Formation non trouvée'], 404);
        }

        return $this->json($this->serialize($formation));
    }

    /**
     * Mise à jour (propriétaire ou admin).
     * Si un médecin modifie, la formation repasse en attente.
     */
    #[Route('/{id}', name: 'api_formations_update', methods: ['PUT', 'PATCH'])]
    #[IsGranted('IS_AUTHENTICATED_FULLY')]
    public function update(string $id, Request $request): JsonResponse
    {
        $formation = $this->repository->find($id);

        if (!$formation) {
            return $this->json(['error' => 'Formation non trouvée'], 404);
        }
        if (!$this->canManage($formation)) {
            return $this->json(['error' => 'Accès refusé'], 403);
        }

        $data = json_decode($request->getContent(), true) ?? [];

        if (isset($data['titre'])) $formation->setTitre($data['titre']);
        if (isset($data['description'])) $formation->setDescription($data['description']);
        if (isset($data['duree'])) $formation->setDuree((int) $data['duree']);
        if (isset($data['prix'])) $formation->setPrix((float) $data['prix']);
        if (isset($data['gratuit'])) $formation->setGratuit((bool) $data['gratuit']);
        if (isset($data['objectifs'])) $formation->setObjectifs($data['objectifs']);

        try {
            if (!empty($data['dateDebut'])) $formation->setDateDebut(new \DateTime($data['dateDebut']));
            if (!empty($data['dateFin'])) $formation->setDateFin(new \DateTime($data['dateFin']));
        } catch (\Exception) {
            return $this->json(['error' => 'Date invalide'], 400);
        }

        if (!$this->isGranted('ROLE_ADMIN')) {
            $formation->setStatut(Formation::STATUT_EN_ATTENTE);
        }

        $this->dm->flush();

        return $this->json($this->serialize($formation));
    }

    /**
     * Accepter / refuser une formation (admin uniquement)
     * Body : { "statut": "acceptee" | "refusee" | "en_attente" }
     */
    #[Route('/{id}/statut', name: 'api_formations_statut', methods: ['PATCH'])]
    #[IsGranted('ROLE_ADMIN')]
    public function updateStatut(string $id, Request $request): JsonResponse
    {
        $formation = $this->repository->find($id);

        if (!$formation) {
            return $this->json(['error' => 'Formation non trouvée'], 404);
        }

        $data = json_decode($request->getContent(), true);
        $statut = is_array($data) ? ($data['statut'] ?? null) : null;

        if (!in_array($statut, self::STATUTS, true)) {
            return $this->json(['error' => 'Statut invalide'], 400);
        }

        $formation->setStatut($statut);
        $this->dm->flush();

        return $this->json($this->serialize($formation));
    }

    /** Suppression (propriétaire ou admin) */
    #[Route('/{id}', name: 'api_formations_delete', methods: ['DELETE'])]
    #[IsGranted('IS_AUTHENTICATED_FULLY')]
    public function delete(string $id): JsonResponse
    {
        $formation = $this->repository->find($id);

        if (!$formation) {
            return $this->json(['error' => 'Formation non trouvée'], 404);
        }
        if (!$this->canManage($formation)) {
            return $this->json(['error' => 'Accès refusé'], 403);
        }

        $this->dm->remove($formation);
        $this->dm->flush();

        return $this->json(null, 204);
    }

    /** Admin, ou médecin propriétaire */
    private function canManage(Formation $f): bool
    {
        if ($this->isGranted('ROLE_ADMIN')) {
            return true;
        }

        $user = $this->getUser();

        return $user
            && $this->isGranted('ROLE_MEDECIN')
            && $f->getCreatedBy() === $user->getUserIdentifier();
    }

    private function serialize(Formation $f): array
    {
        return [
            'id'          => $f->getId(),
            'titre'       => $f->getTitre(),
            'description' => $f->getDescription(),
            'duree'       => $f->getDuree(),
            'dateDebut'   => $f->getDateDebut()?->format('Y-m-d'),
            'dateFin'     => $f->getDateFin()?->format('Y-m-d'),
            'prix'        => $f->getPrix(),
            'gratuit'     => $f->isGratuit(),
            'objectifs'   => $f->getObjectifs(),
            'statut'      => $f->getStatut(),
            'createdBy'   => $f->getCreatedBy(),
        ];
    }
}