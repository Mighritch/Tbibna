<?php

namespace App\Controller;

use App\Document\Evenement;
use App\Repository\EvenementRepository;
use Doctrine\ODM\MongoDB\DocumentManager;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[Route('/api')]
class EvenementController extends AbstractController
{
    /* ------------------------------------------------------------------ */
    /*  PUBLIC : évènements acceptés uniquement                            */
    /* ------------------------------------------------------------------ */

    #[Route('/evenements/publies', name: 'api_evenement_publies', methods: ['GET'])]
    public function publies(EvenementRepository $repo): JsonResponse
    {
        return $this->json(
            array_map(fn (Evenement $e) => $this->serialize($e), $repo->findPublies())
        );
    }

    /* ------------------------------------------------------------------ */
    /*  MÉDECIN                                                            */
    /* ------------------------------------------------------------------ */

    #[Route('/evenements', name: 'api_evenement_index', methods: ['GET'])]
    #[IsGranted('ROLE_MEDECIN')]
    public function index(EvenementRepository $repo): JsonResponse
    {
        [$auteurId] = $this->auteur();
        $evenements = $repo->findByAuteur($auteurId);

        return $this->json(array_map(fn (Evenement $e) => $this->serialize($e), $evenements));
    }

    #[Route('/evenements/{id}', name: 'api_evenement_show', methods: ['GET'])]
    #[IsGranted('ROLE_MEDECIN')]
    public function show(string $id, EvenementRepository $repo): JsonResponse
    {
        $evenement = $repo->find($id);
        if (!$evenement) {
            return $this->json(['message' => 'Évènement introuvable.'], 404);
        }

        [$auteurId] = $this->auteur();
        if ($evenement->getAuteurId() !== $auteurId) {
            return $this->json(['message' => 'Accès refusé à cet évènement.'], 403);
        }

        return $this->json($this->serialize($evenement));
    }

    #[Route('/evenements', name: 'api_evenement_new', methods: ['POST'])]
    #[IsGranted('ROLE_MEDECIN')]
    public function create(Request $request, DocumentManager $dm): JsonResponse
    {
        try {
            $data = $request->toArray();
        } catch (\Throwable) {
            return $this->json(['message' => 'JSON invalide.'], 400);
        }

        $validated = $this->validatePayload($data);
        if (isset($validated['errors'])) {
            return $this->json(['message' => 'Formulaire invalide.', 'errors' => $validated['errors']], 422);
        }

        [$auteurId, $auteurNom] = $this->auteur();

        $evenement = (new Evenement())
            ->setTitre($validated['titre'])
            ->setDescription($validated['description'])
            ->setDateDebut($validated['debut'])
            ->setDateFin($validated['fin'])
            ->setLocalisation($validated['localisation'])
            ->setNombreDeParticipant($validated['nombre'])
            ->setPrix($validated['prix'])
            ->setAuteurId($auteurId)
            ->setAuteurNom($auteurNom)
            ->setStatut(Evenement::STATUT_EN_ATTENTE);

        $secondes = $validated['fin']->getTimestamp() - $validated['debut']->getTimestamp();
        $evenement->setDuree((int) ceil($secondes / 3600));

        $dm->persist($evenement);
        $dm->flush();

        return $this->json($this->serialize($evenement), 201);
    }

