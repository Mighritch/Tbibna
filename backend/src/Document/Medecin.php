<?php

namespace App\Document;

use App\Repository\MedecinRepository;
use Doctrine\ODM\MongoDB\Mapping\Annotations as ODM;

#[ODM\Document(collection: "medecins", repositoryClass: MedecinRepository::class)]
class Medecin
{
    #[ODM\Id]
    private ?string $id = null;

    #[ODM\Field(type: "string")]
    private ?string $numeroLicence = null;

    #[ODM\Field(type: "string")]
    private ?string $specialite = null;

    #[ODM\Field(type: "int")]
    private ?int $anneeExperience = null;

    #[ODM\Field(type: "string")]
    private ?string $hopital = null;

    #[ODM\Field(type: "string")]
    private ?string $faculte = null;

    #[ODM\Field(type: "string", nullable: true)]
    private ?string $photo = null;

    #[ODM\ReferenceOne(targetDocument: User::class, storeAs: "id")]
    private ?User $utilisateur = null;

    public function getId(): ?string
    {
        return $this->id;
    }

    public function getNumeroLicence(): ?string
    {
        return $this->numeroLicence;
    }

    public function setNumeroLicence(string $numeroLicence): static
    {
        $this->numeroLicence = $numeroLicence;
        return $this;
    }

    public function getSpecialite(): ?string
    {
        return $this->specialite;
    }

    public function setSpecialite(string $specialite): static
    {
        $this->specialite = $specialite;
        return $this;
    }

    public function getAnneeExperience(): ?int
    {
        return $this->anneeExperience;
    }

    public function setAnneeExperience(int $anneeExperience): static
    {
        $this->anneeExperience = $anneeExperience;
        return $this;
    }

    public function getHopital(): ?string
    {
        return $this->hopital;
    }

    public function setHopital(string $hopital): static
    {
        $this->hopital = $hopital;
        return $this;
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

    public function getPhoto(): ?string
    {
        return $this->photo;
    }

    public function setPhoto(?string $photo): static
    {
        $this->photo = $photo;
        return $this;
    }

    public function getUtilisateur(): ?User
    {
        return $this->utilisateur;
    }

    public function setUtilisateur(?User $utilisateur): static
    {
        $this->utilisateur = $utilisateur;
        return $this;
    }
}