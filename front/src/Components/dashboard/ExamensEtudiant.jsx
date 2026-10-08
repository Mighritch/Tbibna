import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  BookOpen,
  Clock,
  Award,
  FileQuestion,
  Loader2,
  AlertCircle,
  Search,
} from "lucide-react";

export default function ExamensEtudiant() {
  const [examens, setExamens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchExamens = async () => {
      try {
        setLoading(true);
        setError(null);

        const token = localStorage.getItem("token"); // adaptez selon votre AuthContext
        const response = await fetch("/api/examens/publies", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Impossible de charger les examens");
        }

        const data = await response.json();
        setExamens(data);
      } catch (err) {
        setError(err.message || "Une erreur est survenue");
      } finally {
        setLoading(false);
      }
    };

    fetchExamens();
  }, []);

  const filtered = examens.filter(
    (ex) =>
      ex.titre?.toLowerCase().includes(search.toLowerCase()) ||
      ex.instructions?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#FAF8F5] py-8 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#0F3D3E] text-[#D4AF37]">
              <BookOpen size={24} />
            </div>
            <div>
              <h1 className="font-serif text-3xl font-semibold text-[#0F3D3E]">
                Examens disponibles
              </h1>
              <p className="text-sm text-[#737873]">
                Tous les examens validés et publiés par l’administration
              </p>
            </div>
          </div>
        </div>

        {/* Barre de recherche */}
        <div className="mb-8 relative max-w-md">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[#737873]"
          />
          <input
            type="text"
            placeholder="Rechercher un examen..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-[#E6E1D5] bg-white py-3 pl-10 pr-4 text-sm text-[#0F3D3E] placeholder:text-[#A0A0A0] focus:border-[#0F3D3E] focus:outline-none focus:ring-2 focus:ring-[#0F3D3E]/20"
          />
        </div>

        {/* Contenu */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 size={40} className="animate-spin text-[#0F3D3E]" />
            <p className="mt-4 text-sm text-[#737873]">Chargement des examens...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <AlertCircle size={40} className="text-red-500" />
            <p className="mt-4 text-sm font-medium text-red-600">{error}</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <FileQuestion size={48} className="text-[#D4AF37]" />
            <p className="mt-4 text-lg font-medium text-[#0F3D3E]">
              Aucun examen disponible pour le moment
            </p>
            <p className="mt-1 text-sm text-[#737873]">
              Les examens publiés par l’admin apparaîtront ici.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((examen) => (
              <div
                key={examen.id}
                className="group relative flex flex-col overflow-hidden rounded-2xl border border-[#E6E1D5] bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#0F3D3E]/30 hover:shadow-xl"
              >
                <div className="flex items-start justify-between">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#EBF3F0] text-[#2A6B59] group-hover:bg-[#0F3D3E] group-hover:text-[#D4AF37] transition-colors">
                    <Award size={22} />
                  </div>
                  <span className="rounded-full bg-[#EBF3F0] px-2.5 py-1 text-[11px] font-semibold text-[#2A6B59]">
                    Publié
                  </span>
                </div>

                <h3 className="mt-4 text-lg font-semibold text-[#0F3D3E] line-clamp-2">
                  {examen.titre}
                </h3>

                {examen.instructions && (
                  <p className="mt-2 text-sm text-[#737873] line-clamp-2 leading-relaxed">
                    {examen.instructions}
                  </p>
                )}

                <div className="mt-5 flex flex-wrap gap-3 text-xs text-[#5c5a54]">
                  <div className="flex items-center gap-1.5">
                    <Clock size={14} />
                    <span>{examen.duree} min</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Award size={14} />
                    <span>
                      {examen.pointsTotaux} pts (seuil : {examen.pointsDePassage})
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <FileQuestion size={14} />
                    <span>{examen.questionsCount} question(s)</span>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-[#E6E1D5]">
                  <Link
                    to={`/dashboard/etudiant/examens/${examen.id}`}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#0F3D3E] px-4 py-3 text-sm font-semibold text-white transition-all hover:bg-[#082829] hover:shadow-md"
                  >
                    Commencer l’examen
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}