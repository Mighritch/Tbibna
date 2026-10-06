import { useEffect, useState, useMemo, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import {
  Plus,
  BookOpen,
  Clock,
  BarChart3,
  AlertCircle,
  Pencil,
  Trash2,
  X,
  Save,
  Eye,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  XCircle,
  Hourglass,
  ArrowUpDown,
  Users,
  FileText,
  Send,
} from "lucide-react";

const ITEMS_PER_PAGE = 3;
const POLL_INTERVAL = 5000;

function Pagination({ currentPage, totalPages, totalItems, onPageChange }) {
  if (totalItems <= ITEMS_PER_PAGE) return null;

  const start = (currentPage - 1) * ITEMS_PER_PAGE + 1;
  const end = Math.min(currentPage * ITEMS_PER_PAGE, totalItems);

  return (
    <div className="mt-8 flex flex-col items-center justify-between gap-4 rounded-2xl border border-[#E4DFD3] bg-white p-4 shadow-sm sm:flex-row">
      <p className="text-sm text-[#5C5A54]">
        Affichage de <span className="font-medium text-[#0F3D3E]">{start}</span>{" "}
        à <span className="font-medium text-[#0F3D3E]">{end}</span> sur{" "}
        <span className="font-medium text-[#0F3D3E]">{totalItems}</span> activités
      </p>

      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="inline-flex items-center gap-1 rounded-xl border border-[#E4DFD3] bg-white px-3 py-2 text-sm font-medium text-[#0F3D3E] transition hover:bg-[#FAF8F5] disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronLeft size={16} />
          Précédent
        </button>

        {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => onPageChange(p)}
            className={`h-9 min-w-9 rounded-xl px-3 text-sm font-medium transition ${
              p === currentPage
                ? "bg-[#0F3D3E] text-white"
                : "border border-[#E4DFD3] bg-white text-[#0F3D3E] hover:bg-[#FAF8F5]"
            }`}
          >
            {p}
          </button>
        ))}

        <button
          type="button"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="inline-flex items-center gap-1 rounded-xl border border-[#E4DFD3] bg-white px-3 py-2 text-sm font-medium text-[#0F3D3E] transition hover:bg-[#FAF8F5] disabled:cursor-not-allowed disabled:opacity-40"
        >
          Suivant
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}

