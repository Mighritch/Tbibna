
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  CalendarDays,
  Clock,
  MapPin,
  Users,
  Banknote,
  User,
  CheckCircle2,
  XCircle,
  Hourglass,
  Pencil,
  Trash2,
  Check,
  X,
} from "lucide-react";

const fmt = (iso) =>
  iso
    ? new Date(iso).toLocaleString("fr-FR", {
        dateStyle: "long",
        timeStyle: "short",
      })
    : "—";

const STATUTS = {
  en_attente: {
    label: "En attente de validation",
    cls: "bg-amber-100 text-amber-800",
    icon: Hourglass,
    info: "En attente de validation par l'administrateur. Non visible sur la plateforme.",
    infoCls: "border-amber-200 bg-amber-50 text-amber-800",
  },
  accepte: {
    label: "Accepté",
    cls: "bg-emerald-100 text-emerald-800",
    icon: CheckCircle2,
    info: "Validé par l'administrateur : cet évènement est publié sur la plateforme.",
    infoCls: "border-emerald-200 bg-emerald-50 text-emerald-800",
  },
  refuse: {
    label: "Refusé",
    cls: "bg-red-100 text-red-800",
    icon: XCircle,
    info: "Refusé par l'administrateur : cet évènement n'est pas publié.",
    infoCls: "border-red-200 bg-red-50 text-red-700",
  },
};

