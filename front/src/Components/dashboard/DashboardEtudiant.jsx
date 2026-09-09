import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AlertCircle, X } from "lucide-react";
import { useAuth } from "../auth/AuthContext";
import { isProfileComplete } from "../../utils/profileUtils";

export default function DashboardEtudiant() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [showIncompleteAlert, setShowIncompleteAlert] = useState(false);

  // =====================================================
  // Vérifier si le profil est complet au chargement
  // =====================================================
  useEffect(() => {
    let isMounted = true;

    const checkProfile = async () => {
      try {
        const res = await fetch("/api/profile", {
          credentials: "include",
        });

        if (!res.ok) return;

        const data = await res.json();

        if (isMounted && !isProfileComplete(data)) {
          setShowIncompleteAlert(true);
        }
      } catch (err) {
        // Silencieux : on ne bloque pas l'affichage du dashboard
        console.error("Erreur lors de la vérification du profil :", err);
      }
    };

    checkProfile();

    return () => {
      isMounted = false;
    };
  }, []);

  // =====================================================
  // Masquer l'alerte automatiquement après 5 secondes
  // =====================================================
  useEffect(() => {
    if (showIncompleteAlert) {
      const timer = setTimeout(() => {
        setShowIncompleteAlert(false);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [showIncompleteAlert]);

  return (
    <div className="min-h-screen bg-[#FBF9F4] p-8">
      {/* =================================================
          BANNIÈRE PROFIL INCOMPLET
      ================================================= */}
      {showIncompleteAlert && (
        <div className="fixed top-6 left-1/2 z-50 w-[90%] max-w-md -translate-x-1/2 animate-[fadeIn_0.3s_ease-out]">
          <div className="flex items-center gap-3 rounded-2xl border border-amber-300 bg-amber-50 px-4 py-3 shadow-lg">
            <AlertCircle size={20} className="shrink-0 text-amber-600" />

            <p className="flex-1 text-sm font-medium text-amber-800">
              Votre profil n'est pas complet.{" "}
              <button
                onClick={() => navigate("/profile")}
                className="underline underline-offset-2 hover:text-amber-900"
              >
                Complétez-le maintenant
              </button>
            </p>

            <button
              onClick={() => setShowIncompleteAlert(false)}
              className="shrink-0 text-amber-600 hover:text-amber-900"
              aria-label="Fermer"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      <div className="mx-auto max-w-5xl">
        <div className="flex items-center justify-between mb-8">
          <h1 className="font-serif text-3xl font-bold text-[#0F3D3E]">
            Bienvenue {user?.prenom} à votre espace étudiant👋
          </h1>
        </div>
      </div>
    </div>
  );
}