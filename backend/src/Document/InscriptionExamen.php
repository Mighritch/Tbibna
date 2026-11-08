<?php

namespace App\Document;

use App\Repository\InscriptionExamenRepository;
use Doctrine\ODM\MongoDB\Mapping\Annotations as ODM;

#[ODM\Document(collection: "inscriptions_examens", repositoryClass: InscriptionExamenRepository::class)]
class InscriptionExamen
{
    #[ODM\Id]
    private ?string $id = null;

    #[ODM\Field(type: "string")]
    private string $examenId;

    #[ODM\Field(type: "string")]
    private string $etudiantId;

    #[ODM\Field(type: "date_immutable")]
    private \DateTimeImmutable $dateInscription;

    #[ODM\Field(type: "string")]
    private string $statut = "inscrit"; // inscrit | soumis | terminé

    #[ODM\Field(type: "date_immutable")]
    private ?\DateTimeImmutable $dateSoumission = null;

    public function __construct()
    {
        $this->dateInscription = new \DateTimeImmutable();
    }

    // Getters & Setters

    public function getId(): ?string
    {
        return $this->id;
    }

    public function getExamenId(): string
    {
        return $this->examenId;
    }

    public function setExamenId(string $examenId): static
    {
        $this->examenId = $examenId;
        return $this;
    }

    public function getEtudiantId(): string
    {
        return $this->etudiantId;
    }

    public function setEtudiantId(string $etudiantId): static
    {
        $this->etudiantId = $etudiantId;
        return $this;
    }

    public function getDateInscription(): \DateTimeImmutable
    {
        return $this->dateInscription;
    }

    public function setDateInscription(\DateTimeImmutable $dateInscription): static
    {
        $this->dateInscription = $dateInscription;
        return $this;
    }

    public function getStatut(): string
    {
        return $this->statut;
    }

    public function setStatut(string $statut): static
    {
        $this->statut = $statut;
        return $this;
    }

    public function getDateSoumission(): ?\DateTimeImmutable
    {
        return $this->dateSoumission;
    }

    public function setDateSoumission(?\DateTimeImmutable $dateSoumission): static
    {
        $this->dateSoumission = $dateSoumission;
        return $this;
    }
}