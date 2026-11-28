import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  BookOpen,
  Plus,
  Clock,
  Globe,
  Calendar,
  Loader2,
  AlertCircle,
  FileText,
  FileType2,
  Video,
  ExternalLink,
  Pencil,
  Trash2,
  X,
  CheckCircle2,
  Hourglass,
  Ban,
  Filter,
  Search,
  RotateCcw,
  Users,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Heart,
  User,
} from "lucide-react";

const FILES_BASE_URL = "";

const NIVEAUX = ["Débutant", "Intermédiaire", "Avancé"];
const LANGUES = ["Français", "Arabe", "Anglais"];

const COURS_PAR_PAGE = 4;

function getContenuUrl(contenuCours) {
  if (!contenuCours) return null;
  if (contenuCours.startsWith("http")) return contenuCours;
  return `${FILES_BASE_URL}${contenuCours}`;
}

function ContenuIcon({ type }) {
  if (type === "pdf") return <FileText size={16} />;
  if (type === "word") return <FileType2 size={16} />;
  if (type === "video") return <Video size={16} />;
  return <FileText size={16} />;
}

function contenuLabel(type) {
  if (type === "pdf") return "Voir le PDF";
  if (type === "word") return "Voir le document Word";
  if (type === "video") return "Voir la vidéo";
  return "Voir le contenu";
}

function StatutBadge({ statut }) {
  if (statut === "approuve") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-800">
        <CheckCircle2 size={12} />
        Approuvé
      </span>
    );
  }

  if (statut === "rejete") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800">
        <Ban size={12} />
        Rejeté
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-800">
      <Hourglass size={12} />
      En attente
    </span>
  );
}