export default function DetailEvenement({ isAdmin = false }) {
  const { id } = useParams();
  const navigate = useNavigate();

  const [evenement, setEvenement] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const backUrl = isAdmin
    ? "/dashboard/admin/evenements"
    : "/dashboard/medecin/evenements";

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const res = await fetch(`/api/evenements/${id}`, {
          credentials: "include",
        });

        const data = await res.json().catch(() => ({}));

        if (!res.ok) {
          throw new Error(data.message || "Évènement introuvable.");
        }

        if (!cancelled) setEvenement(data);
      } catch (err) {
        if (!cancelled) {
          setError(err.message || "Impossible de charger les détails.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [id]);

  const handleDelete = async () => {
    if (!evenement) return;

    if (
      !window.confirm(
        `Voulez-vous vraiment supprimer l'évènement « ${evenement.titre} » ?`
      )
    ) {
      return;
    }

    setBusy(true);
    setError("");

    try {
      const res = await fetch(`/api/evenements/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "Erreur lors de la suppression.");
      }

      navigate(backUrl);
    } catch (err) {
      setError(err.message || "Impossible de supprimer l'évènement.");
      setBusy(false);
    }
  };

  const deciderAdmin = async (action, body) => {
    setBusy(true);
    setError("");

    try {
      const res = await fetch(`/api/admin/evenements/${id}/${action}`, {
        method: "PATCH",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body ?? {}),
      });

      if (!res.ok) {
        throw new Error("L'action a échoué.");
      }

      const maj = await res.json();
      setEvenement(maj);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const refuserAdmin = () => {
    const motif = window.prompt("Motif du refus (optionnel) :");

    if (motif === null) return;

    deciderAdmin("refuser", { motif });
  };

  if (loading) {
    return (
      <div className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6">
        <p className="text-sm text-[#737873]">
          Chargement des détails de l&apos;évènement...
        </p>
      </div>
    );
  }

  if (error && !evenement) {
    return (
      <div className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6">
        <Link
          to={backUrl}
          className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-[#0F3D3E] hover:text-[#2A6B59]"
        >
          <ArrowLeft size={16} />
          Retour aux évènements
        </Link>

        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      </div>
    );
  }

  const st = STATUTS[evenement.statut] ?? STATUTS.en_attente;
  const StatutIcon = st.icon;

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6">
      <Link
        to={backUrl}
        className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-[#0F3D3E] hover:text-[#2A6B59]"
      >
        <ArrowLeft size={16} />
        Retour aux évènements
      </Link>

      {error && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-[#E6E1D5] bg-white shadow-sm">
        <div className="border-b border-[#E6E1D5] bg-[#FAF8F5] p-6 sm:p-8">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold ${st.cls}`}
            >
              <StatutIcon size={14} />
              {st.label}
            </span>

            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#EBF3F0] px-4 py-1.5 text-sm font-bold text-[#2A6B59]">
              <Banknote size={16} />
              {evenement.prix > 0
                ? `${evenement.prix} DT`
                : "Gratuit"}
            </span>
          </div>

          <h1 className="font-serif text-2xl font-semibold text-[#0F3D3E] sm:text-3xl">
            {evenement.titre}
          </h1>

          {evenement.auteurNom && (
            <p className="mt-2 inline-flex items-center gap-2 text-sm text-[#737873]">
              <User size={15} className="text-[#0F3D3E]" />
              Proposé par{" "}
              <strong className="text-[#0F3D3E]">
                {evenement.auteurNom}
              </strong>
            </p>
          )}
        </div>

        <div className="space-y-8 p-6 sm:p-8">
          <div className={`rounded-xl border px-4 py-3 text-sm ${st.infoCls}`}>
            <p className="font-medium">{st.info}</p>

            {evenement.statut === "refuse" && evenement.motifRefus && (
              <p className="mt-1 font-semibold">
                Motif du refus : {evenement.motifRefus}
              </p>
            )}

            {evenement.statut !== "en_attente" &&
              evenement.dateDecision && (
                <p className="mt-1 text-xs opacity-80">
                  Décision enregistrée le {fmt(evenement.dateDecision)}
                </p>
              )}
          </div>

          <div>
            <h2 className="mb-2 text-xs font-bold uppercase tracking-wider text-[#737873]">
              Description de l&apos;évènement
            </h2>

            <p className="whitespace-pre-line text-sm leading-relaxed text-[#181919] sm:text-base">
              {evenement.description}
            </p>
          </div>

          <div>
            <h2 className="mb-3 text-xs font-bold uppercase tracking-wider text-[#737873]">
              Informations pratiques
            </h2>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex items-start gap-3 rounded-xl border border-[#E6E1D5] bg-[#FAF8F5] p-4">
                <CalendarDays size={20} className="mt-0.5 shrink-0 text-[#2A6B59]" />
                <div>
                  <p className="text-xs font-semibold text-[#737873]">
                    Date et heure de début
                  </p>
                  <p className="mt-0.5 text-sm font-semibold text-[#0F3D3E]">
                    {fmt(evenement.dateDebut)}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-xl border border-[#E6E1D5] bg-[#FAF8F5] p-4">
                <CalendarDays size={20} className="mt-0.5 shrink-0 text-[#2A6B59]" />
                <div>
                  <p className="text-xs font-semibold text-[#737873]">
                    Date et heure de fin
                  </p>
                  <p className="mt-0.5 text-sm font-semibold text-[#0F3D3E]">
                    {fmt(evenement.dateFin)}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-xl border border-[#E6E1D5] bg-[#FAF8F5] p-4">
                <MapPin size={20} className="mt-0.5 shrink-0 text-[#2A6B59]" />
                <div>
                  <p className="text-xs font-semibold text-[#737873]">
                    Localisation
                  </p>
                  <p className="mt-0.5 text-sm font-semibold text-[#0F3D3E]">
                    {evenement.localisation}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-xl border border-[#E6E1D5] bg-[#FAF8F5] p-4">
                <Clock size={20} className="mt-0.5 shrink-0 text-[#2A6B59]" />
                <div>
                  <p className="text-xs font-semibold text-[#737873]">
                    Durée estimée
                  </p>
                  <p className="mt-0.5 text-sm font-semibold text-[#0F3D3E]">
                    {evenement.duree} heure{evenement.duree > 1 ? "s" : ""}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-xl border border-[#E6E1D5] bg-[#FAF8F5] p-4 sm:col-span-2">
                <Users size={20} className="mt-0.5 shrink-0 text-[#2A6B59]" />
                <div>
                  <p className="text-xs font-semibold text-[#737873]">
                    Capacité d&apos;accueil
                  </p>
                  <p className="mt-0.5 text-sm font-semibold text-[#0F3D3E]">
                    {evenement.nombreDeParticipant} participant
                    {evenement.nombreDeParticipant > 1 ? "s" : ""}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-end gap-3 border-t border-[#E6E1D5] pt-6">
            {isAdmin ? (
              <>
                {evenement.statut !== "accepte" && (
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => deciderAdmin("accepter")}
                    className="inline-flex items-center gap-2 rounded-xl bg-[#2A6B59] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#0F3D3E] disabled:opacity-50"
                  >
                    <Check size={16} />
                    Accepter l&apos;évènement
                  </button>
                )}

                {evenement.statut !== "refuse" && (
                  <button
                    type="button"
                    disabled={busy}
                    onClick={refuserAdmin}
                    className="inline-flex items-center gap-2 rounded-xl border border-red-300 bg-red-50 px-5 py-2.5 text-sm font-semibold text-red-700 transition hover:bg-red-600 hover:text-white disabled:opacity-50"
                  >
                    <X size={16} />
                    Refuser l&apos;évènement
                  </button>
                )}
              </>
            ) : (
              <>
                <Link
                  to={`/dashboard/medecin/evenements/modifier/${evenement.id}`}
                  className="inline-flex items-center gap-2 rounded-xl border border-[#0F3D3E]/20 bg-[#FAF8F5] px-5 py-2.5 text-sm font-semibold text-[#0F3D3E] transition hover:bg-[#0F3D3E] hover:text-white"
                >
                  <Pencil size={16} />
                  Modifier
                </Link>

                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={busy}
                  className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-5 py-2.5 text-sm font-semibold text-red-700 transition hover:bg-red-600 hover:text-white disabled:opacity-50"
                >
                  <Trash2 size={16} />
                  {busy ? "Suppression..." : "Supprimer"}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
