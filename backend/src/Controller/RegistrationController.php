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
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Validator\Validator\ValidatorInterface;

class RegistrationController extends AbstractController
{
    #[Route('/api/register', name: 'api_register', methods: ['POST'])]
    public function register(
        Request $request,
        UserPasswordHasherInterface $passwordHasher,
        DocumentManager $dm,
        ValidatorInterface $validator
    ): JsonResponse {
        $data = json_decode($request->getContent(), true);

        if (!$data) {
            return $this->json(['error' => 'JSON invalide'], Response::HTTP_BAD_REQUEST);
        }

        // Vérification des champs obligatoires
        $required = ['nom', 'prenom', 'dateNaissance', 'email', 'password', 'role'];
        foreach ($required as $field) {
            if (empty($data[$field])) {
                return $this->json(['error' => "Le champ '$field' est obligatoire"], Response::HTTP_BAD_REQUEST);
            }
        }

        // Vérifier si l'email existe déjà
        $existingUser = $dm->getRepository(User::class)->findOneBy(['email' => $data['email']]);
        if ($existingUser) {
            return $this->json(['error' => 'Cet email est déjà utilisé'], Response::HTTP_CONFLICT);
        }

        // Création de l'utilisateur
        $user = new User();
        $user->setNom($data['nom']);
        $user->setPrenom($data['prenom']);
        $user->setEmail($data['email']);
        $user->setRole($data['role']); // ROLE_ETUDIANT ou ROLE_MEDECIN

        try {
            $user->setDateNaissance(new \DateTime($data['dateNaissance']));
        } catch (\Exception $e) {
            return $this->json(['error' => 'Format de date invalide (utilisez YYYY-MM-DD)'], Response::HTTP_BAD_REQUEST);
        }

        // Hasher le mot de passe
        $user->setPassword(
            $passwordHasher->hashPassword($user, $data['password'])
        );

        $dm->persist($user);

        // Créer le profil selon le rôle
        if ($data['role'] === 'ROLE_ETUDIANT') {
            $etudiant = new Etudiant();
            $etudiant->setUtilisateur($user);
            $dm->persist($etudiant);
        } elseif ($data['role'] === 'ROLE_MEDECIN') {
            $medecin = new Medecin();
            $medecin->setUtilisateur($user);
            $dm->persist($medecin);
        } else {
            return $this->json(['error' => 'Rôle invalide. Utilisez ROLE_ETUDIANT ou ROLE_MEDECIN'], Response::HTTP_BAD_REQUEST);
        }

        $dm->flush();

        return $this->json([
            'message' => 'Compte créé avec succès',
            'user' => [
                'id' => $user->getId(),
                'email' => $user->getEmail(),
                'nom' => $user->getNom(),
                'prenom' => $user->getPrenom(),
                'role' => $user->getRole(),
            ]
        ], Response::HTTP_CREATED);
    }
}