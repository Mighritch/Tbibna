import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { BookPlus, ArrowLeft, CheckCircle2 } from "lucide-react";

const NIVEAUX = ["Débutant", "Intermédiaire", "Avancé"];
const LANGUES = ["Français", "Arabe", "Anglais"];

export default function AjouterCours() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    titre: "",
    description: "",
    duree: "",
    langueCours: "",
    contenuCours: "",
    niveauCours: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/cours", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          duree: Number(form.duree),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Une erreur est survenue.");
      }

      setSuccess(true);
      setForm({
        titre: "",
        description: "",
        duree: "",
        langueCours: "",
        contenuCours: "",
        niveauCours: "",
      });

      setTimeout(() => navigate("/medecin/dashboard"), 1500);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

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
              Cours ajouté avec succès. Redirection...
            </div>
          )}

          {error && (
            <div className="mb-6 rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm font-medium text-red-800">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
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
                placeholder="Résumé du cours..."
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
                    <option key={n} value={n}>{n}</option>
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
                  <option key={l} value={l}>{l}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-[#3C3A34]">
                Contenu du cours
              </label>
              <textarea
                name="contenuCours"
                value={form.contenuCours}
                onChange={handleChange}
                required
                rows={6}
                placeholder="Rédigez le contenu complet du cours ici..."
                className="w-full rounded-xl border border-[#E4DFD3] px-4 py-2.5 text-sm outline-none focus:border-[#0F3D3E]"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full justify-center disabled:opacity-60"
            >
              {loading ? "Ajout en cours..." : "Publier le cours"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}