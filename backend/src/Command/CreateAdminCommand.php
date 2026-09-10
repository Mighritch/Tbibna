<?php

namespace App\Command;

use App\Document\User;
use Doctrine\ODM\MongoDB\DocumentManager;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Helper\QuestionHelper;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Question\Question;
use Symfony\Component\Console\Style\SymfonyStyle;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;

#[AsCommand(
    name: 'app:create-admin',
    description: 'Créer un compte administrateur',
)]
class CreateAdminCommand extends Command
{
    public function __construct(
        private readonly DocumentManager $documentManager,
        private readonly UserPasswordHasherInterface $passwordHasher
    ) {
        parent::__construct();
    }

    protected function execute(
        InputInterface $input,
        OutputInterface $output
    ): int {
        $io = new SymfonyStyle($input, $output);

        /** @var QuestionHelper $helper */
        $helper = $this->getHelper('question');

        // =========================
        // NOM
        // =========================
        $question = new Question('Nom : ');
        $nom = $helper->ask($input, $output, $question);

        // =========================
        // PRÉNOM
        // =========================
        $question = new Question('Prénom : ');
        $prenom = $helper->ask($input, $output, $question);

        // =========================
        // EMAIL
        // =========================
        $question = new Question('Email : ');
        $email = $helper->ask($input, $output, $question);

        // =========================
        // MOT DE PASSE
        // =========================
        $question = new Question('Mot de passe : ');
        $question->setHidden(true);
        $question->setHiddenFallback(false);

        $password = $helper->ask($input, $output, $question);

        // =========================
        // VALIDATION
        // =========================

        if (empty($nom)) {
            $io->error('Le nom est obligatoire.');

            return Command::FAILURE;
        }

        if (empty($prenom)) {
            $io->error('Le prénom est obligatoire.');

            return Command::FAILURE;
        }

        if (empty($email)) {
            $io->error("L'email est obligatoire.");

            return Command::FAILURE;
        }

        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            $io->error("L'adresse email n'est pas valide.");

            return Command::FAILURE;
        }

        if (empty($password)) {
            $io->error('Le mot de passe est obligatoire.');

            return Command::FAILURE;
        }

        // =========================
        // VÉRIFIER SI L'EMAIL EXISTE
        // =========================

        $existingUser = $this->documentManager
            ->getRepository(User::class)
            ->findOneBy([
                'email' => $email,
            ]);

        if ($existingUser !== null) {
            $io->error(
                'Un utilisateur avec cet email existe déjà.'
            );

            return Command::FAILURE;
        }

        // =========================
        // CRÉER L'ADMINISTRATEUR
        // =========================

        $user = new User();

        $user->setNom($nom);
        $user->setPrenom($prenom);
        $user->setEmail($email);

        // Rôle administrateur
        $user->setRole('ROLE_ADMIN');

        // =========================
        // HASHER LE MOT DE PASSE
        // =========================

        $hashedPassword = $this->passwordHasher->hashPassword(
            $user,
            $password
        );

        $user->setPassword($hashedPassword);

        // =========================
        // ENREGISTRER DANS MONGODB
        // =========================

        $this->documentManager->persist($user);
        $this->documentManager->flush();

        // =========================
        // MESSAGE DE SUCCÈS
        // =========================

        $io->success(
            'Administrateur créé avec succès !'
        );

        $io->table(
            ['Champ', 'Valeur'],
            [
                ['Nom', $nom],
                ['Prénom', $prenom],
                ['Email', $email],
                ['Rôle', 'ROLE_ADMIN'],
            ]
        );

        return Command::SUCCESS;
    }
}