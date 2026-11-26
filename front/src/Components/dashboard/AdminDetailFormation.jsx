import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Check,
  X,
  Trash2,
  Clock,
  Calendar,
  Target,
  Wallet,
  User,
  Loader2,
  AlertTriangle,
} from "lucide-react";

const API = "http://localhost:8000/api/formations";

const STATUT_UI = {
  en_attente: { label: "En attente de validation", cls: "bg-amber-100 text-amber-700" },
  acceptee: { label: "Acceptée", cls: "bg-green-100 text-green-700" },
  refusee: { label: "Refusée", cls: "bg-red-100 text-red-700" },
};

const formatDate = (d) =>
  d
    ? new Date(d).toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
    : "Non définie";

function InfoItem({ icon: Icon, label, children }) {
  return (
    <div className="flex items-start gap-3 rounded-xl bg-[#FAF8F5] p-4">
      <Icon size={18} className="mt-0.5 text-[#D4AF37]" />
      <div>
        <p className="text-xs text-[#737873]">{label}</p>
        <p className="text-sm font-medium text-[#0F3D3E]">{children}</p>
      </div>
    </div>
  );
}

export default function AdminDetailFormation() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formation, setFormation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [busyStatut, setBusyStatut] = useState(false);

  const [showDelete, setShowDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    fetch(`${API}/${id}`, {
      credentials: "include",
      headers: { Accept: "application/json" },
    })
      .then((res) => {
        if (res.status === 401) throw new Error("Non connecté. Veuillez vous reconnecter.");
        if (res.status === 403) throw new Error("Accès réservé à l'administrateur.");
        if (res.status === 404) throw new Error("Formation introuvable.");
        if (!res.ok) throw new Error("Erreur lors du chargement de la formation.");
        return res.json();
      })
      .then((data) => {
        if (!cancelled) setFormation(data);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

  const changeStatut = async (statut) => {
    setBusyStatut(true);
    setError(null);
    try {
      const res = await fetch(`${API}/${id}/statut`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ statut }),
      });
      if (!res.ok) throw new Error("Impossible de modifier le statut.");
      const updated = await res.json();
      setFormation(updated);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyStatut(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    setDeleteError(null);

    try {
      const res = await fetch(`${API}/${id}`, {
        method: "DELETE",
        credentials: "include",
        headers: { Accept: "application/json" },
      });

      if (!res.ok) {
        let message = "Erreur lors de la suppression.";
        if (res.status === 401) message = "Non connecté. Veuillez vous reconnecter.";
        else if (res.status === 403) message = "Accès refusé.";
        throw new Error(message);
      }

      navigate("/dashboard/admin/formations");
    } catch (err) {
      setDeleteError(err.message);
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center gap-2 text-[#737873]">
        <Loader2 size={18} className="animate-spin" />
        Chargement...
      </div>
    );
  }

  if (error && !formation) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] py-10">
        <div className="mx-auto max-w-3xl px-4">
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
          <Link
            to="/dashboard/admin/formations"
            className="mt-4 inline-block text-sm font-semibold text-[#0F3D3E] hover:underline"
          >
            ← Retour à la gestion des formations
          </Link>
        </div>
      </div>
    );
  }

  const statutKey = formation.statut || "en_attente";
  const statut = STATUT_UI[statutKey] || STATUT_UI.en_attente;

  return (
    <div className="min-h-screen bg-[#FAF8F5] py-10">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => navigate("/dashboard/admin/formations")}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#E6E1D5] bg-white text-[#0F3D3E] transition hover:bg-[#F3EFE6]"
            >
              <ArrowLeft size={18} />
            </button>
            <h1 className="font-serif text-2xl font-semibold text-[#0F3D3E]">
              Détails de la formation
            </h1>
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="rounded-2xl border border-[#E6E1D5] bg-white p-6 shadow-sm sm:p-8">
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${statut.cls}`}>
              {statut.label}
            </span>
            {formation.gratuit ? (
              <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700">
                Gratuit
              </span>
            ) : (
              <span className="rounded-full bg-[#FAF8F5] px-2.5 py-0.5 text-xs font-medium text-[#0F3D3E]">
                {formation.prix} DT
              </span>
            )}
          </div>

          <h2 className="text-2xl font-semibold text-[#0F3D3E]">{formation.titre}</h2>

          <div className="mt-6">
            <h3 className="mb-1.5 text-sm font-medium text-[#0F3D3E]">Description</h3>
            <p className="whitespace-pre-line text-sm leading-relaxed text-[#737873]">
              {formation.description}
            </p>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <InfoItem icon={User} label="Proposée par (Médecin)">
              {formation.createdBy || "Non renseigné"}
            </InfoItem>
            <InfoItem icon={Clock} label="Durée">
              {formation.duree} heure(s)
            </InfoItem>
            <InfoItem icon={Wallet} label="Prix">
              {formation.gratuit ? "Gratuit" : `${formation.prix} DT`}
            </InfoItem>
            <InfoItem icon={Calendar} label="Période">
              Du {formatDate(formation.dateDebut)} au {formatDate(formation.dateFin)}
            </InfoItem>
          </div>

          <div className="mt-6">
            <h3 className="mb-1.5 flex items-center gap-2 text-sm font-medium text-[#0F3D3E]">
              <Target size={16} className="text-[#D4AF37]" /> Objectifs pédagogiques
            </h3>
            <p className="whitespace-pre-line text-sm leading-relaxed text-[#737873]">
              {formation.objectifs || "Aucun objectif renseigné."}
            </p>
          </div>

          {/* Actions Admin */}
          <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-[#E6E1D5] pt-6">
            <button
              type="button"
              onClick={() => {
                setDeleteError(null);
                setShowDelete(true);
              }}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 px-5 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50"
            >
              <Trash2 size={16} /> Supprimer
            </button>

            <div className="flex flex-wrap gap-3">
              {busyStatut ? (
                <Loader2 size={20} className="animate-spin text-[#0F3D3E]" />
              ) : (
                <>
                  {statutKey !== "refusee" && (
                    <button
                      type="button"
                      onClick={() => changeStatut("refusee")}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700"
                    >
                      <X size={16} /> Refuser
                    </button>
                  )}
                  {statutKey !== "acceptee" && (
                    <button
                      type="button"
                      onClick={() => changeStatut("acceptee")}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-green-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-green-700"
                    >
                      <Check size={16} /> Accepter
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal suppression */}
      {showDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600">
                <AlertTriangle size={20} />
              </div>
              <div>
                <h2 className="font-semibold text-[#0F3D3E]">Supprimer la formation ?</h2>
                <p className="mt-1 text-sm text-[#737873]">
                  « {formation.titre} » sera définitivement supprimée. Cette action est irréversible.
                </p>
              </div>
            </div>

            {deleteError && (
              <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {deleteError}
              </div>
            )}

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                disabled={deleting}
                onClick={() => setShowDelete(false)}
                className="rounded-xl border border-[#E6E1D5] px-5 py-2.5 text-sm font-semibold text-[#0F3D3E] transition hover:bg-[#FAF8F5] disabled:opacity-60"
              >
                Annuler
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={handleDelete}
                className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-60"
              >
                {deleting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" /> Suppression...
                  </>
                ) : (
                  "Supprimer"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}