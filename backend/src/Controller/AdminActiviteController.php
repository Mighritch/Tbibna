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
use Symfony\Contracts\HttpClient\HttpClientInterface;

#[Route('/api/admin/activites')]
#[IsGranted('ROLE_ADMIN')]
class AdminActiviteController extends AbstractController
{
    public function __construct(
        private HttpClientInterface $httpClient,
    ) {}

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

                    // Fallback : getUtilisateur() (comme dans CoursController)
                    if (!$medecinNom && method_exists($medecin, 'getUtilisateur')) {
                        $user = $medecin->getUtilisateur();

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

        $ancienStatut = $activite->getStatut();
        $activite->setStatut($statut);
        $dm->flush();

        // ========== ENVOI EMAIL UNIQUEMENT SI PASSAGE À "accepte" ==========
        $emailSent = false;
        $emailError = null;

        if ($statut === 'accepte' && $ancienStatut !== 'accepte') {
            try {
                $medecin = $activite->getMedecin();
                $utilisateur = null;

                if ($medecin) {
                    // On essaie les deux getters possibles
                    if (method_exists($medecin, 'getUtilisateur')) {
                        $utilisateur = $medecin->getUtilisateur();
                    } elseif (method_exists($medecin, 'getUser')) {
                        $utilisateur = $medecin->getUser();
                    }
                }

                $emailMedecin = null;
                if ($utilisateur) {
                    if (method_exists($utilisateur, 'getEmail')) {
                        $emailMedecin = $utilisateur->getEmail();
                    } elseif (method_exists($utilisateur, 'getEmailAddress')) {
                        $emailMedecin = $utilisateur->getEmailAddress();
                    } elseif (method_exists($utilisateur, 'getMail')) {
                        $emailMedecin = $utilisateur->getMail();
                    }
                }

                if ($emailMedecin && filter_var($emailMedecin, FILTER_VALIDATE_EMAIL)) {
                    $this->sendApprovalEmail($emailMedecin, $activite);
                    $emailSent = true;
                } else {
                    $emailError = 'Email du médecin introuvable ou invalide.';
                }
            } catch (\Throwable $mailEx) {
                // On ne fait pas échouer le changement de statut si l'email échoue
                $emailError = $mailEx->getMessage();
            }
        }

        $response = [
            'id' => $activite->getId(),
            'statut' => $activite->getStatut(),
            'message' => 'Statut mis à jour avec succès.',
        ];

        if ($emailSent) {
            $response['email'] = 'Email de confirmation envoyé au médecin.';
        } elseif ($emailError) {
            $response['email_warning'] = 'Statut mis à jour, mais l\'email n\'a pas pu être envoyé : ' . $emailError;
        }

        return $this->json($response);
    }

    /**
     * Envoie un email de confirmation d'approbation d'activité via Resend
     */
    private function sendApprovalEmail(string $toEmail, Activite $activite): void
    {
        $apiKey = $_ENV['RESEND_API_KEY'] ?? null;
        if (!$apiKey) {
            throw new \RuntimeException('Clé API Resend non configurée (RESEND_API_KEY).');
        }

        $from = $_ENV['MAIL_FROM'] ?? 'Tbibna <onboarding@resend.dev>';

        $titre      = htmlspecialchars($activite->getTitre() ?? 'Votre activité', ENT_QUOTES, 'UTF-8');
        $difficulte = htmlspecialchars($activite->getDifficulte() ?? '—', ENT_QUOTES, 'UTF-8');
        $duree      = $activite->getDuree() ? (int) $activite->getDuree() . ' min' : '—';

        // Version HTML
        $html = <<<HTML
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Activité approuvée - Tbibna</title>
</head>
<body style="margin:0; padding:0; background-color:#FBF9F4; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#FBF9F4; padding: 32px 16px;">
    <tr>
      <td align="center">
        <table width="100%" style="max-width:560px; background:#ffffff; border-radius:16px; border:1px solid #E4DFD3; overflow:hidden;">
          <!-- Header -->
          <tr>
            <td style="background-color:#0F3D3E; padding:28px 32px;">
              <h1 style="margin:0; color:#F4C95D; font-size:22px; font-weight:700;">Tbibna</h1>
              <p style="margin:8px 0 0; color:#E8C77E; font-size:15px;">Votre activité a été approuvée ✓</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:32px;">
              <p style="margin:0 0 16px; color:#3C3A34; font-size:15px; line-height:1.6;">
                Bonjour,
              </p>
              <p style="margin:0 0 24px; color:#3C3A34; font-size:15px; line-height:1.6;">
                Nous avons le plaisir de vous informer que votre activité a été <strong style="color:#0F3D3E;">approuvée</strong> par un administrateur et est désormais visible sur la plateforme Tbibna.
              </p>

              <!-- Card infos activité -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#FBF9F4; border:1px solid #E4DFD3; border-radius:12px; margin-bottom:28px;">
                <tr>
                  <td style="padding:18px 20px;">
                    <p style="margin:0 0 10px; font-size:17px; font-weight:600; color:#0F3D3E;">
                      {$titre}
                    </p>
                    <p style="margin:0; font-size:13px; color:#5C5A54; line-height:1.5;">
                      Difficulté : <strong>{$difficulte}</strong><br>
                      Durée : <strong>{$duree}</strong>
                    </p>
                  </td>
                </tr>
              </table>

              <p style="margin:0 0 8px; color:#3C3A34; font-size:15px; line-height:1.6;">
                Merci pour votre contribution à la communauté médicale.
              </p>
              <p style="margin:0; color:#5C5A54; font-size:14px;">
                L’équipe Tbibna
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:16px 32px; background:#F8F6F1; border-top:1px solid #E4DFD3;">
              <p style="margin:0; font-size:12px; color:#9A9790; text-align:center;">
                Cet email a été envoyé automatiquement. Merci de ne pas y répondre.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
HTML;

        // Version texte (meilleure délivrabilité, surtout Outlook)
        $text = "Bonjour,\n\n"
              . "Nous avons le plaisir de vous informer que votre activité a été approuvée par un administrateur et est désormais visible sur la plateforme Tbibna.\n\n"
              . "Titre : {$titre}\n"
              . "Difficulté : {$difficulte}\n"
              . "Durée : {$duree}\n\n"
              . "Merci pour votre contribution à la communauté médicale.\n\n"
              . "L’équipe Tbibna\n";

        $response = $this->httpClient->request('POST', 'https://api.resend.com/emails', [
            'headers' => [
                'Authorization' => 'Bearer ' . $apiKey,
                'Content-Type'  => 'application/json',
            ],
            'json' => [
                'from'    => $from,
                'to'      => [$toEmail],
                'subject' => 'Votre activité « ' . ($activite->getTitre() ?? '') . ' » a été approuvée – Tbibna',
                'html'    => $html,
                'text'    => $text,
            ],
            'timeout' => 15,
        ]);

        $statusCode = $response->getStatusCode();
        $body = $response->toArray(false);

        if ($statusCode < 200 || $statusCode >= 300) {
            $msg = $body['message'] ?? ($body['error'] ?? 'Erreur inconnue Resend');
            throw new \RuntimeException('Resend API error (' . $statusCode . ') : ' . $msg);
        }
    }
}