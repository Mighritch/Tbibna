<?php

namespace App\Controller;

use App\Document\Activite;
use App\Repository\ActiviteRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[Route('/api/etudiant/activites')]
#[IsGranted('ROLE_ETUDIANT')]
class EtudiantActiviteController extends AbstractController
{
    #[Route('', name: 'app_etudiant_activite_index', methods: ['GET'])]
    public function index(ActiviteRepository $activiteRepository): Response
    {
        // On ne récupère QUE les activités acceptées
        $activites = $activiteRepository->findBy(
            ['statut' => 'accepte'],
            ['createdAt' => 'DESC']
        );

        $data = array_map(function (Activite $activite) {
            $medecin = $activite->getMedecin();
            $medecinNom = null;

            if ($medecin) {
                // On essaie d'abord via getUser() (méthode la plus courante)
                if (method_exists($medecin, 'getUser')) {
                    $user = $medecin->getUser();
                    if ($user) {
                        $prenom = method_exists($user, 'getPrenom') ? ($user->getPrenom() ?? '') : '';
                        $nom    = method_exists($user, 'getNom')    ? ($user->getNom() ?? '')    : '';
                        $medecinNom = trim($prenom . ' ' . $nom);
                    }
                }

                // Fallback : via getUtilisateur() si ton document Medecin utilise ce nom
                if (!$medecinNom && method_exists($medecin, 'getUtilisateur')) {
                    $user = $medecin->getUtilisateur();
                    if ($user) {
                        $prenom = method_exists($user, 'getPrenom') ? ($user->getPrenom() ?? '') : '';
                        $nom    = method_exists($user, 'getNom')    ? ($user->getNom() ?? '')    : '';
                        $medecinNom = trim($prenom . ' ' . $nom);
                    }
                }

                // Dernier recours : ID du médecin
                if (!$medecinNom && method_exists($medecin, 'getId')) {
                    $medecinNom = (string) $medecin->getId();
                }
            }

            return [
                'id'           => $activite->getId(),
                'titre'        => $activite->getTitre(),
                'description'  => $activite->getDescription(),
                'instructions' => $activite->getInstructions(),
                'difficulte'   => $activite->getDifficulte(),
                'duree'        => $activite->getDuree(),
                'statut'       => $activite->getStatut(),
                'createdAt'    => $activite->getCreatedAt()?->format('c'),
                'medecinNom'   => $medecinNom ?: 'Médecin',
            ];
        }, $activites);

        return $this->json($data);
    }
}