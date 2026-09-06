<?php

namespace App\Document;

use App\Repository\ExamenRepository;
use Doctrine\ODM\MongoDB\Mapping\Annotations as ODM;

#[ODM\Document(collection: "examens", repositoryClass: ExamenRepository::class)]
class Examen
{
    #[ODM\Id]
    private ?string $id = null;

    #[ODM\Field(type: "string")]
    private ?string $instructions = null;

    #[ODM\Field(type: "int")]
    private ?int $duree = null;

    #[ODM\Field(type: "int")]
    private ?int $pointsTotaux = null;

    #[ODM\Field(type: "int")]
    private ?int $pointsDePassage = null;

    public function getId(): ?string
    {
        return $this->id;
    }

    public function getInstructions(): ?string
    {
        return $this->instructions;
    }

    public function setInstructions(string $instructions): static
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
}