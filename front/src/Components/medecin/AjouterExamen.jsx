import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Save } from "lucide-react";
import { useAuth } from "../auth/AuthContext";

export default function AjouterExamen() {
  const navigate = useNavigate();
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    titre: "",
    instructions: "",
    duree: 60,
    pointsTotaux: 20,
    pointsDePassage: 10,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/examens", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          titre: form.titre,
          instructions: form.instructions,
          duree: Number(form.duree),
          pointsTotaux: Number(form.pointsTotaux),
          pointsDePassage: Number(form.pointsDePassage),
          // IMPORTANT : on n'envoie JAMAIS de statut
          // Le backend force toujours "brouillon"
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Erreur lors de la création");
      }

      navigate("/dashboard/medecin/examens");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <Link
        to="/dashboard/medecin/examens"
        className="inline-flex items-center gap-2 text-sm text-[#737873] hover:text-[#0F3D3E] mb-6"
      >
        <ArrowLeft size={16} />
        Retour aux examens
      </Link>

      <h1 className="font-serif text-3xl font-semibold text-[#0F3D3E] mb-2">
        Ajouter un examen
      </h1>
      <p className="text-sm text-[#737873] mb-8">
        Remplissez les informations de base. L’examen sera soumis à validation par un administrateur avant publication.
      </p>

      {error && (
        <div className="mb-6 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 bg-white rounded-2xl border border-[#E6E1D5] p-6 sm:p-8 shadow-sm">
        <div>
          <label className="block text-sm font-medium text-[#0F3D3E] mb-1.5">
            Titre de l’examen *
          </label>
          <input
            type="text"
            name="titre"
            required
            value={form.titre}
            onChange={handleChange}
            className="w-full rounded-xl border border-[#E6E1D5] px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F3D3E]/30"
            placeholder="Ex: Examen de Cardiologie - Module 1"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[#0F3D3E] mb-1.5">
            Instructions
          </label>
          <textarea
            name="instructions"
            rows={4}
            value={form.instructions}
            onChange={handleChange}
            className="w-full rounded-xl border border-[#E6E1D5] px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F3D3E]/30"
            placeholder="Instructions pour les étudiants..."
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-[#0F3D3E] mb-1.5">
              Durée (minutes) *
            </label>
            <input
              type="number"
              name="duree"
              required
              min={5}
              value={form.duree}
              onChange={handleChange}
              className="w-full rounded-xl border border-[#E6E1D5] px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F3D3E]/30"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#0F3D3E] mb-1.5">
              Points totaux
            </label>
            <input
              type="number"
              name="pointsTotaux"
              min={1}
              value={form.pointsTotaux}
              onChange={handleChange}
              className="w-full rounded-xl border border-[#E6E1D5] px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F3D3E]/30"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#0F3D3E] mb-1.5">
              Points de passage
            </label>
            <input
              type="number"
              name="pointsDePassage"
              min={0}
              value={form.pointsDePassage}
              onChange={handleChange}
              className="w-full rounded-xl border border-[#E6E1D5] px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F3D3E]/30"
            />
          </div>
        </div>

        <div className="rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-800">
          Après enregistrement, l’examen sera automatiquement en <strong>brouillon</strong> et devra être approuvé par un administrateur pour être publié sur la plateforme.
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Link
            to="/dashboard/medecin/examens"
            className="rounded-xl border border-[#E6E1D5] px-5 py-2.5 text-sm font-medium text-[#0F3D3E] hover:bg-[#FAF8F5]"
          >
            Annuler
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl bg-[#0F3D3E] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#082829] disabled:opacity-60"
          >
            <Save size={16} />
            {loading ? "Enregistrement..." : "Soumettre l’examen"}
          </button>
        </div>
      </form>
    </div>
  );
}