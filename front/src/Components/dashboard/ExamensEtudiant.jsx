import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  BookOpen,
  Clock,
  Award,
  FileQuestion,
  Loader2,
  AlertCircle,
  Search,
  CheckCircle2,
  UserPlus,
  Heart,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const ITEMS_PER_PAGE = 4;

export default function ExamensEtudiant() {
  const [examens, setExamens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [onlyFavoris, setOnlyFavoris] = useState(false);
  const [inscrivantId, setInscrivantId] = useState(null);
  const [favoriLoading, setFavoriLoading] = useState({});
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    let isMounted = true;

    const fetchExamens = async () => {
      try {
        setLoading(true);
        setError(null);

        const token = localStorage.getItem("token");
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
        if (isMounted) {
          setExamens(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || "Une erreur est survenue");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchExamens();

    return () => {
      isMounted = false;
    };
  }, []);

  const favorisCount = useMemo(
    () => examens.filter((ex) => ex.isFavori).length,
    [examens]
  );

  const toggleFavori = async (examenId) => {
    if (favoriLoading[examenId]) return;

    const currentItem = examens.find((ex) => ex.id === examenId);
    const previousState = Boolean(currentItem?.isFavori);

    // Mise à jour optimiste
    setExamens((prev) =>
      prev.map((ex) =>
        ex.id === examenId ? { ...ex, isFavori: !previousState } : ex
      )
    );
    setFavoriLoading((prev) => ({ ...prev, [examenId]: true }));

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/examens/${examenId}/favori`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Impossible de mettre à jour le favori");
      }

      setExamens((prev) =>
        prev.map((ex) =>
          ex.id === examenId ? { ...ex, isFavori: Boolean(data.isFavori) } : ex
        )
      );
    } catch (err) {
      // Annulation en cas d'erreur
      setExamens((prev) =>
        prev.map((ex) =>
          ex.id === examenId ? { ...ex, isFavori: previousState } : ex
        )
      );
      alert(err.message || "Erreur lors de la mise à jour des favoris");
    } finally {
      setFavoriLoading((prev) => ({ ...prev, [examenId]: false }));
    }
  };

  const handleInscription = async (examenId) => {
    try {
      setInscrivantId(examenId);
      const token = localStorage.getItem("token");

      const response = await fetch(`/api/examens/${examenId}/inscrire`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erreur lors de l'inscription");
      }

      // Mise à jour locale
      setExamens((prev) =>
        prev.map((ex) =>
          ex.id === examenId ? { ...ex, inscrit: true } : ex
        )
      );
    } catch (err) {
      alert(err.message);
    } finally {
      setInscrivantId(null);
    }
  };

  const filtered = useMemo(() => {
    return examens.filter((ex) => {
      const matchSearch = ex.titre
        ?.toLowerCase()
        .includes(search.toLowerCase());
      const matchFavori = !onlyFavoris || Boolean(ex.isFavori);
      return matchSearch && matchFavori;
    });
  }, [examens, search, onlyFavoris]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const safeCurrentPage = Math.min(currentPage, totalPages);

  const paginatedExamens = useMemo(() => {
    const startIndex = (safeCurrentPage - 1) * ITEMS_PER_PAGE;
    return filtered.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filtered, safeCurrentPage]);

  return (
    <div className="min-h-screen bg-[#FAF8F5] py-8 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
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

          <button
            type="button"
            onClick={() => {
              setOnlyFavoris((prev) => !prev);
              setCurrentPage(1);
            }}
            className={`inline-flex items-center gap-2 self-start rounded-xl border px-4 py-2.5 text-sm font-semibold transition sm:self-auto ${
              onlyFavoris
                ? "border-rose-200 bg-rose-50 text-rose-700 shadow-sm"
                : "border-[#E6E1D5] bg-white text-[#0F3D3E] hover:border-rose-200 hover:bg-rose-50/50"
            }`}
          >
            <Heart
              size={16}
              className={
                onlyFavoris ? "fill-rose-500 text-rose-500" : "text-rose-500"
              }
            />
            Mes favoris
            <span
              className={`rounded-full px-2 py-0.5 text-xs ${
                onlyFavoris
                  ? "bg-rose-200/70 text-rose-800"
                  : "bg-[#FAF8F5] text-[#737873]"
              }`}
            >
              {favorisCount}
            </span>
          </button>
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
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full rounded-xl border border-[#E6E1D5] bg-white py-3 pl-10 pr-4 text-sm text-[#0F3D3E] placeholder:text-[#A0A0A0] focus:border-[#0F3D3E] focus:outline-none focus:ring-2 focus:ring-[#0F3D3E]/20"
          />
        </div>

        {/* Contenu */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 size={40} className="animate-spin text-[#0F3D3E]" />
            <p className="mt-4 text-sm text-[#737873]">
              Chargement des examens...
            </p>
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
              {onlyFavoris
                ? "Aucun examen favori trouvé"
                : search
                ? "Aucun examen ne correspond à votre recherche"
                : "Aucun examen disponible pour le moment"}
            </p>
            <p className="mt-1 text-sm text-[#737873]">
              {onlyFavoris
                ? "Cliquez sur le cœur d'un examen pour l'ajouter à vos favoris."
                : search
                ? "Essayez avec un autre mot-clé."
                : "Les examens publiés par l’admin apparaîtront ici."}
            </p>
            {(search || onlyFavoris) && (
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setOnlyFavoris(false);
                  setCurrentPage(1);
                }}
                className="mt-4 rounded-xl bg-[#2A6B59] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#1e4f42]"
              >
                Afficher tous les examens
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="grid gap-6 sm:grid-cols-2">
              {paginatedExamens.map((examen) => {
                const isFav = Boolean(examen.isFavori);
                const isTogglingFav = Boolean(favoriLoading[examen.id]);

                return (
                  <div
                    key={examen.id}
                    className="group relative flex flex-col overflow-hidden rounded-2xl border border-[#E6E1D5] bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#0F3D3E]/30 hover:shadow-xl"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span
                          className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                            examen.inscrit
                              ? "bg-green-100 text-green-700"
                              : "bg-[#EBF3F0] text-[#2A6B59]"
                          }`}
                        >
                          {examen.inscrit ? "Inscrit" : "Publié"}
                        </span>

                        <button
                          type="button"
                          onClick={() => toggleFavori(examen.id)}
                          disabled={isTogglingFav}
                          title={
                            isFav
                              ? "Retirer des favoris"
                              : "Ajouter aux favoris"
                          }
                          aria-label={
                            isFav
                              ? "Retirer des favoris"
                              : "Ajouter aux favoris"
                          }
                          className={`flex h-8 w-8 items-center justify-center rounded-full border transition ${
                            isFav
                              ? "border-rose-200 bg-rose-50 text-rose-500 hover:bg-rose-100"
                              : "border-[#E6E1D5] bg-white text-[#737873] hover:border-rose-200 hover:text-rose-500"
                          } disabled:opacity-60`}
                        >
                          <Heart
                            size={15}
                            className={isFav ? "fill-rose-500" : ""}
                          />
                        </button>
                      </div>
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
                          {examen.pointsTotaux} pts (seuil :{" "}
                          {examen.pointsDePassage})
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <FileQuestion size={14} />
                        <span>{examen.questionsCount} question(s)</span>
                      </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-[#E6E1D5]">
                      {examen.inscrit ? (
                        <Link
                          to={`/dashboard/etudiant/examens/${examen.id}`}
                          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-white border border-[#0F3D3E] px-4 py-3 text-sm font-semibold text-[#0F3D3E] transition-all hover:bg-[#0F3D3E] hover:text-white hover:shadow-md"
                        >
                          <CheckCircle2 size={18} />
                          Commencer l’examen
                        </Link>
                      ) : (
                        <button
                          onClick={() => handleInscription(examen.id)}
                          disabled={inscrivantId === examen.id}
                          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#2A6B59] px-4 py-3 text-sm font-semibold text-white transition-all hover:bg-[#1e4f42] hover:shadow-md disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                          {inscrivantId === examen.id ? (
                            <>
                              <Loader2 size={18} className="animate-spin" />
                              Inscription...
                            </>
                          ) : (
                            <>
                              <UserPlus size={18} />
                              S’inscrire à l’examen
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
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
                    className="inline-flex items-center gap-1 rounded-xl border border-[#E6E1D5] bg-white px-3.5 py-2 text-sm font-medium text-[#0F3D3E] shadow-sm transition hover:border-[#2A6B59] disabled:cursor-not-allowed disabled:opacity-40"
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
                              ? "bg-[#2A6B59] text-white shadow-sm"
                              : "border border-[#E6E1D5] bg-white text-[#0F3D3E] hover:border-[#2A6B59]"
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
                    className="inline-flex items-center gap-1 rounded-xl border border-[#E6E1D5] bg-white px-3.5 py-2 text-sm font-medium text-[#0F3D3E] shadow-sm transition hover:border-[#2A6B59] disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Suivant <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}