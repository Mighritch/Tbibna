<?php

namespace App\Controller;

use App\Document\Formation;
use App\Repository\FormationRepository;
use Doctrine\ODM\MongoDB\DocumentManager;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[Route('/api/formations')]
class FormationController extends AbstractController
{
    public function __construct(
        private DocumentManager $dm,
        private FormationRepository $repository
    ) {}

    /**
     * Liste de toutes les formations
     */
    #[Route('', name: 'api_formations_list', methods: ['GET'])]
    public function list(): JsonResponse
    {
        $formations = $this->repository->findAll();

        $data = array_map(fn(Formation $f) => $this->serialize($f), $formations);

        return $this->json($data);
    }

    /**
     * Création d'une formation (réservée aux médecins)
     */
    #[Route('', name: 'api_formations_create', methods: ['POST'])]
    #[IsGranted('ROLE_MEDECIN')]
    public function create(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        if (!$data) {
            return $this->json(['error' => 'Données invalides'], 400);
        }

        $formation = new Formation();
        $formation
            ->setTitre($data['titre'] ?? '')
            ->setDescription($data['description'] ?? '')
            ->setLangage($data['langage'] ?? '')
            ->setDuree((int) ($data['duree'] ?? 0))
            ->setPrix((float) ($data['prix'] ?? 0))
            ->setGratuit((bool) ($data['gratuit'] ?? false))
            ->setObjectifs($data['objectifs'] ?? '');

        // Gestion des dates
        if (!empty($data['dateDebut'])) {
            $formation->setDateDebut(new \DateTime($data['dateDebut']));
        }
        if (!empty($data['dateFin'])) {
            $formation->setDateFin(new \DateTime($data['dateFin']));
        }

        $this->dm->persist($formation);
        $this->dm->flush();

        return $this->json($this->serialize($formation), 201);
    }

    /**
     * Récupérer une formation
     */
    #[Route('/{id}', name: 'api_formations_show', methods: ['GET'])]
    public function show(string $id): JsonResponse
    {
        $formation = $this->repository->find($id);

        if (!$formation) {
            return $this->json(['error' => 'Formation non trouvée'], 404);
        }

        return $this->json($this->serialize($formation));
    }

    /**
     * Mise à jour (médecin uniquement)
     */
    #[Route('/{id}', name: 'api_formations_update', methods: ['PUT', 'PATCH'])]
    #[IsGranted('ROLE_MEDECIN')]
    public function update(string $id, Request $request): JsonResponse
    {
        $formation = $this->repository->find($id);

        if (!$formation) {
            return $this->json(['error' => 'Formation non trouvée'], 404);
        }

        $data = json_decode($request->getContent(), true);

        if (isset($data['titre'])) $formation->setTitre($data['titre']);
        if (isset($data['description'])) $formation->setDescription($data['description']);
        if (isset($data['langage'])) $formation->setLangage($data['langage']);
        if (isset($data['duree'])) $formation->setDuree((int) $data['duree']);
        if (isset($data['prix'])) $formation->setPrix((float) $data['prix']);
        if (isset($data['gratuit'])) $formation->setGratuit((bool) $data['gratuit']);
        if (isset($data['objectifs'])) $formation->setObjectifs($data['objectifs']);
        if (!empty($data['dateDebut'])) $formation->setDateDebut(new \DateTime($data['dateDebut']));
        if (!empty($data['dateFin'])) $formation->setDateFin(new \DateTime($data['dateFin']));

        $this->dm->flush();

        return $this->json($this->serialize($formation));
    }

    /**
     * Suppression (médecin uniquement)
     */
    #[Route('/{id}', name: 'api_formations_delete', methods: ['DELETE'])]
    #[IsGranted('ROLE_MEDECIN')]
    public function delete(string $id): JsonResponse
    {
        $formation = $this->repository->find($id);

        if (!$formation) {
            return $this->json(['error' => 'Formation non trouvée'], 404);
        }

        $this->dm->remove($formation);
        $this->dm->flush();

        return $this->json(null, 204);
    }

    private function serialize(Formation $f): array
    {
        return [
            'id'          => $f->getId(),
            'titre'       => $f->getTitre(),
            'description' => $f->getDescription(),
            'langage'     => $f->getLangage(),
            'duree'       => $f->getDuree(),
            'dateDebut'   => $f->getDateDebut()?->format('Y-m-d'),
            'dateFin'     => $f->getDateFin()?->format('Y-m-d'),
            'prix'        => $f->getPrix(),
            'gratuit'     => $f->isGratuit(),
            'objectifs'   => $f->getObjectifs(),
        ];
    }
}