<?php

namespace App\Controller;

use App\Document\Activite;
use App\Document\Medecin;
use App\Document\User;
use App\Form\ActiviteType;
use App\Repository\ActiviteRepository;
use App\Repository\MedecinRepository;
use Doctrine\ODM\MongoDB\DocumentManager;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;
use Symfony\Component\Validator\Validator\ValidatorInterface;

#[Route('/api/medecin/activites')]
#[IsGranted('ROLE_MEDECIN')]
class ActiviteController extends AbstractController
{
    #[Route('', name: 'app_activite_index', methods: ['GET', 'POST'])]
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
                'message' => 'L\'activité a été ajoutée avec succès.'
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
                    'createdAt' => $a->getCreatedAt()?->format('c'),
                ],
                $activites
            );

            return $this->json($data);
        }

        return $this->render('activite/index.html.twig', [
            'activites' => $activites,
        ]);
    }

    #[Route('/{id}', name: 'app_activite_show', methods: ['GET', 'PUT', 'DELETE'])]
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
                'createdAt' => $activite->getCreatedAt()?->format('c'),
            ]);
        }

        return $this->render('activite/show.html.twig', [
            'activite' => $activite,
        ]);
    }

    #[Route('/new', name: 'app_activite_new', methods: ['GET', 'POST'])]
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

            $dm->persist($activite);
            $dm->flush();

            $this->addFlash(
                'success',
                'L\'activité a été ajoutée avec succès.'
            );

            return $this->redirectToRoute('app_activite_index');
        }

        return $this->render('activite/new.html.twig', [
            'form' => $form,
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