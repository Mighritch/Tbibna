<?php

namespace App\Document;

use App\Repository\ExamenRepository;
use Doctrine\ODM\MongoDB\Mapping\Annotations as ODM;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;

#[ODM\Document(collection: "examens", repositoryClass: ExamenRepository::class)]
class Examen
{
    #[ODM\Id]
    private ?string $id = null;

    #[ODM\Field(type: "string")]
    private ?string $titre = null;

    #[ODM\Field(type: "string")]
    private ?string $instructions = null;

    #[ODM\Field(type: "int")]
    private ?int $duree = null; // en minutes

    #[ODM\Field(type: "int")]
    private ?int $pointsTotaux = null;

    #[ODM\Field(type: "int")]
    private ?int $pointsDePassage = null;

    #[ODM\Field(type: "string")]
    private ?string $medecinId = null;

    #[ODM\Field(type: "string")]
    private string $statut = "brouillon"; // brouillon | publié | archivé

    #[ODM\Field(type: "date_immutable")]
    private ?\DateTimeImmutable $dateCreation = null;

    #[ODM\Field(type: "date_immutable")]
    private ?\DateTimeImmutable $dateModification = null;

    #[ODM\Field(type: "collection")]
    private array $questions = []; // tableau de questions (simple pour commencer)

    public function __construct()
    {
        $this->dateCreation = new \DateTimeImmutable();
        $this->dateModification = new \DateTimeImmutable();
        $this->questions = [];
    }

    // Getters & Setters

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

    public function getInstructions(): ?string
    {
        return $this->instructions;
    }

    public function setInstructions(?string $instructions): static
    {
        $this->instructions = $instructions;
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

    public function getPointsTotaux(): ?int
    {
        return $this->pointsTotaux;
    }

    public function setPointsTotaux(int $pointsTotaux): static
    {
        $this->pointsTotaux = $pointsTotaux;
        return $this;
    }

    public function getPointsDePassage(): ?int
    {
        return $this->pointsDePassage;
    }

    public function setPointsDePassage(int $pointsDePassage): static
    {
        $this->pointsDePassage = $pointsDePassage;
        return $this;
    }

    public function getMedecinId(): ?string
    {
        return $this->medecinId;
    }

    public function setMedecinId(string $medecinId): static
    {
        $this->medecinId = $medecinId;
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

    public function getDateCreation(): ?\DateTimeImmutable
    {
        return $this->dateCreation;
    }

    public function setDateCreation(\DateTimeImmutable $dateCreation): static
    {
        $this->dateCreation = $dateCreation;
        return $this;
    }

    public function getDateModification(): ?\DateTimeImmutable
    {
        return $this->dateModification;
    }

    public function setDateModification(\DateTimeImmutable $dateModification): static
    {
        $this->dateModification = $dateModification;
        return $this;
    }

    public function getQuestions(): array
    {
        return $this->questions;
    }

    public function setQuestions(array $questions): static
    {
        $this->questions = $questions;
        return $this;
    }
}