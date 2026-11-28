import { useEffect, useRef, useState } from "react";
import {
  BookOpen,
  Clock,
  Eye,
  Calendar,
  Search,
  X,
  ArrowUpDown,
  Filter,
  CheckCircle2,
  Target,
  User,
  Heart,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const API = "http://localhost:8000/api/formations";

const formatDate = (d) =>
  d ? new Date(d).toLocaleDateString("fr-FR") : null;

const toYMD = (d) => {
  if (!d) return null;
  const dt = new Date(d);
  if (Number.isNaN(dt.getTime())) return null;
  const year = dt.getFullYear();
  const month = String(dt.getMonth() + 1).padStart(2, "0");
  const day = String(dt.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const ITEMS_PER_PAGE = 4;

// Génère la liste des pages à afficher (avec "..." si beaucoup de pages)
const getPageNumbers = (current, total) => {
  if (total <= 5) return Array.from({ length: total }, (_, i) => i + 1);
  const pages = [1];
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  if (start > 2) pages.push("...");
  for (let p = start; p <= end; p++) pages.push(p);
  if (end < total - 1) pages.push("...");
  pages.push(total);
  return pages;
};

function Pagination({ currentPage, totalPages, totalItems, onPageChange }) {
  if (totalPages <= 1) return null;

  const from = (currentPage - 1) * ITEMS_PER_PAGE + 1;
  const to = Math.min(currentPage * ITEMS_PER_PAGE, totalItems);

  return (
    <div className="mt-8 flex flex-col items-center justify-between gap-4 sm:flex-row">
      <p className="text-sm text-[#737873]">
        Affichage de <span className="font-semibold text-[#0F3D3E]">{from}</span>{" "}
        à <span className="font-semibold text-[#0F3D3E]">{to}</span> sur{" "}
        <span className="font-semibold text-[#0F3D3E]">{totalItems}</span>{" "}
        formations
      </p>

      <nav className="flex items-center gap-1.5" aria-label="Pagination">
        <button
          type="button"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          aria-label="Page précédente"
          className="inline-flex items-center gap-1 rounded-xl border border-[#E6E1D5] bg-white px-3 py-2 text-sm font-medium text-[#0F3D3E] shadow-sm transition hover:bg-[#F3EFE6] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-white"
        >
          <ChevronLeft size={16} />
          <span className="hidden sm:inline">Précédent</span>
        </button>

        {getPageNumbers(currentPage, totalPages).map((p, idx) =>
          p === "..." ? (
            <span key={`dots-${idx}`} className="px-1.5 text-[#737873]">
              …
            </span>
          ) : (
            <button
              key={p}
              type="button"
              onClick={() => onPageChange(p)}
              aria-current={p === currentPage ? "page" : undefined}
              className={`h-9 min-w-[2.25rem] rounded-xl px-3 text-sm font-medium transition ${
                p === currentPage
                  ? "bg-[#0F3D3E] text-white shadow-sm"
                  : "border border-[#E6E1D5] bg-white text-[#0F3D3E] hover:bg-[#F3EFE6]"
              }`}
            >
              {p}
            </button>
          )
        )}

        <button
          type="button"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          aria-label="Page suivante"
          className="inline-flex items-center gap-1 rounded-xl border border-[#E6E1D5] bg-white px-3 py-2 text-sm font-medium text-[#0F3D3E] shadow-sm transition hover:bg-[#F3EFE6] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-white"
        >
          <span className="hidden sm:inline">Suivant</span>
          <ChevronRight size={16} />
        </button>
      </nav>
    </div>
  );
}

export default function FormationsEtudiant() {
  const [formations, setFormations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [togglingIds, setTogglingIds] = useState({});

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);

  // Filtres et tris
  const [searchQuery, setSearchQuery] = useState("");
  const [sortPrix, setSortPrix] = useState("");
  const [dateDebutFilter, setDateDebutFilter] = useState("");
  const [dateFinFilter, setDateFinFilter] = useState("");
  const [onlyFavoris, setOnlyFavoris] = useState(false);

  const dateDebutInputRef = useRef(null);
  const dateFinInputRef = useRef(null);

  // Modale de détails d'une formation
  const [selectedFormation, setSelectedFormation] = useState(null);

  useEffect(() => {
    let cancelled = false;

    fetch(API, {
      method: "GET",
      credentials: "include",
      headers: { Accept: "application/json" },
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error("Erreur lors du chargement des formations.");
        }
        return res.json();
      })
      .then((data) => {
        if (!cancelled) {
          const list = Array.isArray(data) ? data : [];
          // Double sécurité : on ne garde que les formations acceptées
          setFormations(list.filter((f) => f.statut === "acceptee"));
        }
      })
      .catch((err) => {
        console.error(err);
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const handleToggleFavori = async (e, formation) => {
    if (e) e.stopPropagation();
    if (togglingIds[formation.id]) return;

    const previousState = Boolean(formation.isFavori);
    const optimisticState = !previousState;

    // Mise à jour optimiste
    setTogglingIds((prev) => ({ ...prev, [formation.id]: true }));
    setFormations((prev) =>
      prev.map((item) =>
        item.id === formation.id ? { ...item, isFavori: optimisticState } : item
      )
    );
    setSelectedFormation((prev) =>
      prev && prev.id === formation.id
        ? { ...prev, isFavori: optimisticState }
        : prev
    );

    try {
      const res = await fetch(`${API}/${formation.id}/favori`, {
        method: "POST",
        credentials: "include",
        headers: { Accept: "application/json" },
      });

      if (res.status === 401 || res.status === 403) {
        throw new Error("Veuillez vous connecter pour ajouter aux favoris.");
      }
      if (!res.ok) {
        throw new Error("Impossible de mettre à jour les favoris.");
      }

      const updated = await res.json();
      setFormations((prev) =>
        prev.map((item) =>
          item.id === formation.id
            ? { ...item, isFavori: Boolean(updated.isFavori) }
            : item
        )
      );
      setSelectedFormation((prev) =>
        prev && prev.id === formation.id
          ? { ...prev, isFavori: Boolean(updated.isFavori) }
          : prev
      );
    } catch (err) {
      console.error(err);
      // Rollback en cas d'erreur
      setFormations((prev) =>
        prev.map((item) =>
          item.id === formation.id ? { ...item, isFavori: previousState } : item
        )
      );
      setSelectedFormation((prev) =>
        prev && prev.id === formation.id
          ? { ...prev, isFavori: previousState }
          : prev
      );
      alert(err.message);
    } finally {
      setTogglingIds((prev) => {
        const copy = { ...prev };
        delete copy[formation.id];
        return copy;
      });
    }
  };

  const openCalendar = (ref) => {
    if (!ref.current) return;
    if (typeof ref.current.showPicker === "function") {
      ref.current.showPicker();
    } else {
      ref.current.focus();
      ref.current.click();
    }
  };

  // Handlers qui remettent la page à 1
  const handleSearchChange = (value) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

  const handleOnlyFavorisToggle = () => {
    setOnlyFavoris((prev) => !prev);
    setCurrentPage(1);
  };

  const handleSortPrix = (value) => {
    setSortPrix(value);
    setDateDebutFilter("");
    setDateFinFilter("");
    setCurrentPage(1);
  };

  const handleDateDebutChange = (value) => {
    setDateDebutFilter(value);
    setSortPrix("");
    setDateFinFilter("");
    setCurrentPage(1);
  };

  const handleDateFinChange = (value) => {
    setDateFinFilter(value);
    setSortPrix("");
    setDateDebutFilter("");
    setCurrentPage(1);
  };

  const handleClearDateDebut = () => {
    setDateDebutFilter("");
    setCurrentPage(1);
  };

  const handleClearDateFin = () => {
    setDateFinFilter("");
    setCurrentPage(1);
  };

  const resetAllFilters = () => {
    setSearchQuery("");
    setSortPrix("");
    setDateDebutFilter("");
    setDateFinFilter("");
    setOnlyFavoris(false);
    setCurrentPage(1);
  };

  const favorisCount = formations.filter((f) => f.isFavori).length;

  // Filtrage
  const filteredFormations = formations.filter((f) => {
    if (onlyFavoris && !f.isFavori) return false;

    const matchTitre = f.titre
      ?.toLowerCase()
      .includes(searchQuery.trim().toLowerCase());
    if (!matchTitre) return false;

    if (sortPrix === "gratuit" && !f.gratuit) return false;
    if ((sortPrix === "payant_asc" || sortPrix === "payant_desc") && f.gratuit) {
      return false;
    }

    if (dateDebutFilter) {
      const fDebut = toYMD(f.dateDebut);
      if (!fDebut || fDebut < dateDebutFilter) return false;
    }

    if (dateFinFilter) {
      const fFin = toYMD(f.dateFin);
      if (!fFin || fFin > dateFinFilter) return false;
    }

    return true;
  });

  // Tri
  const sortedFormations = [...filteredFormations].sort((a, b) => {
    const getPrix = (f) => Number(f.prix) || 0;
    const getTime = (d) => (d ? new Date(d).getTime() : 0);

    if (sortPrix === "payant_asc") return getPrix(a) - getPrix(b);
    if (sortPrix === "payant_desc") return getPrix(b) - getPrix(a);
    if (dateDebutFilter) return getTime(a.dateDebut) - getTime(b.dateDebut);
    if (dateFinFilter) return getTime(a.dateFin) - getTime(b.dateFin);

    return 0;
  });

  // Pagination : 4 formations par page
  const totalPages = Math.max(1, Math.ceil(sortedFormations.length / ITEMS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedFormations = sortedFormations.slice(
    (safePage - 1) * ITEMS_PER_PAGE,
    safePage * ITEMS_PER_PAGE
  );

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const hasActiveFilter = Boolean(
    searchQuery || sortPrix || dateDebutFilter || dateFinFilter || onlyFavoris
  );

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center text-[#737873]">
        Chargement des formations disponibles...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF8F5] py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="font-serif text-2xl font-semibold text-[#0F3D3E]">
            Formations médicales
          </h1>
          <p className="text-sm text-[#737873]">
            Découvrez toutes les formations validées par notre équipe pédagogique
          </p>
        </div>

        {/* Barre de recherche et filtres */}
        {!error && formations.length > 0 && (
          <div className="mb-6 flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            <div className="relative w-full xl:max-w-xs">
              <Search
                size={18}
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#737873]"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder="Rechercher par titre..."
                className="w-full rounded-xl border border-[#E6E1D5] bg-white py-2.5 pl-10 pr-10 text-sm text-[#0F3D3E] placeholder-[#737873] shadow-sm transition focus:border-[#0F3D3E] focus:outline-none"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => handleSearchChange("")}
                  aria-label="Effacer la recherche"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#737873] hover:text-[#0F3D3E]"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Filtre Favoris */}
              <button
                type="button"
                onClick={handleOnlyFavorisToggle}
                className={`inline-flex w-full items-center justify-center gap-2 rounded-xl border px-3.5 py-2.5 text-sm font-medium shadow-sm transition sm:w-auto ${
                  onlyFavoris
                    ? "border-rose-300 bg-rose-50 text-rose-700"
                    : "border-[#E6E1D5] bg-white text-[#0F3D3E] hover:bg-[#FAF8F5]"
                }`}
              >
                <Heart
                  size={15}
                  className={
                    onlyFavoris
                      ? "fill-rose-500 text-rose-500"
                      : "text-[#737873]"
                  }
                />
                <span>Mes favoris</span>
                <span
                  className={`rounded-full px-1.5 py-0.5 text-xs font-semibold ${
                    onlyFavoris
                      ? "bg-rose-200/70 text-rose-800"
                      : "bg-[#FAF8F5] text-[#737873]"
                  }`}
                >
                  {favorisCount}
                </span>
              </button>

              {/* Tarif */}
              <div className="relative w-full sm:w-auto">
                <ArrowUpDown
                  size={15}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#737873]"
                />
                <select
                  value={sortPrix}
                  onChange={(e) => handleSortPrix(e.target.value)}
                  aria-label="Filtrer ou trier par prix"
                  className={`w-full appearance-none rounded-xl border py-2.5 pl-9 pr-8 text-sm font-medium shadow-sm transition focus:border-[#0F3D3E] focus:outline-none sm:w-52 ${
                    sortPrix
                      ? "border-[#0F3D3E] bg-[#F3EFE6] text-[#0F3D3E]"
                      : "border-[#E6E1D5] bg-white text-[#0F3D3E]"
                  }`}
                >
                  <option value="">Tarif : Tous</option>
                  <option value="gratuit">Gratuit uniquement</option>
                  <option value="payant_asc">Par prix : Croissant</option>
                  <option value="payant_desc">Par prix : Décroissant</option>
                </select>
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#737873]">
                  ▼
                </span>
              </div>

              {/* Date début */}
              <div className="relative w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => openCalendar(dateDebutInputRef)}
                  className={`inline-flex w-full items-center justify-between gap-2 rounded-xl border px-3.5 py-2.5 text-sm font-medium shadow-sm transition sm:w-48 ${
                    dateDebutFilter
                      ? "border-[#0F3D3E] bg-[#F3EFE6] text-[#0F3D3E]"
                      : "border-[#E6E1D5] bg-white text-[#0F3D3E] hover:bg-[#FAF8F5]"
                  }`}
                >
                  <span className="inline-flex items-center gap-2 truncate">
                    <Calendar size={15} className="shrink-0 text-[#737873]" />
                    <span className="truncate">
                      {dateDebutFilter
                        ? `Début : ${formatDate(dateDebutFilter)}`
                        : "Date début"}
                    </span>
                  </span>
                  {dateDebutFilter && (
                    <span
                      role="button"
                      tabIndex={0}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleClearDateDebut();
                      }}
                      className="rounded-full p-0.5 text-[#737873] hover:bg-white hover:text-[#0F3D3E]"
                    >
                      <X size={14} />
                    </span>
                  )}
                </button>
                <input
                  ref={dateDebutInputRef}
                  type="date"
                  value={dateDebutFilter}
                  onChange={(e) => handleDateDebutChange(e.target.value)}
                  tabIndex={-1}
                  aria-hidden="true"
                  className="pointer-events-none absolute bottom-0 left-0 h-0 w-0 opacity-0"
                />
              </div>

              {/* Date fin */}
              <div className="relative w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => openCalendar(dateFinInputRef)}
                  className={`inline-flex w-full items-center justify-between gap-2 rounded-xl border px-3.5 py-2.5 text-sm font-medium shadow-sm transition sm:w-48 ${
                    dateFinFilter
                      ? "border-[#0F3D3E] bg-[#F3EFE6] text-[#0F3D3E]"
                      : "border-[#E6E1D5] bg-white text-[#0F3D3E] hover:bg-[#FAF8F5]"
                  }`}
                >
                  <span className="inline-flex items-center gap-2 truncate">
                    <Calendar size={15} className="shrink-0 text-[#737873]" />
                    <span className="truncate">
                      {dateFinFilter
                        ? `Fin : ${formatDate(dateFinFilter)}`
                        : "Date fin"}
                    </span>
                  </span>
                  {dateFinFilter && (
                    <span
                      role="button"
                      tabIndex={0}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleClearDateFin();
                      }}
                      className="rounded-full p-0.5 text-[#737873] hover:bg-white hover:text-[#0F3D3E]"
                    >
                      <X size={14} />
                    </span>
                  )}
                </button>
                <input
                  ref={dateFinInputRef}
                  type="date"
                  value={dateFinFilter}
                  onChange={(e) => handleDateFinChange(e.target.value)}
                  tabIndex={-1}
                  aria-hidden="true"
                  className="pointer-events-none absolute bottom-0 left-0 h-0 w-0 opacity-0"
                />
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {!error && formations.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#E6E1D5] bg-white py-16 text-center">
            <BookOpen className="mx-auto h-12 w-12 text-[#D4AF37]" />
            <p className="mt-4 text-[#737873]">
              Aucune formation disponible pour le moment.
            </p>
          </div>
        ) : !error && sortedFormations.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#E6E1D5] bg-white py-16 text-center">
            <Filter className="mx-auto h-10 w-10 text-[#737873]" />
            <p className="mt-4 text-[#737873]">
              {onlyFavoris && favorisCount === 0
                ? "Vous n'avez pas encore ajouté de formation à vos favoris."
                : "Aucune formation trouvée avec les critères sélectionnés."}
            </p>
            {hasActiveFilter && (
              <button
                type="button"
                onClick={resetAllFilters}
                className="mt-3 text-sm font-semibold text-[#0F3D3E] hover:underline"
              >
                Réinitialiser les filtres
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="grid gap-6 sm:grid-cols-2">
              {paginatedFormations.map((f) => (
                <div
                  key={f.id}
                  className="flex flex-col justify-between rounded-2xl border border-[#E6E1D5] bg-white p-6 shadow-sm transition hover:shadow-md"
                >
                  <div>
                    <div className="mb-3 flex items-center justify-between gap-2">
                      <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700">
                        <CheckCircle2 size={12} /> Validée
                      </span>

                      <div className="flex items-center gap-2">
                        {f.gratuit ? (
                          <span className="rounded-full bg-[#EBF3F0] px-2.5 py-0.5 text-xs font-semibold text-[#2A6B59]">
                            Gratuit
                          </span>
                        ) : (
                          <span className="whitespace-nowrap rounded-full bg-[#FAF8F5] px-2.5 py-0.5 text-xs font-semibold text-[#0F3D3E]">
                            {f.prix} DT
                          </span>
                        )}

                        <button
                          type="button"
                          onClick={(e) => handleToggleFavori(e, f)}
                          disabled={Boolean(togglingIds[f.id])}
                          aria-label={
                            f.isFavori
                              ? "Retirer des favoris"
                              : "Ajouter aux favoris"
                          }
                          title={
                            f.isFavori
                              ? "Retirer des favoris"
                              : "Ajouter aux favoris"
                          }
                          className={`rounded-full border p-1.5 transition ${
                            f.isFavori
                              ? "border-rose-200 bg-rose-50 text-rose-500 hover:bg-rose-100"
                              : "border-[#E6E1D5] bg-white text-[#737873] hover:border-rose-200 hover:text-rose-500"
                          }`}
                        >
                          <Heart
                            size={15}
                            className={f.isFavori ? "fill-rose-500" : ""}
                          />
                        </button>
                      </div>
                    </div>

                    <h3 className="line-clamp-2 font-semibold text-[#0F3D3E]">
                      {f.titre}
                    </h3>

                    <p className="mt-2 line-clamp-3 text-sm text-[#737873]">
                      {f.description}
                    </p>

                    <div className="mt-4 flex flex-wrap gap-3 text-xs text-[#737873]">
                      <span className="inline-flex items-center gap-1">
                        <Clock size={14} /> {f.duree}h
                      </span>
                      {f.dateDebut && (
                        <span className="inline-flex items-center gap-1">
                          <Calendar size={14} /> {formatDate(f.dateDebut)}
                          {f.dateFin && ` → ${formatDate(f.dateFin)}`}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="mt-5 border-t border-[#E6E1D5] pt-4">
                    <button
                      type="button"
                      onClick={() => setSelectedFormation(f)}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#0F3D3E] px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-[#082829]"
                    >
                      <Eye size={15} /> Consulter les détails
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <Pagination
              currentPage={safePage}
              totalPages={totalPages}
              totalItems={sortedFormations.length}
              onPageChange={handlePageChange}
            />
          </>
        )}
      </div>

      {/* Modale de détail de la formation */}
      {selectedFormation && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-4 py-6"
          onClick={() => setSelectedFormation(null)}
        >
          <div
            className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl sm:p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 border-b border-[#E6E1D5] pb-4">
              <div>
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700">
                    <CheckCircle2 size={12} /> Formation validée
                  </span>
                  {selectedFormation.gratuit ? (
                    <span className="rounded-full bg-[#EBF3F0] px-2.5 py-0.5 text-xs font-semibold text-[#2A6B59]">
                      Gratuit
                    </span>
                  ) : (
                    <span className="rounded-full bg-[#FAF8F5] px-2.5 py-0.5 text-xs font-semibold text-[#0F3D3E]">
                      {selectedFormation.prix} DT
                    </span>
                  )}
                </div>
                <h2 className="font-serif text-xl font-semibold text-[#0F3D3E] sm:text-2xl">
                  {selectedFormation.titre}
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setSelectedFormation(null)}
                aria-label="Fermer"
                className="rounded-lg p-1.5 text-[#737873] transition hover:bg-[#FAF8F5] hover:text-[#0F3D3E]"
              >
                <X size={20} />
              </button>
            </div>

            <div className="mt-5 space-y-5 text-sm">
              <div className="grid gap-3 rounded-xl bg-[#FAF8F5] p-4 sm:grid-cols-3">
                <div className="flex items-center gap-2 text-[#0F3D3E]">
                  <Clock size={16} className="text-[#2A6B59]" />
                  <span>
                    <strong>Durée :</strong> {selectedFormation.duree}h
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[#0F3D3E] sm:col-span-2">
                  <Calendar size={16} className="text-[#2A6B59]" />
                  <span>
                    <strong>Période :</strong>{" "}
                    {selectedFormation.dateDebut
                      ? `${formatDate(selectedFormation.dateDebut)}${
                          selectedFormation.dateFin
                            ? ` au ${formatDate(selectedFormation.dateFin)}`
                            : ""
                        }`
                      : "Non précisée"}
                  </span>
                </div>
                {selectedFormation.createdBy && (
                  <div className="flex items-center gap-2 text-[#0F3D3E] sm:col-span-3">
                    <User size={16} className="text-[#2A6B59]" />
                    <span>
                      <strong>Formateur :</strong> {selectedFormation.createdBy}
                    </span>
                  </div>
                )}
              </div>

              <div>
                <h3 className="font-semibold text-[#0F3D3E]">Description</h3>
                <p className="mt-1.5 whitespace-pre-line leading-relaxed text-[#4A4D4A]">
                  {selectedFormation.description}
                </p>
              </div>

              {selectedFormation.objectifs && (
                <div>
                  <h3 className="inline-flex items-center gap-1.5 font-semibold text-[#0F3D3E]">
                    <Target size={16} className="text-[#2A6B59]" />
                    Objectifs pédagogiques
                  </h3>
                  <p className="mt-1.5 whitespace-pre-line leading-relaxed text-[#4A4D4A]">
                    {selectedFormation.objectifs}
                  </p>
                </div>
              )}
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-[#E6E1D5] pt-4">
              <button
                type="button"
                onClick={(e) => handleToggleFavori(e, selectedFormation)}
                disabled={Boolean(togglingIds[selectedFormation.id])}
                className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition ${
                  selectedFormation.isFavori
                    ? "border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100"
                    : "border-[#E6E1D5] bg-white text-[#0F3D3E] hover:bg-[#FAF8F5]"
                }`}
              >
                <Heart
                  size={16}
                  className={
                    selectedFormation.isFavori ? "fill-rose-500 text-rose-500" : ""
                  }
                />
                {selectedFormation.isFavori
                  ? "Retirer des favoris"
                  : "Ajouter aux favoris"}
              </button>

              <button
                type="button"
                onClick={() => setSelectedFormation(null)}
                className="rounded-xl border border-[#E6E1D5] px-5 py-2.5 text-sm font-semibold text-[#0F3D3E] transition hover:bg-[#FAF8F5]"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}