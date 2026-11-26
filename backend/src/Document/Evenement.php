<?php

namespace App\Document;

use App\Repository\EvenementRepository;
use Doctrine\ODM\MongoDB\Mapping\Annotations as ODM;

#[ODM\Document(collection: "evenements", repositoryClass: EvenementRepository::class)]
class Evenement
{
    public const STATUT_EN_ATTENTE = 'en_attente';
    public const STATUT_ACCEPTE    = 'accepte';
    public const STATUT_REFUSE     = 'refuse';

    #[ODM\Id]
    private ?string $id = null;

    #[ODM\Field(type: "string")]
    private ?string $titre = null;

    #[ODM\Field(type: "string")]
    private ?string $description = null;

    #[ODM\Field(type: "date")]
    private ?\DateTime $dateDebut = null;

    #[ODM\Field(type: "date")]
    private ?\DateTime $dateFin = null;

    #[ODM\Field(type: "int")]
    private ?int $duree = null;

    #[ODM\Field(type: "string")]
    private ?string $localisation = null;

    #[ODM\Field(type: "int")]
    private ?int $nombreDeParticipant = null;

    #[ODM\Field(type: "float")]
    private ?float $prix = null;

    #[ODM\Field(type: "string")]
    private string $statut = self::STATUT_EN_ATTENTE;

    #[ODM\Field(type: "string", nullable: true)]
    private ?string $auteurId = null;

    #[ODM\Field(type: "string", nullable: true)]
    private ?string $auteurNom = null;

    #[ODM\Field(type: "string", nullable: true)]
    private ?string $motifRefus = null;

    #[ODM\Field(type: "date", nullable: true)]
    private ?\DateTime $dateDecision = null;

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

    public function getDateDebut(): ?\DateTime
    {
        return $this->dateDebut;
    }

    public function setDateDebut(\DateTime $dateDebut): static
    {
        $this->dateDebut = $dateDebut;
        return $this;
    }

    public function getDateFin(): ?\DateTime
    {
        return $this->dateFin;
    }

    public function setDateFin(\DateTime $dateFin): static
    {
        $this->dateFin = $dateFin;
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

    public function getLocalisation(): ?string
    {
        return $this->localisation;
    }

    public function setLocalisation(string $localisation): static
    {
        $this->localisation = $localisation;
        return $this;
    }

    public function getNombreDeParticipant(): ?int
    {
        return $this->nombreDeParticipant;
    }

    public function setNombreDeParticipant(int $nombreDeParticipant): static
    {
        $this->nombreDeParticipant = $nombreDeParticipant;
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

    public function getStatut(): string
    {
        return $this->statut;
    }

    public function setStatut(string $statut): static
    {
        $this->statut = $statut;
        return $this;
    }

    public function getAuteurId(): ?string
    {
        return $this->auteurId;
    }

    public function setAuteurId(?string $v): static
    {
        $this->auteurId = $v;
        return $this;
    }

    public function getAuteurNom(): ?string
    {
        return $this->auteurNom;
    }

    public function setAuteurNom(?string $v): static
    {
        $this->auteurNom = $v;
        return $this;
    }

    public function getMotifRefus(): ?string
    {
        return $this->motifRefus;
    }

    public function setMotifRefus(?string $v): static
    {
        $this->motifRefus = $v;
        return $this;
    }

    public function getDateDecision(): ?\DateTime
    {
        return $this->dateDecision;
    }

    public function setDateDecision(?\DateTime $v): static
    {
        $this->dateDecision = $v;
        return $this;
    }
}