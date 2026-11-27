<?php

namespace App\Repository;

use App\Document\Examen;
use Doctrine\Bundle\MongoDBBundle\Repository\ServiceDocumentRepository;
use Doctrine\Bundle\MongoDBBundle\ManagerRegistry;

class ExamenRepository extends ServiceDocumentRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Examen::class);
    }

    public function findByMedecin(string $medecinId): array
    {
        return $this->createQueryBuilder()
            ->field('medecinId')->equals($medecinId)
            ->sort('dateCreation', 'desc')
            ->getQuery()
            ->execute()
            ->toArray();
    }

    /**
     * Récupère les examens du médecin (tous statuts) + les examens publiés par d'autres médecins
     */
    public function findForMedecin(string $medecinId): array
    {
        $qb = $this->createQueryBuilder();
        $qb->addOr($qb->expr()->field('medecinId')->equals($medecinId));
        $qb->addOr($qb->expr()->field('statut')->equals('publié'));

        return $qb
            ->sort('dateCreation', 'desc')
            ->getQuery()
            ->execute()
            ->toArray();
    }

    /** Tous les examens (pour l'admin), triés du plus récent */
    public function findAllOrdered(): array
    {
        return $this->createQueryBuilder()
            ->sort('dateCreation', 'desc')
            ->getQuery()
            ->execute()
            ->toArray();
    }

    /** Examens en attente d'approbation (brouillon) */
    public function findPending(): array
    {
        return $this->createQueryBuilder()
            ->field('statut')->equals('brouillon')
            ->sort('dateCreation', 'desc')
            ->getQuery()
            ->execute()
            ->toArray();
    }

    /** Examens publiés (acceptés par l'admin) – pour les étudiants */
    public function findPublished(): array
    {
        return $this->createQueryBuilder()
            ->field('statut')->equals('publié')
            ->sort('dateCreation', 'desc')
            ->getQuery()
            ->execute()
            ->toArray();
    }
}