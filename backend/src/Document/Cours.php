<?php

namespace App\Document;

use App\Repository\CoursRepository;
use Doctrine\ODM\MongoDB\Mapping\Annotations as ODM;

#[ODM\Document(collection: "cours", repositoryClass: CoursRepository::class)]
class Cours
{
    #[ODM\Id]
    private ?string $id = null;

    #[ODM\Field(type: "string")]
    private ?string $titre = null;

    #[ODM\Field(type: "string")]
    private ?string $description = null;

    #[ODM\Field(type: "int")]
    private ?int $duree = null;

    #[ODM\Field(type: "string")]
    private ?string $langueCours = null;

    #[ODM\Field(type: "string")]
    private ?string $contenuCours = null;

    #[ODM\Field(type: "string")]
    private ?string $niveauCours = null;

    // Référence vers le médecin qui a créé le cours
    #[ODM\ReferenceOne(targetDocument: Medecin::class, storeAs: "id")]
    private ?Medecin $medecin = null;

    // Date de création (utile pour trier / afficher)
    #[ODM\Field(type: "date")]
    private ?\DateTime $dateCreation = null;

    public function __construct()
    {
        $this->dateCreation = new \DateTime();
    }

    public function getId(): ?string
    {
        return $this->id;
    }

    public function getTitre(): ?string
    {
        return $this->titre;
    }

    public function setTitre(string $titre): static
    {
        $this->titre = $titre;
        return $this;
    }

    public function getDescription(): ?string
    {
        return $this->description;
    }

    public function setDescription(string $description): static
    {
        $this->description = $description;
        return $this;
    }

    public function getDuree(): ?int
    {
        return $this->duree;
    }

    public function setDuree(int $duree): static
    {
        $this->duree = $duree;
        return $this;
    }

    public function getLangueCours(): ?string
    {
        return $this->langueCours;
    }

    public function setLangueCours(string $langueCours): static
    {
        $this->langueCours = $langueCours;
        return $this;
    }

    public function getContenuCours(): ?string
    {
        return $this->contenuCours;
    }

    public function setContenuCours(string $contenuCours): static
    {
        $this->contenuCours = $contenuCours;
        return $this;
    }

    public function getNiveauCours(): ?string
    {
        return $this->niveauCours;
    }

    public function setNiveauCours(string $niveauCours): static
    {
        $this->niveauCours = $niveauCours;
        return $this;
    }

    public function getMedecin(): ?Medecin
    {
        return $this->medecin;
    }

    public function setMedecin(?Medecin $medecin): static
    {
        $this->medecin = $medecin;
        return $this;
    }

    public function getDateCreation(): ?\DateTime
    {
        return $this->dateCreation;
    }

    public function setDateCreation(\DateTime $dateCreation): static
    {
        $this->dateCreation = $dateCreation;
        return $this;
    }
}