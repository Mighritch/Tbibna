import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  Plus,
  BookOpen,
  Clock,
  Eye,
  Pencil,
  Trash2,
  Loader2,
  AlertTriangle,
  Calendar,
  Search,
  X,
  ArrowUpDown,
  Filter,
  Heart,
  UserCheck,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const API = "http://localhost:8000/api/formations";

const STATUT_UI = {
  en_attente: { label: "En attente de validation", cls: "bg-amber-100 text-amber-700" },
  acceptee: { label: "Acceptée", cls: "bg-green-100 text-green-700" },
  refusee: { label: "Refusée", cls: "bg-red-100 text-red-700" },
};

const formatDate = (d) =>
  d ? new Date(d).toLocaleDateString("fr-FR") : null;

// Normalise une date en YYYY-MM-DD (heure locale) pour comparer uniquement le jour
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

export default function MesFormations() {
  const [formations, setFormations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Onglet actif : "toutes" | "mine" | "autres" | "favoris"
  const [activeTab, setActiveTab] = useState("toutes");

  // Suivi du chargement lors du clic sur le bouton favori
  const [togglingFavoriId, setTogglingFavoriId] = useState(null);

  // recherche par titre
  const [searchQuery, setSearchQuery] = useState("");

  // filtre / tri par statut ("", "acceptee", "en_attente", "refusee")
  const [statutFilter, setStatutFilter] = useState("");

  // tri / filtre par prix ("", "gratuit", "payant_asc", "payant_desc")
  const [sortPrix, setSortPrix] = useState("");

  // sélection via calendrier pour date début et date fin
  const [dateDebutFilter, setDateDebutFilter] = useState("");
  const [dateFinFilter, setDateFinFilter] = useState("");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);

  // références vers les inputs date pour ouvrir le calendrier au clic sur le bouton
  const dateDebutInputRef = useRef(null);
  const dateFinInputRef = useRef(null);

  // suppression
  const [toDelete, setToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    fetch(`${API}/catalogue-medecin`, {
      method: "GET",
      credentials: "include",
      headers: { Accept: "application/json" },
    })
      .then((res) => {
        if (res.status === 401) {
          throw new Error("Non connecté. Veuillez vous reconnecter.");
        }
        if (res.status === 403) {
          throw new Error("Accès réservé aux médecins.");
        }
        if (!res.ok) {
          throw new Error("Erreur lors du chargement des formations.");
        }
        return res.json();
      })
      .then((data) => {
        if (!cancelled) setFormations(Array.isArray(data) ? data : []);
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

  // Ajouter / Retirer une formation des favoris
  const handleToggleFavori = async (formation) => {
    if (togglingFavoriId || formation.statut !== "acceptee") return;
    setTogglingFavoriId(formation.id);

    try {
      const res = await fetch(`${API}/${formation.id}/favori`, {
        method: "POST",
        credentials: "include",
        headers: { Accept: "application/json" },
      });

      if (!res.ok) {
        throw new Error("Impossible de mettre à jour les favoris.");
      }

      const updated = await res.json();
      setFormations((prev) =>
        prev.map((item) => (item.id === updated.id ? updated : item))
      );
    } catch (err) {
      console.error(err);
    } finally {
      setTogglingFavoriId(null);
    }
  };

  const confirmDelete = async () => {
    if (!toDelete) return;
    setDeleting(true);
    setDeleteError(null);

    try {
      const res = await fetch(`${API}/${toDelete.id}`, {
        method: "DELETE",
        credentials: "include",
        headers: { Accept: "application/json" },
      });

      if (!res.ok) {
        let message = "Erreur lors de la suppression.";
        if (res.status === 401) message = "Non connecté. Veuillez vous reconnecter.";
        else if (res.status === 403) message = "Vous ne pouvez pas supprimer cette formation.";
        else if (res.status === 404) message = "Formation introuvable.";
        throw new Error(message);
      }

      setFormations((prev) => prev.filter((f) => f.id !== toDelete.id));
      setToDelete(null);
    } catch (err) {
      setDeleteError(err.message);
    } finally {
      setDeleting(false);
    }
  };

  // Ouvre le petit calendrier natif au clic
  const openCalendar = (ref) => {
    if (!ref.current) return;
    if (typeof ref.current.showPicker === "function") {
      ref.current.showPicker();
    } else {
      ref.current.focus();
      ref.current.click();
    }
  };

  // Chaque changement d'onglet / recherche / filtre ramène à la page 1
  // (fait directement dans les gestionnaires d'événements, sans useEffect)
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setCurrentPage(1);
  };

  const handleSearchChange = (value) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

  const clearDateDebut = () => {
    setDateDebutFilter("");
    setCurrentPage(1);
  };

  const clearDateFin = () => {
    setDateFinFilter("");
    setCurrentPage(1);
  };

  // Gestionnaires exclusifs entre Statut, Prix, Date début et Date fin
  const handleStatutChange = (value) => {
    setCurrentPage(1);
    setStatutFilter(value);
    setSortPrix("");
    setDateDebutFilter("");
    setDateFinFilter("");
  };

  const handleSortPrix = (value) => {
    setCurrentPage(1);
    setSortPrix(value);
    setStatutFilter("");
    setDateDebutFilter("");
    setDateFinFilter("");
  };

  const handleDateDebutChange = (value) => {
    setCurrentPage(1);
    setDateDebutFilter(value);
    setStatutFilter("");
    setSortPrix("");
    setDateFinFilter("");
  };

  const handleDateFinChange = (value) => {
    setCurrentPage(1);
    setDateFinFilter(value);
    setStatutFilter("");
    setSortPrix("");
    setDateDebutFilter("");
  };

  // Compteurs pour les onglets
  const countMine = formations.filter((f) => f.isMine).length;
  const countAutres = formations.filter((f) => !f.isMine).length;
  const countFavoris = formations.filter((f) => f.isFavori).length;

  // 1. Filtrage par onglet + titre + statut + prix + date choisie dans le calendrier
  const filteredFormations = formations.filter((f) => {
    if (activeTab === "mine" && !f.isMine) return false;
    if (activeTab === "autres" && f.isMine) return false;
    if (activeTab === "favoris" && !f.isFavori) return false;

    const matchTitre = f.titre
      ?.toLowerCase()
      .includes(searchQuery.trim().toLowerCase());
    if (!matchTitre) return false;

    if (statutFilter && (f.statut || "en_attente") !== statutFilter) {
      return false;
    }

    if (sortPrix === "gratuit" && !f.gratuit) {
      return false;
    }

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

  // 2. Tri des formations résultantes
  const sortedFormations = [...filteredFormations].sort((a, b) => {
    const getPrix = (f) => Number(f.prix) || 0;
    const getTime = (d) => (d ? new Date(d).getTime() : 0);

    if (sortPrix === "payant_asc") return getPrix(a) - getPrix(b);
    if (sortPrix === "payant_desc") return getPrix(b) - getPrix(a);

    if (dateDebutFilter) {
      return getTime(a.dateDebut) - getTime(b.dateDebut);
    }

    if (dateFinFilter) {
      return getTime(a.dateFin) - getTime(b.dateFin);
    }

    return 0;
  });

  // 3. Pagination : 4 formations par page
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
    activeTab !== "toutes" ||
      searchQuery ||
      statutFilter ||
      sortPrix ||
      dateDebutFilter ||
      dateFinFilter
  );

  const resetAllFilters = () => {
    setCurrentPage(1);
    setActiveTab("toutes");
    setSearchQuery("");
    setStatutFilter("");
    setSortPrix("");
    setDateDebutFilter("");
    setDateFinFilter("");
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center text-[#737873]">
        Chargement des formations...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF8F5] py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-serif text-2xl font-semibold text-[#0F3D3E]">
              Formations médicales
            </h1>
            <p className="text-sm text-[#737873]">
              Gérez vos propres formations et explorez celles validées de vos confrères
            </p>
          </div>

          <Link
            to="/dashboard/medecin/formations/ajouter"
            className="inline-flex items-center gap-2 rounded-xl border border-[#0F3D3E] bg-white px-5 py-3 text-sm font-semibold text-[#0F3D3E] shadow-sm transition hover:bg-[#F3EFE6]"
          >
            <Plus size={18} />
            Nouvelle formation
          </Link>
        </div>

        {/* Onglets : Toutes / Mes formations / Autres médecins / Mes favoris */}
        {!error && formations.length > 0 && (
          <div className="mb-6 flex flex-wrap gap-2 border-b border-[#E6E1D5] pb-4">
          
            <button
              type="button"
              onClick={() => handleTabChange("mine")}
              className={`rounded-xl px-4 py-2 text-sm font-medium transition ${
                activeTab === "mine"
                  ? "bg-[#0F3D3E] text-white shadow-sm"
                  : "border border-[#E6E1D5] bg-white text-[#0F3D3E] hover:bg-[#F3EFE6]"
              }`}
            >
              Mes formations ({countMine})
            </button>

            <button
              type="button"
              onClick={() => handleTabChange("autres")}
              className={`rounded-xl px-4 py-2 text-sm font-medium transition ${
                activeTab === "autres"
                  ? "bg-[#0F3D3E] text-white shadow-sm"
                  : "border border-[#E6E1D5] bg-white text-[#0F3D3E] hover:bg-[#F3EFE6]"
              }`}
            >
              Formations confrères ({countAutres})
            </button>

            <button
              type="button"
              onClick={() => handleTabChange("favoris")}
              className={`inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-medium transition ${
                activeTab === "favoris"
                  ? "bg-[#0F3D3E] text-white shadow-sm"
                  : "border border-[#E6E1D5] bg-white text-[#0F3D3E] hover:bg-[#F3EFE6]"
              }`}
            >
              <Heart
                size={15}
                className={
                  activeTab === "favoris"
                    ? "fill-red-400 text-red-400"
                    : "text-red-500"
                }
              />
              Mes favoris ({countFavoris})
            </button>
          </div>
        )}

        {/* Barre de recherche par titre + Statut + Prix + Calendriers Date début / Date fin */}
        {!error && formations.length > 0 && (
          <div className="mb-6 flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            {/* Recherche */}
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

            {/* Contrôles de tri/filtre séparés */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Filtre / Tri : Statut */}
              <div className="relative w-full sm:w-auto">
                <Filter
                  size={15}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#737873]"
                />
                <select
                  value={statutFilter}
                  onChange={(e) => handleStatutChange(e.target.value)}
                  aria-label="Filtrer par statut"
                  className={`w-full appearance-none rounded-xl border py-2.5 pl-9 pr-8 text-sm font-medium shadow-sm transition focus:border-[#0F3D3E] focus:outline-none sm:w-48 ${
                    statutFilter
                      ? "border-[#0F3D3E] bg-[#F3EFE6] text-[#0F3D3E]"
                      : "border-[#E6E1D5] bg-white text-[#0F3D3E]"
                  }`}
                >
                  <option value="">Statut : Tous</option>
                  <option value="acceptee">Acceptée</option>
                  <option value="en_attente">En attente</option>
                  <option value="refusee">Refusée</option>
                </select>
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#737873]">
                  ▼
                </span>
              </div>

              {/* Tri : Gratuit ou Par prix */}
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

              {/* Tri : Date de début (ouvre un calendrier au clic) */}
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
                      aria-label="Effacer la date de début"
                      onClick={(e) => {
                        e.stopPropagation();
                        clearDateDebut();
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.stopPropagation();
                          clearDateDebut();
                        }
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

              {/* Tri : Date de fin (ouvre un calendrier au clic) */}
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
                      aria-label="Effacer la date de fin"
                      onClick={(e) => {
                        e.stopPropagation();
                        clearDateFin();
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.stopPropagation();
                          clearDateFin();
                        }
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
            <p className="mt-4 text-[#737873]">Aucune formation pour le moment</p>
            <Link
              to="/dashboard/medecin/formations/ajouter"
              className="mt-4 inline-block text-sm font-semibold text-[#0F3D3E] hover:underline"
            >
              Créer votre première formation →
            </Link>
          </div>
        ) : !error && sortedFormations.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#E6E1D5] bg-white py-16 text-center">
            <Filter className="mx-auto h-10 w-10 text-[#737873]" />
            <p className="mt-4 text-[#737873]">
              Aucune formation trouvée avec les critères sélectionnés.
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
            {paginatedFormations.map((f) => {
              const statut = STATUT_UI[f.statut] || STATUT_UI.en_attente;
              const isAcceptee = f.statut === "acceptee";

              return (
                <div
                  key={f.id}
                  className="flex flex-col rounded-2xl border border-[#E6E1D5] bg-white p-6 shadow-sm transition hover:shadow-md"
                >
                  {/* En-tête : Statut / Auteur + Bouton Favori */}
                  <div className="mb-3 flex items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-1.5">
                      {f.isMine ? (
                        <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${statut.cls}`}>
                          {statut.label}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-[#F3EFE6] px-2.5 py-0.5 text-xs font-medium text-[#0F3D3E]">
                          <UserCheck size={12} />
                          Confrère
                        </span>
                      )}
                    </div>

                    {/* Bouton Favori (disponible sur toute formation acceptée) */}
                    {isAcceptee && (
                      <button
                        type="button"
                        disabled={togglingFavoriId === f.id}
                        onClick={() => handleToggleFavori(f)}
                        title={
                          f.isFavori
                            ? "Retirer des favoris"
                            : "Ajouter aux favoris"
                        }
                        aria-label={
                          f.isFavori
                            ? "Retirer des favoris"
                            : "Ajouter aux favoris"
                        }
                        className={`rounded-full p-2 transition ${
                          f.isFavori
                            ? "bg-red-50 text-red-600 hover:bg-red-100"
                            : "bg-[#FAF8F5] text-[#737873] hover:bg-[#F3EFE6] hover:text-red-500"
                        } disabled:opacity-50`}
                      >
                        <Heart
                          size={16}
                          className={f.isFavori ? "fill-red-500 text-red-500" : ""}
                        />
                      </button>
                    )}
                  </div>

                  <div className="flex items-start justify-between gap-2">
                    <h3 className="line-clamp-2 font-semibold text-[#0F3D3E]">
                      {f.titre}
                    </h3>
                    {f.gratuit ? (
                      <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700">
                        Gratuit
                      </span>
                    ) : (
                      <span className="whitespace-nowrap rounded-full bg-[#FAF8F5] px-2.5 py-0.5 text-xs font-medium text-[#0F3D3E]">
                        {f.prix} DT
                      </span>
                    )}
                  </div>

                  {!f.isMine && f.createdBy && (
                    <p className="mt-1 truncate text-xs text-[#737873]">
                      Proposée par : <span className="font-medium text-[#0F3D3E]">{f.createdBy}</span>
                    </p>
                  )}

                  <p className="mt-2 line-clamp-2 text-sm text-[#737873]">
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

                  {/* Actions */}
                  <div className="mt-auto pt-5">
                    <div className="flex gap-2 border-t border-[#E6E1D5] pt-4">
                      <Link
                        to={`/dashboard/medecin/formations/${f.id}`}
                        className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-[#E6E1D5] px-3 py-2 text-xs font-semibold text-[#0F3D3E] transition hover:bg-[#FAF8F5]"
                      >
                        <Eye size={14} /> Voir
                      </Link>

                      {f.isMine && (
                        <>
                          <Link
                            to={`/dashboard/medecin/formations/${f.id}/modifier`}
                            className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-[#E6E1D5] px-3 py-2 text-xs font-semibold text-[#0F3D3E] transition hover:bg-[#FAF8F5]"
                          >
                            <Pencil size={14} /> Modifier
                          </Link>
                          <button
                            type="button"
                            onClick={() => {
                              setDeleteError(null);
                              setToDelete(f);
                            }}
                            className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-50"
                          >
                            <Trash2 size={14} /> Supprimer
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
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

      {/* Modal de confirmation de suppression */}
      {toDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600">
                <AlertTriangle size={20} />
              </div>
              <div>
                <h2 className="font-semibold text-[#0F3D3E]">Supprimer la formation ?</h2>
                <p className="mt-1 text-sm text-[#737873]">
                  « {toDelete.titre} » sera définitivement supprimée. Cette action est irréversible.
                </p>
              </div>
            </div>

            {deleteError && (
              <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {deleteError}
              </div>
            )}

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                disabled={deleting}
                onClick={() => setToDelete(null)}
                className="rounded-xl border border-[#E6E1D5] px-5 py-2.5 text-sm font-semibold text-[#0F3D3E] transition hover:bg-[#FAF8F5] disabled:opacity-60"
              >
                Annuler
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={confirmDelete}
                className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-60"
              >
                {deleting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" /> Suppression...
                  </>
                ) : (
                  "Supprimer"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}