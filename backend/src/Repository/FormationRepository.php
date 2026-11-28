<?php

namespace App\Repository;

use App\Document\Formation;
use Doctrine\Bundle\MongoDBBundle\Repository\ServiceDocumentRepository;
use Doctrine\Bundle\MongoDBBundle\ManagerRegistry;

class FormationRepository extends ServiceDocumentRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Formation::class);
    }

    /** Formations visibles publiquement (acceptées uniquement) */
    public function findAcceptees(): array
    {
        return $this->findBy(
            ['statut' => Formation::STATUT_ACCEPTEE],
            ['id' => 'desc']
        );
    }

    /** Formations d'un médecin (tous statuts) */
    public function findByCreator(string $identifier): array
    {
        return $this->findBy(['createdBy' => $identifier], ['id' => 'desc']);
    }

    /**
     * Pour l'espace médecin :
     * Retourne ses propres formations (tous statuts) + les formations acceptées des autres médecins
     */
    public function findForMedecin(string $identifier): array
    {
        $qb = $this->createQueryBuilder();
        $qb->addOr($qb->expr()->field('createdBy')->equals($identifier));
        $qb->addOr(
            $qb->expr()
                ->field('statut')->equals(Formation::STATUT_ACCEPTEE)
                ->field('createdBy')->notEqual($identifier)
        );
        $qb->sort('id', 'desc');

        return $qb->getQuery()->execute()->toArray();
    }

    /** Formations acceptées mises en favoris par un utilisateur */
    public function findFavorisByUser(string $identifier): array
    {
        return $this->findBy(
            [
                'statut' => Formation::STATUT_ACCEPTEE,
                'favorisBy' => $identifier,
            ],
            ['id' => 'desc']
        );
    }

    /** Pour l'admin : toutes, ou filtrées par statut */
    public function findForAdmin(?string $statut = null): array
    {
        $criteria = $statut ? ['statut' => $statut] : [];

        return $this->findBy($criteria, ['id' => 'desc']);
    }
}