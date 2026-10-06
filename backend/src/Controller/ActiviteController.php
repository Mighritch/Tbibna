<?php

namespace App\Controller;

use App\Document\Activite;
use App\Document\Medecin;
use App\Document\SoumissionActivite;
use App\Document\User;
use App\Form\ActiviteType;
use App\Repository\ActiviteRepository;
use App\Repository\MedecinRepository;
use App\Repository\SoumissionActiviteRepository;
use Doctrine\ODM\MongoDB\DocumentManager;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;
use Symfony\Component\Validator\Validator\ValidatorInterface;

class ActiviteController extends AbstractController
{
    #[Route('/api/activites/accepte', name: 'activites_accepte', methods: ['GET'])]
    #[IsGranted('ROLE_MEDECIN')]
    public function listeAcceptees(ActiviteRepository $activiteRepository): JsonResponse
    {
        $activites = $activiteRepository->findBy(
            ['statut' => 'accepte'],
            ['createdAt' => 'DESC']
        );

        $data = array_map(function (Activite $a) {
            $medecin = $a->getMedecin();
            $utilisateur = $medecin?->getUtilisateur();

            return [
                'id' => $a->getId(),
                'titre' => $a->getTitre(),
                'description' => $a->getDescription(),
                'instructions' => $a->getInstructions(),
                'difficulte' => $a->getDifficulte(),
                'duree' => $a->getDuree(),
                'statut' => $a->getStatut(),
                'createdAt' => $a->getCreatedAt()?->format('c'),
                'nbParticipants' => count($a->getParticipants()),
                'medecin' => $medecin ? [
                    'id' => $medecin->getId(),
                    'nom' => $utilisateur?->getNom(),
                    'prenom' => $utilisateur?->getPrenom(),
                ] : null,
            ];
        }, $activites);

        return $this->json($data);
    }

    #[Route('/api/medecin/activites', name: 'app_activite_index', methods: ['GET', 'POST'])]
    #[IsGranted('ROLE_MEDECIN')]
    public function index(
        Request $request,
        DocumentManager $dm,
        MedecinRepository $medecinRepository,
        ActiviteRepository $activiteRepository,
        ValidatorInterface $validator
    ): Response {
        $medecin = $this->getMedecinConnecte($medecinRepository);

        if ($request->isMethod('POST') && $this->isApiRequest($request)) {
            $payload = json_decode($request->getContent(), true);

            if (!$payload) {
                return $this->json([
                    'message' => 'Données JSON invalides'
                ], 400);
            }

            $activite = new Activite();
            $activite->setTitre($payload['titre'] ?? null);
            $activite->setDescription($payload['description'] ?? null);
            $activite->setInstructions($payload['instructions'] ?? null);
            $activite->setDifficulte($payload['difficulte'] ?? null);
            $activite->setDuree(
                isset($payload['duree']) ? (int) $payload['duree'] : null
            );
            $activite->setMedecin($medecin);
            $activite->setStatut('en_attente');

            $errors = $validator->validate($activite);

            if (count($errors) > 0) {
                $messages = [];
                foreach ($errors as $error) {
                    $messages[] = $error->getMessage();
                }
                return $this->json([
                    'message' => implode(' ', $messages)
                ], 422);
            }

            $dm->persist($activite);
            $dm->flush();

            return $this->json([
                'id' => $activite->getId(),
                'message' => 'L\'activité a été ajoutée avec succès. Elle sera visible sur la plateforme après validation par un administrateur.'
            ], 201);
        }

        $activites = $activiteRepository->findBy(
            ['medecin' => $medecin],
            ['createdAt' => 'DESC']
        );

        if ($this->isApiRequest($request)) {
            $data = array_map(
                fn(Activite $a) => [
                    'id' => $a->getId(),
                    'titre' => $a->getTitre(),
                    'description' => $a->getDescription(),
                    'instructions' => $a->getInstructions(),
                    'difficulte' => $a->getDifficulte(),
                    'duree' => $a->getDuree(),
                    'statut' => $a->getStatut(),
                    'createdAt' => $a->getCreatedAt()?->format('c'),
                    'nbParticipants' => count($a->getParticipants()),
                ],
                $activites
            );

            return $this->json($data);
        }

        return $this->render('activite/index.html.twig', [
            'activites' => $activites,
        ]);
    }

