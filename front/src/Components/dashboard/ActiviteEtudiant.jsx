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
  Send,
  CheckCircle2,
  FileText,
} from "lucide-react";

export default function ActivitesEtudiant() {
  const [activites, setActivites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewingActivite, setViewingActivite] = useState(null);

  const [sortDifficulte, setSortDifficulte] = useState("");

  const [contenuTravail, setContenuTravail] = useState("");
  const [commentaireEtudiant, setCommentaireEtudiant] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState(null);

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

  const activitesFiltrees = useMemo(() => {
    let result = [...activites];

    if (sortDifficulte) {
      result = result.filter((a) => a.difficulte === sortDifficulte);
    }

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
    setContenuTravail("");
    setCommentaireEtudiant("");
    setSubmitError(null);
    setSubmitSuccess(null);
  };

  const closeViewModal = () => {
    setViewingActivite(null);
    setContenuTravail("");
    setCommentaireEtudiant("");
    setSubmitError(null);
    setSubmitSuccess(null);
  };

  const handleSubmitTravail = async (e) => {
    e.preventDefault();
    if (!viewingActivite) return;

    setSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(null);

    try {
      const res = await fetch(
        `/api/etudiant/activites/${viewingActivite.id}/soumettre`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            contenu: contenuTravail,
            commentaireEtudiant: commentaireEtudiant || null,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Erreur lors de la soumission");
      }

      setSubmitSuccess(data.message || "Travail soumis avec succès !");

      setActivites((prev) =>
        prev.map((a) =>
          a.id === viewingActivite.id
            ? {
                ...a,
                aDejaSoumis: true,
                soumission: {
                  id: data.id,
                  contenu: contenuTravail,
                  commentaireEtudiant: commentaireEtudiant || null,
                  statut: data.statut || "soumis",
                  note: null,
                  commentaireMedecin: null,
                  createdAt: new Date().toISOString(),
                },
              }
            : a
        )
      );

      setViewingActivite((prev) =>
        prev
          ? {
              ...prev,
              aDejaSoumis: true,
              soumission: {
                id: data.id,
                contenu: contenuTravail,
                commentaireEtudiant: commentaireEtudiant || null,
                statut: data.statut || "soumis",
                note: null,
                commentaireMedecin: null,
                createdAt: new Date().toISOString(),
              },
            }
          : null
      );
    } catch (err) {
      console.error(err);
      setSubmitError(err.message || "Une erreur est survenue");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FBF9F4] p-6 sm:p-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-10">
          <h1 className="font-serif text-3xl font-bold text-[#0F3D3E]">
            Activités disponibles
          </h1>
          <p className="mt-1 text-[#5C5A54]">
            Découvrez les activités proposées par les médecins et validées par
            l’administration.
          </p>
        </div>

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
                  {act.aDejaSoumis && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
                      <CheckCircle2 size={12} />
                      Soumis
                    </span>
                  )}
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
                    {act.aDejaSoumis ? "Voir ma soumission" : "Voir & Soumettre"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

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

              <div className="border-t border-[#E4DFD3] pt-6">
                <h4 className="mb-4 flex items-center gap-2 text-sm font-medium text-[#0F3D3E]">
                  <FileText size={16} />
                  Mon travail
                </h4>

                {viewingActivite.aDejaSoumis && viewingActivite.soumission ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                      <CheckCircle2 size={18} />
                      <span>
                        Travail soumis le{" "}
                        {new Date(
                          viewingActivite.soumission.createdAt
                        ).toLocaleDateString("fr-FR", {
                          day: "2-digit",
                          month: "long",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>

                    <div>
                      <p className="mb-1 text-xs font-medium text-[#5C5A54]">
                        Contenu soumis
                      </p>
                      <p className="whitespace-pre-wrap rounded-xl border border-[#E4DFD3] bg-[#FAF8F5] px-4 py-3 text-sm text-[#5C5A54]">
                        {viewingActivite.soumission.contenu}
                      </p>
                    </div>

                    {viewingActivite.soumission.commentaireEtudiant && (
                      <div>
                        <p className="mb-1 text-xs font-medium text-[#5C5A54]">
                          Votre commentaire
                        </p>
                        <p className="whitespace-pre-wrap rounded-xl border border-[#E4DFD3] bg-[#FAF8F5] px-4 py-3 text-sm text-[#5C5A54]">
                          {viewingActivite.soumission.commentaireEtudiant}
                        </p>
                      </div>
                    )}

                    {viewingActivite.soumission.note !== null && (
                      <div className="rounded-xl border border-[#E4DFD3] bg-white px-4 py-3">
                        <p className="text-sm font-medium text-[#0F3D3E]">
                          Note : {viewingActivite.soumission.note}/20
                        </p>
                        {viewingActivite.soumission.commentaireMedecin && (
                          <p className="mt-1 text-sm text-[#5C5A54]">
                            {viewingActivite.soumission.commentaireMedecin}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <form onSubmit={handleSubmitTravail} className="space-y-4">
                    <div>
                      <label className="mb-1.5 block text-xs font-medium text-[#5C5A54]">
                        Votre travail <span className="text-rose-500">*</span>
                      </label>
                      <textarea
                        value={contenuTravail}
                        onChange={(e) => setContenuTravail(e.target.value)}
                        required
                        rows={6}
                        placeholder="Rédigez ici votre réponse / rapport / analyse selon les instructions..."
                        className="w-full rounded-xl border border-[#E4DFD3] bg-[#FAF8F5] px-4 py-3 text-sm text-[#0F3D3E] outline-none transition focus:border-[#0F3D3E] focus:ring-2 focus:ring-[#0F3D3E]/10"
                      />
                    </div>

                    <div>
                      <label className="mb-1.5 block text-xs font-medium text-[#5C5A54]">
                        Commentaire (optionnel)
                      </label>
                      <textarea
                        value={commentaireEtudiant}
                        onChange={(e) => setCommentaireEtudiant(e.target.value)}
                        rows={2}
                        placeholder="Ajoutez un commentaire si nécessaire..."
                        className="w-full rounded-xl border border-[#E4DFD3] bg-[#FAF8F5] px-4 py-3 text-sm text-[#0F3D3E] outline-none transition focus:border-[#0F3D3E] focus:ring-2 focus:ring-[#0F3D3E]/10"
                      />
                    </div>

                    {submitError && (
                      <div className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
                        <AlertCircle size={16} />
                        {submitError}
                      </div>
                    )}

                    {submitSuccess && (
                      <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                        <CheckCircle2 size={16} />
                        {submitSuccess}
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={submitting || !contenuTravail.trim()}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#0F3D3E] px-4 py-3 text-sm font-medium text-white transition hover:bg-[#082829] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {submitting ? (
                        <>
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                          Envoi en cours...
                        </>
                      ) : (
                        <>
                          <Send size={16} />
                          Soumettre mon travail
                        </>
                      )}
                    </button>
                  </form>
                )}
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