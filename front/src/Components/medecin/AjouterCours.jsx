import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BookPlus,
  ArrowLeft,
  CheckCircle2,
  UploadCloud,
  FileText,
  Film,
  X,
  Sparkles,
  Loader2,
} from "lucide-react";

const NIVEAUX = ["Débutant", "Intermédiaire", "Avancé"];
const LANGUES = ["Français", "Arabe", "Anglais"];

const ACCEPTED_EXTENSIONS = [
  ".pdf",
  ".doc",
  ".docx",
  ".mp4",
  ".mov",
  ".avi",
  ".mkv",
  ".webm",
];

const ACCEPTED_MIME_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "video/mp4",
  "video/quicktime",
  "video/x-msvideo",
  "video/x-matroska",
  "video/webm",
];

const MAX_FILE_SIZE_MB = 200;

function getFileKind(file) {
  if (!file) return null;
  if (file.type === "application/pdf") return "pdf";
  if (
    file.type === "application/msword" ||
    file.type ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  )
    return "word";
  if (file.type.startsWith("video/")) return "video";
  return "autre";
}

function FileKindIcon({ kind }) {
  if (kind === "video") return <Film size={18} className="text-[#0F3D3E]" />;
  return <FileText size={18} className="text-[#0F3D3E]" />;
}

