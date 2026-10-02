<?php

namespace App\Document;

use App\Repository\ActiviteRepository;
use Doctrine\ODM\MongoDB\Mapping\Annotations as ODM;
use Symfony\Component\Validator\Constraints as Assert;

#[ODM\Document(collection: "activites", repositoryClass: ActiviteRepository::class)]
class Activite
{
    public const DIFFICULTES = [
        'Facile' => 'facile',
        'Moyen' => 'moyen',
        'Difficile' => 'difficile',
    ];

    #[ODM\Id]
    private ?string $id = null;

    #[ODM\Field(type: "string")]
    #[Assert\NotBlank(message: "Le titre est obligatoire.")]
    #[Assert\Length(min: 3, max: 150)]
    private ?string $titre = null;

    #[ODM\Field(type: "string")]
    #[Assert\NotBlank(message: "La description est obligatoire.")]
    private ?string $description = null;

    #[ODM\Field(type: "string")]
    #[Assert\NotBlank(message: "Les instructions sont obligatoires.")]
    private ?string $instructions = null;

    #[ODM\Field(type: "string")]
    #[Assert\NotBlank(message: "La difficulté est obligatoire.")]
    #[Assert\Choice(choices: ['facile', 'moyen', 'difficile'])]
    private ?string $difficulte = null;

    #[ODM\Field(type: "int")]
    #[Assert\NotBlank(message: "La durée est obligatoire.")]
    #[Assert\Positive(message: "La durée doit être supérieure à 0.")]
    private ?int $duree = null;

    #[ODM\ReferenceOne(targetDocument: Medecin::class, storeAs: "id")]
    private ?Medecin $medecin = null;

    #[ODM\Field(type: "date_immutable")]
    private ?\DateTimeImmutable $createdAt = null;

    public function __construct()
    {
        $this->createdAt = new \DateTimeImmutable();
    }

    public function getId(): ?string
    {
        return $this->id;
    }

    public function getTitre(): ?string
    {
        return $this->titre;
    }

    public function setTitre(?string $titre): static
    {
        $this->titre = $titre;
        return $this;
    }

    public function getDescription(): ?string
    {
        return $this->description;
    }

    public function setDescription(?string $description): static
    {
        $this->description = $description;
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

    public function getDifficulte(): ?string
    {
        return $this->difficulte;
    }

    public function setDifficulte(?string $difficulte): static
    {
        $this->difficulte = $difficulte;
        return $this;
    }

    public function getDuree(): ?int
    {
        return $this->duree;
    }

    public function setDuree(?int $duree): static
    {
        $this->duree = $duree;
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

    public function getCreatedAt(): ?\DateTimeImmutable
    {
        return $this->createdAt;
    }
}