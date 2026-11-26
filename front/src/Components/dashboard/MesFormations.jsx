import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, BookOpen, Clock } from "lucide-react";

const STATUT_UI = {
  en_attente: { label: "En attente de validation", cls: "bg-amber-100 text-amber-700" },
  acceptee: { label: "Acceptée", cls: "bg-green-100 text-green-700" },
  refusee: { label: "Refusée", cls: "bg-red-100 text-red-700" },
};

export default function MesFormations() {
  const [formations, setFormations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    fetch("http://localhost:8000/api/formations/mes-formations", {
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
                  className="rounded-2xl border border-[#E6E1D5] bg-white p-6 shadow-sm transition hover:shadow-md"
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