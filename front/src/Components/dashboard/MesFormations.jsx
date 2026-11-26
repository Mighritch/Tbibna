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

export default function MesFormations() {
  const [formations, setFormations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // recherche par titre
  const [searchQuery, setSearchQuery] = useState("");

  // filtre / tri par statut ("", "acceptee", "en_attente", "refusee")
  const [statutFilter, setStatutFilter] = useState("");

  // tri / filtre par prix ("", "gratuit", "payant_asc", "payant_desc")
  const [sortPrix, setSortPrix] = useState("");

  // sélection via calendrier pour date début et date fin
  const [dateDebutFilter, setDateDebutFilter] = useState("");
  const [dateFinFilter, setDateFinFilter] = useState("");

  // références vers les inputs date pour ouvrir le calendrier au clic sur le bouton
  const dateDebutInputRef = useRef(null);
  const dateFinInputRef = useRef(null);

  // suppression
  const [toDelete, setToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    fetch(`${API}/mes-formations`, {
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

  // Gestionnaires exclusifs entre Statut, Prix, Date début et Date fin
  const handleStatutChange = (value) => {
    setStatutFilter(value);
    setSortPrix("");
    setDateDebutFilter("");
    setDateFinFilter("");
  };

  const handleSortPrix = (value) => {
    setSortPrix(value);
    setStatutFilter("");
    setDateDebutFilter("");
    setDateFinFilter("");
  };

  const handleDateDebutChange = (value) => {
    setDateDebutFilter(value);
    setStatutFilter("");
    setSortPrix("");
    setDateFinFilter("");
  };

  const handleDateFinChange = (value) => {
    setDateFinFilter(value);
    setStatutFilter("");
    setSortPrix("");
    setDateDebutFilter("");
  };

  // 1. Filtrage par titre + statut + prix + date choisie dans le calendrier
  const filteredFormations = formations.filter((f) => {
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

  const hasActiveFilter = Boolean(
    searchQuery || statutFilter || sortPrix || dateDebutFilter || dateFinFilter
  );

  const resetAllFilters = () => {
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
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-serif text-2xl font-semibold text-[#0F3D3E]">
              Mes formations
            </h1>
            <p className="text-sm text-[#737873]">
              Une formation n'est visible par les étudiants qu'après validation par l'administrateur
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
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher par titre..."
                className="w-full rounded-xl border border-[#E6E1D5] bg-white py-2.5 pl-10 pr-10 text-sm text-[#0F3D3E] placeholder-[#737873] shadow-sm transition focus:border-[#0F3D3E] focus:outline-none"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
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
                        setDateDebutFilter("");
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.stopPropagation();
                          setDateDebutFilter("");
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
                        setDateFinFilter("");
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.stopPropagation();
                          setDateFinFilter("");
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
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {sortedFormations.map((f) => {
              const statut = STATUT_UI[f.statut] || STATUT_UI.en_attente;
              return (
                <div
                  key={f.id}
                  className="flex flex-col rounded-2xl border border-[#E6E1D5] bg-white p-6 shadow-sm transition hover:shadow-md"
                >
                  <div className="mb-3">
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${statut.cls}`}>
                      {statut.label}
                    </span>
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
                  <div className="mt-5 flex gap-2 border-t border-[#E6E1D5] pt-4">
                    <Link
                      to={`/dashboard/medecin/formations/${f.id}`}
                      className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-[#E6E1D5] px-3 py-2 text-xs font-semibold text-[#0F3D3E] transition hover:bg-[#FAF8F5]"
                    >
                      <Eye size={14} /> Voir
                    </Link>
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
                  </div>
                </div>
              );
            })}
          </div>
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