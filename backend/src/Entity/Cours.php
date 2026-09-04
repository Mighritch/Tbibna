<?php

namespace App\Entity;

use App\Repository\CoursRepository;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: CoursRepository::class)]
class Cours
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(length: 255)]
    private ?string $titre = null;

    #[ORM\Column(length: 255)]
    private ?string $description = null;

    #[ORM\Column]
    private ?int $duree = null;

    #[ORM\Column(length: 255)]
    private ?string $langueCours = null;

    #[ORM\Column(length: 255)]
    private ?string $ContenuCours = null;

    #[ORM\Column(length: 255)]
    private ?string $niveauCours = null;

    public function getId(): ?int
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
        return $this->ContenuCours;
    }

    public function setContenuCours(string $ContenuCours): static
    {
        $this->ContenuCours = $ContenuCours;

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
}
