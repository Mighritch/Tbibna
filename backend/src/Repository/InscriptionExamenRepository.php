<?php

namespace App\Repository;

use App\Document\InscriptionExamen;
use Doctrine\Bundle\MongoDBBundle\Repository\ServiceDocumentRepository;
use Doctrine\Bundle\MongoDBBundle\ManagerRegistry;

class InscriptionExamenRepository extends ServiceDocumentRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, InscriptionExamen::class);
    }

    public function findByExamenAndEtudiant(string $examenId, string $etudiantId): ?InscriptionExamen
    {
        return $this->createQueryBuilder()
            ->field('examenId')->equals($examenId)
            ->field('etudiantId')->equals($etudiantId)
            ->getQuery()
            ->getSingleResult();
    }

    public function findByEtudiant(string $etudiantId): array
    {
        return $this->createQueryBuilder()
            ->field('etudiantId')->equals($etudiantId)
            ->sort('dateInscription', 'desc')
            ->getQuery()
            ->execute()
            ->toArray();
    }

    public function isInscrit(string $examenId, string $etudiantId): bool
    {
        return $this->findByExamenAndEtudiant($examenId, $etudiantId) !== null;
    }
}