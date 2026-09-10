<?php

namespace App\Repository;

use App\Document\Activite;
use Doctrine\Bundle\MongoDBBundle\Repository\ServiceDocumentRepository;
use Doctrine\Persistence\ManagerRegistry;

class ActiviteRepository extends ServiceDocumentRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Activite::class);
    }
}