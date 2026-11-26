import { useEffect, useState } from "react";
import {
  BookOpen,
  Clock,
  Check,
  X,
  Trash2,
  Loader2,
  RefreshCw,
  Calendar,
  User,
} from "lucide-react";

const API = "http://localhost:8000/api/formations";

const TABS = [
  { key: "en_attente", label: "En attente" },
  { key: "acceptee", label: "Acceptées" },
  { key: "refusee", label: "Refusées" },
];

const STATUT_BADGE = {
  en_attente: { label: "En attente", cls: "bg-amber-100 text-amber-700" },
  acceptee: { label: "Acceptée", cls: "bg-green-100 text-green-700" },
  refusee: { label: "Refusée", cls: "bg-red-100 text-red-700" },
};

const getStatut = (f) => f.statut || "en_attente";

export default function AdminFormations() {
  const [formations, setFormations] = useState([]);
  const [tab, setTab] = useState("en_attente");
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);

  // Chargement (initial + à chaque clic sur "Actualiser")
  useEffect(() => {
    let cancelled = false;

    fetch(`${API}/admin`, {
      credentials: "include",
      headers: { Accept: "application/json" },
    })
      .then((res) => {
        if (res.status === 401) throw new Error("Non connecté. Veuillez vous reconnecter.");
        if (res.status === 403) throw new Error("Accès réservé à l'administrateur.");
        if (!res.ok) throw new Error("Erreur lors du chargement des formations.");
        return res.json();
      })
      .then((data) => {
        if (cancelled) return;
        setFormations(Array.isArray(data) ? data : []);
        setError(null);
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
  }, [reloadKey]);

  const refresh = () => {
    setLoading(true);
    setReloadKey((k) => k + 1);
  };

  const changeStatut = async (id, statut) => {
    setBusyId(id);
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
      setFormations((prev) => prev.map((f) => (f.id === id ? updated : f)));
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyId(null);
    }
  };

  const remove = async (id) => {
    if (!window.confirm("Supprimer définitivement cette formation ?")) return;
    setBusyId(id);
    setError(null);
    try {
      const res = await fetch(`${API}/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Impossible de supprimer la formation.");
      setFormations((prev) => prev.filter((f) => f.id !== id));
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyId(null);
    }
  };

  const visibles = formations.filter((f) => getStatut(f) === tab);
  const count = (key) => formations.filter((f) => getStatut(f) === key).length;

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center gap-2 text-[#737873]">
        <Loader2 size={18} className="animate-spin" />
        Chargement des formations...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF8F5] py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h1 className="font-serif text-2xl font-semibold text-[#0F3D3E]">
              Gestion des formations
            </h1>
            <p className="text-sm text-[#737873]">
              Seules les formations acceptées sont visibles sur la plateforme
            </p>
          </div>
          <button
            type="button"
            onClick={refresh}
            className="inline-flex items-center gap-2 rounded-xl border border-[#E6E1D5] bg-white px-4 py-2 text-sm font-semibold text-[#0F3D3E] hover:bg-[#F3EFE6]"
          >
            <RefreshCw size={16} /> Actualiser
          </button>
        </div>

        <div className="mb-6 flex flex-wrap gap-2">
          {TABS.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                tab === t.key
                  ? "bg-[#0F3D3E] text-white"
                  : "border border-[#E6E1D5] bg-white text-[#0F3D3E] hover:bg-[#F3EFE6]"
              }`}
            >
              {t.label} ({count(t.key)})
            </button>
          ))}
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {visibles.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#E6E1D5] bg-white py-16 text-center">
            <BookOpen className="mx-auto h-12 w-12 text-[#D4AF37]" />
            <p className="mt-4 text-[#737873]">Aucune formation dans cette catégorie</p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {visibles.map((f) => {
              const statut = getStatut(f);
              const badge = STATUT_BADGE[statut];

              return (
                <div
                  key={f.id}
                  className="flex flex-col rounded-2xl border border-[#E6E1D5] bg-white p-6 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="line-clamp-2 font-semibold text-[#0F3D3E]">{f.titre}</h3>
                    {f.gratuit ? (
                      <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700">
                        Gratuit
                      </span>
                    ) : (
                      <span className="whitespace-nowrap rounded-full bg-[#FAF8F5] px-2.5 py-0.5 text-xs font-medium text-[#0F3D3E]">
                        {f.prix} DT
                      </span>
                    )}
                  </div>

                  <span
                    className={`mt-2 w-fit rounded-full px-2.5 py-0.5 text-xs font-medium ${badge.cls}`}
                  >
                    {badge.label}
                  </span>

                  <p className="mt-3 line-clamp-3 text-sm text-[#737873]">{f.description}</p>

                  {f.objectifs && (
                    <p className="mt-2 line-clamp-2 text-xs italic text-[#737873]">
                      Objectifs : {f.objectifs}
                    </p>
                  )}

                  <div className="mt-4 flex flex-wrap gap-3 text-xs text-[#737873]">
                    <span className="inline-flex items-center gap-1">
                      <Clock size={14} /> {f.duree}h
                    </span>
                    {(f.dateDebut || f.dateFin) && (
                      <span className="inline-flex items-center gap-1">
                        <Calendar size={14} /> {f.dateDebut || "?"} → {f.dateFin || "?"}
                      </span>
                    )}
                  </div>

                  {f.createdBy && (
                    <p className="mt-3 inline-flex items-center gap-1 text-xs text-[#737873]">
                      <User size={14} /> Par : {f.createdBy}
                    </p>
                  )}

                  <div className="mt-5 flex flex-wrap gap-2 border-t border-[#E6E1D5] pt-4">
                    {busyId === f.id ? (
                      <Loader2 size={18} className="animate-spin text-[#0F3D3E]" />
                    ) : (
                      <>
                        {statut !== "acceptee" && (
                          <button
                            type="button"
                            onClick={() => changeStatut(f.id, "acceptee")}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-green-600 px-3 py-2 text-xs font-semibold text-white hover:bg-green-700"
                          >
                            <Check size={14} /> Accepter
                          </button>
                        )}
                        {statut !== "refusee" && (
                          <button
                            type="button"
                            onClick={() => changeStatut(f.id, "refusee")}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-3 py-2 text-xs font-semibold text-white hover:bg-red-700"
                          >
                            <X size={14} /> Refuser
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => remove(f.id)}
                          title="Supprimer"
                          className="ml-auto inline-flex items-center gap-1.5 rounded-lg border border-[#E6E1D5] px-3 py-2 text-xs font-semibold text-[#737873] hover:bg-[#FAF8F5]"
                        >
                          <Trash2 size={14} />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}