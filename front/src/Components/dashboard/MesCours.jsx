import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BookOpen, Plus, Clock, Globe, BarChart3 } from "lucide-react";

export default function MesCours() {
  const navigate = useNavigate();

  const [cours, setCours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const fetchCours = async () => {
      try {
        const res = await fetch("/api/cours/mes-cours", {
          credentials: "include",
        });

        if (!res.ok) {
          throw new Error("Impossible de charger vos cours.");
        }

        const data = await res.json();
        if (isMounted) setCours(data);
      } catch (err) {
        if (isMounted) setError(err.message);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchCours();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#FBF9F4] p-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="font-serif text-3xl font-bold text-[#0F3D3E]">
              Mes cours
            </h1>
            <p className="mt-1 text-sm text-[#5C5A54]">
              Gérez les cours que vous avez publiés sur Tbibna
            </p>
          </div>

          <button
            onClick={() => navigate("/dashboard/medecin/cours/ajouter")}
            className="btn-primary"
          >
            <Plus size={18} />
            Ajouter un cours
          </button>
        </div>

        {loading && (
          <div className="rounded-2xl border border-[#E4DFD3] bg-white p-10 text-center text-sm text-[#5C5A54]">
            Chargement de vos cours...
          </div>
        )}

        {!loading && error && (
          <div className="rounded-2xl border border-red-300 bg-red-50 p-6 text-center text-sm font-medium text-red-800">
            {error}
          </div>
        )}

        {/* ===================== AUCUN COURS ===================== */}
        {!loading && !error && cours.length === 0 && (
          <div className="flex flex-col items-center rounded-2xl border border-dashed border-[#E4DFD3] bg-white px-6 py-16 text-center">
            <span className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#EFEAE0] text-[#3E7C6A]">
              <BookOpen size={28} />
            </span>
            <h2 className="font-serif text-xl font-bold text-[#0F3D3E]">
              Vous devez ajouter votre premier cours
            </h2>
            <p className="mt-2 max-w-md text-sm text-[#5C5A54]">
              Vous n'avez encore publié aucun cours. Partagez votre expertise
              en créant votre premier contenu pédagogique dès maintenant.
            </p>
            <button
              onClick={() => navigate("/dashboard/medecin/cours/ajouter")}
              className="btn-primary mt-6"
            >
              <Plus size={18} />
              Ajouter mon premier cours
            </button>
          </div>
        )}

        {/* ===================== LISTE DES COURS ===================== */}
        {!loading && !error && cours.length > 0 && (
          <div className="grid gap-5 sm:grid-cols-2">
            {cours.map((c) => (
              <div
                key={c.id}
                className="card flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="font-serif text-lg font-bold text-[#0F3D3E]">
                      {c.titre}
                    </h3>
                    <span className="shrink-0 rounded-full border border-[#E4DFD3] bg-[#EFEAE0] px-2.5 py-1 text-[11px] font-medium text-[#3E7C6A]">
                      {c.niveauCours}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-[#5C5A54] line-clamp-3">
                    {c.description}
                  </p>
                </div>

                <div className="mt-5 flex flex-wrap items-center gap-4 border-t border-[#E4DFD3] pt-4 text-xs text-[#5C5A54]">
                  <span className="flex items-center gap-1.5">
                    <Clock size={14} />
                    {c.duree} min
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Globe size={14} />
                    {c.langueCours}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <BarChart3 size={14} />
                    {c.niveauCours}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}