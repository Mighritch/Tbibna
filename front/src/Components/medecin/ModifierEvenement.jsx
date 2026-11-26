import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, CalendarCog } from "lucide-react";

const INITIAL = {
  titre: "",
  description: "",
  dateDebut: "",
  dateFin: "",
  localisation: "",
  nombreDeParticipant: "",
  prix: "0",
};

// Convertit une date ISO (ex: 2026-11-26T14:30:00+01:00) au format attendu par <input type="datetime-local">
function toDatetimeLocal(isoString) {
  if (!isoString) return "";
  const d = new Date(isoString);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}`;
}

function validate(f) {
  const e = {};
  if (!f.titre.trim()) e.titre = "Le titre est obligatoire.";
  if (!f.description.trim()) e.description = "La description est obligatoire.";
  if (!f.localisation.trim()) e.localisation = "La localisation est obligatoire.";
  if (!f.dateDebut) e.dateDebut = "La date de début est obligatoire.";
  if (!f.dateFin) e.dateFin = "La date de fin est obligatoire.";
  if (f.dateDebut && f.dateFin && new Date(f.dateFin) <= new Date(f.dateDebut)) {
    e.dateFin = "La date de fin doit être postérieure à la date de début.";
  }
  if (!Number.isInteger(Number(f.nombreDeParticipant)) || Number(f.nombreDeParticipant) < 1) {
    e.nombreDeParticipant = "Le nombre de participants doit être supérieur à 0.";
  }
  if (f.prix === "" || Number(f.prix) < 0 || Number.isNaN(Number(f.prix))) {
    e.prix = "Le prix ne peut pas être négatif.";
  }
  return e;
}

const inputClass =
  "w-full rounded-xl border border-[#E6E1D5] bg-white px-4 py-3 text-sm text-[#181919] outline-none transition focus:border-[#0F3D3E] focus:ring-2 focus:ring-[#0F3D3E]/10";

function Field({ label, error, children }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-semibold text-[#0F3D3E]">{label}</label>
      {children}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}

export default function ModifierEvenement() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState(INITIAL);
  const [errors, setErrors] = useState({});
  const [globalError, setGlobalError] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/evenements/${id}`, { credentials: "include" });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          throw new Error(data.message || "Évènement introuvable.");
        }
        if (!cancelled) {
          setForm({
            titre: data.titre ?? "",
            description: data.description ?? "",
            dateDebut: toDatetimeLocal(data.dateDebut),
            dateFin: toDatetimeLocal(data.dateFin),
            localisation: data.localisation ?? "",
            nombreDeParticipant: String(data.nombreDeParticipant ?? ""),
            prix: String(data.prix ?? "0"),
          });
        }
      } catch (err) {
        if (!cancelled) setGlobalError(err.message || "Impossible de charger l'évènement.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGlobalError("");

    const clientErrors = validate(form);
    if (Object.keys(clientErrors).length) {
      setErrors(clientErrors);
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`/api/evenements/${id}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          titre: form.titre.trim(),
          description: form.description.trim(),
          localisation: form.localisation.trim(),
          dateDebut: form.dateDebut,
          dateFin: form.dateFin,
          nombreDeParticipant: Number(form.nombreDeParticipant),
          prix: Number(form.prix),
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (res.status === 422) {
        setErrors(data.errors || {});
        setGlobalError(data.message || "Formulaire invalide.");
        return;
      }
      if (!res.ok) {
        setGlobalError(data.message || "Une erreur est survenue lors de la modification.");
        return;
      }

      navigate("/dashboard/medecin/evenements");
    } catch {
      setGlobalError("Impossible de contacter le serveur.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6">
      <Link
        to="/dashboard/medecin/evenements"
        className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-[#0F3D3E] hover:text-[#2A6B59]"
      >
        <ArrowLeft size={16} /> Retour aux évènements
      </Link>

      <div className="rounded-2xl border border-[#E6E1D5] bg-white p-6 shadow-sm sm:p-8">
        <div className="mb-6 flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#0F3D3E] text-[#D4AF37]">
            <CalendarCog size={22} />
          </span>
          <div>
            <h1 className="font-serif text-2xl font-semibold text-[#0F3D3E]">
              Modifier l&apos;évènement
            </h1>
            <p className="text-xs text-[#737873]">
              Toute modification nécessitera une nouvelle validation par l&apos;administrateur.
            </p>
          </div>
        </div>

        {loading ? (
          <p className="text-sm text-[#737873]">Chargement des données...</p>
        ) : (
          <>
            {globalError && (
              <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {globalError}
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate className="space-y-5">
              <Field label="Titre" error={errors.titre}>
                <input name="titre" value={form.titre} onChange={handleChange} className={inputClass} />
              </Field>

              <Field label="Description" error={errors.description}>
                <textarea
                  name="description"
                  rows={5}
                  value={form.description}
                  onChange={handleChange}
                  className={inputClass}
                />
              </Field>

              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Date et heure de début" error={errors.dateDebut}>
                  <input
                    type="datetime-local"
                    name="dateDebut"
                    value={form.dateDebut}
                    onChange={handleChange}
                    className={inputClass}
                  />
                </Field>
                <Field label="Date et heure de fin" error={errors.dateFin}>
                  <input
                    type="datetime-local"
                    name="dateFin"
                    value={form.dateFin}
                    onChange={handleChange}
                    className={inputClass}
                  />
                </Field>
              </div>

              <Field label="Localisation" error={errors.localisation}>
                <input
                  name="localisation"
                  value={form.localisation}
                  onChange={handleChange}
                  className={inputClass}
                />
              </Field>

              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Nombre de participants" error={errors.nombreDeParticipant}>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    name="nombreDeParticipant"
                    value={form.nombreDeParticipant}
                    onChange={handleChange}
                    className={inputClass}
                  />
                </Field>
                <Field label="Prix (DT)" error={errors.prix}>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    name="prix"
                    value={form.prix}
                    onChange={handleChange}
                    className={inputClass}
                  />
                </Field>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <Link
                  to="/dashboard/medecin/evenements"
                  className="rounded-xl border border-[#0F3D3E]/15 px-6 py-3 text-sm font-semibold text-[#0F3D3E] hover:bg-[#FAF8F5]"
                >
                  Annuler
                </Link>
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-xl bg-[#0F3D3E] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-[#0F3D3E]/20 transition hover:bg-[#082829] disabled:opacity-60"
                >
                  {submitting ? "Enregistrement..." : "Enregistrer les modifications"}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}