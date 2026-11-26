<?php

namespace App\Document;

use App\Repository\FormationRepository;
use Doctrine\ODM\MongoDB\Mapping\Annotations as ODM;

#[ODM\Document(collection: "formations", repositoryClass: FormationRepository::class)]
class Formation
{
    public const STATUT_EN_ATTENTE = 'en_attente';
    public const STATUT_ACCEPTEE = 'acceptee';
    public const STATUT_REFUSEE = 'refusee';

    #[ODM\Id]
    private ?string $id = null;

    #[ODM\Field(type: "string")]
    private ?string $titre = null;

    #[ODM\Field(type: "string")]
    private ?string $description = null;

    #[ODM\Field(type: "int")]
    private ?int $duree = null;

    #[ODM\Field(type: "date")]
    private ?\DateTime $dateDebut = null;

    #[ODM\Field(type: "date")]
    private ?\DateTime $dateFin = null;

    #[ODM\Field(type: "float")]
    private ?float $prix = null;

    #[ODM\Field(type: "bool")]
    private ?bool $gratuit = null;

    #[ODM\Field(type: "string")]
    private ?string $objectifs = null;

    // Statut de validation de la formation
    #[ODM\Field(type: "string")]
    private string $statut = self::STATUT_EN_ATTENTE;

    // Identifiant (email) du médecin qui a créé la formation
    #[ODM\Field(type: "string", nullable: true)]
    private ?string $createdBy = null;

    // Liste des identifiants (emails) des étudiants ayant mis cette formation en favori
    #[ODM\Field(type: "collection")]
    private array $favorisBy = [];

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

    public function getDateDebut(): ?\DateTime
    {
        return $this->dateDebut;
    }

    public function setDateDebut(?\DateTime $dateDebut): static
    {
        $this->dateDebut = $dateDebut;
        return $this;
    }

    public function getDateFin(): ?\DateTime
    {
        return $this->dateFin;
    }

    public function setDateFin(?\DateTime $dateFin): static
    {
        $this->dateFin = $dateFin;
        return $this;
    }

    public function getPrix(): ?float
    {
        return $this->prix;
    }

    public function setPrix(float $prix): static
    {
        $this->prix = $prix;
        return $this;
    }

    public function isGratuit(): ?bool
    {
        return $this->gratuit;
    }

    public function setGratuit(bool $gratuit): static
    {
        $this->gratuit = $gratuit;
        return $this;
    }

    public function getObjectifs(): ?string
    {
        return $this->objectifs;
    }

    public function setObjectifs(string $objectifs): static
    {
        $this->objectifs = $objectifs;
        return $this;
    }

    public function getStatut(): string
    {
        return $this->statut;
    }

    public function setStatut(string $statut): self
    {
        $this->statut = $statut;
        return $this;
    }

    public function getCreatedBy(): ?string
    {
        return $this->createdBy;
    }

    public function setCreatedBy(?string $createdBy): self
    {
        $this->createdBy = $createdBy;
        return $this;
    }

    public function getFavorisBy(): array
    {
        return $this->favorisBy;
    }

    public function isFavoriBy(?string $userIdentifier): bool
    {
        if (!$userIdentifier) {
            return false;
        }
        return in_array($userIdentifier, $this->favorisBy, true);
    }

    public function toggleFavori(string $userIdentifier): bool
    {
        if ($this->isFavoriBy($userIdentifier)) {
            $this->favorisBy = array_values(
                array_filter($this->favorisBy, fn(string $id) => $id !== $userIdentifier)
            );
            return false;
        }

        $this->favorisBy[] = $userIdentifier;
        return true;
    }
}