export default function AjouterCours() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    titre: "",
    description: "",
    duree: "",
    langueCours: "",
    niveauCours: "",
  });

  const [contenuFichier, setContenuFichier] = useState(null);
  const [fileError, setFileError] = useState(null);

  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    setFileError(null);

    if (!file) {
      setContenuFichier(null);
      return;
    }

    const isTypeOk =
      ACCEPTED_MIME_TYPES.includes(file.type) ||
      ACCEPTED_EXTENSIONS.some((ext) =>
        file.name.toLowerCase().endsWith(ext)
      );

    if (!isTypeOk) {
      setFileError(
        "Format non supporté. Utilisez un PDF, un document Word (.doc/.docx) ou une vidéo (.mp4, .mov, .avi, .mkv, .webm)."
      );
      setContenuFichier(null);
      e.target.value = "";
      return;
    }

    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      setFileError(`Le fichier dépasse la taille maximale de ${MAX_FILE_SIZE_MB} Mo.`);
      setContenuFichier(null);
      e.target.value = "";
      return;
    }

    setContenuFichier(file);
  };

  const removeFile = () => {
    setContenuFichier(null);
    setFileError(null);
  };

  const handleGenerateDescription = async () => {
    if (!form.titre.trim()) {
      setError("Veuillez d’abord saisir le titre du cours.");
      return;
    }

    if (!form.langueCours) {
      setError("Veuillez sélectionner la langue du cours avant de générer la description.");
      return;
    }

    setError(null);
    setGenerating(true);

    try {
      const res = await fetch("/api/cours/generer-description", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          titre: form.titre,
          langueCours: form.langueCours,
          niveauCours: form.niveauCours || undefined,
          duree: form.duree || undefined,
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
        throw new Error(data.error || "Impossible de générer la description.");
      }

      setForm((prev) => ({
        ...prev,
        description: data.description || "",
      }));
    } catch (err) {
      setError(err.message);
    } finally {
      setGenerating(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!contenuFichier) {
      setError("Veuillez joindre le contenu du cours (PDF, Word ou vidéo).");
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("titre", form.titre);
      formData.append("description", form.description);
      formData.append("duree", form.duree);
      formData.append("langueCours", form.langueCours);
      formData.append("niveauCours", form.niveauCours);
      formData.append("contenuFichier", contenuFichier);

      const res = await fetch("/api/cours", {
        method: "POST",
        credentials: "include",
        body: formData,
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
        throw new Error(data.error || "Une erreur est survenue.");
      }

      setSuccess(true);
      setForm({
        titre: "",
        description: "",
        duree: "",
        langueCours: "",
        niveauCours: "",
      });
      setContenuFichier(null);

      setTimeout(() => navigate("/dashboard/medecin/cours"), 1500);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fileKind = getFileKind(contenuFichier);
  const canGenerate = form.titre.trim() !== "" && form.langueCours !== "";

  return (
    <div className="min-h-screen bg-[#FBF9F4] p-8">
      <div className="mx-auto max-w-2xl">
        <button
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center gap-2 text-sm font-medium text-[#3C3A34] hover:text-[#0F3D3E]"
        >
          <ArrowLeft size={16} />
          Retour
        </button>

        <div className="rounded-2xl border border-[#E4DFD3] bg-white p-8 shadow-sm">
          <div className="mb-6 flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#0F3D3E] text-[#E8C77E]">
              <BookPlus size={22} />
            </span>
            <div>
              <h1 className="font-serif text-2xl font-bold text-[#0F3D3E]">
                Ajouter un cours
              </h1>
              <p className="text-sm text-[#5C5A54]">
                Partagez vos connaissances avec vos patients et confrères
              </p>
            </div>
          </div>

          {success && (
            <div className="mb-6 flex items-center gap-2 rounded-xl border border-emerald-300 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">
              <CheckCircle2 size={18} />
              Cours ajouté avec succès. Il sera visible après validation par un administrateur. Redirection...
            </div>
          )}

          {error && (
            <div className="mb-6 rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm font-medium text-red-800">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Titre */}
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
                placeholder="Ex : Introduction à la cardiologie"
                className="w-full rounded-xl border border-[#E4DFD3] px-4 py-2.5 text-sm outline-none focus:border-[#0F3D3E]"
              />
            </div>

            {/* Langue (placée avant la description pour forcer le choix) */}
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
                <option value="">Choisir la langue...</option>
                {LANGUES.map((l) => (
                  <option key={l} value={l}>
                    {l}
                  </option>
                ))}
              </select>
            </div>

            {/* Description + bouton IA */}
            <div>
              <div className="mb-1.5 flex items-center justify-between gap-3">
                <label className="block text-sm font-medium text-[#3C3A34]">
                  Description
                </label>

                <button
                  type="button"
                  onClick={handleGenerateDescription}
                  disabled={generating || !canGenerate}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-[#0F3D3E]/20 bg-[#0F3D3E]/5 px-3 py-1.5 text-xs font-semibold text-[#0F3D3E] transition hover:bg-[#0F3D3E]/10 disabled:cursor-not-allowed disabled:opacity-50"
                  title={
                    !form.titre.trim()
                      ? "Saisissez d’abord un titre"
                      : !form.langueCours
                      ? "Sélectionnez d’abord la langue"
                      : "Générer une description avec l’IA"
                  }
                >
                  {generating ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      Génération...
                    </>
                  ) : (
                    <>
                      <Sparkles size={14} />
                      Générer avec l’IA
                    </>
                  )}
                </button>
              </div>

              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                required
                rows={4}
                placeholder="Résumé du cours... ou cliquez sur « Générer avec l’IA »"
                className="w-full rounded-xl border border-[#E4DFD3] px-4 py-2.5 text-sm outline-none focus:border-[#0F3D3E]"
              />
              <p className="mt-1.5 text-xs text-[#5C5A54]">
                Astuce : renseignez le <strong>titre</strong> et la <strong>langue</strong>, puis cliquez sur le bouton IA.
              </p>
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
                  placeholder="45"
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

            {/* Upload */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-[#3C3A34]">
                Contenu du cours (PDF, Word ou vidéo)
              </label>

              {!contenuFichier ? (
                <label
                  htmlFor="contenuFichier"
                  className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-[#E4DFD3] bg-[#FBF9F4] px-4 py-8 text-center transition hover:border-[#0F3D3E]/40"
                >
                  <UploadCloud size={26} className="text-[#0F3D3E]" />
                  <p className="text-sm font-medium text-[#3C3A34]">
                    Cliquez pour importer un fichier
                  </p>
                  <p className="text-xs text-[#5C5A54]">
                    PDF, DOC, DOCX, MP4, MOV, AVI, MKV, WEBM — max {MAX_FILE_SIZE_MB} Mo
                  </p>
                  <input
                    id="contenuFichier"
                    name="contenuFichier"
                    type="file"
                    accept={ACCEPTED_EXTENSIONS.join(",")}
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              ) : (
                <div className="flex items-center justify-between gap-3 rounded-xl border border-[#E4DFD3] bg-[#FBF9F4] px-4 py-3">
                  <div className="flex min-w-0 items-center gap-2">
                    <FileKindIcon kind={fileKind} />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-[#3C3A34]">
                        {contenuFichier.name}
                      </p>
                      <p className="text-xs text-[#5C5A54]">
                        {(contenuFichier.size / (1024 * 1024)).toFixed(1)} Mo
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={removeFile}
                    className="shrink-0 text-[#5C5A54] hover:text-red-600"
                    aria-label="Retirer le fichier"
                  >
                    <X size={18} />
                  </button>
                </div>
              )}

              {fileError && (
                <p className="mt-2 text-xs font-medium text-red-600">
                  {fileError}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || generating}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#0F3D3E] px-5 py-3 text-sm font-semibold text-[#F4C95D] shadow-md transition hover:bg-[#082829] disabled:opacity-60"
            >
              {loading ? "Ajout en cours..." : "Publier le cours"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}