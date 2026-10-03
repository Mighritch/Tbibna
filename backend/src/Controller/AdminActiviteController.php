<?php

namespace App\Controller;

use App\Document\Activite;
use App\Repository\ActiviteRepository;
use Doctrine\ODM\MongoDB\DocumentManager;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[Route('/api/admin/activites')]
#[IsGranted('ROLE_ADMIN')]
class AdminActiviteController extends AbstractController
{
    #[Route('', name: 'app_admin_activite_index', methods: ['GET'])]
    public function index(
        ActiviteRepository $activiteRepository
    ): Response {
        $activites = $activiteRepository->findBy(
            [],
            ['createdAt' => 'DESC']
        );

        $data = array_map(
            function (Activite $activite) {
                $medecin = $activite->getMedecin();
                $medecinNom = null;

                if ($medecin) {
                    /*
                     * Le médecin est lié à un User.
                     * On récupère le prénom et le nom depuis User.
                     */
                    if (method_exists($medecin, 'getUser')) {
                        $user = $medecin->getUser();

                        if ($user) {
                            $prenom = method_exists($user, 'getPrenom')
                                ? ($user->getPrenom() ?? '')
                                : '';

                            $nom = method_exists($user, 'getNom')
                                ? ($user->getNom() ?? '')
                                : '';

                            $medecinNom = trim($prenom . ' ' . $nom);
                        }
                    }

                    // Si aucun nom n'a été trouvé, on utilise l'ID du médecin.
                    if (!$medecinNom && method_exists($medecin, 'getId')) {
                        $medecinNom = (string) $medecin->getId();
                    }
                }

                return [
                    'id' => $activite->getId(),
                    'titre' => $activite->getTitre(),
                    'description' => $activite->getDescription(),
                    'instructions' => $activite->getInstructions(),
                    'difficulte' => $activite->getDifficulte(),
                    'duree' => $activite->getDuree(),
                    'statut' => $activite->getStatut(),
                    'createdAt' => $activite->getCreatedAt()?->format('c'),
                    'medecinNom' => $medecinNom,
                ];
            },
            $activites
        );

        return $this->json($data);
    }

    #[Route(
        '/{id}/statut',
        name: 'app_admin_activite_statut',
        methods: ['PUT']
    )]
    public function changeStatut(
        string $id,
        Request $request,
        ActiviteRepository $activiteRepository,
        DocumentManager $dm
    ): Response {
        $activite = $activiteRepository->find($id);

        if (!$activite) {
            return $this->json(
                ['message' => 'Activité introuvable.'],
                Response::HTTP_NOT_FOUND
            );
        }

        $payload = json_decode(
            $request->getContent(),
            true
        );

        if (!is_array($payload) || !isset($payload['statut'])) {
            return $this->json(
                ['message' => 'Données JSON invalides.'],
                Response::HTTP_BAD_REQUEST
            );
        }

        $statut = $payload['statut'];

        if (!in_array(
            $statut,
            ['en_attente', 'accepte', 'refuse'],
            true
        )) {
            return $this->json(
                ['message' => 'Statut invalide.'],
                Response::HTTP_UNPROCESSABLE_ENTITY
            );
        }

        $activite->setStatut($statut);

        $dm->flush();

        return $this->json([
            'id' => $activite->getId(),
            'statut' => $activite->getStatut(),
            'message' => 'Statut mis à jour avec succès.',
        ]);
    }
}