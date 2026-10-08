import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Clock, Award, FileText, Search } from "lucide-react";
import { useAuth } from "../auth/AuthContext";

export default function MesExamens() {
  const [examens, setExamens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const { token } = useAuth();

  useEffect(() => {
    const fetchExamens = async () => {
      try {
        const res = await fetch("/api/examens", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (res.ok) {
          const data = await res.json();
          setExamens(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchExamens();
  }, [token]);

  // Filtrage par titre
  const filtered = examens.filter((ex) =>
    ex.titre?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-[#737873]">Chargement des examens...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="font-serif text-3xl font-semibold text-[#0F3D3E]">
            Mes Examens
          </h1>
          <p className="mt-1 text-sm text-[#737873]">
            Gérez les examens que vous avez créés
          </p>
        </div>

        <Link
          to="/dashboard/medecin/examens/ajouter"
          className="inline-flex items-center gap-2 rounded-xl border border-[#0F3D3E]/20 bg-white px-5 py-3 text-sm font-semibold text-[#0F3D3E] shadow-sm hover:bg-[#FAF8F5] hover:border-[#0F3D3E]/40 transition"
        >
          <Plus size={18} />
          Ajouter un examen
        </Link>
      </div>

      {/* Barre de recherche */}
      <div className="mb-8 relative max-w-md">
        <Search
          size={18}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-[#737873]"
        />
        <input
          type="text"
          placeholder="Rechercher un examen par titre..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-xl border border-[#E6E1D5] bg-white py-3 pl-10 pr-4 text-sm text-[#0F3D3E] placeholder:text-[#A0A0A0] focus:border-[#0F3D3E] focus:outline-none focus:ring-2 focus:ring-[#0F3D3E]/20"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#E6E1D5] bg-white p-12 text-center">
          <FileText size={40} className="mx-auto text-[#D4AF37] mb-4" />
          <p className="text-[#0F3D3E] font-medium">
            {search
              ? "Aucun examen ne correspond à votre recherche"
              : "Aucun examen pour le moment"}
          </p>
          <p className="text-sm text-[#737873] mt-1">
            {search
              ? "Essayez avec un autre mot-clé."
              : "Commencez par créer votre premier examen."}
          </p>
          {!search && (
            <Link
              to="/dashboard/medecin/examens/ajouter"
              className="mt-6 inline-flex items-center gap-2 rounded-xl border border-[#0F3D3E]/20 bg-white px-5 py-2.5 text-sm font-semibold text-[#0F3D3E] shadow-sm hover:bg-[#FAF8F5] hover:border-[#0F3D3E]/40 transition"
            >
              <Plus size={16} />
              Créer un examen
            </Link>
          )}
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((examen) => (
            <div
              key={examen.id}
              className="rounded-2xl border border-[#E6E1D5] bg-white p-6 shadow-sm hover:shadow-md transition"
            >
              <div className="flex items-start justify-between">
                <h3 className="font-semibold text-[#0F3D3E] text-lg line-clamp-2">
                  {examen.titre}
                </h3>
                <span
                  className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                    examen.statut === "publié"
                      ? "bg-green-100 text-green-700"
                      : "bg-amber-100 text-amber-700"
                  }`}
                >
                  {examen.statut}
                </span>
              </div>

              <div className="mt-4 space-y-2 text-sm text-[#737873]">
                <div className="flex items-center gap-2">
                  <Clock size={14} />
                  {examen.duree} min
                </div>
                <div className="flex items-center gap-2">
                  <Award size={14} />
                  {examen.pointsTotaux} points (passage : {examen.pointsDePassage})
                </div>
                <div className="flex items-center gap-2">
                  <FileText size={14} />
                  {examen.questionsCount} question(s)
                </div>
              </div>

              <p className="mt-3 text-xs text-[#A0A0A0]">
                Créé le {examen.dateCreation}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}