    #[Route('/evenements/{id}', name: 'api_evenement_edit', methods: ['PUT'])]
    #[IsGranted('ROLE_MEDECIN')]
    public function update(string $id, Request $request, EvenementRepository $repo, DocumentManager $dm): JsonResponse
    {
        $evenement = $repo->find($id);
        if (!$evenement) {
            return $this->json(['message' => 'Évènement introuvable.'], 404);
        }

        [$auteurId] = $this->auteur();
        if ($evenement->getAuteurId() !== $auteurId) {
            return $this->json(['message' => 'Vous ne pouvez modifier que vos propres évènements.'], 403);
        }

        try {
            $data = $request->toArray();
        } catch (\Throwable) {
            return $this->json(['message' => 'JSON invalide.'], 400);
        }

        $validated = $this->validatePayload($data);
        if (isset($validated['errors'])) {
            return $this->json(['message' => 'Formulaire invalide.', 'errors' => $validated['errors']], 422);
        }

        $secondes = $validated['fin']->getTimestamp() - $validated['debut']->getTimestamp();

        $evenement
            ->setTitre($validated['titre'])
            ->setDescription($validated['description'])
            ->setDateDebut($validated['debut'])
            ->setDateFin($validated['fin'])
            ->setDuree((int) ceil($secondes / 3600))
            ->setLocalisation($validated['localisation'])
            ->setNombreDeParticipant($validated['nombre'])
            ->setPrix($validated['prix'])
            // Toute modification repasse l'évènement en attente de validation admin
            ->setStatut(Evenement::STATUT_EN_ATTENTE)
            ->setMotifRefus(null)
            ->setDateDecision(null);

        $dm->flush();

        return $this->json($this->serialize($evenement));
    }

    #[Route('/evenements/{id}', name: 'api_evenement_delete', methods: ['DELETE'])]
    #[IsGranted('ROLE_MEDECIN')]
    public function delete(string $id, EvenementRepository $repo, DocumentManager $dm): JsonResponse
    {
        $evenement = $repo->find($id);
        if (!$evenement) {
            return $this->json(['message' => 'Évènement introuvable.'], 404);
        }

        [$auteurId] = $this->auteur();
        if ($evenement->getAuteurId() !== $auteurId) {
            return $this->json(['message' => 'Vous ne pouvez supprimer que vos propres évènements.'], 403);
        }

        $dm->remove($evenement);
        $dm->flush();

        return $this->json(['message' => 'Évènement supprimé avec succès.']);
    }

    /* ------------------------------------------------------------------ */
    /*  ADMIN                                                              */
    /* ------------------------------------------------------------------ */

    #[Route('/admin/evenements', name: 'api_admin_evenement_index', methods: ['GET'])]
    #[IsGranted('ROLE_ADMIN')]
    public function adminIndex(Request $request, EvenementRepository $repo): JsonResponse
    {
        $statut = $request->query->get('statut');
        $valides = [Evenement::STATUT_EN_ATTENTE, Evenement::STATUT_ACCEPTE, Evenement::STATUT_REFUSE];

        if ($statut !== null && !in_array($statut, $valides, true)) {
            return $this->json(['message' => 'Statut invalide.'], 400);
        }

        $evenements = $repo->findForAdmin($statut);

        return $this->json(array_map(fn (Evenement $e) => $this->serialize($e), $evenements));
    }

    #[Route('/admin/evenements/{id}/accepter', name: 'api_admin_evenement_accepter', methods: ['PATCH'])]
    #[IsGranted('ROLE_ADMIN')]
    public function accepter(string $id, EvenementRepository $repo, DocumentManager $dm): JsonResponse
    {
        $evenement = $repo->find($id);
        if (!$evenement) {
            return $this->json(['message' => 'Évènement introuvable.'], 404);
        }

        $evenement
            ->setStatut(Evenement::STATUT_ACCEPTE)
            ->setMotifRefus(null)
            ->setDateDecision(new \DateTime());

        $dm->flush();

        return $this->json($this->serialize($evenement));
    }

