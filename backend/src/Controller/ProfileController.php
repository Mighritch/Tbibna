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

        $profileData = [
            'id' => $user->getId(),
            'nom' => $user->getNom(),
            'prenom' => $user->getPrenom(),
            'email' => $user->getEmail(),
            'dateNaissance' => $user->getDateNaissance()?->format('Y-m-d'),
            'role' => $user->getRole(),
        ];

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

        if (!is_array($data)) {
            return $this->json(['error' => 'JSON invalide'], Response::HTTP_BAD_REQUEST);
        }

        if (!empty($data['nom'])) {
            $user->setNom(trim($data['nom']));
        }
        if (!empty($data['prenom'])) {
            $user->setPrenom(trim($data['prenom']));
        }
        if (!empty($data['dateNaissance'])) {
            try {
                $user->setDateNaissance(new \DateTime($data['dateNaissance']));
            } catch (\Exception $e) {
                return $this->json(['error' => 'Format de date invalide (utilisez YYYY-MM-DD)'], Response::HTTP_BAD_REQUEST);
            }
        }

        if ($user->getRole() === 'ROLE_ETUDIANT') {
            $etudiant = $dm->getRepository(Etudiant::class)->findOneBy(['utilisateur' => $user->getId()]);

            if (!$etudiant) {
                return $this->json(['error' => 'Profil étudiant introuvable'], Response::HTTP_NOT_FOUND);
            }

            if (isset($data['faculte'])) $etudiant->setFaculte($data['faculte'] ?: null);
            if (isset($data['numeroCarteEtudiant']) && $data['numeroCarteEtudiant'] !== '') {
                $etudiant->setNumeroCarteEtudiant((int) $data['numeroCarteEtudiant']);
            }
            if (isset($data['niveauEtude'])) $etudiant->setNiveauEtude($data['niveauEtude'] ?: null);
            if (isset($data['pays'])) $etudiant->setPays($data['pays'] ?: null);
            if (isset($data['ville'])) $etudiant->setVille($data['ville'] ?: null);
            if (isset($data['photo'])) $etudiant->setPhoto($data['photo'] ?: null);
        } elseif ($user->getRole() === 'ROLE_MEDECIN') {
            $medecin = $dm->getRepository(Medecin::class)->findOneBy(['utilisateur' => $user->getId()]);

            if (!$medecin) {
                return $this->json(['error' => 'Profil médecin introuvable'], Response::HTTP_NOT_FOUND);
            }

            if (isset($data['numeroLicence'])) $medecin->setNumeroLicence($data['numeroLicence'] ?: null);
            if (isset($data['specialite'])) $medecin->setSpecialite($data['specialite'] ?: null);
            if (array_key_exists('anneeExperience', $data)) {
                $medecin->setAnneeExperience($data['anneeExperience'] === '' || $data['anneeExperience'] === null
                    ? null
                    : (int) $data['anneeExperience']);
            }
            if (isset($data['hopital'])) $medecin->setHopital($data['hopital'] ?: null);
            if (isset($data['faculte'])) $medecin->setFaculte($data['faculte'] ?: null);
            if (isset($data['photo'])) $medecin->setPhoto($data['photo'] ?: null);
        }

        $dm->flush();

        return $this->json(['message' => 'Profil mis à jour avec succès']);
    }
}