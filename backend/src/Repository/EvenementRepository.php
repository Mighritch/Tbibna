<?php

namespace App\Repository;

use App\Document\Evenement;
use Doctrine\Bundle\MongoDBBundle\ManagerRegistry;
use Doctrine\Bundle\MongoDBBundle\Repository\ServiceDocumentRepository;

class EvenementRepository extends ServiceDocumentRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Evenement::class);
    }

    /** Évènements acceptés par l'admin = visibles sur la plateforme */
    public function findPublies(): array
    {
        return $this->findBy(
            ['statut' => Evenement::STATUT_ACCEPTE],
            ['dateDebut' => 'ASC']
        );
    }

    /** Évènements publiés mis en favoris par un utilisateur */
    public function findFavorisByUser(string $userId): array
    {
        return $this->findBy(
            [
                'statut' => Evenement::STATUT_ACCEPTE,
                'favorisUserIds' => $userId,
            ],
            ['dateDebut' => 'ASC']
        );
    }

    /** Évènements d'un médecin (tous statuts) */
    public function findByAuteur(string $auteurId): array
    {
        return $this->findBy(['auteurId' => $auteurId], ['dateDebut' => 'DESC']);
    }

    /** Vue admin : tous les évènements, filtrables par statut */
    public function findForAdmin(?string $statut = null): array
    {
        $criteria = $statut ? ['statut' => $statut] : [];

        return $this->findBy($criteria, ['dateDebut' => 'DESC']);
    }
}