    #[Route('/admin/evenements/{id}/refuser', name: 'api_admin_evenement_refuser', methods: ['PATCH'])]
    #[IsGranted('ROLE_ADMIN')]
    public function refuser(string $id, Request $request, EvenementRepository $repo, DocumentManager $dm): JsonResponse
    {
        $evenement = $repo->find($id);
        if (!$evenement) {
            return $this->json(['message' => 'Évènement introuvable.'], 404);
        }

        try {
            $data = $request->getContent() !== '' ? $request->toArray() : [];
        } catch (\Throwable) {
            $data = [];
        }

        $motif = trim((string) ($data['motif'] ?? ''));

        $evenement
            ->setStatut(Evenement::STATUT_REFUSE)
            ->setMotifRefus($motif !== '' ? $motif : null)
            ->setDateDecision(new \DateTime());

        $dm->flush();

        return $this->json($this->serialize($evenement));
    }

    /* ------------------------------------------------------------------ */
    /*  Helpers                                                            */
    /* ------------------------------------------------------------------ */

    private function validatePayload(array $data): array
    {
        $errors = [];

        foreach (['titre', 'description', 'localisation'] as $champ) {
            if (trim((string) ($data[$champ] ?? '')) === '') {
                $errors[$champ] = 'Ce champ est obligatoire.';
            }
        }

        $debut = $this->parseDate($data['dateDebut'] ?? null, 'dateDebut', 'La date de début', $errors);
        $fin   = $this->parseDate($data['dateFin'] ?? null, 'dateFin', 'La date de fin', $errors);

        if ($debut && $fin && $fin <= $debut) {
            $errors['dateFin'] = 'La date de fin doit être postérieure à la date de début.';
        }

        $nombre = filter_var($data['nombreDeParticipant'] ?? null, FILTER_VALIDATE_INT);
        if ($nombre === false || $nombre < 1) {
            $errors['nombreDeParticipant'] = 'Le nombre de participants doit être supérieur à 0.';
        }

        $prix = filter_var($data['prix'] ?? null, FILTER_VALIDATE_FLOAT);
        if ($prix === false || $prix < 0) {
            $errors['prix'] = 'Le prix ne peut pas être négatif.';
        }

        if ($errors) {
            return ['errors' => $errors];
        }

        return [
            'titre' => trim((string) $data['titre']),
            'description' => trim((string) $data['description']),
            'localisation' => trim((string) $data['localisation']),
            'debut' => $debut,
            'fin' => $fin,
            'nombre' => (int) $nombre,
            'prix' => (float) $prix,
        ];
    }

    /** @return array{0: string, 1: string} [id, nom complet] de l'utilisateur connecté */
    private function auteur(): array
    {
        $u = $this->getUser();

        $id = method_exists($u, 'getId') ? (string) $u->getId() : $u->getUserIdentifier();
        $nom = trim(
            (method_exists($u, 'getPrenom') ? (string) $u->getPrenom() : '') . ' ' .
            (method_exists($u, 'getNom') ? (string) $u->getNom() : '')
        );

        return [$id, $nom !== '' ? $nom : $u->getUserIdentifier()];
    }

    private function parseDate(mixed $value, string $key, string $label, array &$errors): ?\DateTime
    {
        if (empty($value)) {
            $errors[$key] = "$label est obligatoire.";
            return null;
        }

        try {
            return new \DateTime((string) $value);
        } catch (\Exception) {
            $errors[$key] = "$label est invalide.";
            return null;
        }
    }

    private function serialize(Evenement $e): array
    {
        return [
            'id' => $e->getId(),
            'titre' => $e->getTitre(),
            'description' => $e->getDescription(),
            'dateDebut' => $e->getDateDebut()?->format(\DateTimeInterface::ATOM),
            'dateFin' => $e->getDateFin()?->format(\DateTimeInterface::ATOM),
            'duree' => $e->getDuree(),
            'localisation' => $e->getLocalisation(),
            'nombreDeParticipant' => $e->getNombreDeParticipant(),
            'prix' => $e->getPrix(),
            'statut' => $e->getStatut(),
            'auteurNom' => $e->getAuteurNom(),
            'motifRefus' => $e->getMotifRefus(),
            'dateDecision' => $e->getDateDecision()?->format(\DateTimeInterface::ATOM),
        ];
    }
}