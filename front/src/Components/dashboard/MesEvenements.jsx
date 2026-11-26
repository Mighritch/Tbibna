import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Plus,
  MapPin,
  Users,
  Clock,
  CalendarDays,
  CheckCircle2,
  XCircle,
  Hourglass,
} from "lucide-react";

const fmt = (iso) =>
  iso
    ? new Date(iso).toLocaleString("fr-FR", { dateStyle: "medium", timeStyle: "short" })
    : "—";

const STATUTS = {
  en_attente: {
    label: "En attente",
    cls: "bg-amber-100 text-amber-800",
    icon: Hourglass,
    info: "En attente de validation par l'administrateur. Non visible sur la plateforme.",
    infoCls: "bg-amber-50 text-amber-800",
  },
  accepte: {
    label: "Accepté",
    cls: "bg-emerald-100 text-emerald-800",
    icon: CheckCircle2,
    info: "Validé par l'administrateur : cet évènement est publié sur la plateforme.",
    infoCls: "bg-emerald-50 text-emerald-800",
  },
  refuse: {
    label: "Refusé",
    cls: "bg-red-100 text-red-800",
    icon: XCircle,
    info: "Refusé par l'administrateur : cet évènement n'est pas publié.",
    infoCls: "bg-red-50 text-red-700",
  },
};

const FILTRES = [
  { value: "", label: "Tous" },
  { value: "en_attente", label: "En attente" },
  { value: "accepte", label: "Acceptés" },
  { value: "refuse", label: "Refusés" },
];

export default function MesEvenements() {
  const [evenements, setEvenements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filtre, setFiltre] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/evenements", { credentials: "include" });
        if (!res.ok) throw new Error();
        const data = await res.json();
        if (!cancelled) setEvenements(data);
      } catch {
        if (!cancelled) setError("Impossible de charger les évènements.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const compteurs = useMemo(() => {
    const c = { "": evenements.length, en_attente: 0, accepte: 0, refuse: 0 };
    evenements.forEach((e) => {
      if (c[e.statut] !== undefined) c[e.statut] += 1;
    });
    return c;
  }, [evenements]);

  const affiches = filtre ? evenements.filter((e) => e.statut === filtre) : evenements;

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-serif text-3xl font-semibold text-[#0F3D3E]">Mes évènements</h1>
        <Link
          to="/dashboard/medecin/evenements/ajouter"
          className="inline-flex items-center gap-2 rounded-xl border border-[#E6E1D5] bg-white px-5 py-3 text-sm font-semibold text-[#0F3D3E] shadow-sm transition hover:border-[#0F3D3E]/30 hover:bg-[#FAF8F5] hover:shadow-md"
        >
          <Plus size={16} /> Ajouter un évènement
        </Link>
      </div>

      {!loading && !error && evenements.length > 0 && (
        <div className="mb-6 flex flex-wrap gap-2">
          {FILTRES.map((f) => (
            <button
              key={f.value}
              type="button"
              onClick={() => setFiltre(f.value)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
                filtre === f.value
                  ? "bg-[#0F3D3E] text-white"
                  : "border border-[#0F3D3E]/15 bg-white text-[#0F3D3E] hover:bg-[#0F3D3E]/5"
              }`}
            >
              {f.label} ({compteurs[f.value]})
            </button>
          ))}
        </div>
      )}

      {loading && <p className="text-sm text-[#737873]">Chargement...</p>}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {!loading && !error && affiches.length === 0 && (
        <div className="rounded-2xl border border-dashed border-[#E6E1D5] bg-white p-10 text-center text-sm text-[#737873]">
          Aucun évènement{filtre ? " pour ce statut" : " pour le moment"}.
        </div>
      )}

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {affiches.map((e) => {
          const st = STATUTS[e.statut] ?? STATUTS.en_attente;
          const StatutIcon = st.icon;

          return (
            <article
              key={e.id}
              className="flex flex-col rounded-2xl border border-[#E6E1D5] bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="mb-3 flex items-center justify-between gap-3">
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${st.cls}`}
                >
                  <StatutIcon size={13} /> {st.label}
                </span>
                <span className="shrink-0 rounded-full bg-[#EBF3F0] px-3 py-1 text-xs font-bold text-[#2A6B59]">
                  {e.prix > 0 ? `${e.prix} DT` : "Gratuit"}
                </span>
              </div>

              <h2 className="text-lg font-semibold text-[#0F3D3E]">{e.titre}</h2>

              <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-[#737873]">
                {e.description}
              </p>

              <ul className="mt-4 space-y-2 text-sm text-[#4A4D4A]">
                <li className="flex items-center gap-2">
                  <CalendarDays size={15} className="text-[#2A6B59]" />
                  {fmt(e.dateDebut)} → {fmt(e.dateFin)}
                </li>
                <li className="flex items-center gap-2">
                  <Clock size={15} className="text-[#2A6B59]" /> {e.duree} h
                </li>
                <li className="flex items-center gap-2">
                  <MapPin size={15} className="text-[#2A6B59]" /> {e.localisation}
                </li>
                <li className="flex items-center gap-2">
                  <Users size={15} className="text-[#2A6B59]" /> {e.nombreDeParticipant} participants
                </li>
              </ul>

              <div className={`mt-4 rounded-lg px-3 py-2 text-xs ${st.infoCls}`}>
                <p>{st.info}</p>
                {e.statut === "refuse" && e.motifRefus && (
                  <p className="mt-1 font-semibold">Motif : {e.motifRefus}</p>
                )}
                {e.statut !== "en_attente" && e.dateDecision && (
                  <p className="mt-1 opacity-80">Décision du {fmt(e.dateDecision)}</p>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}