function ModifierCoursModal({ cours, onClose, onSaved }) {
  const [form, setForm] = useState({
    titre: cours.titre || "",
    description: cours.description || "",
    duree: cours.duree ?? "",
    langueCours: cours.langueCours || "",
    niveauCours: cours.niveauCours || "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch(`/api/cours/${cours.id}`, {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...form,
          duree: Number(form.duree),
        }),
      });

      const text = await res.text();
      let data;

      try {
        data = JSON.parse(text);
      } catch {
        console.error("Réponse non-JSON reçue :", text.slice(0, 500));
        throw new Error(
          `Erreur serveur (${res.status}). Réponse non JSON. Voir la console.`
        );
      }

      if (!res.ok) {
        throw new Error(data.error || "Impossible de modifier le cours.");
      }

      onSaved({
        ...cours,
        ...form,
        duree: Number(form.duree),
        statut: cours.statut === "rejete" ? "en_attente" : cours.statut,
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="font-serif text-xl font-bold text-[#0F3D3E]">
            Modifier le cours
          </h2>

          <button
            onClick={onClose}
            className="text-[#5C5A54] hover:text-[#0F3D3E]"
            aria-label="Fermer"
          >
            <X size={20} />
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm font-medium text-red-800">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-[#3C3A34]">
              Titre du cours
            </label>

            <input
              type="text"
              name="titre"
              value={form.titre}
              onChange={handleChange}
              required
              className="w-full rounded-xl border border-[#E4DFD3] px-4 py-2.5 text-sm outline-none focus:border-[#0F3D3E]"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-[#3C3A34]">
              Description
            </label>

            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              required
              rows={3}
              className="w-full rounded-xl border border-[#E4DFD3] px-4 py-2.5 text-sm outline-none focus:border-[#0F3D3E]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-[#3C3A34]">
                Durée (minutes)
              </label>

              <input
                type="number"
                name="duree"
                value={form.duree}
                onChange={handleChange}
                required
                min={1}
                className="w-full rounded-xl border border-[#E4DFD3] px-4 py-2.5 text-sm outline-none focus:border-[#0F3D3E]"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-[#3C3A34]">
                Niveau
              </label>

              <select
                name="niveauCours"
                value={form.niveauCours}
                onChange={handleChange}
                required
                className="w-full rounded-xl border border-[#E4DFD3] px-4 py-2.5 text-sm outline-none focus:border-[#0F3D3E]"
              >
                <option value="">Choisir...</option>

                {NIVEAUX.map((niveau) => (
                  <option key={niveau} value={niveau}>
                    {niveau}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-[#3C3A34]">
              Langue du cours
            </label>

            <select
              name="langueCours"
              value={form.langueCours}
              onChange={handleChange}
              required
              className="w-full rounded-xl border border-[#E4DFD3] px-4 py-2.5 text-sm outline-none focus:border-[#0F3D3E]"
            >
              <option value="">Choisir...</option>

              {LANGUES.map((langue) => (
                <option key={langue} value={langue}>
                  {langue}
                </option>
              ))}
            </select>
          </div>

          <p className="text-xs text-[#5C5A54]">
            Le fichier de contenu (PDF, Word ou vidéo) ne peut pas être
            remplacé depuis cette fenêtre. Supprimez le cours et recréez-le si
            besoin d'en changer.
          </p>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-[#E4DFD3] px-4 py-2.5 text-sm font-semibold text-[#3C3A34] transition hover:bg-[#FBF9F4]"
            >
              Annuler
            </button>

            <button
              type="submit"
              disabled={loading}
              className="flex-1 rounded-xl bg-[#0F3D3E] px-4 py-2.5 text-sm font-semibold text-[#F4C95D] transition hover:bg-[#082829] disabled:opacity-60"
            >
              {loading ? "Enregistrement..." : "Enregistrer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function SupprimerCoursModal({ cours, onClose, onDeleted }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleDelete = async () => {
    setError(null);
    setLoading(true);

    try {
      const res = await fetch(`/api/cours/${cours.id}`, {
        method: "DELETE",
        credentials: "include",
      });

      const text = await res.text();
      let data;

      try {
        data = JSON.parse(text);
      } catch {
        console.error("Réponse non-JSON reçue :", text.slice(0, 500));
        throw new Error(
          `Erreur serveur (${res.status}). Réponse non JSON. Voir la console.`
        );
      }

      if (!res.ok) {
        throw new Error(data.error || "Impossible de supprimer le cours.");
      }

      onDeleted(cours.id);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-red-600">
            <Trash2 size={20} />
          </span>

          <h2 className="font-serif text-lg font-bold text-[#0F3D3E]">
            Supprimer ce cours ?
          </h2>
        </div>

        <p className="mb-5 text-sm text-[#5C5A54]">
          Cette action est irréversible. Le cours{" "}
          <span className="font-semibold text-[#3C3A34]">
            « {cours.titre} »
          </span>{" "}
          et son fichier associé seront définitivement supprimés.
        </p>

        {error && (
          <div className="mb-4 rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm font-medium text-red-800">
            {error}
          </div>
        )}

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="flex-1 rounded-xl border border-[#E4DFD3] px-4 py-2.5 text-sm font-semibold text-[#3C3A34] transition hover:bg-[#FBF9F4] disabled:opacity-60"
          >
            Annuler
          </button>

          <button
            type="button"
            onClick={handleDelete}
            disabled={loading}
            className="flex-1 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-60"
          >
            {loading ? "Suppression..." : "Supprimer"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function MesCours() {
  const [cours, setCours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // "mes" | "tous" | "favoris"
  const [vue, setVue] = useState("mes");
  const [togglingFavoriId, setTogglingFavoriId] = useState(null);

  const [coursAModifier, setCoursAModifier] = useState(null);
  const [coursASupprimer, setCoursASupprimer] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [filtreLangue, setFiltreLangue] = useState("");
  const [filtreNiveau, setFiltreNiveau] = useState("");

  const [pageActuelle, setPageActuelle] = useState(1);

  // ========== CHARGEMENT INITIAL & CHANGEMENT D'ONGLET ==========
  useEffect(() => {
    const controller = new AbortController();
    const url = vue === "mes" ? "/api/cours/mes-cours" : "/api/cours/public";

    fetch(url, {
      credentials: "include",
      signal: controller.signal,
    })
      .then(async (res) => {
        const text = await res.text();
        let data;
        try {
          data = JSON.parse(text);
        } catch {
          console.error("Réponse non-JSON reçue :", text.slice(0, 500));
          throw new Error(
            `Erreur serveur (${res.status}). Réponse non JSON. Voir la console.`
          );
        }
        if (!res.ok) {
          throw new Error(
            data.error || data.message || "Impossible de charger les cours."
          );
        }
        return data;
      })
      .then((data) => {
        setCours(Array.isArray(data) ? data : []);
        setError(null);
      })
      .catch((err) => {
        if (err.name !== "AbortError") {
          setError(err.message);
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      });

    return () => controller.abort();
  }, [vue]);

  // ========== ACTUALISATION MANUELLE ==========
  const handleRefresh = async () => {
    if (refreshing || loading) return;
    setRefreshing(true);

    try {
      const url = vue === "mes" ? "/api/cours/mes-cours" : "/api/cours/public";
      const res = await fetch(url, { credentials: "include" });
      const text = await res.text();
      let data;

      try {
        data = JSON.parse(text);
      } catch {
        throw new Error(`Erreur serveur (${res.status}). Réponse non JSON.`);
      }

      if (!res.ok) {
        throw new Error(
          data.error || data.message || "Impossible de charger les cours."
        );
      }

      setCours(Array.isArray(data) ? data : []);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (!successMessage) return;

    const timer = setTimeout(() => {
      setSuccessMessage(null);
    }, 3000);

    return () => clearTimeout(timer);
  }, [successMessage]);

  // ========== TOGGLE FAVORI ==========
  const handleToggleFavori = async (coursId) => {
    if (togglingFavoriId) return;
    setTogglingFavoriId(coursId);

    // Mise à jour optimiste
    setCours((prev) =>
      prev.map((c) =>
        c.id === coursId ? { ...c, isFavori: !c.isFavori } : c
      )
    );

    try {
      const res = await fetch(`/api/cours/${coursId}/favori`, {
        method: "POST",
        credentials: "include",
      });

      const data = await res.json();

      if (res.ok) {
        setCours((prev) =>
          prev.map((c) =>
            c.id === coursId ? { ...c, isFavori: data.isFavori } : c
          )
        );
        setSuccessMessage(data.message);
      } else {
        setCours((prev) =>
          prev.map((c) =>
            c.id === coursId ? { ...c, isFavori: !c.isFavori } : c
          )
        );
        setError(data.error || "Impossible de modifier les favoris.");
      }
    } catch (err) {
      console.error(err);
      setCours((prev) =>
        prev.map((c) =>
          c.id === coursId ? { ...c, isFavori: !c.isFavori } : c
        )
      );
    } finally {
      setTogglingFavoriId(null);
    }
  };

  const countFavoris = useMemo(
    () => cours.filter((c) => !c.estProprietaire && c.isFavori).length,
    [cours]
  );

  const coursFiltres = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    return cours.filter((c) => {
      if (vue === "favoris" && (!c.isFavori || c.estProprietaire)) {
        return false;
      }

      const matchSearch =
        !term ||
        (c.titre && c.titre.toLowerCase().includes(term)) ||
        (c.description && c.description.toLowerCase().includes(term));

      const matchLangue = !filtreLangue || c.langueCours === filtreLangue;
      const matchNiveau = !filtreNiveau || c.niveauCours === filtreNiveau;

      return matchSearch && matchLangue && matchNiveau;
    });
  }, [cours, vue, searchTerm, filtreLangue, filtreNiveau]);

  const totalPages = Math.ceil(coursFiltres.length / COURS_PAR_PAGE);

  const pageSecurisee =
    totalPages === 0 ? 1 : Math.min(pageActuelle, totalPages);

  const coursAffiches = useMemo(() => {
    const indexDebut = (pageSecurisee - 1) * COURS_PAR_PAGE;
    const indexFin = indexDebut + COURS_PAR_PAGE;

    return coursFiltres.slice(indexDebut, indexFin);
  }, [coursFiltres, pageSecurisee]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setPageActuelle(1);
  };

  const handleLangueChange = (e) => {
    setFiltreLangue(e.target.value);
    setPageActuelle(1);
  };

  const handleNiveauChange = (e) => {
    setFiltreNiveau(e.target.value);
    setPageActuelle(1);
  };

  const handleVueChange = (nouvelleVue) => {
    if (nouvelleVue === vue) return;
    // On passe loading à true uniquement lors d'un vrai changement de source de données
    if (
      (vue === "mes" && nouvelleVue !== "mes") ||
      (vue !== "mes" && nouvelleVue === "mes")
    ) {
      setLoading(true);
      setError(null);
    }
    setVue(nouvelleVue);
    setPageActuelle(1);
  };

  const allerPagePrecedente = () => {
    setPageActuelle((prev) => Math.max(prev - 1, 1));
  };

  const allerPageSuivante = () => {
    setPageActuelle((prev) => Math.min(prev + 1, totalPages));
  };

  const allerPage = (page) => {
    setPageActuelle(page);
  };

  const handleCoursModifie = (coursMisAJour) => {
    setCours((prev) =>
      prev.map((c) =>
        c.id === coursMisAJour.id ? { ...c, ...coursMisAJour } : c
      )
    );

    setCoursAModifier(null);
    setSuccessMessage("Cours modifié avec succès.");
  };

  const handleCoursSupprime = (id) => {
    setCours((prev) => prev.filter((c) => c.id !== id));

    setCoursASupprimer(null);
    setSuccessMessage("Cours supprimé avec succès.");
  };

  const resetFiltres = () => {
    setSearchTerm("");
    setFiltreLangue("");
    setFiltreNiveau("");
    setPageActuelle(1);
  };

  const hasActiveFilters = searchTerm || filtreLangue || filtreNiveau;

  return (
    <div className="min-h-screen bg-[#FBF9F4] p-6 sm:p-8">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-serif text-3xl font-bold text-[#0F3D3E]">
              {vue === "mes"
                ? "Mes cours"
                : vue === "favoris"
                ? "Mes cours favoris"
                : "Tous les cours"}
            </h1>

            <p className="mt-1 text-sm text-[#5C5A54]">
              {vue === "mes"
                ? "Gérez et publiez vos cours médicaux (validation admin requise)"
                : vue === "favoris"
                ? "Retrouvez les cours de vos confrères enregistrés en favoris"
                : "Parcourez les cours approuvés publiés par les autres médecins"}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleRefresh}
              disabled={loading || refreshing}
              className="inline-flex items-center gap-2 rounded-xl border border-[#E4DFD3] bg-white px-4 py-2.5 text-sm font-semibold text-[#0F3D3E] shadow-sm transition hover:bg-[#FBF9F4] disabled:opacity-60"
              title="Actualiser la liste"
            >
              <RefreshCw
                size={16}
                className={refreshing ? "animate-spin" : ""}
              />
              Actualiser
            </button>

            {vue === "mes" && (
              <Link
                to="/dashboard/medecin/cours/ajouter"
                className="inline-flex items-center gap-2 rounded-xl border border-[#E4DFD3] bg-white px-5 py-2.5 text-sm font-semibold text-[#0F3D3E] shadow-md transition hover:bg-[#FBF9F4] hover:shadow-lg"
              >
                <Plus size={16} />
                Ajouter un cours
              </Link>
            )}
          </div>
        </div>

        {/* Onglets */}
        <div className="mb-6 flex gap-2 rounded-2xl border border-[#E4DFD3] bg-white p-1.5 shadow-sm">
          <button
            type="button"
            onClick={() => handleVueChange("mes")}
            className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
              vue === "mes"
                ? "bg-[#0F3D3E] text-[#F4C95D]"
                : "text-[#5C5A54] hover:bg-[#FBF9F4]"
            }`}
          >
            <BookOpen size={16} />
            Mes cours
          </button>

          <button
            type="button"
            onClick={() => handleVueChange("tous")}
            className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
              vue === "tous"
                ? "bg-[#0F3D3E] text-[#F4C95D]"
                : "text-[#5C5A54] hover:bg-[#FBF9F4]"
            }`}
          >
            <Users size={16} />
            Cours Confrères
          </button>

          <button
            type="button"
            onClick={() => handleVueChange("favoris")}
            className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
              vue === "favoris"
                ? "bg-[#0F3D3E] text-[#F4C95D]"
                : "text-[#5C5A54] hover:bg-[#FBF9F4]"
            }`}
          >
            <Heart
              size={16}
              className={
                vue === "favoris" ? "fill-red-500 text-red-500" : ""
              }
            />
            Favoris{vue !== "mes" && countFavoris > 0 ? ` (${countFavoris})` : ""}
          </button>
        </div>

        {/* Message de succès */}
        {successMessage && (
          <div className="mb-6 flex items-center gap-3 rounded-xl border border-emerald-300 bg-emerald-50 px-5 py-3 text-sm font-medium text-emerald-800 shadow-sm">
            <CheckCircle2 size={18} />
            {successMessage}
          </div>
        )}

        {/* Filtres */}
        {!loading && !error && cours.length > 0 && (
          <div className="mb-8 overflow-hidden rounded-2xl border border-[#E4DFD3] bg-white shadow-md">
            <div className="border-b border-[#E4DFD3] bg-gradient-to-r from-[#0F3D3E]/[0.04] to-transparent px-5 py-3.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#0F3D3E]/10 text-[#0F3D3E]">
                    <Filter size={16} />
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-[#0F3D3E]">
                      Recherche & Filtres
                    </p>

                    <p className="text-xs text-[#5C5A54]">
                      Trouvez rapidement des cours
                    </p>
                  </div>
                </div>

                {hasActiveFilters && (
                  <button
                    type="button"
                    onClick={resetFiltres}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-[#0F3D3E]/5 px-3 py-1.5 text-xs font-medium text-[#0F3D3E] transition hover:bg-[#0F3D3E]/10"
                  >
                    <RotateCcw size={13} />
                    Réinitialiser
                  </button>
                )}
              </div>
            </div>

            <div className="space-y-5 p-5">
              <div className="relative group">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                  <Search
                    size={18}
                    className="text-[#5C5A54] transition group-focus-within:text-[#0F3D3E]"
                  />
                </div>

                <input
                  type="text"
                  value={searchTerm}
                  onChange={handleSearchChange}
                  placeholder="Rechercher par titre ou description..."
                  className="w-full rounded-xl border border-[#E4DFD3] bg-[#FBF9F4] py-3.5 pl-12 pr-12 text-sm text-[#3C3A34] placeholder:text-[#9A9790] shadow-sm outline-none transition focus:border-[#0F3D3E] focus:bg-white focus:ring-2 focus:ring-[#0F3D3E]/15"
                />

                {searchTerm && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchTerm("");
                      setPageActuelle(1);
                    }}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 rounded-full p-1 text-[#5C5A54] transition hover:bg-[#0F3D3E]/10 hover:text-[#0F3D3E]"
                    aria-label="Effacer la recherche"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>

              <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div className="flex flex-wrap gap-4">
                  <div className="min-w-[160px] flex-1 sm:flex-none">
                    <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-[#5C5A54]">
                      <Globe size={12} />
                      Langue
                    </label>

                    <select
                      value={filtreLangue}
                      onChange={handleLangueChange}
                      className="w-full appearance-none rounded-xl border border-[#E4DFD3] bg-[#FBF9F4] px-4 py-2.5 text-sm text-[#3C3A34] shadow-sm outline-none transition focus:border-[#0F3D3E] focus:bg-white focus:ring-2 focus:ring-[#0F3D3E]/15"
                    >
                      <option value="">Toutes les langues</option>

                      {LANGUES.map((langue) => (
                        <option key={langue} value={langue}>
                          {langue}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="min-w-[160px] flex-1 sm:flex-none">
                    <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-[#5C5A54]">
                      <BookOpen size={12} />
                      Niveau
                    </label>

                    <select
                      value={filtreNiveau}
                      onChange={handleNiveauChange}
                      className="w-full appearance-none rounded-xl border border-[#E4DFD3] bg-[#FBF9F4] px-4 py-2.5 text-sm text-[#3C3A34] shadow-sm outline-none transition focus:border-[#0F3D3E] focus:bg-white focus:ring-2 focus:ring-[#0F3D3E]/15"
                    >
                      <option value="">Tous les niveaux</option>

                      {NIVEAUX.map((niveau) => (
                        <option key={niveau} value={niveau}>
                          {niveau}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold ${
                      hasActiveFilters
                        ? "bg-[#0F3D3E] text-[#F4C95D]"
                        : "bg-[#0F3D3E]/10 text-[#0F3D3E]"
                    }`}
                  >
                    {coursFiltres.length} cours
                    {hasActiveFilters ? " trouvé(s)" : ""}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20 text-[#5C5A54]">
            <Loader2 className="mb-3 h-8 w-8 animate-spin text-[#0F3D3E]" />
            <p>Chargement des cours...</p>
          </div>
        )}

        {/* Erreur */}
        {error && (
          <div className="mb-6 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-800">
            <AlertCircle size={20} />
            {error}
          </div>
        )}

        {/* Aucun cours */}
        {!loading && !error && cours.length === 0 && (
          <div className="rounded-2xl border border-dashed border-[#E4DFD3] bg-white p-12 text-center shadow-sm">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#0F3D3E]/5 text-[#0F3D3E]">
              <BookOpen size={28} />
            </div>

            <h2 className="text-lg font-semibold text-[#0F3D3E]">
              {vue === "mes"
                ? "Aucun cours pour le moment"
                : vue === "favoris"
                ? "Aucun cours favori"
                : "Aucun cours public disponible"}
            </h2>

            <p className="mt-2 text-sm text-[#5C5A54]">
              {vue === "mes"
                ? "Commencez par publier votre premier cours. Il sera visible sur la plateforme après validation par un administrateur."
                : vue === "favoris"
                ? "Cliquez sur le cœur d'un cours dans l'onglet « Cours Confrères » pour l'ajouter ici."
                : "Il n'y a pas encore de cours approuvés publiés par d'autres médecins."}
            </p>

            {vue === "mes" && (
              <Link
                to="/dashboard/medecin/cours/ajouter"
                className="mt-6 inline-flex items-center gap-2 rounded-xl border border-[#E4DFD3] bg-white px-5 py-2.5 text-sm font-semibold text-[#0F3D3E] transition hover:bg-[#FBF9F4]"
              >
                <Plus size={16} />
                Créer mon premier cours
              </Link>
            )}
          </div>
        )}

        {/* Aucun résultat de filtre ou favoris vide */}
        {!loading &&
          !error &&
          cours.length > 0 &&
          coursFiltres.length === 0 && (
            <div className="rounded-2xl border border-dashed border-[#E4DFD3] bg-white p-10 text-center shadow-sm">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[#0F3D3E]/5 text-[#0F3D3E]">
                {vue === "favoris" && !hasActiveFilters ? (
                  <Heart size={22} />
                ) : (
                  <Search size={22} />
                )}
              </div>

              <p className="text-sm font-medium text-[#3C3A34]">
                {vue === "favoris" && !hasActiveFilters
                  ? "Vous n'avez pas encore ajouté de cours de vos confrères en favoris."
                  : "Aucun cours ne correspond à votre recherche ou aux filtres sélectionnés."}
              </p>

              {hasActiveFilters ? (
                <button
                  type="button"
                  onClick={resetFiltres}
                  className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-[#0F3D3E] underline-offset-2 hover:underline"
                >
                  <RotateCcw size={14} />
                  Réinitialiser la recherche et les filtres
                </button>
              ) : (
                vue === "favoris" && (
                  <button
                    type="button"
                    onClick={() => handleVueChange("tous")}
                    className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-[#0F3D3E] underline-offset-2 hover:underline"
                  >
                    Parcourir tous les cours
                  </button>
                )
              )}
            </div>
          )}

        {/* Liste des cours */}
        {!loading && !error && coursFiltres.length > 0 && (
          <>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {coursAffiches.map((c) => {
                const contenuUrl = getContenuUrl(c.contenuCours);
                const auteurNom = c.medecin
                  ? `${c.medecin.prenom || ""} ${c.medecin.nom || ""}`.trim()
                  : "";

                return (
                  <article
                    key={c.id}
                    className="flex flex-col rounded-2xl border border-[#E4DFD3] bg-white p-5 shadow-sm transition hover:shadow-md"
                  >
                    <div className="mb-3 flex items-start justify-between gap-2">
                      <h3 className="font-serif text-lg font-semibold leading-snug text-[#0F3D3E]">
                        {c.titre}
                      </h3>

                      <div className="flex shrink-0 items-center gap-1.5">
                        <div className="flex flex-col items-end gap-1">
                          <span className="rounded-full bg-[#0F3D3E]/10 px-2.5 py-0.5 text-xs font-medium text-[#0F3D3E]">
                            {c.niveauCours}
                          </span>

                          {vue === "mes" && <StatutBadge statut={c.statut} />}
                        </div>

                        {vue !== "mes" && !c.estProprietaire && (
                          <button
                            type="button"
                            onClick={() => handleToggleFavori(c.id)}
                            disabled={togglingFavoriId === c.id}
                            title={
                              c.isFavori
                                ? "Retirer des favoris"
                                : "Ajouter aux favoris"
                            }
                            className="rounded-full p-1.5 text-[#5C5A54] transition hover:bg-red-50 hover:text-red-500 disabled:opacity-50"
                          >
                            <Heart
                              size={18}
                              className={
                                c.isFavori
                                  ? "fill-red-500 text-red-500"
                                  : "text-[#5C5A54]"
                              }
                            />
                          </button>
                        )}
                      </div>
                    </div>

                    <p className="mb-4 line-clamp-2 flex-1 text-sm text-[#5C5A54]">
                      {c.description}
                    </p>

                    <div className="space-y-2 border-t border-[#E4DFD3] pt-4 text-xs text-[#737873]">
                      {vue !== "mes" && (
                        <div className="flex items-center gap-2 font-medium text-[#0F3D3E]">
                          <User size={14} />
                          <span>
                            {c.estProprietaire
                              ? "Mon cours"
                              : auteurNom
                              ? `Dr. ${auteurNom}`
                              : "Confrère"}
                          </span>
                        </div>
                      )}

                      <div className="flex items-center gap-2">
                        <Clock size={14} />
                        <span>{c.duree} min</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Globe size={14} />
                        <span>{c.langueCours}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Calendar size={14} />
                        <span>
                          {c.dateCreation
                            ? new Date(c.dateCreation).toLocaleDateString(
                                "fr-FR",
                                {
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric",
                                }
                              )
                            : "—"}
                        </span>
                      </div>
                    </div>

                    {contenuUrl && (
                      <a
                        href={contenuUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-4 flex items-center justify-between gap-2 rounded-xl border border-[#E4DFD3] bg-[#FBF9F4] px-3 py-2.5 text-xs font-semibold text-[#0F3D3E] transition hover:border-[#0F3D3E]/40 hover:bg-[#0F3D3E]/5"
                      >
                        <span className="flex min-w-0 items-center gap-2">
                          <ContenuIcon type={c.typeContenu} />

                          <span className="truncate">
                            {contenuLabel(c.typeContenu)}
                            {c.nomOriginalFichier
                              ? ` — ${c.nomOriginalFichier}`
                              : ""}
                          </span>
                        </span>

                        <ExternalLink size={14} className="shrink-0" />
                      </a>
                    )}

                    {vue === "mes" && c.statut !== "approuve" && (
                      <div className="mt-3 flex gap-2">
                        <button
                          type="button"
                          onClick={() => setCoursAModifier(c)}
                          className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-[#E4DFD3] px-3 py-2 text-xs font-semibold text-[#0F3D3E] transition hover:bg-[#0F3D3E]/5"
                        >
                          <Pencil size={14} />
                          Modifier
                        </button>

                        <button
                          type="button"
                          onClick={() => setCoursASupprimer(c)}
                          className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-red-200 px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-50"
                        >
                          <Trash2 size={14} />
                          Supprimer
                        </button>
                      </div>
                    )}
                  </article>
                );
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8 flex flex-col items-center justify-center gap-4">
                <div className="text-sm text-[#5C5A54]">
                  Page{" "}
                  <span className="font-semibold text-[#0F3D3E]">
                    {pageSecurisee}
                  </span>{" "}
                  sur{" "}
                  <span className="font-semibold text-[#0F3D3E]">
                    {totalPages}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={allerPagePrecedente}
                    disabled={pageSecurisee === 1}
                    className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-[#E4DFD3] bg-white px-3 text-sm font-semibold text-[#0F3D3E] shadow-sm transition hover:bg-[#FBF9F4] disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <ChevronLeft size={17} />
                    Précédent
                  </button>

                  <div className="flex items-center gap-1">
                    {Array.from(
                      { length: totalPages },
                      (_, index) => index + 1
                    ).map((page) => (
                      <button
                        key={page}
                        type="button"
                        onClick={() => allerPage(page)}
                        className={`flex h-10 min-w-10 items-center justify-center rounded-xl px-3 text-sm font-semibold transition ${
                          pageSecurisee === page
                            ? "bg-[#0F3D3E] text-[#F4C95D] shadow-sm"
                            : "border border-[#E4DFD3] bg-white text-[#0F3D3E] hover:bg-[#FBF9F4]"
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={allerPageSuivante}
                    disabled={pageSecurisee === totalPages}
                    className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-[#E4DFD3] bg-white px-3 text-sm font-semibold text-[#0F3D3E] shadow-sm transition hover:bg-[#FBF9F4] disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Suivant
                    <ChevronRight size={17} />
                  </button>
                </div>

                <p className="text-xs text-[#737873]">
                  {coursFiltres.length} cours au total — 4 cours maximum par
                  page
                </p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modales */}
      {coursAModifier && (
        <ModifierCoursModal
          cours={coursAModifier}
          onClose={() => setCoursAModifier(null)}
          onSaved={handleCoursModifie}
        />
      )}

      {coursASupprimer && (
        <SupprimerCoursModal
          cours={coursASupprimer}
          onClose={() => setCoursASupprimer(null)}
          onDeleted={handleCoursSupprime}
        />
      )}
    </div>
  );
}