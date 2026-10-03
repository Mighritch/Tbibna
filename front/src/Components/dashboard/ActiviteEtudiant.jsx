import { useEffect, useState, useMemo } from "react";
import {
  BookOpen,
  Clock,
  BarChart3,
  AlertCircle,
  Eye,
  X,
  User,
  ArrowUpDown,
} from "lucide-react";

export default function ActivitesEtudiant() {
  const [activites, setActivites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewingActivite, setViewingActivite] = useState(null);

  // === TRI ===
  const [sortDifficulte, setSortDifficulte] = useState(""); // "" | "facile" | "moyen" | "difficile"

  useEffect(() => {
    let cancelled = false;

    const loadActivites = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch("/api/etudiant/activites", {
          credentials: "include",
          headers: {
            Accept: "application/json",
          },
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

  // Liste triée / filtrée
  const activitesFiltrees = useMemo(() => {
    let result = [...activites];

    // Filtre par difficulté
    if (sortDifficulte) {
      result = result.filter((a) => a.difficulte === sortDifficulte);
    }

    // Tri par difficulté (facile → moyen → difficile)
    const ordreDifficulte = { facile: 1, moyen: 2, difficile: 3 };
    result.sort((a, b) => {
      const dA = ordreDifficulte[a.difficulte] || 99;
      const dB = ordreDifficulte[b.difficulte] || 99;
      return dA - dB;
    });

    return result;
  }, [activites, sortDifficulte]);

  const openViewModal = (act) => {
    setViewingActivite(act);
  };

  const closeViewModal = () => {
    setViewingActivite(null);
  };

  return (
    <div className="min-h-screen bg-[#FBF9F4] p-6 sm:p-8">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-10">
          <h1 className="font-serif text-3xl font-bold text-[#0F3D3E]">
            Activités disponibles
          </h1>
          <p className="mt-1 text-[#5C5A54]">
            Découvrez les activités proposées par les médecins et validées par
            l’administration.
          </p>
        </div>

        {/* Filtres de tri */}
        {!loading && !error && activites.length > 0 && (
          <div className="mb-6 flex flex-wrap items-center gap-4 rounded-2xl border border-[#E4DFD3] bg-white p-4 shadow-sm">
            <div className="flex items-center gap-2 text-sm font-medium text-[#0F3D3E]">
              <ArrowUpDown size={16} />
              Trier / Filtrer :
            </div>

            <div className="flex items-center gap-2">
              <label className="text-xs text-[#5C5A54]">Difficulté</label>
              <select
                value={sortDifficulte}
                onChange={(e) => setSortDifficulte(e.target.value)}
                className="rounded-xl border border-[#E4DFD3] bg-[#FAF8F5] px-3 py-2 text-sm text-[#0F3D3E] outline-none focus:border-[#0F3D3E] focus:ring-2 focus:ring-[#0F3D3E]/10"
              >
                <option value="">Toutes</option>
                <option value="facile">Facile</option>
                <option value="moyen">Moyen</option>
                <option value="difficile">Difficile</option>
              </select>
            </div>

            {sortDifficulte && (
              <button
                type="button"
                onClick={() => setSortDifficulte("")}
                className="ml-auto text-xs font-medium text-[#0F3D3E] underline hover:no-underline"
              >
                Réinitialiser
              </button>
            )}
          </div>
        )}

        {/* Contenu */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#0F3D3E] border-t-transparent" />
          </div>
        ) : error ? (
          <div className="flex items-center gap-3 rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-rose-800">
            <AlertCircle size={20} />
            <p>{error}</p>
          </div>
        ) : activites.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#E4DFD3] bg-white py-16 text-center">
            <BookOpen
              size={40}
              className="mx-auto mb-4 text-[#0F3D3E]/40"
            />
            <h3 className="text-lg font-semibold text-[#0F3D3E]">
              Aucune activité disponible
            </h3>
            <p className="mt-2 text-sm text-[#5C5A54]">
              Les activités validées par l’administration apparaîtront ici.
            </p>
          </div>
        ) : activitesFiltrees.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#E4DFD3] bg-white py-16 text-center">
            <BookOpen
              size={40}
              className="mx-auto mb-4 text-[#0F3D3E]/40"
            />
            <h3 className="text-lg font-semibold text-[#0F3D3E]">
              Aucune activité ne correspond au filtre
            </h3>
            <p className="mt-2 text-sm text-[#5C5A54]">
              Essayez une autre difficulté ou réinitialisez le filtre.
            </p>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2">
            {activitesFiltrees.map((act) => (
              <div
                key={act.id}
                className="rounded-2xl border border-[#E4DFD3] bg-white p-6 shadow-sm transition hover:border-[#0F3D3E]/25 hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-3">
                  <h2 className="line-clamp-2 text-lg font-semibold text-[#0F3D3E]">
                    {act.titre}
                  </h2>
                </div>

                <p className="mt-3 line-clamp-3 text-sm text-[#5C5A54]">
                  {act.description}
                </p>

                <div className="mt-4 flex items-center gap-2 text-xs text-[#737873]">
                  <User size={14} />
                  <span>{act.medecinNom || "Médecin"}</span>
                </div>

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

                <div className="mt-6 border-t border-[#E4DFD3] pt-4">
                  <button
                    type="button"
                    onClick={() => openViewModal(act)}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-[#E4DFD3] bg-white px-4 py-2.5 text-sm font-medium text-[#0F3D3E] transition hover:bg-[#FAF8F5]"
                  >
                    <Eye size={16} />
                    Voir les instructions
                  </button>
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
                Détails de l’activité
              </h2>
              <button
                type="button"
                onClick={closeViewModal}
                className="rounded-lg p-1.5 text-[#5C5A54] transition hover:bg-gray-100"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-6 p-6">
              <div>
                <h3 className="text-lg font-semibold text-[#0F3D3E]">
                  {viewingActivite.titre}
                </h3>
                <div className="mt-2 flex items-center gap-2 text-sm text-[#737873]">
                  <User size={15} />
                  <span>{viewingActivite.medecinNom || "Médecin"}</span>
                </div>
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
                <h4 className="mb-2 text-sm font-medium text-[#0F3D3E]">
                  Description
                </h4>
                <p className="whitespace-pre-wrap rounded-xl border border-[#E4DFD3] bg-[#FAF8F5] px-4 py-3 text-sm text-[#5C5A54]">
                  {viewingActivite.description || "—"}
                </p>
              </div>

              <div>
                <h4 className="mb-2 text-sm font-medium text-[#0F3D3E]">
                  Instructions
                </h4>
                <p className="whitespace-pre-wrap rounded-xl border border-[#E4DFD3] bg-[#FAF8F5] px-4 py-3 text-sm text-[#5C5A54]">
                  {viewingActivite.instructions || "—"}
                </p>
              </div>
            </div>

            <div className="sticky bottom-0 flex justify-end border-t border-[#E4DFD3] bg-white px-6 py-4">
              <button
                type="button"
                onClick={closeViewModal}
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