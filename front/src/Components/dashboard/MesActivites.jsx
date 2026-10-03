import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Plus,
  BookOpen,
  Clock,
  BarChart3,
  AlertCircle,
  Pencil,
  Trash2,
  X,
  Save,
  Eye,
} from "lucide-react";

export default function MesActivites() {
  const [activites, setActivites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const [editingActivite, setEditingActivite] = useState(null);
  const [form, setForm] = useState({
    titre: "",
    description: "",
    instructions: "",
    difficulte: "",
    duree: "",
  });

  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState(null);

  const [viewingActivite, setViewingActivite] = useState(null);

  useEffect(() => {
    let cancelled = false;

    const loadActivites = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch("/api/medecin/activites", {
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

  const handleDelete = async (id) => {
    if (
      !window.confirm(
        "Êtes-vous sûr de vouloir supprimer cette activité ?"
      )
    ) {
      return;
    }

    setDeletingId(id);

    try {
      const res = await fetch(`/api/medecin/activites/${id}`, {
        method: "DELETE",
        credentials: "include",
        headers: {
          Accept: "application/json",
        },
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(
          data.message || "Erreur lors de la suppression"
        );
      }

      setActivites((prev) => prev.filter((a) => a.id !== id));
    } catch (err) {
      console.error(err);
      setError(err.message || "Erreur lors de la suppression");
    } finally {
      setDeletingId(null);
    }
  };

  const openEditModal = (act) => {
    setEditingActivite(act);

    setForm({
      titre: act.titre || "",
      description: act.description || "",
      instructions: act.instructions || "",
      difficulte: act.difficulte || "",
      duree: act.duree?.toString() || "",
    });

    setFormError(null);
  };

  const closeEditModal = () => {
    setEditingActivite(null);
    setFormError(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleUpdate = async (e) => {
    e.preventDefault();

    if (!editingActivite) {
      return;
    }

    setSaving(true);
    setFormError(null);

    try {
      const duree = parseInt(form.duree, 10);

      if (Number.isNaN(duree) || duree < 1) {
        throw new Error("La durée doit être un nombre supérieur à 0.");
      }

      const res = await fetch(
        `/api/medecin/activites/${editingActivite.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            ...form,
            duree,
          }),
        }
      );

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));

        throw new Error(
          data.message || "Erreur lors de la modification"
        );
      }

      setActivites((prev) =>
        prev.map((a) =>
          a.id === editingActivite.id
            ? {
                ...a,
                ...form,
                duree,
              }
            : a
        )
      );

      closeEditModal();
    } catch (err) {
      console.error(err);

      setFormError(
        err.message || "Erreur lors de la modification"
      );
    } finally {
      setSaving(false);
    }
  };

  const openViewModal = (act) => {
    setViewingActivite(act);
  };

  const closeViewModal = () => {
    setViewingActivite(null);
  };

  

  return (
    <div className="min-h-screen bg-[#FBF9F4] p-6 sm:p-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-serif text-3xl font-bold text-[#0F3D3E]">
              Mes activités
            </h1>

            <p className="mt-1 text-[#5C5A54]">
              Gérez les activités que vous proposez aux étudiants.
            </p>
          </div>

          <Link
            to="/dashboard/medecin/activites/ajouter"
            className="inline-flex items-center gap-2 rounded-xl border border-[#E4DFD3] bg-white px-5 py-3 text-sm font-semibold text-[#0F3D3E] shadow-sm transition hover:bg-gray-50 hover:shadow-md"
          >
            <Plus size={18} />
            Ajouter une activité
          </Link>
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
        ) : activites.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#E4DFD3] bg-white py-16 text-center">
            <BookOpen
              size={40}
              className="mx-auto mb-4 text-[#0F3D3E]/40"
            />

            <h3 className="text-lg font-semibold text-[#0F3D3E]">
              Aucune activité pour le moment
            </h3>

            <p className="mt-2 text-sm text-[#5C5A54]">
              Commencez par créer votre première activité.
            </p>

            <Link
              to="/dashboard/medecin/activites/ajouter"
              className="mt-6 inline-flex items-center gap-2 rounded-xl border border-[#E4DFD3] bg-white px-5 py-2.5 text-sm font-semibold text-[#0F3D3E] shadow-sm transition hover:bg-gray-50"
            >
              <Plus size={16} />
              Créer une activité
            </Link>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2">
            {activites.map((act) => (
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

                <div className="mt-5 flex items-center gap-4 text-xs text-[#737873]">
                  <span className="flex items-center gap-1.5">
                    <Clock size={14} />
                    {act.duree} min
                  </span>

                  <span className="flex items-center gap-1.5">
                    <BarChart3 size={14} />
                    {act.difficulte}
                  </span>
                </div>

                <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-[#E4DFD3] pt-4">
                  <button
                    type="button"
                    onClick={() => openViewModal(act)}
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-[#E4DFD3] bg-white px-4 py-2.5 text-sm font-medium text-[#0F3D3E] transition hover:bg-[#FAF8F5]"
                  >
                    <Eye size={16} />
                    Voir instructions
                  </button>

                  <button
                    type="button"
                    onClick={() => openEditModal(act)}
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-[#E4DFD3] bg-white px-4 py-2.5 text-sm font-medium text-[#0F3D3E] transition hover:bg-[#FAF8F5]"
                  >
                    <Pencil size={16} />
                    Modifier
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDelete(act.id)}
                    disabled={deletingId === act.id}
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-sm font-medium text-rose-700 transition hover:bg-rose-100 disabled:opacity-60"
                  >
                    {deletingId === act.id ? (
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-rose-700 border-t-transparent" />
                    ) : (
                      <Trash2 size={16} />
                    )}

                    Supprimer
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
                Instructions de l'activité
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
              <div className="flex items-start justify-between gap-3">
                <h3 className="text-lg font-semibold text-[#0F3D3E]">
                  {viewingActivite.titre}
                </h3>
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

      {editingActivite && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-[#E4DFD3] bg-white shadow-xl">
            <div className="sticky top-0 flex items-center justify-between border-b border-[#E4DFD3] bg-white px-6 py-4">
              <h2 className="text-xl font-semibold text-[#0F3D3E]">
                Modifier l'activité
              </h2>

              <button
                type="button"
                onClick={closeEditModal}
                className="rounded-lg p-1.5 text-[#5C5A54] transition hover:bg-gray-100"
              >
                <X size={20} />
              </button>
            </div>

            <form
              onSubmit={handleUpdate}
              className="p-6"
            >
              {formError && (
                <div className="mb-5 flex items-center gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
                  <AlertCircle size={18} />
                  {formError}
                </div>
              )}

              <div className="space-y-5">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-[#0F3D3E]">
                    Titre *
                  </label>

                  <input
                    type="text"
                    name="titre"
                    value={form.titre}
                    onChange={handleChange}
                    required
                    minLength={3}
                    maxLength={150}
                    className="w-full rounded-xl border border-[#E4DFD3] bg-[#FAF8F5] px-4 py-3 text-sm text-black outline-none transition focus:border-[#0F3D3E] focus:ring-2 focus:ring-[#0F3D3E]/10"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-[#0F3D3E]">
                    Description *
                  </label>

                  <textarea
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    required
                    rows={3}
                    className="w-full rounded-xl border border-[#E4DFD3] bg-[#FAF8F5] px-4 py-3 text-sm text-black outline-none transition focus:border-[#0F3D3E] focus:ring-2 focus:ring-[#0F3D3E]/10"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-[#0F3D3E]">
                    Instructions *
                  </label>

                  <textarea
                    name="instructions"
                    value={form.instructions}
                    onChange={handleChange}
                    required
                    rows={5}
                    className="w-full rounded-xl border border-[#E4DFD3] bg-[#FAF8F5] px-4 py-3 text-sm text-black outline-none transition focus:border-[#0F3D3E] focus:ring-2 focus:ring-[#0F3D3E]/10"
                  />
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-[#0F3D3E]">
                      Difficulté *
                    </label>

                    <select
                      name="difficulte"
                      value={form.difficulte}
                      onChange={handleChange}
                      required
                      className="w-full rounded-xl border border-[#E4DFD3] bg-[#FAF8F5] px-4 py-3 text-sm text-black outline-none transition focus:border-[#0F3D3E] focus:ring-2 focus:ring-[#0F3D3E]/10"
                    >
                      <option value="">
                        Choisir une difficulté
                      </option>

                      <option value="facile">
                        Facile
                      </option>

                      <option value="moyen">
                        Moyen
                      </option>

                      <option value="difficile">
                        Difficile
                      </option>
                    </select>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-[#0F3D3E]">
                      Durée (minutes) *
                    </label>

                    <input
                      type="number"
                      name="duree"
                      value={form.duree}
                      onChange={handleChange}
                      required
                      min={1}
                      className="w-full rounded-xl border border-[#E4DFD3] bg-[#FAF8F5] px-4 py-3 text-sm text-black outline-none transition focus:border-[#0F3D3E] focus:ring-2 focus:ring-[#0F3D3E]/10"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-8 flex flex-wrap items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={closeEditModal}
                  className="rounded-xl border border-[#E4DFD3] bg-white px-5 py-2.5 text-sm font-medium text-[#0F3D3E] transition hover:bg-[#FAF8F5]"
                >
                  Annuler
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#0F3D3E] px-6 py-2.5 text-sm font-semibold text-white shadow-md transition hover:bg-[#082829] disabled:opacity-60"
                >
                  {saving ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Enregistrement...
                    </>
                  ) : (
                    <>
                      <Save size={16} />
                      Enregistrer
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}