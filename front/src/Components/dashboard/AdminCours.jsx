import { useEffect, useState } from "react";
import {
  BookOpen,
  Clock,
  Globe,
  Calendar,
  Loader2,
  AlertCircle,
  FileText,
  FileType2,
  Video,
  ExternalLink,
  CheckCircle2,
  Hourglass,
  Ban,
  Check,
  X,
} from "lucide-react";

const FILES_BASE_URL = "";

function getContenuUrl(contenuCours) {
  if (!contenuCours) return null;
  if (contenuCours.startsWith("http")) return contenuCours;
  return `${FILES_BASE_URL}${contenuCours}`;
}

function ContenuIcon({ type }) {
  if (type === "pdf") return <FileText size={16} />;
  if (type === "word") return <FileType2 size={16} />;
  if (type === "video") return <Video size={16} />;
  return <FileText size={16} />;
}

function contenuLabel(type) {
  if (type === "pdf") return "Voir le PDF";
  if (type === "word") return "Voir le document Word";
  if (type === "video") return "Voir la vidéo";
  return "Voir le contenu";
}

function StatutBadge({ statut }) {
  if (statut === "approuve") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-800">
        <CheckCircle2 size={12} />
        Approuvé
      </span>
    );
  }
  if (statut === "rejete") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800">
        <Ban size={12} />
        Rejeté
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-800">
      <Hourglass size={12} />
      En attente
    </span>
  );
}

