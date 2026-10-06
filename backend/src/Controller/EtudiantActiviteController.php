<?php

namespace App\Controller;

use App\Document\Activite;
use App\Document\Etudiant;
use App\Document\SoumissionActivite;
use App\Document\User;
use App\Repository\ActiviteRepository;
use App\Repository\EtudiantRepository;
use App\Repository\SoumissionActiviteRepository;
use Doctrine\ODM\MongoDB\DocumentManager;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;
use Symfony\Component\Validator\Validator\ValidatorInterface;

#[Route('/api/etudiant/activites')]
#[IsGranted('ROLE_ETUDIANT')]
class EtudiantActiviteController extends AbstractController
{
    // =========================================================
    // LISTE DES ACTIVITÉS ACCEPTÉES (avec isFavori + isParticipant + soumission)
    // =========================================================
    #[Route('', name: 'etudiant_activites_list', methods: ['GET'])]
    public function list(
        ActiviteRepository $activiteRepository,
        EtudiantRepository $etudiantRepository,
        SoumissionActiviteRepository $soumissionRepository
    ): JsonResponse {
        $etudiant = $this->getEtudiantConnecte($etudiantRepository);
        $etudiantId = $etudiant->getId();

        $activites = $activiteRepository->findBy(
            ['statut' => 'accepte'],
            ['createdAt' => 'DESC']
        );

        $data = array_map(function (Activite $a) use ($etudiantId, $soumissionRepository, $etudiant) {
            $medecin = $a->getMedecin();
            $utilisateur = $medecin?->getUtilisateur();

            $medecinNom = 'Médecin';
            if ($utilisateur) {
                $prenom = method_exists($utilisateur, 'getPrenom') ? ($utilisateur->getPrenom() ?? '') : '';
                $nom    = method_exists($utilisateur, 'getNom')    ? ($utilisateur->getNom() ?? '')    : '';
                $medecinNom = trim($prenom . ' ' . $nom) ?: 'Médecin';
            }

            // Recherche soumission (essaie d'abord avec objets, puis avec IDs)
            $soumission = $soumissionRepository->findOneBy([
                'activite' => $a,
                'etudiant' => $etudiant,
            ]);

            if (!$soumission) {
                $soumission = $soumissionRepository->findOneBy([
                    'activite' => $a->getId(),
                    'etudiant' => $etudiantId,
                ]);
            }

            $soumissionData = null;
            if ($soumission) {
                $soumissionData = [
                    'id'                  => $soumission->getId(),
                    'contenu'             => $soumission->getContenu(),
                    'commentaireEtudiant' => $soumission->getCommentaireEtudiant(),
                    'statut'              => $soumission->getStatut(),
                    'note'                => $soumission->getNote(),
                    'commentaireMedecin'  => $soumission->getCommentaireMedecin(),
                    'createdAt'           => $soumission->getCreatedAt()?->format('c'),
                ];
            }

            return [
                'id'            => $a->getId(),
                'titre'         => $a->getTitre(),
                'description'   => $a->getDescription(),
                'instructions'  => $a->getInstructions(),
                'difficulte'    => $a->getDifficulte(),
                'duree'         => $a->getDuree(),
                'statut'        => $a->getStatut(),
                'createdAt'     => $a->getCreatedAt()?->format('c'),
                'medecinNom'    => $medecinNom,
                'isFavori'      => $a->isFavoriPar($etudiantId),
                'isParticipant' => $a->isParticipant($etudiantId),
                'aDejaSoumis'   => $soumission !== null,
                'soumission'    => $soumissionData,
            ];
        }, $activites);

        return $this->json($data);
    }

