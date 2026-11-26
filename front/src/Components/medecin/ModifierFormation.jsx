import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Save, Loader2 } from "lucide-react";

const API = "http://localhost:8000/api/formations";

const inputClass =
  "w-full rounded-xl border border-[#E6E1D5] bg-[#FAF8F5] px-4 py-3 text-sm focus:border-[#0F3D3E] focus:outline-none focus:ring-2 focus:ring-[#0F3D3E]/10";

const labelClass = "block text-sm font-medium text-[#0F3D3E] mb-1.5";

export default function ModifierFormation() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [loadFailed, setLoadFailed] = useState(false);

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

  // Chargement de la formation existante
  useEffect(() => {
    let cancelled = false;

    fetch(`${API}/${id}`, {
      credentials: "include",
      headers: { Accept: "application/json" },
    })
      .then((res) => {
        if (res.status === 404) throw new Error("Formation introuvable.");
        if (!res.ok) throw new Error("Erreur lors du chargement de la formation.");
        return res.json();
      })
      .then((f) => {
        if (cancelled) return;
        setForm({
          titre: f.titre ?? "",
          description: f.description ?? "",
          duree: f.duree ?? "",
          dateDebut: f.dateDebut ?? "",
          dateFin: f.dateFin ?? "",
          prix: f.gratuit ? "" : f.prix ?? "",
          gratuit: !!f.gratuit,
          objectifs: f.objectifs ?? "",
        });
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err.message);
          setLoadFailed(true);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

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
    setSaving(true);
    setError(null);

    try {
      const response = await fetch(`${API}/${id}`, {
        method: "PUT",
        credentials: "include",
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
        let message = "Erreur lors de la modification";

        if (response.status === 401) {
          message = "Non connecté. Veuillez vous reconnecter.";
        } else if (response.status === 403) {
          message = "Vous ne pouvez pas modifier cette formation.";
        } else if (response.status === 404) {
          message = "Formation introuvable.";
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

      // Succès → retour à la page de détails
      navigate(`/dashboard/medecin/formations/${id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center text-[#737873]">
        Chargement...
      </div>
    );
  }

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
              Modifier la formation
            </h1>
            <p className="text-sm text-[#737873]">
              Après modification, la formation sera de nouveau soumise à validation
            </p>
          </div>
        </div>

        {loadFailed ? (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : (
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
                disabled={saving}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0F3D3E] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-[#0F3D3E]/20 transition hover:bg-[#082829] disabled:opacity-60"
              >
                {saving ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Enregistrement...
                  </>
                ) : (
                  <>
                    <Save size={18} />
                    Enregistrer les modifications
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}