import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AlertCircle, X, BookOpen, Plus } from "lucide-react";
import { useAuth } from "../auth/AuthContext";
import { isProfileComplete } from "../../utils/profileUtils";

export default function DashboardMedecin() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [showIncompleteAlert, setShowIncompleteAlert] = useState(false);

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
        console.error("Erreur lors de la vérification du profil :", err);
      }
    };

    checkProfile();

    return () => {
      isMounted = false;
    };
  }, []);

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
      {/* Bannière profil incomplet */}
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
        <div className="mb-10">
          <h1 className="font-serif text-3xl font-bold text-[#0F3D3E]">
            Bienvenue Dr. {user?.nom} 👋
          </h1>
          <p className="mt-2 text-[#5C5A54]">
            Gérez vos formations et partagez votre expertise.
          </p>
        </div>

        {/* Carte d’accès rapide aux cours */}
        <div className="grid gap-6 sm:grid-cols-2">
          <Link
            to="/dashboard/medecin/cours"
            className="group flex items-center gap-5 rounded-2xl border border-[#E4DFD3] bg-white p-6 shadow-sm transition hover:border-[#0F3D3E]/30 hover:shadow-md"
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-[#0F3D3E] text-[#E8C77E] transition group-hover:scale-105">
              <BookOpen size={26} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-[#0F3D3E]">
                Mes cours
              </h2>
              <p className="mt-1 text-sm text-[#5C5A54]">
                Voir et gérer tous vos cours publiés
              </p>
            </div>
          </Link>

          <Link
            to="/dashboard/medecin/cours/ajouter"
            className="group flex items-center gap-5 rounded-2xl border border-[#E4DFD3] bg-white p-6 shadow-sm transition hover:border-[#0F3D3E]/30 hover:shadow-md"
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-[#2A6B59] text-white transition group-hover:scale-105">
              <Plus size={26} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-[#0F3D3E]">
                Ajouter un cours
              </h2>
              <p className="mt-1 text-sm text-[#5C5A54]">
                Publier une nouvelle formation
              </p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}