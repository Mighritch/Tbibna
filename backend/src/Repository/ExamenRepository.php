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
}