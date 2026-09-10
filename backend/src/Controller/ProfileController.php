<?php

namespace App\Controller;

use App\Document\Etudiant;
use App\Document\Medecin;
use App\Document\User;
use Doctrine\ODM\MongoDB\DocumentManager;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

class ProfileController extends AbstractController
{
    #[Route('/api/profile', name: 'api_profile', methods: ['GET'])]
    public function profile(DocumentManager $dm): JsonResponse
    {
        /** @var User|null $user */
        $user = $this->getUser();

        if (!$user instanceof User) {
            return $this->json(['error' => 'Non authentifié'], Response::HTTP_UNAUTHORIZED);
        }

        // Base commune à tous les utilisateurs
        $profileData = [
            'id' => $user->getId(),
            'nom' => $user->getNom(),
            'prenom' => $user->getPrenom(),
            'email' => $user->getEmail(),
            'dateNaissance' => $user->getDateNaissance()?->format('Y-m-d'),
            'role' => $user->getRole(),
        ];

        // Ajout des champs spécifiques selon le rôle
        if ($user->getRole() === 'ROLE_ETUDIANT') {
            $etudiant = $dm->getRepository(Etudiant::class)->findOneBy(['utilisateur' => $user->getId()]);

            if (!$etudiant) {
                return $this->json(['error' => 'Profil étudiant introuvable'], Response::HTTP_NOT_FOUND);
            }

            $profileData['etudiant'] = [
                'id' => $etudiant->getId(),
                'faculte' => $etudiant->getFaculte(),
                'numeroCarteEtudiant' => $etudiant->getNumeroCarteEtudiant(),
                'niveauEtude' => $etudiant->getNiveauEtude(),
                'pays' => $etudiant->getPays(),
                'ville' => $etudiant->getVille(),
                'photo' => $etudiant->getPhoto(),
            ];
        } elseif ($user->getRole() === 'ROLE_MEDECIN') {
            $medecin = $dm->getRepository(Medecin::class)->findOneBy(['utilisateur' => $user->getId()]);

            if (!$medecin) {
                return $this->json(['error' => 'Profil médecin introuvable'], Response::HTTP_NOT_FOUND);
            }

            $profileData['medecin'] = [
                'id' => $medecin->getId(),
                'numeroLicence' => $medecin->getNumeroLicence(),
                'specialite' => $medecin->getSpecialite(),
                'anneeExperience' => $medecin->getAnneeExperience(),
                'hopital' => $medecin->getHopital(),
                'faculte' => $medecin->getFaculte(),
                'photo' => $medecin->getPhoto(),
            ];
        } elseif ($user->getRole() === 'ROLE_ADMIN') {
            // L'admin n'a pas de profil spécifique (Etudiant/Medecin)
            // On renvoie uniquement les infos de base
            $profileData['admin'] = true;
        } else {
            return $this->json(['error' => 'Rôle inconnu'], Response::HTTP_BAD_REQUEST);
        }

        return $this->json($profileData);
    }

    #[Route('/api/profile', name: 'api_profile_update', methods: ['PUT', 'PATCH'])]
    public function updateProfile(Request $request, DocumentManager $dm): JsonResponse
    {
        /** @var User|null $user */
        $user = $this->getUser();

        if (!$user instanceof User) {
            return $this->json(['error' => 'Non authentifié'], Response::HTTP_UNAUTHORIZED);
        }

        $data = json_decode($request->getContent(), true);

        if (!$data) {
            return $this->json(['error' => 'JSON invalide'], Response::HTTP_BAD_REQUEST);
        }

        // Mise à jour des champs communs (optionnels)
        if (!empty($data['nom'])) {
            $user->setNom($data['nom']);
        }
        if (!empty($data['prenom'])) {
            $user->setPrenom($data['prenom']);
        }
        if (!empty($data['dateNaissance'])) {
            try {
                $user->setDateNaissance(new \DateTime($data['dateNaissance']));
            } catch (\Exception $e) {
                return $this->json(['error' => 'Format de date invalide (utilisez YYYY-MM-DD)'], Response::HTTP_BAD_REQUEST);
            }
        }

        // Mise à jour des champs spécifiques selon le rôle
        if ($user->getRole() === 'ROLE_ETUDIANT') {
            $etudiant = $dm->getRepository(Etudiant::class)->findOneBy(['utilisateur' => $user->getId()]);

            if (!$etudiant) {
                return $this->json(['error' => 'Profil étudiant introuvable'], Response::HTTP_NOT_FOUND);
            }

            if (!empty($data['faculte'])) {
                $etudiant->setFaculte($data['faculte']);
            }
            if (!empty($data['numeroCarteEtudiant'])) {
                $etudiant->setNumeroCarteEtudiant((int) $data['numeroCarteEtudiant']);
            }
            if (!empty($data['niveauEtude'])) {
                $etudiant->setNiveauEtude($data['niveauEtude']);
            }
            if (!empty($data['pays'])) {
                $etudiant->setPays($data['pays']);
            }
            if (!empty($data['ville'])) {
                $etudiant->setVille($data['ville']);
            }
            if (!empty($data['photo'])) {
                $etudiant->setPhoto($data['photo']);
            }
        } elseif ($user->getRole() === 'ROLE_MEDECIN') {
            $medecin = $dm->getRepository(Medecin::class)->findOneBy(['utilisateur' => $user->getId()]);

            if (!$medecin) {
                return $this->json(['error' => 'Profil médecin introuvable'], Response::HTTP_NOT_FOUND);
            }

            if (!empty($data['numeroLicence'])) {
                $medecin->setNumeroLicence($data['numeroLicence']);
            }
            if (!empty($data['specialite'])) {
                $medecin->setSpecialite($data['specialite']);
            }
            if (isset($data['anneeExperience'])) {
                $medecin->setAnneeExperience((int) $data['anneeExperience']);
            }
            if (!empty($data['hopital'])) {
                $medecin->setHopital($data['hopital']);
            }
            if (!empty($data['faculte'])) {
                $medecin->setFaculte($data['faculte']);
            }
            if (!empty($data['photo'])) {
                $medecin->setPhoto($data['photo']);
            }
        }
        // ROLE_ADMIN : on ne fait que les champs communs (déjà gérés plus haut)

        $dm->flush();

        return $this->json(['message' => 'Profil mis à jour avec succès']);
    }
}