    #[Route('/api/medecin/activites/{id}', name: 'app_activite_show', methods: ['GET', 'PUT', 'DELETE'])]
    #[IsGranted('ROLE_MEDECIN')]
    public function show(
        string $id,
        Request $request,
        DocumentManager $dm,
        MedecinRepository $medecinRepository,
        ActiviteRepository $activiteRepository,
        ValidatorInterface $validator
    ): Response {
        $medecin = $this->getMedecinConnecte($medecinRepository);

        $activite = $activiteRepository->find($id);

        if (!$activite) {
            return $this->json([
                'message' => 'Activité introuvable.'
            ], 404);
        }

        if ($activite->getMedecin()?->getId() !== $medecin->getId()) {
            return $this->json([
                'message' => 'Vous n\'êtes pas autorisé à accéder à cette activité.'
            ], 403);
        }

        if ($request->isMethod('DELETE')) {
            $dm->remove($activite);
            $dm->flush();

            return $this->json([
                'message' => 'L\'activité a été supprimée avec succès.'
            ], 200);
        }

        if ($request->isMethod('PUT') && $this->isApiRequest($request)) {
            $payload = json_decode($request->getContent(), true);

            if (!$payload) {
                return $this->json([
                    'message' => 'Données JSON invalides'
                ], 400);
            }

            if (array_key_exists('titre', $payload)) {
                $activite->setTitre($payload['titre']);
            }
            if (array_key_exists('description', $payload)) {
                $activite->setDescription($payload['description']);
            }
            if (array_key_exists('instructions', $payload)) {
                $activite->setInstructions($payload['instructions']);
            }
            if (array_key_exists('difficulte', $payload)) {
                $activite->setDifficulte($payload['difficulte']);
            }
            if (array_key_exists('duree', $payload)) {
                $activite->setDuree(
                    $payload['duree'] !== null
                        ? (int) $payload['duree']
                        : null
                );
            }

            $errors = $validator->validate($activite);

            if (count($errors) > 0) {
                $messages = [];
                foreach ($errors as $error) {
                    $messages[] = $error->getMessage();
                }
                return $this->json([
                    'message' => implode(' ', $messages)
                ], 422);
            }

            $dm->flush();

            return $this->json([
                'id' => $activite->getId(),
                'message' => 'L\'activité a été modifiée avec succès.'
            ], 200);
        }

        if ($this->isApiRequest($request)) {
            return $this->json([
                'id' => $activite->getId(),
                'titre' => $activite->getTitre(),
                'description' => $activite->getDescription(),
                'instructions' => $activite->getInstructions(),
                'difficulte' => $activite->getDifficulte(),
                'duree' => $activite->getDuree(),
                'statut' => $activite->getStatut(),
                'createdAt' => $activite->getCreatedAt()?->format('c'),
                'nbParticipants' => count($activite->getParticipants()),
            ]);
        }

        return $this->render('activite/show.html.twig', [
            'activite' => $activite,
        ]);
    }

    #[Route('/api/medecin/activites/new', name: 'app_activite_new', methods: ['GET', 'POST'])]
    #[IsGranted('ROLE_MEDECIN')]
    public function new(
        Request $request,
        DocumentManager $dm,
        MedecinRepository $medecinRepository
    ): Response {
        $medecin = $this->getMedecinConnecte($medecinRepository);

        $activite = new Activite();
        $form = $this->createForm(ActiviteType::class, $activite);
        $form->handleRequest($request);

        if ($form->isSubmitted() && $form->isValid()) {
            $activite->setMedecin($medecin);
            $activite->setStatut('en_attente');

            $dm->persist($activite);
            $dm->flush();

            $this->addFlash(
                'success',
                'L\'activité a été ajoutée avec succès. Elle sera visible après validation par un administrateur.'
            );

            return $this->redirectToRoute('app_activite_index');
        }

        return $this->render('activite/new.html.twig', [
            'form' => $form,
        ]);
    }

