import { useEffect, useState } from "react";
import {
  BookOpen,
  Clock,
  BarChart3,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Hourglass,
  Eye,
  X,
  Check,
  Ban,
} from "lucide-react";

export default function AdminActivites() {
  const [activites, setActivites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(null); // id en cours d'action
  const [viewingActivite, setViewingActivite] = useState(null);
  const [filter, setFilter] = useState("all"); // all | en_attente | accepte | refuse

  useEffect(() => {
    let cancelled = false;

    const loadActivites = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch("/api/admin/activites", {
          credentials: "include",
          headers: { Accept: "application/json" },
        });

        if (!res.ok) {
          throw new Error("Impossible de charger les activités");
        }

        const data = await res.json();

        if (!cancelled) {
          setActivites(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        console.error(err);
        if (!cancelled) {
          setError(err.message || "Une erreur est survenue");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadActivites();

    return () => {
      cancelled = true;
    };
  }, []);

  const changeStatut = async (id, nouveauStatut) => {
    setActionLoading(id);

    try {
      const res = await fetch(`/api/admin/activites/${id}/statut`, {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ statut: nouveauStatut }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "Erreur lors du changement de statut");
      }

      setActivites((prev) =>
        prev.map((a) => (a.id === id ? { ...a, statut: nouveauStatut } : a))
      );
    } catch (err) {
      console.error(err);
      setError(err.message || "Erreur lors de l'action");
    } finally {
      setActionLoading(null);
    }
  };

  const getStatutBadge = (statut) => {
    switch (statut) {
      case "accepte":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
            <CheckCircle2 size={13} />
            Acceptée
          </span>
        );
      case "refuse":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-2.5 py-1 text-xs font-medium text-rose-700">
            <XCircle size={13} />
            Refusée
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700">
            <Hourglass size={13} />
            En attente
          </span>
        );
    }
  };

  const filtered = activites.filter((a) => {
    if (filter === "all") return true;
    return a.statut === filter;
  });

  const counts = {
    all: activites.length,
    en_attente: activites.filter((a) => a.statut === "en_attente").length,
    accepte: activites.filter((a) => a.statut === "accepte").length,
    refuse: activites.filter((a) => a.statut === "refuse").length,
  };

  return (
    <div className="min-h-screen bg-[#FBF9F4] p-6 sm:p-8">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-serif text-3xl font-bold text-[#0F3D3E]">
            Gestion des activités
          </h1>
          <p className="mt-1 text-[#5C5A54]">
            Validez ou refusez les activités proposées par les médecins.
          </p>
        </div>

        {/* Filtres */}
        <div className="mb-6 flex flex-wrap gap-2">
          {[
            { key: "all", label: "Toutes" },
            { key: "en_attente", label: "En attente" },
            { key: "accepte", label: "Acceptées" },
            { key: "refuse", label: "Refusées" },
          ].map((f) => (
            <button
              key={f.key}
              type="button"
              onClick={() => setFilter(f.key)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                filter === f.key
                  ? "bg-[#0F3D3E] text-white"
                  : "bg-white border border-[#E4DFD3] text-[#0F3D3E] hover:bg-[#FAF8F5]"
              }`}
            >
              {f.label} ({counts[f.key]})
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#0F3D3E] border-t-transparent" />
          </div>
        ) : error ? (
          <div className="flex items-center gap-3 rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-rose-800">
            <AlertCircle size={20} />
            <p>{error}</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#E4DFD3] bg-white py-16 text-center">
            <BookOpen size={40} className="mx-auto mb-4 text-[#0F3D3E]/40" />
            <h3 className="text-lg font-semibold text-[#0F3D3E]">
              Aucune activité
            </h3>
            <p className="mt-2 text-sm text-[#5C5A54]">
              {filter === "all"
                ? "Aucune activité n’a encore été créée."
                : "Aucune activité dans cette catégorie."}
            </p>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((act) => (
              <div
                key={act.id}
                className="rounded-2xl border border-[#E4DFD3] bg-white p-6 shadow-sm transition hover:border-[#0F3D3E]/25 hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-3">
                  <h2 className="line-clamp-2 text-lg font-semibold text-[#0F3D3E]">
                    {act.titre}
                  </h2>
                  {getStatutBadge(act.statut)}
                </div>

                <p className="mt-3 line-clamp-3 text-sm text-[#5C5A54]">
                  {act.description}
                </p>

                <div className="mt-4 flex items-center gap-4 text-xs text-[#737873]">
                  <span className="flex items-center gap-1.5">
                    <Clock size={14} />
                    {act.duree} min
                  </span>
                  <span className="flex items-center gap-1.5">
                    <BarChart3 size={14} />
                    {act.difficulte}
                  </span>
                </div>

                {act.medecinNom && (
                  <p className="mt-2 text-xs text-[#737873]">
                    Par : <span className="font-medium text-[#0F3D3E]">{act.medecinNom}</span>
                  </p>
                )}

                <div className="mt-5 flex flex-wrap gap-2 border-t border-[#E4DFD3] pt-4">
                  <button
                    type="button"
                    onClick={() => setViewingActivite(act)}
                    className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-[#E4DFD3] bg-white px-3 py-2 text-sm font-medium text-[#0F3D3E] transition hover:bg-[#FAF8F5]"
                  >
                    <Eye size={15} />
                    Voir
                  </button>

                  {act.statut !== "accepte" && (
                    <button
                      type="button"
                      disabled={actionLoading === act.id}
                      onClick={() => changeStatut(act.id, "accepte")}
                      className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-emerald-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-emerald-700 disabled:opacity-60"
                    >
                      {actionLoading === act.id ? (
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      ) : (
                        <Check size={15} />
                      )}
                      Accepter
                    </button>
                  )}

                  {act.statut !== "refuse" && (
                    <button
                      type="button"
                      disabled={actionLoading === act.id}
                      onClick={() => changeStatut(act.id, "refuse")}
                      className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-rose-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-rose-700 disabled:opacity-60"
                    >
                      {actionLoading === act.id ? (
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      ) : (
                        <Ban size={15} />
                      )}
                      Refuser
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de visualisation */}
      {viewingActivite && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-[#E4DFD3] bg-white shadow-xl">
            <div className="sticky top-0 flex items-center justify-between border-b border-[#E4DFD3] bg-white px-6 py-4">
              <h2 className="text-xl font-semibold text-[#0F3D3E]">
                Détails de l'activité
              </h2>
              <button
                type="button"
                onClick={() => setViewingActivite(null)}
                className="rounded-lg p-1.5 text-[#5C5A54] transition hover:bg-gray-100"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-6 p-6">
              <div className="flex items-start justify-between gap-3">
                <h3 className="text-lg font-semibold text-[#0F3D3E]">
                  {viewingActivite.titre}
                </h3>
                {getStatutBadge(viewingActivite.statut)}
              </div>

              <div className="flex flex-wrap items-center gap-4 text-sm text-[#737873]">
                <span className="flex items-center gap-1.5">
                  <Clock size={16} />
                  {viewingActivite.duree} min
                </span>
                <span className="flex items-center gap-1.5">
                  <BarChart3 size={16} />
                  {viewingActivite.difficulte}
                </span>
              </div>

              <div>
                <h4 className="mb-2 text-sm font-medium text-[#0F3D3E]">Description</h4>
                <p className="whitespace-pre-wrap rounded-xl border border-[#E4DFD3] bg-[#FAF8F5] px-4 py-3 text-sm text-[#5C5A54]">
                  {viewingActivite.description || "—"}
                </p>
              </div>

              <div>
                <h4 className="mb-2 text-sm font-medium text-[#0F3D3E]">Instructions</h4>
                <p className="whitespace-pre-wrap rounded-xl border border-[#E4DFD3] bg-[#FAF8F5] px-4 py-3 text-sm text-[#5C5A54]">
                  {viewingActivite.instructions || "—"}
                </p>
              </div>
            </div>

            <div className="sticky bottom-0 flex justify-end gap-3 border-t border-[#E4DFD3] bg-white px-6 py-4">
              {viewingActivite.statut !== "accepte" && (
                <button
                  type="button"
                  onClick={() => {
                    changeStatut(viewingActivite.id, "accepte");
                    setViewingActivite(null);
                  }}
                  className="rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-emerald-700"
                >
                  Accepter
                </button>
              )}
              {viewingActivite.statut !== "refuse" && (
                <button
                  type="button"
                  onClick={() => {
                    changeStatut(viewingActivite.id, "refuse");
                    setViewingActivite(null);
                  }}
                  className="rounded-xl bg-rose-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-rose-700"
                >
                  Refuser
                </button>
              )}
              <button
                type="button"
                onClick={() => setViewingActivite(null)}
                className="rounded-xl border border-[#E4DFD3] bg-white px-5 py-2.5 text-sm font-medium text-[#0F3D3E] transition hover:bg-[#FAF8F5]"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}