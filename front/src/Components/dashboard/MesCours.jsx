import { useEffect, useState } from "react";
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
} from "lucide-react";

// Base du serveur Symfony qui héberge les fichiers uploadés (public/uploads/...).
// Laisser vide "" si le proxy Vite redirige /uploads vers le backend.
const FILES_BASE_URL = "";

const NIVEAUX = ["Débutant", "Intermédiaire", "Avancé"];
const LANGUES = ["Français", "Arabe", "Anglais"];

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

/* ------------------------------------------------------------------ */
/* Modale de modification d'un cours                                   */
/* ------------------------------------------------------------------ */
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
        headers: { "Content-Type": "application/json" },
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
                {NIVEAUX.map((n) => (
                  <option key={n} value={n}>
                    {n}
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
              {LANGUES.map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </select>
          </div>

          <p className="text-xs text-[#5C5A54]">
            Le fichier de contenu (PDF, Word ou vidéo) ne peut pas être remplacé
            depuis cette fenêtre. Supprimez le cours et recréez-le si besoin
            d'en changer.
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

/* ------------------------------------------------------------------ */
/* Modale de confirmation de suppression                               */
/* ------------------------------------------------------------------ */
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
          <span className="font-semibold text-[#3C3A34]">« {cours.titre} »</span>{" "}
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

/* ------------------------------------------------------------------ */
/* Page principale                                                     */
/* ------------------------------------------------------------------ */
export default function MesCours() {
  const [cours, setCours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [coursAModifier, setCoursAModifier] = useState(null);
  const [coursASupprimer, setCoursASupprimer] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  useEffect(() => {
    const fetchCours = async () => {
      try {
        const res = await fetch("/api/cours/mes-cours", {
          credentials: "include",
        });

        const text = await res.text(); // Lecture de la réponse brute (texte)

        let data;
        try {
          data = JSON.parse(text);
        } catch {
          // Si la réponse n'est pas du JSON (ex: page d'erreur HTML 404/500)
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

        setCours(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCours();
  }, []);

  // Petite notification auto-effacée après une action réussie
  useEffect(() => {
    if (!successMessage) return;
    const timer = setTimeout(() => setSuccessMessage(null), 3000);
    return () => clearTimeout(timer);
  }, [successMessage]);

  const handleCoursModifie = (coursMisAJour) => {
    setCours((prev) =>
      prev.map((c) => (c.id === coursMisAJour.id ? { ...c, ...coursMisAJour } : c))
    );
    setCoursAModifier(null);
    setSuccessMessage("Cours modifié avec succès.");
  };

  const handleCoursSupprime = (id) => {
    setCours((prev) => prev.filter((c) => c.id !== id));
    setCoursASupprimer(null);
    setSuccessMessage("Cours supprimé avec succès.");
  };

  return (
    <div className="min-h-screen bg-[#FBF9F4] p-6 sm:p-8">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-serif text-3xl font-bold text-[#0F3D3E]">
              Mes cours
            </h1>
            <p className="mt-1 text-sm text-[#5C5A54]">
              Gérez et publiez vos cours médicaux
            </p>
          </div>
     
        </div>

        {/* Notification succès */}
        {successMessage && (
          <div className="mb-6 flex items-center gap-3 rounded-xl border border-emerald-300 bg-emerald-50 px-5 py-3 text-sm font-medium text-emerald-800">
            <CheckCircle2 size={18} />
            {successMessage}
          </div>
        )}

        {/* États */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20 text-[#5C5A54]">
            <Loader2 className="mb-3 h-8 w-8 animate-spin text-[#0F3D3E]" />
            <p>Chargement de vos cours...</p>
          </div>
        )}

        {error && (
          <div className="mb-6 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-800">
            <AlertCircle size={20} />
            {error}
          </div>
        )}

        {!loading && !error && cours.length === 0 && (
          <div className="rounded-2xl border border-dashed border-[#E4DFD3] bg-white p-12 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#0F3D3E]/5 text-[#0F3D3E]">
              <BookOpen size={28} />
            </div>
            <h2 className="text-lg font-semibold text-[#0F3D3E]">
              Aucun cours pour le moment
            </h2>
            <p className="mt-2 text-sm text-[#5C5A54]">
              Commencez par publier votre premier cours pour le partager avec
              vos étudiants et confrères.
            </p>
            <Link
              to="/dashboard/medecin/cours/ajouter"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#0F3D3E] px-5 py-2.5 text-sm font-semibold text-[#F4C95D] transition hover:bg-[#082829]"
            >
              <Plus size={16} />
              Créer mon premier cours
            </Link>
          </div>
        )}

        {/* Liste des cours */}
        {!loading && !error && cours.length > 0 && (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {cours.map((c) => {
              const contenuUrl = getContenuUrl(c.contenuCours);

              return (
                <article
                  key={c.id}
                  className="flex flex-col rounded-2xl border border-[#E4DFD3] bg-white p-5 shadow-sm transition hover:shadow-md"
                >
                  <div className="mb-3 flex items-start justify-between gap-2">
                    <h3 className="font-serif text-lg font-semibold leading-snug text-[#0F3D3E]">
                      {c.titre}
                    </h3>
                    <span className="shrink-0 rounded-full bg-[#0F3D3E]/10 px-2.5 py-0.5 text-xs font-medium text-[#0F3D3E]">
                      {c.niveauCours}
                    </span>
                  </div>

                  <p className="mb-4 line-clamp-2 flex-1 text-sm text-[#5C5A54]">
                    {c.description}
                  </p>

                  <div className="space-y-2 border-t border-[#E4DFD3] pt-4 text-xs text-[#737873]">
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

                  {/* Lien vers le contenu du cours (PDF, Word ou vidéo) */}
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
                          {c.nomOriginalFichier ? ` — ${c.nomOriginalFichier}` : ""}
                        </span>
                      </span>
                      <ExternalLink size={14} className="shrink-0" />
                    </a>
                  )}

                  {/* Actions : modifier / supprimer */}
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
                </article>
              );
            })}
          </div>
        )}
      </div>

      {/* Modale de modification */}
      {coursAModifier && (
        <ModifierCoursModal
          cours={coursAModifier}
          onClose={() => setCoursAModifier(null)}
          onSaved={handleCoursModifie}
        />
      )}

      {/* Modale de suppression */}
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