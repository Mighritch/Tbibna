import { useEffect, useMemo, useState } from "react";
import {
  Check,
  X,
  Calendar,
  MapPin,
  Users,
  Clock,
  Hourglass,
  CheckCircle2,
  XCircle,
} from "lucide-react";

const API = "/api/admin/evenements";

const STATUTS = {
  en_attente: {
    label: "En attente",
    titre: "Évènements en attente",
    cls: "bg-amber-100 text-amber-800",
    couleur: "#B45309",
    fond: "#FEF3C7",
    icon: Hourglass,
  },
  accepte: {
    label: "Acceptés",
    titre: "Évènements acceptés",
    cls: "bg-emerald-100 text-emerald-800",
    couleur: "#047857",
    fond: "#D1FAE5",
    icon: CheckCircle2,
  },
  refuse: {
    label: "Refusés",
    titre: "Évènements refusés",
    cls: "bg-red-100 text-red-800",
    couleur: "#B91C1C",
    fond: "#FEE2E2",
    icon: XCircle,
  },
};

const ORDRE = ["en_attente", "accepte", "refuse"];

const fmt = (iso) =>
  iso
    ? new Date(iso).toLocaleString("fr-FR", { dateStyle: "medium", timeStyle: "short" })
    : "—";

export default function AdminEvenements() {
  const [evenements, setEvenements] = useState([]);
  const [filtre, setFiltre] = useState("en_attente");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState(null);

  // Chargement initial : les setState sont appelés après la réponse (asynchrone)
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const res = await fetch(API, { credentials: "include" });
        if (!res.ok) throw new Error("Impossible de charger les évènements.");
        const data = await res.json();
        if (!cancelled) setEvenements(data);
      } catch (e) {
        if (!cancelled) setError(e.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const decider = async (id, action, body) => {
    setBusyId(id);
    setError("");
    try {
      const res = await fetch(`${API}/${id}/${action}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body ?? {}),
      });
      if (!res.ok) throw new Error("L'action a échoué.");
      const maj = await res.json();
      // l'évènement change de statut => il passe dans l'autre section
      setEvenements((liste) => liste.map((e) => (e.id === maj.id ? maj : e)));
    } catch (e) {
      setError(e.message);
    } finally {
      setBusyId(null);
    }
  };

  const refuser = (id) => {
    const motif = window.prompt("Motif du refus (optionnel) :");
    if (motif === null) return; // annulé
    decider(id, "refuser", { motif });
  };

  // Regroupement + compteurs
  const parStatut = useMemo(() => {
    const groupes = { en_attente: [], accepte: [], refuse: [] };
    evenements.forEach((e) => {
      (groupes[e.statut] ?? groupes.en_attente).push(e);
    });
    return groupes;
  }, [evenements]);

  const st = STATUTS[filtre];
  const StatutIcon = st.icon;
  const liste = parStatut[filtre];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="font-serif text-3xl font-semibold text-[#0F3D3E]">
        Évènements proposés par les médecins
      </h1>
      <p className="mt-1 text-sm text-[#737873]">
        Un évènement n'est visible sur la plateforme qu'après votre acceptation.
      </p>

      {/* Filtres par statut avec compteurs */}
      <div className="mt-6 flex flex-wrap gap-2">
        {ORDRE.map((valeur) => {
          const actif = filtre === valeur;
          const s = STATUTS[valeur];
          return (
            <button
              key={valeur}
              type="button"
              onClick={() => setFiltre(valeur)}
              style={{
                backgroundColor: actif ? "#0F3D3E" : "#FFFFFF",
                color: actif ? "#FFFFFF" : "#0F3D3E",
                border: "1px solid rgba(15,61,62,0.2)",
                borderRadius: 9999,
                padding: "6px 16px",
                fontSize: 14,
                fontWeight: 500,
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              {s.label}
              <span
                style={{
                  minWidth: 22,
                  padding: "1px 7px",
                  borderRadius: 9999,
                  fontSize: 12,
                  fontWeight: 700,
                  textAlign: "center",
                  backgroundColor: actif ? "rgba(255,255,255,0.2)" : s.fond,
                  color: actif ? "#FFFFFF" : s.couleur,
                }}
              >
                {parStatut[valeur].length}
              </span>
            </button>
          );
        })}
      </div>

      {error && (
        <div className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      {loading ? (
        <p className="mt-8 text-[#737873]">Chargement…</p>
      ) : (
        <section className="mt-8">
          <div className="mb-4 flex items-center gap-3">
            <h2 className="flex items-center gap-2 text-xl font-semibold text-[#0F3D3E]">
              <StatutIcon size={20} style={{ color: st.couleur }} />
              {st.titre}
            </h2>
            <span className={`rounded-full px-3 py-0.5 text-xs font-bold ${st.cls}`}>
              {liste.length}
            </span>
          </div>

          {liste.length === 0 ? (
            <p className="rounded-xl border border-dashed border-[#E6E1D5] bg-white px-4 py-6 text-center text-sm text-[#737873]">
              Aucun évènement dans ce statut.
            </p>
          ) : (
            <div className="grid gap-5 md:grid-cols-2">
              {liste.map((e) => (
                <article
                  key={e.id}
                  className="rounded-2xl border border-[#E6E1D5] bg-white p-6 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="text-lg font-semibold text-[#0F3D3E]">{e.titre}</h3>
                    <span
                      className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${st.cls}`}
                    >
                      <StatutIcon size={13} />
                      {st.label.replace(/s$/, "")}
                    </span>
                  </div>

                  <p className="mt-1 text-xs text-[#737873]">
                    Proposé par <strong>{e.auteurNom || "—"}</strong>
                  </p>

                  <p className="mt-3 text-sm text-[#4A4D4A]">{e.description}</p>

                  <ul className="mt-4 space-y-1.5 text-sm text-[#4A4D4A]">
                    <li className="flex items-center gap-2">
                      <Calendar size={15} /> {fmt(e.dateDebut)} → {fmt(e.dateFin)}
                    </li>
                    <li className="flex items-center gap-2">
                      <Clock size={15} /> {e.duree} h
                    </li>
                    <li className="flex items-center gap-2">
                      <MapPin size={15} /> {e.localisation}
                    </li>
                    <li className="flex items-center gap-2">
                      <Users size={15} /> {e.nombreDeParticipant} participants —{" "}
                      {e.prix > 0 ? `${e.prix} DT` : "Gratuit"}
                    </li>
                  </ul>

                  {e.statut === "refuse" && e.motifRefus && (
                    <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">
                      Motif : {e.motifRefus}
                    </p>
                  )}

                  {e.statut !== "en_attente" && e.dateDecision && (
                    <p className="mt-3 text-xs text-[#737873]">
                      Décision du {fmt(e.dateDecision)}
                    </p>
                  )}

                  <div className="mt-5 flex gap-3">
                    {e.statut !== "accepte" && (
                      <button
                        type="button"
                        disabled={busyId === e.id}
                        onClick={() => decider(e.id, "accepter")}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-[#2A6B59] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#0F3D3E] disabled:opacity-50"
                      >
                        <Check size={16} /> Accepter
                      </button>
                    )}
                    {e.statut !== "refuse" && (
                      <button
                        type="button"
                        disabled={busyId === e.id}
                        onClick={() => refuser(e.id)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-red-300 px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-50 disabled:opacity-50"
                      >
                        <X size={16} /> Refuser
                      </button>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
}