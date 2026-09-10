<?php

namespace App\Repository;

use App\Document\Medecin;
use Doctrine\Bundle\MongoDBBundle\Repository\ServiceDocumentRepository;
use Doctrine\Persistence\ManagerRegistry;

class MedecinRepository extends ServiceDocumentRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Medecin::class);
    }
}