export default function AdminCours() {
  const [pendingCours, setPendingCours] = useState([]);
  const [approvedCours, setApprovedCours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [activeTab, setActiveTab] = useState("pending");

  // Chargement initial des données (corrigé pour ESLint)
  useEffect(() => {
    let cancelled = false;

    async function loadCours() {
      setLoading(true);
      setError(null);

      try {
        // Cours en attente (admin only)
        const resPending = await fetch("/api/cours/admin/en-attente", {
          credentials: "include",
        });
        const textPending = await resPending.text();
        let dataPending;
        try {
          dataPending = JSON.parse(textPending);
        } catch {
          throw new Error(
            `Erreur serveur (${resPending.status}) sur les cours en attente.`
          );
        }
        if (!resPending.ok) {
          throw new Error(
            dataPending.error || "Impossible de charger les cours en attente."
          );
        }

        // Cours déjà approuvés (public)
        const resApproved = await fetch("/api/cours/public", {
          credentials: "include",
        });
        const textApproved = await resApproved.text();
        let dataApproved;
        try {
          dataApproved = JSON.parse(textApproved);
        } catch {
          throw new Error(
            `Erreur serveur (${resApproved.status}) sur les cours approuvés.`
          );
        }
        if (!resApproved.ok) {
          throw new Error(
            dataApproved.error || "Impossible de charger les cours publiés."
          );
        }

        if (!cancelled) {
          setPendingCours(dataPending);
          setApprovedCours(dataApproved);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadCours();

    return () => {
      cancelled = true;
    };
  }, []);

  // Auto-disparition du message de succès
  useEffect(() => {
    if (!successMessage) return;
    const timer = setTimeout(() => setSuccessMessage(null), 3500);
    return () => clearTimeout(timer);
  }, [successMessage]);

  const handleApprove = async (id) => {
    setActionLoading(id);
    setError(null);

    try {
      const res = await fetch(`/api/cours/${id}/approuver`, {
        method: "POST",
        credentials: "include",
      });

      const text = await res.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error(`Erreur serveur (${res.status}).`);
      }

      if (!res.ok) {
        throw new Error(data.error || "Impossible d'approuver le cours.");
      }

      const approved = pendingCours.find((c) => c.id === id);
      if (approved) {
        setPendingCours((prev) => prev.filter((c) => c.id !== id));
        setApprovedCours((prev) => [
          { ...approved, statut: "approuve" },
          ...prev,
        ]);
      }

      setSuccessMessage("Cours approuvé avec succès.");
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (id) => {
    setActionLoading(id);
    setError(null);

    try {
      const res = await fetch(`/api/cours/${id}/rejeter`, {
        method: "POST",
        credentials: "include",
      });

      const text = await res.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error(`Erreur serveur (${res.status}).`);
      }

      if (!res.ok) {
        throw new Error(data.error || "Impossible de rejeter le cours.");
      }

      setPendingCours((prev) => prev.filter((c) => c.id !== id));
      setSuccessMessage("Cours rejeté.");
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const renderCoursCard = (c, showActions = false) => {
    const contenuUrl = getContenuUrl(c.contenuCours);

    return (
      <article
        key={c.id}
        className="flex flex-col rounded-2xl border border-[#E4DFD3] bg-white p-5 shadow-sm transition hover:shadow-md"
      >
        <div className="mb-3 flex items-start justify-between gap-2">
          <h3 className="font-serif text-lg font-semibold leading-snug text-[#0F3D3E]">
            {c.titre}
          </h3>
          <div className="flex shrink-0 flex-col items-end gap-1">
            <span className="rounded-full bg-[#0F3D3E]/10 px-2.5 py-0.5 text-xs font-medium text-[#0F3D3E]">
              {c.niveauCours}
            </span>
            <StatutBadge
              statut={c.statut || (showActions ? "en_attente" : "approuve")}
            />
          </div>
        </div>

        <p className="mb-4 line-clamp-2 flex-1 text-sm text-[#5C5A54]">
          {c.description}
        </p>

        <div className="space-y-2 border-t border-[#E4DFD3] pt-4 text-xs text-[#737873]">
          <div className="flex items-center gap-2">
            <Clock size={14} />
            <span>{c.duree} min</span>
          </div>
          <div className="flex items-center gap-2">
            <Globe size={14} />
            <span>{c.langueCours}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar size={14} />
            <span>
              {c.dateCreation
                ? new Date(c.dateCreation).toLocaleDateString("fr-FR", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })
                : "—"}
            </span>
          </div>
        </div>

        {contenuUrl && (
          <a
            href={contenuUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 flex items-center justify-between gap-2 rounded-xl border border-[#E4DFD3] bg-[#FBF9F4] px-3 py-2.5 text-xs font-semibold text-[#0F3D3E] transition hover:border-[#0F3D3E]/40 hover:bg-[#0F3D3E]/5"
          >
            <span className="flex min-w-0 items-center gap-2">
              <ContenuIcon type={c.typeContenu} />
              <span className="truncate">
                {contenuLabel(c.typeContenu)}
                {c.nomOriginalFichier ? ` — ${c.nomOriginalFichier}` : ""}
              </span>
            </span>
            <ExternalLink size={14} className="shrink-0" />
          </a>
        )}

        {showActions && (
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={() => handleApprove(c.id)}
              disabled={actionLoading === c.id}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-emerald-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-60"
            >
              {actionLoading === c.id ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Check size={14} />
              )}
              Approuver
            </button>
            <button
              type="button"
              onClick={() => handleReject(c.id)}
              disabled={actionLoading === c.id}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-red-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-red-700 disabled:opacity-60"
            >
              {actionLoading === c.id ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <X size={14} />
              )}
              Rejeter
            </button>
          </div>
        )}
      </article>
    );
  };

  return (
    <div className="min-h-screen bg-[#FBF9F4] p-6 sm:p-8">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-serif text-3xl font-bold text-[#0F3D3E]">
            Gestion des cours
          </h1>
          <p className="mt-1 text-sm text-[#5C5A54]">
            Validez ou rejetez les cours soumis par les médecins. Consultez
            également les cours déjà publiés.
          </p>
        </div>

        {/* Success */}
        {successMessage && (
          <div className="mb-6 flex items-center gap-3 rounded-xl border border-emerald-300 bg-emerald-50 px-5 py-3 text-sm font-medium text-emerald-800">
            <CheckCircle2 size={18} />
            {successMessage}
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="mb-6 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-800">
            <AlertCircle size={20} />
            {error}
          </div>
        )}

        {/* Tabs */}
        <div className="mb-6 flex gap-2 border-b border-[#E4DFD3]">
          <button
            type="button"
            onClick={() => setActiveTab("pending")}
            className={`px-4 py-2.5 text-sm font-semibold transition ${
              activeTab === "pending"
                ? "border-b-2 border-[#0F3D3E] text-[#0F3D3E]"
                : "text-[#5C5A54] hover:text-[#0F3D3E]"
            }`}
          >
            En attente
            {pendingCours.length > 0 && (
              <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">
                {pendingCours.length}
              </span>
            )}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("approved")}
            className={`px-4 py-2.5 text-sm font-semibold transition ${
              activeTab === "approved"
                ? "border-b-2 border-[#0F3D3E] text-[#0F3D3E]"
                : "text-[#5C5A54] hover:text-[#0F3D3E]"
            }`}
          >
            Publiés
            {approvedCours.length > 0 && (
              <span className="ml-2 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-800">
                {approvedCours.length}
              </span>
            )}
          </button>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20 text-[#5C5A54]">
            <Loader2 className="mb-3 h-8 w-8 animate-spin text-[#0F3D3E]" />
            <p>Chargement des cours...</p>
          </div>
        )}

        {/* Contenu des onglets */}
        {!loading && !error && (
          <>
            {activeTab === "pending" && (
              <>
                {pendingCours.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-[#E4DFD3] bg-white p-12 text-center">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#0F3D3E]/5 text-[#0F3D3E]">
                      <BookOpen size={28} />
                    </div>
                    <h2 className="text-lg font-semibold text-[#0F3D3E]">
                      Aucun cours en attente
                    </h2>
                    <p className="mt-2 text-sm text-[#5C5A54]">
                      Tous les cours soumis ont déjà été traités.
                    </p>
                  </div>
                ) : (
                  <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {pendingCours.map((c) => renderCoursCard(c, true))}
                  </div>
                )}
              </>
            )}

            {activeTab === "approved" && (
              <>
                {approvedCours.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-[#E4DFD3] bg-white p-12 text-center">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#0F3D3E]/5 text-[#0F3D3E]">
                      <BookOpen size={28} />
                    </div>
                    <h2 className="text-lg font-semibold text-[#0F3D3E]">
                      Aucun cours publié
                    </h2>
                    <p className="mt-2 text-sm text-[#5C5A54]">
                      Les cours approuvés apparaîtront ici.
                    </p>
                  </div>
                ) : (
                  <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {approvedCours.map((c) => renderCoursCard(c, false))}
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}