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

    // Chemin/URL relatif du fichier uploadé (ex: /uploads/cours/abc123.pdf)
    #[ODM\Field(type: "string")]
    private ?string $contenuCours = null;

    // Nom original du fichier envoyé par le médecin (pour affichage)
    #[ODM\Field(type: "string", nullable: true)]
    private ?string $nomOriginalFichier = null;

    // Type du contenu : "pdf", "word" ou "video"
    #[ODM\Field(type: "string")]
    private ?string $typeContenu = null;

    #[ODM\Field(type: "string")]
    private ?string $niveauCours = null;

    // Statut de validation : "en_attente" | "approuve" | "rejete"
    #[ODM\Field(type: "string")]
    private string $statut = 'en_attente';

    // Référence vers le médecin qui a créé le cours
    #[ODM\ReferenceOne(targetDocument: Medecin::class, storeAs: "id")]
    private ?Medecin $medecin = null;

    // Date de création (utile pour trier / afficher)
    #[ODM\Field(type: "date")]
    private ?\DateTime $dateCreation = null;

    public function __construct()
    {
        $this->dateCreation = new \DateTime();
        $this->statut = 'en_attente';
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

    public function getNomOriginalFichier(): ?string
    {
        return $this->nomOriginalFichier;
    }

    public function setNomOriginalFichier(?string $nomOriginalFichier): static
    {
        $this->nomOriginalFichier = $nomOriginalFichier;
        return $this;
    }

    public function getTypeContenu(): ?string
    {
        return $this->typeContenu;
    }

    public function setTypeContenu(string $typeContenu): static
    {
        $this->typeContenu = $typeContenu;
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

    public function getStatut(): string
    {
        return $this->statut;
    }

    public function setStatut(string $statut): static
    {
        $this->statut = $statut;
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