<?php

namespace App\Repository;

use App\Document\SoumissionActivite;
use Doctrine\Bundle\MongoDBBundle\Repository\ServiceDocumentRepository;
use Doctrine\Persistence\ManagerRegistry;

class SoumissionActiviteRepository extends ServiceDocumentRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, SoumissionActivite::class);
    }
}