    #[Route('/api/medecin/activites/{id}/soumissions', name: 'medecin_activite_soumissions', methods: ['GET'])]
    #[IsGranted('ROLE_MEDECIN')]
    public function soumissions(
        string $id,
        ActiviteRepository $activiteRepository,
        MedecinRepository $medecinRepository,
        SoumissionActiviteRepository $soumissionRepository
    ): JsonResponse {
        $medecin = $this->getMedecinConnecte($medecinRepository);

        $activite = $activiteRepository->find($id);

        if (!$activite) {
            return $this->json(['message' => 'Activité introuvable.'], 404);
        }

        if ($activite->getMedecin()?->getId() !== $medecin->getId()) {
            return $this->json(['message' => 'Vous n\'êtes pas autorisé à accéder à cette activité.'], 403);
        }

        $soumissions = $soumissionRepository->findBy(
            ['activite' => $activite],
            ['createdAt' => 'DESC']
        );

        if (empty($soumissions)) {
            $soumissions = $soumissionRepository->findBy(
                ['activite' => $activite->getId()],
                ['createdAt' => 'DESC']
            );
        }

        $data = array_map(function (SoumissionActivite $s) {
            $etudiant = $s->getEtudiant();
            $utilisateur = $etudiant?->getUtilisateur();

            $etudiantNom = 'Étudiant';
            if ($utilisateur) {
                $prenom = method_exists($utilisateur, 'getPrenom') ? ($utilisateur->getPrenom() ?? '') : '';
                $nom    = method_exists($utilisateur, 'getNom')    ? ($utilisateur->getNom() ?? '')    : '';
                $etudiantNom = trim($prenom . ' ' . $nom) ?: 'Étudiant';
            }

            return [
                'id'                  => $s->getId(),
                'contenu'             => $s->getContenu(),
                'commentaireEtudiant' => $s->getCommentaireEtudiant(),
                'statut'              => $s->getStatut(),
                'note'                => $s->getNote(),
                'commentaireMedecin'  => $s->getCommentaireMedecin(),
                'createdAt'           => $s->getCreatedAt()?->format('c'),
                'etudiant'            => [
                    'id'  => $etudiant?->getId(),
                    'nom' => $etudiantNom,
                ],
            ];
        }, $soumissions);

        return $this->json([
            'activite' => [
                'id'    => $activite->getId(),
                'titre' => $activite->getTitre(),
            ],
            'soumissions' => $data,
            'total'       => count($data),
        ]);
    }

    #[Route('/api/medecin/soumissions/{id}/noter', name: 'medecin_soumission_noter', methods: ['PUT'])]
    #[IsGranted('ROLE_MEDECIN')]
    public function noterSoumission(
        string $id,
        Request $request,
        DocumentManager $dm,
        MedecinRepository $medecinRepository,
        SoumissionActiviteRepository $soumissionRepository
    ): JsonResponse {
        $medecin = $this->getMedecinConnecte($medecinRepository);

        $soumission = $soumissionRepository->find($id);

        if (!$soumission) {
            return $this->json(['message' => 'Soumission introuvable.'], 404);
        }

        $activite = $soumission->getActivite();

        if (!$activite || $activite->getMedecin()?->getId() !== $medecin->getId()) {
            return $this->json(['message' => 'Vous n\'êtes pas autorisé à noter cette soumission.'], 403);
        }

        $payload = json_decode($request->getContent(), true);

        if (!$payload) {
            return $this->json(['message' => 'Données JSON invalides'], 400);
        }

        if (array_key_exists('note', $payload)) {
            $note = $payload['note'] !== null ? (float) $payload['note'] : null;
            if ($note !== null && ($note < 0 || $note > 20)) {
                return $this->json(['message' => 'La note doit être comprise entre 0 et 20.'], 422);
            }
            $soumission->setNote($note);
        }

        if (array_key_exists('commentaireMedecin', $payload)) {
            $soumission->setCommentaireMedecin($payload['commentaireMedecin'] ?: null);
        }

        $soumission->setUpdatedAt(new \DateTimeImmutable());
        $dm->flush();

        return $this->json([
            'message' => 'Note enregistrée avec succès.',
            'note'    => $soumission->getNote(),
            'commentaireMedecin' => $soumission->getCommentaireMedecin(),
        ]);
    }

    private function isApiRequest(Request $request): bool
    {
        $accept = $request->headers->get('Accept', '');
        $contentType = $request->headers->get('Content-Type', '');

        return str_contains($accept, 'application/json')
            || str_contains($contentType, 'application/json')
            || $request->query->get('format') === 'json';
    }

    private function getMedecinConnecte(
        MedecinRepository $medecinRepository
    ): Medecin {
        $user = $this->getUser();

        if (!$user instanceof User) {
            throw $this->createAccessDeniedException(
                'Utilisateur non authentifié.'
            );
        }

        $medecin = $medecinRepository->findOneBy([
            'utilisateur' => $user->getId()
        ]);

        if (!$medecin) {
            throw $this->createAccessDeniedException(
                'Aucun profil médecin associé à ce compte.'
            );
        }

        return $medecin;
    }
}