<?php

namespace App\Document;

use App\Repository\EtudiantRepository;
use Doctrine\ODM\MongoDB\Mapping\Annotations as ODM;

#[ODM\Document(collection: "etudiants", repositoryClass: EtudiantRepository::class)]
class Etudiant
{
    #[ODM\Id]
    private ?string $id = null;

    #[ODM\Field(type: "string")]
    private ?string $faculte = null;

    #[ODM\Field(type: "int")]
    private ?int $numeroCarteEtudiant = null;

    #[ODM\Field(type: "string")]
    private ?string $niveauEtude = null;

    #[ODM\Field(type: "string")]
    private ?string $pays = null;

    #[ODM\Field(type: "string")]
    private ?string $ville = null;

    #[ODM\Field(type: "string")]
    private ?string $photo = null;

    #[ODM\ReferenceOne(targetDocument: User::class, storeAs: "id")]
    private ?User $utilisateur = null;

    public function getId(): ?string
    {
        return $this->id;
    }

    public function getFaculte(): ?string
    {
        return $this->faculte;
    }

    public function setFaculte(string $faculte): static
    {
        $this->faculte = $faculte;
        return $this;
    }

    public function getNumeroCarteEtudiant(): ?int
    {
        return $this->numeroCarteEtudiant;
    }

    public function setNumeroCarteEtudiant(int $numeroCarteEtudiant): static
    {
        $this->numeroCarteEtudiant = $numeroCarteEtudiant;
        return $this;
    }

    public function getNiveauEtude(): ?string
    {
        return $this->niveauEtude;
    }

    public function setNiveauEtude(string $niveauEtude): static
    {
        $this->niveauEtude = $niveauEtude;
        return $this;
    }

    public function getPays(): ?string
    {
        return $this->pays;
    }

    public function setPays(string $pays): static
    {
        $this->pays = $pays;
        return $this;
    }

    public function getVille(): ?string
    {
        return $this->ville;
    }

    public function setVille(string $ville): static
    {
        $this->ville = $ville;
        return $this;
    }

    public function getPhoto(): ?string
    {
        return $this->photo;
    }

    public function setPhoto(string $photo): static
    {
        $this->photo = $photo;
        return $this;
    }

    public function getUtilisateur(): ?User
    {
        return $this->utilisateur;
    }

    public function setUtilisateur(User $utilisateur): static
    {
        $this->utilisateur = $utilisateur;
        return $this;
    }
}