export default function MesActivites() {
  const [activites, setActivites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [error, setError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const [vue, setVue] = useState("mes");

  const [editingActivite, setEditingActivite] = useState(null);
  const [form, setForm] = useState({
    titre: "",
    description: "",
    instructions: "",
    difficulte: "",
    duree: "",
  });

  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState(null);
  const [viewingActivite, setViewingActivite] = useState(null);

  // === SOUMISSIONS ===
  const [soumissionsModal, setSoumissionsModal] = useState(null); // { activite, soumissions, total, loading }
  const [notingId, setNotingId] = useState(null);
  const [noteForm, setNoteForm] = useState({ note: "", commentaireMedecin: "" });

  const [sortDifficulte, setSortDifficulte] = useState("");
  const [sortStatut, setSortStatut] = useState("");

  const isMounted = useRef(true);
  const isPolling = useRef(false);

  const loadActivites = useCallback(
    async (silent = false) => {
      try {
        if (!silent) {
          setLoading(true);
          setError(null);
        }

        const url =
          vue === "mes"
            ? "/api/medecin/activites"
            : "/api/activites/accepte";

        const res = await fetch(url, {
          credentials: "include",
          headers: { Accept: "application/json" },
        });

        if (!res.ok) {
          throw new Error(
            vue === "mes"
              ? "Impossible de charger vos activités"
              : "Impossible de charger les activités des médecins"
          );
        }

        const data = await res.json();

        if (isMounted.current) {
          setActivites(Array.isArray(data) ? data : []);
          setViewingActivite((prev) => {
            if (!prev) return null;
            const updated = (Array.isArray(data) ? data : []).find(
              (a) => a.id === prev.id
            );
            return updated || prev;
          });
        }
      } catch (err) {
        console.error(err);
        if (isMounted.current && !silent) {
          setError(err.message || "Une erreur est survenue");
        }
      } finally {
        if (isMounted.current && !silent) {
          setLoading(false);
        }
      }
    },
    [vue]
  );

  useEffect(() => {
    isMounted.current = true;
    let isCancelled = false;

    const fetchData = async () => {
      if (!isCancelled) await loadActivites(false);
    };

    fetchData();

    return () => {
      isCancelled = true;
      isMounted.current = false;
    };
  }, [loadActivites]);

  useEffect(() => {
    if (vue !== "mes") return;

    const intervalId = setInterval(() => {
      if (isPolling.current) return;
      isPolling.current = true;
      loadActivites(true).finally(() => {
        isPolling.current = false;
      });
    }, POLL_INTERVAL);

    return () => clearInterval(intervalId);
  }, [vue, loadActivites]);

  const activitesFiltrees = useMemo(() => {
    let result = [...activites];

    if (sortDifficulte) {
      result = result.filter((a) => a.difficulte === sortDifficulte);
    }

    if (sortStatut && vue === "mes") {
      result = result.filter((a) => a.statut === sortStatut);
    }

    const ordreDifficulte = { facile: 1, moyen: 2, difficile: 3 };
    result.sort((a, b) => {
      const dA = ordreDifficulte[a.difficulte] || 99;
      const dB = ordreDifficulte[b.difficulte] || 99;
      return dA - dB;
    });

    return result;
  }, [activites, sortDifficulte, sortStatut, vue]);

  const totalPages = Math.max(1, Math.ceil(activitesFiltrees.length / ITEMS_PER_PAGE));
  const currentPage = Math.min(page, totalPages);
  const paginated = activitesFiltrees.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handlePageChange = (p) => {
    setPage(p);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cette activité ?")) {
      return;
    }

    setDeletingId(id);

    try {
      const res = await fetch(`/api/medecin/activites/${id}`, {
        method: "DELETE",
        credentials: "include",
        headers: { Accept: "application/json" },
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "Erreur lors de la suppression");
      }

      setActivites((prev) => prev.filter((a) => a.id !== id));
    } catch (err) {
      console.error(err);
      setError(err.message || "Erreur lors de la suppression");
    } finally {
      setDeletingId(null);
    }
  };

  const openEditModal = (act) => {
    setEditingActivite(act);
    setForm({
      titre: act.titre || "",
      description: act.description || "",
      instructions: act.instructions || "",
      difficulte: act.difficulte || "",
      duree: act.duree?.toString() || "",
    });
    setFormError(null);
  };

  const closeEditModal = () => {
    setEditingActivite(null);
    setFormError(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editingActivite) return;

    setSaving(true);
    setFormError(null);

    try {
      const duree = parseInt(form.duree, 10);

      if (Number.isNaN(duree) || duree < 1) {
        throw new Error("La durée doit être un nombre supérieur à 0.");
      }

      const res = await fetch(`/api/medecin/activites/${editingActivite.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ ...form, duree }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "Erreur lors de la modification");
      }

      setActivites((prev) =>
        prev.map((a) =>
          a.id === editingActivite.id ? { ...a, ...form, duree } : a
        )
      );

      closeEditModal();
    } catch (err) {
      console.error(err);
      setFormError(err.message || "Erreur lors de la modification");
    } finally {
      setSaving(false);
    }
  };

  const openViewModal = (act) => setViewingActivite(act);
  const closeViewModal = () => setViewingActivite(null);

  // ===== SOUMISSIONS =====
  const openSoumissionsModal = async (act) => {
    setSoumissionsModal({
      activite: act,
      soumissions: [],
      total: 0,
      loading: true,
      error: null,
    });

    try {
      const res = await fetch(
        `/api/medecin/activites/${act.id}/soumissions`,
        {
          credentials: "include",
          headers: { Accept: "application/json" },
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Impossible de charger les soumissions");
      }

      setSoumissionsModal({
        activite: act,
        soumissions: data.soumissions || [],
        total: data.total || 0,
        loading: false,
        error: null,
      });
    } catch (err) {
      console.error(err);
      setSoumissionsModal((prev) => ({
        ...prev,
        loading: false,
        error: err.message || "Une erreur est survenue",
      }));
    }
  };

  const closeSoumissionsModal = () => {
    setSoumissionsModal(null);
    setNotingId(null);
    setNoteForm({ note: "", commentaireMedecin: "" });
  };

  const openNoteForm = (soumission) => {
    setNotingId(soumission.id);
    setNoteForm({
      note: soumission.note !== null && soumission.note !== undefined
        ? String(soumission.note)
        : "",
      commentaireMedecin: soumission.commentaireMedecin || "",
    });
  };

  const handleNoter = async (e) => {
    e.preventDefault();
    if (!notingId) return;

    try {
      const res = await fetch(`/api/medecin/soumissions/${notingId}/noter`, {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          note: noteForm.note !== "" ? parseFloat(noteForm.note) : null,
          commentaireMedecin: noteForm.commentaireMedecin || null,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Erreur lors de l'enregistrement de la note");
      }

      // Mettre à jour la liste locale
      setSoumissionsModal((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          soumissions: prev.soumissions.map((s) =>
            s.id === notingId
              ? {
                  ...s,
                  note: data.note,
                  commentaireMedecin: data.commentaireMedecin,
                }
              : s
          ),
        };
      });

      setNotingId(null);
      setNoteForm({ note: "", commentaireMedecin: "" });
    } catch (err) {
      console.error(err);
      alert(err.message || "Une erreur est survenue");
    }
  };

  const getStatutBadge = (statut) => {
    switch (statut) {
      case "accepte":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
            <CheckCircle2 size={13} />
            Acceptée
          </span>
        );
      case "refuse":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-2.5 py-1 text-xs font-medium text-rose-700">
            <XCircle size={13} />
            Refusée
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700">
            <Hourglass size={13} />
            En attente
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#FBF9F4] p-6 sm:p-8">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-serif text-3xl font-bold text-[#0F3D3E]">
              {vue === "mes" ? "Mes activités" : "Toutes les activités"}
            </h1>
            <p className="mt-1 text-[#5C5A54]">
              {vue === "mes"
                ? "Gérez les activités que vous proposez aux étudiants. Elles ne seront visibles sur la plateforme qu’après validation par un administrateur."
                : "Parcourez les activités acceptées publiées par les autres médecins."}
            </p>
          </div>

          {vue === "mes" && (
            <Link
              to="/dashboard/medecin/activites/ajouter"
              className="inline-flex items-center gap-2 rounded-xl border border-[#E4DFD3] bg-white px-5 py-3 text-sm font-semibold text-[#0F3D3E] shadow-sm transition hover:bg-gray-50 hover:shadow-md"
            >
              <Plus size={18} />
              Ajouter une activité
            </Link>
          )}
        </div>

        {/* Onglets */}
        <div className="mb-6 flex gap-2 rounded-2xl border border-[#E4DFD3] bg-white p-1.5 shadow-sm">
          <button
            type="button"
            onClick={() => {
              setVue("mes");
              setPage(1);
              setSortDifficulte("");
              setSortStatut("");
            }}
            className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
              vue === "mes"
                ? "bg-[#0F3D3E] text-[#F4C95D]"
                : "text-[#5C5A54] hover:bg-[#FBF9F4]"
            }`}
          >
            <BookOpen size={16} />
            Mes activités
          </button>
          <button
            type="button"
            onClick={() => {
              setVue("tous");
              setPage(1);
              setSortDifficulte("");
              setSortStatut("");
            }}
            className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
              vue === "tous"
                ? "bg-[#0F3D3E] text-[#F4C95D]"
                : "text-[#5C5A54] hover:bg-[#FBF9F4]"
            }`}
          >
            <Users size={16} />
            Toutes les activités
          </button>
        </div>

        {/* Filtres */}
        {!loading && !error && activites.length > 0 && (
          <div className="mb-6 flex flex-wrap items-center gap-4 rounded-2xl border border-[#E4DFD3] bg-white p-4 shadow-sm">
            <div className="flex items-center gap-2 text-sm font-medium text-[#0F3D3E]">
              <ArrowUpDown size={16} />
              Trier / Filtrer :
            </div>

            <div className="flex items-center gap-2">
              <label className="text-xs text-[#5C5A54]">Difficulté</label>
              <select
                value={sortDifficulte}
                onChange={(e) => setSortDifficulte(e.target.value)}
                className="rounded-xl border border-[#E4DFD3] bg-[#FAF8F5] px-3 py-2 text-sm text-[#0F3D3E] outline-none focus:border-[#0F3D3E] focus:ring-2 focus:ring-[#0F3D3E]/10"
              >
                <option value="">Toutes</option>
                <option value="facile">Facile</option>
                <option value="moyen">Moyen</option>
                <option value="difficile">Difficile</option>
              </select>
            </div>

            {vue === "mes" && (
              <div className="flex items-center gap-2">
                <label className="text-xs text-[#5C5A54]">Statut</label>
                <select
                  value={sortStatut}
                  onChange={(e) => setSortStatut(e.target.value)}
                  className="rounded-xl border border-[#E4DFD3] bg-[#FAF8F5] px-3 py-2 text-sm text-[#0F3D3E] outline-none focus:border-[#0F3D3E] focus:ring-2 focus:ring-[#0F3D3E]/10"
                >
                  <option value="">Tous</option>
                  <option value="en_attente">En attente</option>
                  <option value="accepte">Acceptée</option>
                  <option value="refuse">Refusée</option>
                </select>
              </div>
            )}

            {(sortDifficulte || sortStatut) && (
              <button
                type="button"
                onClick={() => {
                  setSortDifficulte("");
                  setSortStatut("");
                }}
                className="ml-auto text-xs font-medium text-[#0F3D3E] underline hover:no-underline"
              >
                Réinitialiser
              </button>
            )}
          </div>
        )}

        {/* Contenu */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#0F3D3E] border-t-transparent" />
          </div>
        ) : error ? (
          <div className="flex items-center gap-3 rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-rose-800">
            <AlertCircle size={20} />
            <p>{error}</p>
          </div>
        ) : activites.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#E4DFD3] bg-white py-16 text-center">
            <BookOpen size={40} className="mx-auto mb-4 text-[#0F3D3E]/40" />
            <h3 className="text-lg font-semibold text-[#0F3D3E]">
              {vue === "mes"
                ? "Aucune activité pour le moment"
                : "Aucune activité acceptée pour le moment"}
            </h3>
            <p className="mt-2 text-sm text-[#5C5A54]">
              {vue === "mes"
                ? "Commencez par créer votre première activité."
                : "Les activités acceptées par l’administrateur apparaîtront ici."}
            </p>
            {vue === "mes" && (
              <Link
                to="/dashboard/medecin/activites/ajouter"
                className="mt-6 inline-flex items-center gap-2 rounded-xl border border-[#E4DFD3] bg-white px-5 py-2.5 text-sm font-semibold text-[#0F3D3E] shadow-sm transition hover:bg-gray-50"
              >
                <Plus size={16} />
                Créer une activité
              </Link>
            )}
          </div>
        ) : activitesFiltrees.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#E4DFD3] bg-white py-16 text-center">
            <BookOpen size={40} className="mx-auto mb-4 text-[#0F3D3E]/40" />
            <h3 className="text-lg font-semibold text-[#0F3D3E]">
              Aucune activité ne correspond aux filtres
            </h3>
            <p className="mt-2 text-sm text-[#5C5A54]">
              Essayez de modifier ou de réinitialiser les filtres.
            </p>
          </div>
        ) : (
          <>
            <div className="grid gap-5 sm:grid-cols-2">
              {paginated.map((act) => (
                <div
                  key={act.id}
                  className="rounded-2xl border border-[#E4DFD3] bg-white p-6 shadow-sm transition hover:border-[#0F3D3E]/25 hover:shadow-md"
                >
                  <div className="flex items-start justify-between gap-3">
                    <h2 className="line-clamp-2 text-lg font-semibold text-[#0F3D3E]">
                      {act.titre}
                    </h2>
                    {vue === "mes" && getStatutBadge(act.statut)}
                  </div>

                  {vue === "tous" && act.medecin && (
                    <p className="mt-1 text-xs font-medium text-[#0F3D3E]/70">
                      Par Dr. {act.medecin.prenom} {act.medecin.nom}
                    </p>
                  )}

                  <p className="mt-3 line-clamp-3 text-sm text-[#5C5A54]">
                    {act.description}
                  </p>

                  <div className="mt-5 flex flex-wrap items-center gap-4 text-xs text-[#737873]">
                    <span className="flex items-center gap-1.5">
                      <Clock size={14} />
                      {act.duree} min
                    </span>
                    <span className="flex items-center gap-1.5">
                      <BarChart3 size={14} />
                      {act.difficulte}
                    </span>
                    <span className="flex items-center gap-1.5 font-medium text-[#0F3D3E]">
                      <Users size={14} />
                      {act.nbParticipants ?? 0} étudiant
                      {(act.nbParticipants ?? 0) > 1 ? "s" : ""}
                    </span>
                  </div>

                  <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-[#E4DFD3] pt-4">
                    <button
                      type="button"
                      onClick={() => openViewModal(act)}
                      className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-[#E4DFD3] bg-white px-4 py-2.5 text-sm font-medium text-[#0F3D3E] transition hover:bg-[#FAF8F5]"
                    >
                      <Eye size={16} />
                      Voir
                    </button>

                    {/* Bouton Voir les soumissions (uniquement en vue "mes") */}
                    {vue === "mes" && (
                      <button
                        type="button"
                        onClick={() => openSoumissionsModal(act)}
                        className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-[#0F3D3E]/20 bg-[#0F3D3E]/5 px-4 py-2.5 text-sm font-medium text-[#0F3D3E] transition hover:bg-[#0F3D3E]/10"
                      >
                        <FileText size={16} />
                        Soumissions
                      </button>
                    )}

                    {vue === "mes" && (
                      <>
                        <button
                          type="button"
                          onClick={() => openEditModal(act)}
                          className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#E4DFD3] bg-white px-3 py-2.5 text-sm font-medium text-[#0F3D3E] transition hover:bg-[#FAF8F5]"
                        >
                          <Pencil size={16} />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDelete(act.id)}
                          disabled={deletingId === act.id}
                          className="inline-flex items-center justify-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2.5 text-sm font-medium text-rose-700 transition hover:bg-rose-100 disabled:opacity-60"
                        >
                          {deletingId === act.id ? (
                            <span className="h-4 w-4 animate-spin rounded-full border-2 border-rose-700 border-t-transparent" />
                          ) : (
                            <Trash2 size={16} />
                          )}
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={activitesFiltrees.length}
              onPageChange={handlePageChange}
            />
          </>
        )}
      </div>

      {/* Modal visualisation instructions */}
      {viewingActivite && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-[#E4DFD3] bg-white shadow-xl">
            <div className="sticky top-0 flex items-center justify-between border-b border-[#E4DFD3] bg-white px-6 py-4">
              <h2 className="text-xl font-semibold text-[#0F3D3E]">
                Instructions de l'activité
              </h2>
              <button
                type="button"
                onClick={closeViewModal}
                className="rounded-lg p-1.5 text-[#5C5A54] transition hover:bg-gray-100"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-6 p-6">
              <div className="flex items-start justify-between gap-3">
                <h3 className="text-lg font-semibold text-[#0F3D3E]">
                  {viewingActivite.titre}
                </h3>
                {vue === "mes" && getStatutBadge(viewingActivite.statut)}
              </div>

              {vue === "tous" && viewingActivite.medecin && (
                <p className="text-sm font-medium text-[#0F3D3E]/80">
                  Publié par Dr. {viewingActivite.medecin.prenom}{" "}
                  {viewingActivite.medecin.nom}
                </p>
              )}

              <div className="flex flex-wrap items-center gap-4 text-sm text-[#737873]">
                <span className="flex items-center gap-1.5">
                  <Clock size={16} />
                  {viewingActivite.duree} min
                </span>
                <span className="flex items-center gap-1.5">
                  <BarChart3 size={16} />
                  {viewingActivite.difficulte}
                </span>
                <span className="flex items-center gap-1.5 font-medium text-[#0F3D3E]">
                  <Users size={16} />
                  {viewingActivite.nbParticipants ?? 0} étudiant
                  {(viewingActivite.nbParticipants ?? 0) > 1 ? "s" : ""}
                </span>
              </div>

              {vue === "mes" && viewingActivite.statut === "en_attente" && (
                <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                  Cette activité est en attente de validation par un
                  administrateur. Elle n’est pas encore visible sur la
                  plateforme.
                </div>
              )}

              {vue === "mes" && viewingActivite.statut === "refuse" && (
                <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
                  Cette activité a été refusée par un administrateur.
                </div>
              )}

              <div>
                <h4 className="mb-2 text-sm font-medium text-[#0F3D3E]">
                  Description
                </h4>
                <p className="whitespace-pre-wrap rounded-xl border border-[#E4DFD3] bg-[#FAF8F5] px-4 py-3 text-sm text-[#5C5A54]">
                  {viewingActivite.description || "—"}
                </p>
              </div>

              <div>
                <h4 className="mb-2 text-sm font-medium text-[#0F3D3E]">
                  Instructions
                </h4>
                <p className="whitespace-pre-wrap rounded-xl border border-[#E4DFD3] bg-[#FAF8F5] px-4 py-3 text-sm text-[#5C5A54]">
                  {viewingActivite.instructions || "—"}
                </p>
              </div>
            </div>

            <div className="sticky bottom-0 flex justify-end border-t border-[#E4DFD3] bg-white px-6 py-4">
              <button
                type="button"
                onClick={closeViewModal}
                className="rounded-xl border border-[#E4DFD3] bg-white px-5 py-2.5 text-sm font-medium text-[#0F3D3E] transition hover:bg-[#FAF8F5]"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== MODAL SOUMISSIONS ===== */}
      {soumissionsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-[#E4DFD3] bg-white shadow-xl">
            <div className="sticky top-0 flex items-center justify-between border-b border-[#E4DFD3] bg-white px-6 py-4">
              <div>
                <h2 className="text-xl font-semibold text-[#0F3D3E]">
                  Soumissions des étudiants
                </h2>
                <p className="mt-0.5 text-sm text-[#5C5A54]">
                  {soumissionsModal.activite?.titre}
                </p>
              </div>
              <button
                type="button"
                onClick={closeSoumissionsModal}
                className="rounded-lg p-1.5 text-[#5C5A54] transition hover:bg-gray-100"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6">
              {soumissionsModal.loading ? (
                <div className="flex justify-center py-12">
                  <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#0F3D3E] border-t-transparent" />
                </div>
              ) : soumissionsModal.error ? (
                <div className="flex items-center gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
                  <AlertCircle size={18} />
                  {soumissionsModal.error}
                </div>
              ) : soumissionsModal.soumissions.length === 0 ? (
                <div className="rounded-xl border border-dashed border-[#E4DFD3] py-12 text-center">
                  <FileText
                    size={36}
                    className="mx-auto mb-3 text-[#0F3D3E]/40"
                  />
                  <p className="font-medium text-[#0F3D3E]">
                    Aucune soumission pour le moment
                  </p>
                  <p className="mt-1 text-sm text-[#5C5A54]">
                    Les travaux des étudiants apparaîtront ici.
                  </p>
                </div>
              ) : (
                <div className="space-y-5">
                  <p className="text-sm text-[#5C5A54]">
                    {soumissionsModal.total} soumission
                    {soumissionsModal.total > 1 ? "s" : ""}
                  </p>

                  {soumissionsModal.soumissions.map((s) => (
                    <div
                      key={s.id}
                      className="rounded-2xl border border-[#E4DFD3] bg-[#FAF8F5] p-5"
                    >
                      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <p className="font-semibold text-[#0F3D3E]">
                            {s.etudiant?.nom || "Étudiant"}
                          </p>
                          <p className="text-xs text-[#737873]">
                            Soumis le{" "}
                            {s.createdAt
                              ? new Date(s.createdAt).toLocaleDateString(
                                  "fr-FR",
                                  {
                                    day: "2-digit",
                                    month: "long",
                                    year: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  }
                                )
                              : "—"}
                          </p>
                        </div>

                        {s.note !== null && s.note !== undefined ? (
                          <span className="inline-flex items-center rounded-full bg-emerald-50 px-3 py-1 text-sm font-semibold text-emerald-700">
                            Note : {s.note}/20
                          </span>
                        ) : (
                          <span className="inline-flex items-center rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700">
                            Non noté
                          </span>
                        )}
                      </div>

                      <div className="mb-3">
                        <p className="mb-1 text-xs font-medium text-[#5C5A54]">
                          Travail de l’étudiant
                        </p>
                        <p className="whitespace-pre-wrap rounded-xl border border-[#E4DFD3] bg-white px-4 py-3 text-sm text-[#0F3D3E]">
                          {s.contenu || "—"}
                        </p>
                      </div>

                      {s.commentaireEtudiant && (
                        <div className="mb-3">
                          <p className="mb-1 text-xs font-medium text-[#5C5A54]">
                            Commentaire de l’étudiant
                          </p>
                          <p className="whitespace-pre-wrap rounded-xl border border-[#E4DFD3] bg-white px-4 py-3 text-sm text-[#5C5A54]">
                            {s.commentaireEtudiant}
                          </p>
                        </div>
                      )}

                      {s.commentaireMedecin && notingId !== s.id && (
                        <div className="mb-3">
                          <p className="mb-1 text-xs font-medium text-[#5C5A54]">
                            Votre commentaire
                          </p>
                          <p className="whitespace-pre-wrap rounded-xl border border-[#E4DFD3] bg-white px-4 py-3 text-sm text-[#5C5A54]">
                            {s.commentaireMedecin}
                          </p>
                        </div>
                      )}

                      {/* Formulaire de notation */}
                      {notingId === s.id ? (
                        <form
                          onSubmit={handleNoter}
                          className="mt-4 space-y-3 border-t border-[#E4DFD3] pt-4"
                        >
                          <div className="grid gap-3 sm:grid-cols-2">
                            <div>
                              <label className="mb-1 block text-xs font-medium text-[#5C5A54]">
                                Note (/20)
                              </label>
                              <input
                                type="number"
                                min={0}
                                max={20}
                                step={0.5}
                                value={noteForm.note}
                                onChange={(e) =>
                                  setNoteForm((prev) => ({
                                    ...prev,
                                    note: e.target.value,
                                  }))
                                }
                                className="w-full rounded-xl border border-[#E4DFD3] bg-white px-3 py-2 text-sm outline-none focus:border-[#0F3D3E] focus:ring-2 focus:ring-[#0F3D3E]/10"
                                placeholder="Ex : 15"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="mb-1 block text-xs font-medium text-[#5C5A54]">
                              Commentaire (optionnel)
                            </label>
                            <textarea
                              rows={2}
                              value={noteForm.commentaireMedecin}
                              onChange={(e) =>
                                setNoteForm((prev) => ({
                                  ...prev,
                                  commentaireMedecin: e.target.value,
                                }))
                              }
                              className="w-full rounded-xl border border-[#E4DFD3] bg-white px-3 py-2 text-sm outline-none focus:border-[#0F3D3E] focus:ring-2 focus:ring-[#0F3D3E]/10"
                              placeholder="Votre retour à l’étudiant..."
                            />
                          </div>

                          <div className="flex gap-2">
                            <button
                              type="submit"
                              className="inline-flex items-center gap-2 rounded-xl bg-[#0F3D3E] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#082829]"
                            >
                              <Send size={14} />
                              Enregistrer la note
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setNotingId(null);
                                setNoteForm({ note: "", commentaireMedecin: "" });
                              }}
                              className="rounded-xl border border-[#E4DFD3] bg-white px-4 py-2 text-sm font-medium text-[#0F3D3E] transition hover:bg-[#FAF8F5]"
                            >
                              Annuler
                            </button>
                          </div>
                        </form>
                      ) : (
                        <button
                          type="button"
                          onClick={() => openNoteForm(s)}
                          className="mt-2 inline-flex items-center gap-2 rounded-xl border border-[#E4DFD3] bg-white px-4 py-2 text-sm font-medium text-[#0F3D3E] transition hover:bg-white/80"
                        >
                          <Pencil size={14} />
                          {s.note !== null && s.note !== undefined
                            ? "Modifier la note"
                            : "Noter ce travail"}
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="sticky bottom-0 flex justify-end border-t border-[#E4DFD3] bg-white px-6 py-4">
              <button
                type="button"
                onClick={closeSoumissionsModal}
                className="rounded-xl border border-[#E4DFD3] bg-white px-5 py-2.5 text-sm font-medium text-[#0F3D3E] transition hover:bg-[#FAF8F5]"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal édition */}
      {editingActivite && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-[#E4DFD3] bg-white shadow-xl">
            <div className="sticky top-0 flex items-center justify-between border-b border-[#E4DFD3] bg-white px-6 py-4">
              <h2 className="text-xl font-semibold text-[#0F3D3E]">
                Modifier l'activité
              </h2>
              <button
                type="button"
                onClick={closeEditModal}
                className="rounded-lg p-1.5 text-[#5C5A54] transition hover:bg-gray-100"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleUpdate} className="p-6">
              {formError && (
                <div className="mb-5 flex items-center gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
                  <AlertCircle size={18} />
                  {formError}
                </div>
              )}

              <div className="space-y-5">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-[#0F3D3E]">
                    Titre *
                  </label>
                  <input
                    type="text"
                    name="titre"
                    value={form.titre}
                    onChange={handleChange}
                    required
                    minLength={3}
                    maxLength={150}
                    className="w-full rounded-xl border border-[#E4DFD3] bg-[#FAF8F5] px-4 py-3 text-sm text-black outline-none transition focus:border-[#0F3D3E] focus:ring-2 focus:ring-[#0F3D3E]/10"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-[#0F3D3E]">
                    Description *
                  </label>
                  <textarea
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    required
                    rows={3}
                    className="w-full rounded-xl border border-[#E4DFD3] bg-[#FAF8F5] px-4 py-3 text-sm text-black outline-none transition focus:border-[#0F3D3E] focus:ring-2 focus:ring-[#0F3D3E]/10"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-[#0F3D3E]">
                    Instructions *
                  </label>
                  <textarea
                    name="instructions"
                    value={form.instructions}
                    onChange={handleChange}
                    required
                    rows={5}
                    className="w-full rounded-xl border border-[#E4DFD3] bg-[#FAF8F5] px-4 py-3 text-sm text-black outline-none transition focus:border-[#0F3D3E] focus:ring-2 focus:ring-[#0F3D3E]/10"
                  />
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-[#0F3D3E]">
                      Difficulté *
                    </label>
                    <select
                      name="difficulte"
                      value={form.difficulte}
                      onChange={handleChange}
                      required
                      className="w-full rounded-xl border border-[#E4DFD3] bg-[#FAF8F5] px-4 py-3 text-sm text-black outline-none transition focus:border-[#0F3D3E] focus:ring-2 focus:ring-[#0F3D3E]/10"
                    >
                      <option value="">Choisir une difficulté</option>
                      <option value="facile">Facile</option>
                      <option value="moyen">Moyen</option>
                      <option value="difficile">Difficile</option>
                    </select>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-[#0F3D3E]">
                      Durée (minutes) *
                    </label>
                    <input
                      type="number"
                      name="duree"
                      value={form.duree}
                      onChange={handleChange}
                      required
                      min={1}
                      className="w-full rounded-xl border border-[#E4DFD3] bg-[#FAF8F5] px-4 py-3 text-sm text-black outline-none transition focus:border-[#0F3D3E] focus:ring-2 focus:ring-[#0F3D3E]/10"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-8 flex flex-wrap items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={closeEditModal}
                  className="rounded-xl border border-[#E4DFD3] bg-white px-5 py-2.5 text-sm font-medium text-[#0F3D3E] transition hover:bg-[#FAF8F5]"
                >
                  Annuler
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#0F3D3E] px-6 py-2.5 text-sm font-semibold text-white shadow-md transition hover:bg-[#082829] disabled:opacity-60"
                >
                  {saving ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Enregistrement...
                    </>
                  ) : (
                    <>
                      <Save size={16} />
                      Enregistrer
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}