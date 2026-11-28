import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Plus,
  Clock,
  Award,
  FileText,
  Search,
  UserCheck,
  Users,
  Heart,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useAuth } from "../auth/AuthContext";

const ITEMS_PER_PAGE = 4;

export default function MesExamens() {
  const [examens, setExamens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filtreAuteur, setFiltreAuteur] = useState("moi"); // "moi" | "confreres" | "favoris"
  const [togglingId, setTogglingId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
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

  const handleToggleFavori = async (examenId) => {
    if (togglingId) return;
    setTogglingId(examenId);

    // Mise à jour optimiste
    setExamens((prev) =>
      prev.map((ex) =>
        ex.id === examenId ? { ...ex, isFavori: !ex.isFavori } : ex
      )
    );

    try {
      const res = await fetch(`/api/examens/${examenId}/favori`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        const data = await res.json();
        setExamens((prev) =>
          prev.map((ex) =>
            ex.id === examenId ? { ...ex, isFavori: data.isFavori } : ex
          )
        );
      } else {
        // Annuler si erreur serveur
        setExamens((prev) =>
          prev.map((ex) =>
            ex.id === examenId ? { ...ex, isFavori: !ex.isFavori } : ex
          )
        );
      }
    } catch (err) {
      console.error(err);
      setExamens((prev) =>
        prev.map((ex) =>
          ex.id === examenId ? { ...ex, isFavori: !ex.isFavori } : ex
        )
      );
    } finally {
      setTogglingId(null);
    }
  };

  // Compteurs pour les onglets
  const countMoi = examens.filter((ex) => ex.estProprietaire).length;
  const countConfreres = examens.filter((ex) => !ex.estProprietaire).length;
  const countFavoris = examens.filter(
    (ex) => !ex.estProprietaire && ex.isFavori
  ).length;

  // Filtrage par onglet et par titre
  const filtered = useMemo(() => {
    return examens.filter((ex) => {
      const matchSearch = ex.titre?.toLowerCase().includes(search.toLowerCase());
      if (!matchSearch) return false;

      if (filtreAuteur === "moi") return ex.estProprietaire;
      if (filtreAuteur === "favoris") return !ex.estProprietaire && ex.isFavori;
      return !ex.estProprietaire;
    });
  }, [examens, search, filtreAuteur]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const safeCurrentPage = Math.min(currentPage, totalPages);

  const paginatedExamens = useMemo(() => {
    const startIndex = (safeCurrentPage - 1) * ITEMS_PER_PAGE;
    return filtered.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filtered, safeCurrentPage]);

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
            Examens
          </h1>
          <p className="mt-1 text-sm text-[#737873]">
            Gérez vos examens et consultez ceux validés des autres médecins
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

      {/* Onglets de filtre + Barre de recherche */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="inline-flex rounded-xl border border-[#E6E1D5] bg-[#FAF8F5] p-1 w-fit">
          <button
            type="button"
            onClick={() => {
              setFiltreAuteur("moi");
              setCurrentPage(1);
            }}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
              filtreAuteur === "moi"
                ? "bg-white text-[#0F3D3E] shadow-sm"
                : "text-[#737873] hover:text-[#0F3D3E]"
            }`}
          >
            Mes examens ({countMoi})
          </button>
          <button
            type="button"
            onClick={() => {
              setFiltreAuteur("confreres");
              setCurrentPage(1);
            }}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
              filtreAuteur === "confreres"
                ? "bg-white text-[#0F3D3E] shadow-sm"
                : "text-[#737873] hover:text-[#0F3D3E]"
            }`}
          >
            Confrères ({countConfreres})
          </button>
          <button
            type="button"
            onClick={() => {
              setFiltreAuteur("favoris");
              setCurrentPage(1);
            }}
            className={`inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium transition ${
              filtreAuteur === "favoris"
                ? "bg-white text-[#0F3D3E] shadow-sm"
                : "text-[#737873] hover:text-[#0F3D3E]"
            }`}
          >
            <Heart
              size={14}
              className={
                filtreAuteur === "favoris"
                  ? "fill-red-500 text-red-500"
                  : "text-[#737873]"
              }
            />
            Favoris ({countFavoris})
          </button>
        </div>

        <div className="relative w-full md:max-w-md">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[#737873]"
          />
          <input
            type="text"
            placeholder="Rechercher un examen par titre..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full rounded-xl border border-[#E6E1D5] bg-white py-2.5 pl-10 pr-4 text-sm text-[#0F3D3E] placeholder:text-[#A0A0A0] focus:border-[#0F3D3E] focus:outline-none focus:ring-2 focus:ring-[#0F3D3E]/20"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#E6E1D5] bg-white p-12 text-center">
          <FileText size={40} className="mx-auto text-[#D4AF37] mb-4" />
          <p className="text-[#0F3D3E] font-medium">
            {search
              ? "Aucun examen ne correspond à votre recherche"
              : filtreAuteur === "favoris"
              ? "Aucun examen en favori"
              : filtreAuteur === "confreres"
              ? "Aucun examen publié par d'autres médecins"
              : "Aucun examen pour le moment"}
          </p>
          <p className="text-sm text-[#737873] mt-1">
            {search
              ? "Essayez avec un autre mot-clé."
              : filtreAuteur === "favoris"
              ? "Cliquez sur le cœur d'un examen d'un confrère pour l'ajouter ici."
              : filtreAuteur === "confreres"
              ? "Les examens validés par l'administrateur apparaîtront ici."
              : "Commencez par créer votre premier examen."}
          </p>
          {!search && filtreAuteur === "moi" && (
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
        <>
          <div className="grid gap-5 sm:grid-cols-2">
            {paginatedExamens.map((examen) => (
              <div
                key={examen.id}
                className="flex flex-col justify-between rounded-2xl border border-[#E6E1D5] bg-white p-6 shadow-sm hover:shadow-md transition"
              >
                <div>
                  {/* Badge propriétaire / confrère + statut + bouton favori */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    {examen.estProprietaire ? (
                      <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full bg-[#0F3D3E]/10 text-[#0F3D3E]">
                        <UserCheck size={12} />
                        Mon examen
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full bg-blue-50 text-blue-700">
                        <Users size={12} />
                        {examen.auteurNom ? `Dr. ${examen.auteurNom}` : "Confrère"}
                      </span>
                    )}

                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                          examen.statut === "publié"
                            ? "bg-green-100 text-green-700"
                            : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {examen.statut}
                      </span>

                      {!examen.estProprietaire && (
                        <button
                          type="button"
                          onClick={() => handleToggleFavori(examen.id)}
                          disabled={togglingId === examen.id}
                          title={
                            examen.isFavori
                              ? "Retirer des favoris"
                              : "Ajouter aux favoris"
                          }
                          className="rounded-full p-1.5 text-[#737873] hover:bg-red-50 hover:text-red-500 transition disabled:opacity-50"
                        >
                          <Heart
                            size={18}
                            className={
                              examen.isFavori
                                ? "fill-red-500 text-red-500"
                                : "text-[#737873]"
                            }
                          />
                        </button>
                      )}
                    </div>
                  </div>

                  <h3 className="font-semibold text-[#0F3D3E] text-lg line-clamp-2">
                    {examen.titre}
                  </h3>

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
                </div>

                <p className="mt-4 pt-3 border-t border-[#E6E1D5]/60 text-xs text-[#A0A0A0]">
                  Créé le {examen.dateCreation}
                </p>
              </div>
            ))}
          </div>

          {/* Contrôles de pagination */}
          {totalPages > 1 && (
            <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-[#E6E1D5] pt-6">
              <p className="text-sm text-[#737873]">
                Page{" "}
                <span className="font-semibold text-[#0F3D3E]">
                  {safeCurrentPage}
                </span>{" "}
                sur{" "}
                <span className="font-semibold text-[#0F3D3E]">
                  {totalPages}
                </span>{" "}
                ({filtered.length} examen{filtered.length > 1 ? "s" : ""})
              </p>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setCurrentPage((p) =>
                      Math.max(1, Math.min(p, totalPages) - 1)
                    )
                  }
                  disabled={safeCurrentPage === 1}
                  className="inline-flex items-center gap-1 rounded-xl border border-[#E6E1D5] bg-white px-3.5 py-2 text-sm font-medium text-[#0F3D3E] shadow-sm transition hover:border-[#0F3D3E] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronLeft size={16} /> Précédent
                </button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, idx) => idx + 1).map(
                    (page) => (
                      <button
                        key={page}
                        type="button"
                        onClick={() => setCurrentPage(page)}
                        className={`h-9 w-9 rounded-xl text-sm font-semibold transition ${
                          safeCurrentPage === page
                            ? "bg-[#0F3D3E] text-white shadow-sm"
                            : "border border-[#E6E1D5] bg-white text-[#0F3D3E] hover:border-[#0F3D3E]"
                        }`}
                      >
                        {page}
                      </button>
                    )
                  )}
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                  disabled={safeCurrentPage === totalPages}
                  className="inline-flex items-center gap-1 rounded-xl border border-[#E6E1D5] bg-white px-3.5 py-2 text-sm font-medium text-[#0F3D3E] shadow-sm transition hover:border-[#0F3D3E] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Suivant <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}