    // =========================================================
    // REJOINDRE / QUITTER UNE ACTIVITÉ
    // =========================================================
    #[Route('/{id}/participer', name: 'etudiant_activite_participer', methods: ['POST', 'DELETE'])]
    public function participer(
        string $id,
        Request $request,
        ActiviteRepository $activiteRepository,
        EtudiantRepository $etudiantRepository,
        DocumentManager $dm
    ): JsonResponse {
        $etudiant = $this->getEtudiantConnecte($etudiantRepository);
        $etudiantId = $etudiant->getId();

        $activite = $activiteRepository->find($id);

        if (!$activite) {
            return $this->json(['message' => 'Activité introuvable.'], 404);
        }

        if ($activite->getStatut() !== 'accepte') {
            return $this->json(['message' => 'Cette activité n\'est pas encore disponible.'], 403);
        }

        if ($request->isMethod('POST')) {
            $activite->addParticipant($etudiantId);
            $dm->flush();

            return $this->json([
                'message' => 'Vous avez rejoint l\'activité.',
                'isParticipant' => true,
            ]);
        }

        // DELETE = quitter
        // On empêche de quitter si l'étudiant a déjà soumis
        $soumissionExistante = $dm->getRepository(SoumissionActivite::class)->findOneBy([
            'activite' => $activite,
            'etudiant' => $etudiant,
        ]);

        if ($soumissionExistante) {
            return $this->json([
                'message' => 'Vous ne pouvez pas quitter une activité après avoir soumis votre travail.'
            ], 403);
        }

        $activite->removeParticipant($etudiantId);
        $dm->flush();

        return $this->json([
            'message' => 'Vous avez quitté l\'activité.',
            'isParticipant' => false,
        ]);
    }

    // =========================================================
    // FAVORIS (existant)
    // =========================================================
    #[Route('/{id}/favori', name: 'etudiant_activite_favori', methods: ['POST', 'DELETE'])]
    public function favori(
        string $id,
        Request $request,
        ActiviteRepository $activiteRepository,
        EtudiantRepository $etudiantRepository,
        DocumentManager $dm
    ): JsonResponse {
        $etudiant = $this->getEtudiantConnecte($etudiantRepository);
        $etudiantId = $etudiant->getId();

        $activite = $activiteRepository->find($id);

        if (!$activite) {
            return $this->json(['message' => 'Activité introuvable.'], 404);
        }

        if ($request->isMethod('POST')) {
            $activite->addFavori($etudiantId);
            $dm->flush();
            return $this->json(['isFavori' => true]);
        }

        $activite->removeFavori($etudiantId);
        $dm->flush();
        return $this->json(['isFavori' => false]);
    }

    // =========================================================
    // SOUMISSION DU TRAVAIL (avec contrôle de participation)
    // =========================================================
    #[Route('/{id}/soumettre', name: 'etudiant_activite_soumettre', methods: ['POST'])]
    public function soumettre(
        string $id,
        Request $request,
        ActiviteRepository $activiteRepository,
        EtudiantRepository $etudiantRepository,
        SoumissionActiviteRepository $soumissionRepository,
        DocumentManager $dm,
        ValidatorInterface $validator
    ): JsonResponse {
        $etudiant = $this->getEtudiantConnecte($etudiantRepository);
        $etudiantId = $etudiant->getId();

        $activite = $activiteRepository->find($id);

        if (!$activite) {
            return $this->json(['message' => 'Activité introuvable.'], 404);
        }

        if ($activite->getStatut() !== 'accepte') {
            return $this->json(['message' => 'Cette activité n\'est pas disponible.'], 403);
        }

        // === CONTRÔLE PRINCIPAL ===
        if (!$activite->isParticipant($etudiantId)) {
            return $this->json([
                'message' => 'Vous devez d\'abord rejoindre cette activité avant de pouvoir soumettre votre travail.'
            ], 403);
        }

        // Vérifier qu'il n'a pas déjà soumis
        $existante = $soumissionRepository->findOneBy([
            'activite' => $activite,
            'etudiant' => $etudiant,
        ]);

        if ($existante) {
            return $this->json([
                'message' => 'Vous avez déjà soumis un travail pour cette activité.'
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
        $soumission->setStatut('realise');

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
            'id' => $soumission->getId(),
            'message' => 'Travail soumis avec succès ! L\'activité est maintenant réalisée.',
            'statut' => $soumission->getStatut(),
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
            throw $this->createAccessDeniedException(
                'Aucun profil étudiant associé à ce compte.'
            );
        }

        return $etudiant;
    }
}