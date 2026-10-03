<?php

namespace App\Document;

use Doctrine\ODM\MongoDB\Mapping\Annotations as ODM;
use Symfony\Component\Validator\Constraints as Assert;

#[ODM\Document(collection: 'soumissions_activite')]
class SoumissionActivite
{
    #[ODM\Id]
    private ?string $id = null;

    #[ODM\ReferenceOne(targetDocument: Activite::class)]
    #[Assert\NotNull]
    private ?Activite $activite = null;

    #[ODM\ReferenceOne(targetDocument: Etudiant::class)]
    #[Assert\NotNull]
    private ?Etudiant $etudiant = null;

    #[ODM\Field(type: 'string')]
    #[Assert\NotBlank(message: 'Le contenu du travail est obligatoire.')]
    #[Assert\Length(min: 10, minMessage: 'Le travail doit contenir au moins {{ limit }} caractères.')]
    private ?string $contenu = null;

    #[ODM\Field(type: 'string', nullable: true)]
    private ?string $commentaireEtudiant = null;

    #[ODM\Field(type: 'string')]
    private string $statut = 'realise';   // ← modifié : par défaut "réalisé"

    #[ODM\Field(type: 'float', nullable: true)]
    private ?float $note = null;

    #[ODM\Field(type: 'string', nullable: true)]
    private ?string $commentaireMedecin = null;

    #[ODM\Field(type: 'date')]
    private \DateTimeInterface $createdAt;

    #[ODM\Field(type: 'date', nullable: true)]
    private ?\DateTimeInterface $updatedAt = null;

    public function __construct()
    {
        $this->createdAt = new \DateTimeImmutable();
    }

    public function getId(): ?string
    {
        return $this->id;
    }

    public function getActivite(): ?Activite
    {
        return $this->activite;
    }

    public function setActivite(?Activite $activite): self
    {
        $this->activite = $activite;
        return $this;
    }

    public function getEtudiant(): ?Etudiant
    {
        return $this->etudiant;
    }

    public function setEtudiant(?Etudiant $etudiant): self
    {
        $this->etudiant = $etudiant;
        return $this;
    }

    public function getContenu(): ?string
    {
        return $this->contenu;
    }

    public function setContenu(?string $contenu): self
    {
        $this->contenu = $contenu;
        return $this;
    }

    public function getCommentaireEtudiant(): ?string
    {
        return $this->commentaireEtudiant;
    }

    public function setCommentaireEtudiant(?string $commentaireEtudiant): self
    {
        $this->commentaireEtudiant = $commentaireEtudiant;
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

    public function getNote(): ?float
    {
        return $this->note;
    }

    public function setNote(?float $note): self
    {
        $this->note = $note;
        return $this;
    }

    public function getCommentaireMedecin(): ?string
    {
        return $this->commentaireMedecin;
    }

    public function setCommentaireMedecin(?string $commentaireMedecin): self
    {
        $this->commentaireMedecin = $commentaireMedecin;
        return $this;
    }

    public function getCreatedAt(): \DateTimeInterface
    {
        return $this->createdAt;
    }

    public function getUpdatedAt(): ?\DateTimeInterface
    {
        return $this->updatedAt;
    }

    public function setUpdatedAt(?\DateTimeInterface $updatedAt): self
    {
        $this->updatedAt = $updatedAt;
        return $this;
    }
}