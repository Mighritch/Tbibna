<?php

namespace App\Controller;

use App\Document\Activite;
use App\Document\Etudiant;
use App\Document\SoumissionActivite;
use App\Document\User;
use App\Repository\ActiviteRepository;
use App\Repository\EtudiantRepository;
use Doctrine\ODM\MongoDB\DocumentManager;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;
use Symfony\Component\Validator\Validator\ValidatorInterface;

#[Route('/api/etudiant/activites')]
#[IsGranted('ROLE_ETUDIANT')]
class EtudiantActiviteController extends AbstractController
{
    #[Route('', name: 'app_etudiant_activite_index', methods: ['GET'])]
    public function index(
        ActiviteRepository $activiteRepository,
        EtudiantRepository $etudiantRepository,
        DocumentManager $dm
    ): Response {
        $etudiant = $this->getEtudiantConnecte($etudiantRepository);
        $soumissionRepository = $dm->getRepository(SoumissionActivite::class);

        $activites = $activiteRepository->findBy(
            ['statut' => 'accepte'],
            ['createdAt' => 'DESC']
        );

        $data = array_map(function (Activite $activite) use ($etudiant, $soumissionRepository) {
            $medecin = $activite->getMedecin();
            $medecinNom = null;

            if ($medecin) {
                if (method_exists($medecin, 'getUser')) {
                    $user = $medecin->getUser();
                    if ($user) {
                        $prenom = method_exists($user, 'getPrenom') ? ($user->getPrenom() ?? '') : '';
                        $nom    = method_exists($user, 'getNom')    ? ($user->getNom() ?? '')    : '';
                        $medecinNom = trim($prenom . ' ' . $nom);
                    }
                }

                if (!$medecinNom && method_exists($medecin, 'getUtilisateur')) {
                    $user = $medecin->getUtilisateur();
                    if ($user) {
                        $prenom = method_exists($user, 'getPrenom') ? ($user->getPrenom() ?? '') : '';
                        $nom    = method_exists($user, 'getNom')    ? ($user->getNom() ?? '')    : '';
                        $medecinNom = trim($prenom . ' ' . $nom);
                    }
                }

                if (!$medecinNom && method_exists($medecin, 'getId')) {
                    $medecinNom = (string) $medecin->getId();
                }
            }

            $soumission = $soumissionRepository->findOneBy([
                'activite' => $activite,
                'etudiant' => $etudiant,
            ]);

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
                'aDejaSoumis'  => $soumission !== null,
                'isFavori'     => $activite->isFavoriPar($etudiant->getId()),
                'soumission'   => $soumission ? [
                    'id'                  => $soumission->getId(),
                    'contenu'             => $soumission->getContenu(),
                    'commentaireEtudiant' => $soumission->getCommentaireEtudiant(),
                    'statut'              => $soumission->getStatut(),
                    'note'                => $soumission->getNote(),
                    'commentaireMedecin'  => $soumission->getCommentaireMedecin(),
                    'createdAt'           => $soumission->getCreatedAt()->format('c'),
                ] : null,
            ];
        }, $activites);

        return $this->json($data);
    }

    // ==================== FAVORIS ====================
    #[Route('/{id}/favori', name: 'app_etudiant_activite_favori', methods: ['POST', 'DELETE'])]
    public function toggleFavori(
        string $id,
        Request $request,
        DocumentManager $dm,
        ActiviteRepository $activiteRepository,
        EtudiantRepository $etudiantRepository
    ): Response {
        $etudiant = $this->getEtudiantConnecte($etudiantRepository);
        $activite = $activiteRepository->find($id);

        if (!$activite) {
            return $this->json(['message' => 'Activité introuvable.'], 404);
        }

        if ($activite->getStatut() !== 'accepte') {
            return $this->json(['message' => 'Cette activité n\'est pas encore disponible.'], 403);
        }

        $etudiantId = $etudiant->getId();

        if ($request->isMethod('POST')) {
            $activite->addFavori($etudiantId);
            $dm->flush();

            return $this->json([
                'message'  => 'Activité ajoutée aux favoris.',
                'isFavori' => true,
            ]);
        }

        // DELETE
        $activite->removeFavori($etudiantId);
        $dm->flush();

        return $this->json([
            'message'  => 'Activité retirée des favoris.',
            'isFavori' => false,
        ]);
    }

    // ==================== SOUMISSION ====================
    #[Route('/{id}/soumettre', name: 'app_etudiant_activite_soumettre', methods: ['POST'])]
    public function soumettre(
        string $id,
        Request $request,
        DocumentManager $dm,
        ActiviteRepository $activiteRepository,
        EtudiantRepository $etudiantRepository,
        ValidatorInterface $validator
    ): Response {
        $etudiant = $this->getEtudiantConnecte($etudiantRepository);
        $soumissionRepository = $dm->getRepository(SoumissionActivite::class);

        $activite = $activiteRepository->find($id);

        if (!$activite) {
            return $this->json(['message' => 'Activité introuvable.'], 404);
        }

        if ($activite->getStatut() !== 'accepte') {
            return $this->json(['message' => 'Cette activité n\'est pas encore disponible.'], 403);
        }

        $existante = $soumissionRepository->findOneBy([
            'activite' => $activite,
            'etudiant' => $etudiant,
        ]);

        if ($existante) {
            return $this->json([
                'message' => 'Vous avez déjà soumis un travail pour cette activité. Vous ne pouvez pas le modifier pour le moment.'
            ], 409);
        }

        $payload = json_decode($request->getContent(), true);

        if (!$payload) {
            return $this->json(['message' => 'Données JSON invalides'], 400);
        }

        $soumission = new SoumissionActivite();
        $soumission->setActivite($activite);
        $soumission->setEtudiant($etudiant);
        $soumission->setContenu($payload['contenu'] ?? null);
        $soumission->setCommentaireEtudiant($payload['commentaireEtudiant'] ?? null);
        $soumission->setStatut('realise');   // ← modifié : activité marquée comme réalisée

        $errors = $validator->validate($soumission);

        if (count($errors) > 0) {
            $messages = [];
            foreach ($errors as $error) {
                $messages[] = $error->getMessage();
            }
            return $this->json(['message' => implode(' ', $messages)], 422);
        }

        $dm->persist($soumission);
        $dm->flush();

        return $this->json([
            'id'      => $soumission->getId(),
            'message' => 'Votre travail a été soumis avec succès. L\'activité est maintenant marquée comme réalisée.',
            'statut'  => $soumission->getStatut(),
        ], 201);
    }

    private function getEtudiantConnecte(EtudiantRepository $etudiantRepository): Etudiant
    {
        $user = $this->getUser();

        if (!$user instanceof User) {
            throw $this->createAccessDeniedException('Utilisateur non authentifié.');
        }

        $etudiant = $etudiantRepository->findOneBy([
            'utilisateur' => $user->getId()
        ]);

        if (!$etudiant) {
            $etudiant = $etudiantRepository->findOneBy([
                'user' => $user->getId()
            ]);
        }

        if (!$etudiant) {
            throw $this->createAccessDeniedException(
                'Aucun profil étudiant associé à ce compte.'
            );
        }

        return $etudiant;
    }
}