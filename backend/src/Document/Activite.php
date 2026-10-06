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

    public const STATUTS = [
        'En attente' => 'en_attente',
        'Acceptée'   => 'accepte',
        'Refusée'    => 'refuse',
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

    #[ODM\Field(type: "string")]
    #[Assert\Choice(choices: ['en_attente', 'accepte', 'refuse'])]
    private string $statut = 'en_attente';

    #[ODM\ReferenceOne(targetDocument: Medecin::class, storeAs: "id")]
    private ?Medecin $medecin = null;

    #[ODM\Field(type: "date_immutable")]
    private ?\DateTimeImmutable $createdAt = null;

    #[ODM\Field(type: "collection")]
    private array $favoris = [];

    #[ODM\Field(type: "collection")]
    private array $participants = [];

    public function __construct()
    {
        $this->createdAt = new \DateTimeImmutable();
        $this->statut = 'en_attente';
        $this->favoris = [];
        $this->participants = [];
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

    public function getCreatedAt(): ?\DateTimeImmutable
    {
        return $this->createdAt;
    }

    // ========== FAVORIS (null-safe) ==========
    public function getFavoris(): array
    {
        return $this->favoris ?? [];
    }

    public function setFavoris(array $favoris): self
    {
        $this->favoris = $favoris;
        return $this;
    }

    public function addFavori(string $etudiantId): self
    {
        $favoris = $this->getFavoris();
        if (!in_array($etudiantId, $favoris, true)) {
            $favoris[] = $etudiantId;
            $this->favoris = $favoris;
        }
        return $this;
    }

    public function removeFavori(string $etudiantId): self
    {
        $this->favoris = array_values(array_filter(
            $this->getFavoris(),
            fn($id) => $id !== $etudiantId
        ));
        return $this;
    }

    public function isFavoriPar(string $etudiantId): bool
    {
        return in_array($etudiantId, $this->getFavoris(), true);
    }

    // ========== PARTICIPANTS (null-safe) ==========
    public function getParticipants(): array
    {
        return $this->participants ?? [];
    }

    public function setParticipants(array $participants): self
    {
        $this->participants = $participants;
        return $this;
    }

    public function addParticipant(string $etudiantId): self
    {
        $participants = $this->getParticipants();
        if (!in_array($etudiantId, $participants, true)) {
            $participants[] = $etudiantId;
            $this->participants = $participants;
        }
        return $this;
    }

    public function removeParticipant(string $etudiantId): self
    {
        $this->participants = array_values(array_filter(
            $this->getParticipants(),
            fn($id) => $id !== $etudiantId
        ));
        return $this;
    }

    public function isParticipant(string $etudiantId): bool
    {
        return in_array($etudiantId, $this->getParticipants(), true);
    }
}