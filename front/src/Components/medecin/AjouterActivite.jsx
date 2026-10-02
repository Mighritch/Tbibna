import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Save, AlertCircle } from "lucide-react";

export default function AjouterActivite() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [form, setForm] = useState({
    titre: "",
    description: "",
    instructions: "",
    difficulte: "",
    duree: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/medecin/activites", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          ...form,
          duree: parseInt(form.duree, 10),
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "Erreur lors de la création");
      }

      navigate("/dashboard/medecin/activites");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FBF9F4] p-6 sm:p-8">
      <div className="mx-auto max-w-2xl">

        {/* Header */}
        <div className="mb-8">
          <Link
            to="/dashboard/medecin/activites"
            className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-[#0F3D3E] hover:text-[#2A6B59]"
          >
            <ArrowLeft size={16} />
            Retour aux activités
          </Link>

          <h1 className="font-serif text-3xl font-bold text-[#0F3D3E]">
            Ajouter une activité
          </h1>

          <p className="mt-1 text-[#5C5A54]">
            Créez une nouvelle activité pour vos étudiants.
          </p>
        </div>

        {/* Formulaire */}
        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-[#E4DFD3] bg-white p-6 shadow-sm sm:p-8"
        >
          {/* Erreur */}
          {error && (
            <div className="mb-6 flex items-center gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
              <AlertCircle size={18} />
              {error}
            </div>
          )}

          <div className="space-y-5">

            {/* Titre */}
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
                placeholder="Ex : Exercice de respiration contrôlée"
                className="w-full rounded-xl border border-[#E4DFD3] bg-[#FAF8F5] px-4 py-3 text-sm text-black outline-none transition focus:border-[#0F3D3E] focus:ring-2 focus:ring-[#0F3D3E]/10"
              />
            </div>

            {/* Description */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-[#0F3D3E]">
                Description *
              </label>

              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                required
                rows={4}
                placeholder="Décrivez brièvement l'activité..."
                className="w-full rounded-xl border border-[#E4DFD3] bg-[#FAF8F5] px-4 py-3 text-sm text-black outline-none transition focus:border-[#0F3D3E] focus:ring-2 focus:ring-[#0F3D3E]/10"
              />
            </div>

            {/* Instructions */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-[#0F3D3E]">
                Instructions *
              </label>

              <textarea
                name="instructions"
                value={form.instructions}
                onChange={handleChange}
                required
                rows={6}
                placeholder="Détaillez les étapes à suivre pour réaliser l'activité..."
                className="w-full rounded-xl border border-[#E4DFD3] bg-[#FAF8F5] px-4 py-3 text-sm text-black outline-none transition focus:border-[#0F3D3E] focus:ring-2 focus:ring-[#0F3D3E]/10"
              />
            </div>

            {/* Difficulté + Durée */}
            <div className="grid gap-5 sm:grid-cols-2">

              {/* Difficulté */}
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

              {/* Durée */}
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
                  placeholder="30"
                  className="w-full rounded-xl border border-[#E4DFD3] bg-[#FAF8F5] px-4 py-3 text-sm text-black outline-none transition focus:border-[#0F3D3E] focus:ring-2 focus:ring-[#0F3D3E]/10"
                />
              </div>
            </div>
          </div>

          {/* Boutons */}
          <div className="mt-8 flex flex-wrap items-center justify-end gap-3">

            {/* Annuler */}
            <Link
              to="/dashboard/medecin/activites"
              className="rounded-xl border border-[#E4DFD3] bg-white px-5 py-2.5 text-sm font-medium text-[#0F3D3E] transition hover:bg-[#FAF8F5]"
            >
              Annuler
            </Link>

            {/* Enregistrer */}
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-xl bg-[#0F3D3E] px-6 py-2.5 text-sm font-semibold text-black shadow-md transition hover:bg-[#082829] disabled:opacity-60"
            >
              {loading ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-black border-t-transparent" />
                  <span className="text-black">
                    Enregistrement...
                  </span>
                </>
              ) : (
                <>
                  <Save size={16} className="text-black" />
                  <span className="text-black">
                    Enregistrer l’activité
                  </span>
                </>
              )}
            </button>

          </div>
        </form>
      </div>
    </div>
  );
}

