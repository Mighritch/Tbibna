import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Plus,
  BookOpen,
  Clock,
  Eye,
  Pencil,
  Trash2,
  Loader2,
  AlertTriangle,
  Calendar,
} from "lucide-react";

const API = "http://localhost:8000/api/formations";

const STATUT_UI = {
  en_attente: { label: "En attente de validation", cls: "bg-amber-100 text-amber-700" },
  acceptee: { label: "Acceptée", cls: "bg-green-100 text-green-700" },
  refusee: { label: "Refusée", cls: "bg-red-100 text-red-700" },
};

const formatDate = (d) =>
  d ? new Date(d).toLocaleDateString("fr-FR") : null;

export default function MesFormations() {
  const [formations, setFormations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // suppression
  const [toDelete, setToDelete] = useState(null); // formation à supprimer
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    fetch(`${API}/mes-formations`, {
      method: "GET",
      credentials: "include",
      headers: { Accept: "application/json" },
    })
      .then((res) => {
        if (res.status === 401) {
          throw new Error("Non connecté. Veuillez vous reconnecter.");
        }
        if (res.status === 403) {
          throw new Error("Accès réservé aux médecins.");
        }
        if (!res.ok) {
          throw new Error("Erreur lors du chargement des formations.");
        }
        return res.json();
      })
      .then((data) => {
        if (!cancelled) setFormations(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        console.error(err);
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const confirmDelete = async () => {
    if (!toDelete) return;
    setDeleting(true);
    setDeleteError(null);

    try {
      const res = await fetch(`${API}/${toDelete.id}`, {
        method: "DELETE",
        credentials: "include",
        headers: { Accept: "application/json" },
      });

      if (!res.ok) {
        let message = "Erreur lors de la suppression.";
        if (res.status === 401) message = "Non connecté. Veuillez vous reconnecter.";
        else if (res.status === 403) message = "Vous ne pouvez pas supprimer cette formation.";
        else if (res.status === 404) message = "Formation introuvable.";
        throw new Error(message);
      }

      setFormations((prev) => prev.filter((f) => f.id !== toDelete.id));
      setToDelete(null);
    } catch (err) {
      setDeleteError(err.message);
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center text-[#737873]">
        Chargement des formations...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF8F5] py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-serif text-2xl font-semibold text-[#0F3D3E]">
              Mes formations
            </h1>
            <p className="text-sm text-[#737873]">
              Une formation n'est visible par les étudiants qu'après validation par l'administrateur
            </p>
          </div>

          <Link
            to="/dashboard/medecin/formations/ajouter"
            className="inline-flex items-center gap-2 rounded-xl bg-[#0F3D3E] px-5 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-[#082829]"
          >
            <Plus size={18} />
            Nouvelle formation
          </Link>
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {!error && formations.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#E6E1D5] bg-white py-16 text-center">
            <BookOpen className="mx-auto h-12 w-12 text-[#D4AF37]" />
            <p className="mt-4 text-[#737873]">Aucune formation pour le moment</p>
            <Link
              to="/dashboard/medecin/formations/ajouter"
              className="mt-4 inline-block text-sm font-semibold text-[#0F3D3E] hover:underline"
            >
              Créer votre première formation →
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {formations.map((f) => {
              const statut = STATUT_UI[f.statut] || STATUT_UI.en_attente;
              return (
                <div
                  key={f.id}
                  className="flex flex-col rounded-2xl border border-[#E6E1D5] bg-white p-6 shadow-sm transition hover:shadow-md"
                >
                  <div className="mb-3">
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${statut.cls}`}>
                      {statut.label}
                    </span>
                  </div>

                  <div className="flex items-start justify-between gap-2">
                    <h3 className="line-clamp-2 font-semibold text-[#0F3D3E]">
                      {f.titre}
                    </h3>
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

                  <p className="mt-2 line-clamp-2 text-sm text-[#737873]">
                    {f.description}
                  </p>

                  <div className="mt-4 flex flex-wrap gap-3 text-xs text-[#737873]">
                    <span className="inline-flex items-center gap-1">
                      <Clock size={14} /> {f.duree}h
                    </span>
                    {f.dateDebut && (
                      <span className="inline-flex items-center gap-1">
                        <Calendar size={14} /> {formatDate(f.dateDebut)}
                        {f.dateFin && ` → ${formatDate(f.dateFin)}`}
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="mt-5 flex gap-2 border-t border-[#E6E1D5] pt-4">
                    <Link
                      to={`/dashboard/medecin/formations/${f.id}`}
                      className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-[#E6E1D5] px-3 py-2 text-xs font-semibold text-[#0F3D3E] transition hover:bg-[#FAF8F5]"
                    >
                      <Eye size={14} /> Voir
                    </Link>
                    <Link
                      to={`/dashboard/medecin/formations/${f.id}/modifier`}
                      className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-[#E6E1D5] px-3 py-2 text-xs font-semibold text-[#0F3D3E] transition hover:bg-[#FAF8F5]"
                    >
                      <Pencil size={14} /> Modifier
                    </Link>
                    <button
                      type="button"
                      onClick={() => {
                        setDeleteError(null);
                        setToDelete(f);
                      }}
                      className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-50"
                    >
                      <Trash2 size={14} /> Supprimer
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal de confirmation de suppression */}
      {toDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600">
                <AlertTriangle size={20} />
              </div>
              <div>
                <h2 className="font-semibold text-[#0F3D3E]">Supprimer la formation ?</h2>
                <p className="mt-1 text-sm text-[#737873]">
                  « {toDelete.titre} » sera définitivement supprimée. Cette action est irréversible.
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
                onClick={() => setToDelete(null)}
                className="rounded-xl border border-[#E6E1D5] px-5 py-2.5 text-sm font-semibold text-[#0F3D3E] transition hover:bg-[#FAF8F5] disabled:opacity-60"
              >
                Annuler
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={confirmDelete}
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