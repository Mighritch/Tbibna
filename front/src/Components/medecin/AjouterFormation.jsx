import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Save, Loader2 } from "lucide-react";

const inputClass =
  "w-full rounded-xl border border-[#E6E1D5] bg-[#FAF8F5] px-4 py-3 text-sm focus:border-[#0F3D3E] focus:outline-none focus:ring-2 focus:ring-[#0F3D3E]/10";

const labelClass = "block text-sm font-medium text-[#0F3D3E] mb-1.5";

export default function AjouterFormation() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [form, setForm] = useState({
    titre: "",
    description: "",
    duree: "",
    dateDebut: "",
    dateFin: "",
    prix: "",
    gratuit: false,
    objectifs: "",
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
      // si gratuit est coché, on remet le prix à vide
      ...(name === "gratuit" && checked ? { prix: "" } : {}),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("http://localhost:8000/api/formations", {
        method: "POST",
        credentials: "include", // envoie le cookie de session
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          ...form,
          duree: Number(form.duree),
          prix: form.gratuit ? 0 : Number(form.prix || 0),
        }),
      });

      if (!response.ok) {
        let message = "Erreur lors de la création";

        if (response.status === 401) {
          message = "Non connecté. Veuillez vous reconnecter.";
        } else if (response.status === 403) {
          message = "Accès réservé aux médecins.";
        } else {
          try {
            const err = await response.json();
            message = err.error || err.message || message;
          } catch {
            // réponse non JSON, on garde le message par défaut
          }
        }

        throw new Error(message);
      }

      // Succès → redirection
      navigate("/dashboard/medecin/formations");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] py-10">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex items-center gap-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#E6E1D5] bg-white text-[#0F3D3E] transition hover:bg-[#F3EFE6]"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="font-serif text-2xl font-semibold text-[#0F3D3E]">
              Ajouter une formation
            </h1>
            <p className="text-sm text-[#737873]">
              Créez une nouvelle formation pour les étudiants
            </p>
          </div>
        </div>

        {/* Formulaire */}
        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-[#E6E1D5] bg-white p-6 shadow-sm sm:p-8"
        >
          {error && (
            <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="space-y-6">
            {/* Titre */}
            <div>
              <label className={labelClass}>Titre de la formation *</label>
              <input
                type="text"
                name="titre"
                required
                value={form.titre}
                onChange={handleChange}
                className={inputClass}
                placeholder="Ex: Formation React Avancé"
              />
            </div>

            {/* Description */}
            <div>
              <label className={labelClass}>Description *</label>
              <textarea
                name="description"
                required
                rows={4}
                value={form.description}
                onChange={handleChange}
                className={inputClass}
                placeholder="Décrivez le contenu de la formation..."
              />
            </div>

            {/* Durée */}
            <div>
              <label className={labelClass}>Durée (heures) *</label>
              <input
                type="number"
                name="duree"
                required
                min="1"
                value={form.duree}
                onChange={handleChange}
                className={inputClass}
                placeholder="Ex: 40"
              />
            </div>

            {/* Dates */}
            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <label className={labelClass}>Date de début</label>
                <input
                  type="date"
                  name="dateDebut"
                  value={form.dateDebut}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>Date de fin</label>
                <input
                  type="date"
                  name="dateFin"
                  value={form.dateFin}
                  min={form.dateDebut || undefined}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>
            </div>

            {/* Prix + Gratuit */}
            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <label className={labelClass}>Prix (DT)</label>
                <input
                  type="number"
                  name="prix"
                  min="0"
                  step="0.01"
                  value={form.prix}
                  onChange={handleChange}
                  disabled={form.gratuit}
                  className={`${inputClass} disabled:opacity-50`}
                  placeholder="0.00"
                />
              </div>

              <div className="flex items-end">
                <label className="flex cursor-pointer select-none items-center gap-3">
                  <input
                    type="checkbox"
                    name="gratuit"
                    checked={form.gratuit}
                    onChange={handleChange}
                    className="h-5 w-5 rounded border-[#E6E1D5] text-[#0F3D3E] focus:ring-[#0F3D3E]"
                  />
                  <span className="text-sm font-medium text-[#0F3D3E]">
                    Formation gratuite
                  </span>
                </label>
              </div>
            </div>

            {/* Objectifs */}
            <div>
              <label className={labelClass}>Objectifs pédagogiques</label>
              <textarea
                name="objectifs"
                rows={3}
                value={form.objectifs}
                onChange={handleChange}
                className={inputClass}
                placeholder="Ce que l'étudiant saura faire à la fin de la formation..."
              />
            </div>
          </div>

          {/* Boutons */}
          <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="rounded-xl border border-[#E6E1D5] bg-white px-6 py-3 text-sm font-semibold text-[#0F3D3E] transition hover:bg-[#FAF8F5]"
            >
              Annuler
            </button>

            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0F3D3E] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-[#0F3D3E]/20 transition hover:bg-[#082829] disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Enregistrement...
                </>
              ) : (
                <>
                  <Save size={18} />
                  Publier la formation
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}