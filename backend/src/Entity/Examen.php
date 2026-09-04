<?php

namespace App\Entity;

use App\Repository\ExamenRepository;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: ExamenRepository::class)]
class Examen
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(type: Types::TEXT)]
    private ?string $instructions = null;

    #[ORM\Column]
    private ?int $duree = null;

    #[ORM\Column]
    private ?int $pointsTotaux = null;

    #[ORM\Column]
    private ?int $pointsDePassage = null;

    public function getId(): ?int
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