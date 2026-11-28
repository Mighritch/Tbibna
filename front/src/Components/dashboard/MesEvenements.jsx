import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Plus,
  Search,
  ArrowUpDown,
  MapPin,
  Users,
  Clock,
  CalendarDays,
  CheckCircle2,
  XCircle,
  Hourglass,
  Pencil,
  Trash2,
  Eye,
  Heart,
  UserCheck,
} from "lucide-react";

const fmt = (iso) =>
  iso
    ? new Date(iso).toLocaleString("fr-FR", { dateStyle: "medium", timeStyle: "short" })
    : "—";

const STATUTS = {
  en_attente: {
    label: "En attente",
    cls: "bg-amber-100 text-amber-800",
    icon: Hourglass,
    info: "En attente de validation par l'administrateur. Non visible sur la plateforme.",
    infoCls: "bg-amber-50 text-amber-800",
  },
  accepte: {
    label: "Accepté",
    cls: "bg-emerald-100 text-emerald-800",
    icon: CheckCircle2,
    info: "Validé par l'administrateur : cet évènement est publié sur la plateforme.",
    infoCls: "bg-emerald-50 text-emerald-800",
  },
  refuse: {
    label: "Refusé",
    cls: "bg-red-100 text-red-800",
    icon: XCircle,
    info: "Refusé par l'administrateur : cet évènement n'est pas publié.",
    infoCls: "bg-red-50 text-red-700",
  },
};

const TRIS = {
  date: { label: "Date (par défaut)", fn: null },
  prix_asc: { label: "Prix : croissant", fn: (a, b) => (a.prix ?? 0) - (b.prix ?? 0) },
  prix_desc: { label: "Prix : décroissant", fn: (a, b) => (b.prix ?? 0) - (a.prix ?? 0) },
  part_asc: {
    label: "Participants : croissant",
    fn: (a, b) => (a.nombreDeParticipant ?? 0) - (b.nombreDeParticipant ?? 0),
  },
  part_desc: {
    label: "Participants : décroissant",
    fn: (a, b) => (b.nombreDeParticipant ?? 0) - (a.nombreDeParticipant ?? 0),
  },
};

export default function MesEvenements() {
  const [evenements, setEvenements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState(null);
  const [togglingFavoriId, setTogglingFavoriId] = useState(null);

  // Onglet actif : "tous" | "mine" | "autres" | "favoris"
  const [activeTab, setActiveTab] = useState("tous");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("date");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/evenements", { credentials: "include" });
        if (!res.ok) throw new Error();
        const data = await res.json();
        if (!cancelled) setEvenements(Array.isArray(data) ? data : []);
      } catch {
        if (!cancelled) setError("Impossible de charger les évènements.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const countMine = useMemo(
    () => evenements.filter((e) => e.isMine).length,
    [evenements]
  );
  const countAutres = useMemo(
    () => evenements.filter((e) => !e.isMine).length,
    [evenements]
  );
  const countFavoris = useMemo(
    () => evenements.filter((e) => e.isFavori).length,
    [evenements]
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();

    let list = evenements.filter((e) => {
      if (activeTab === "mine" && !e.isMine) return false;
      if (activeTab === "autres" && e.isMine) return false;
      if (activeTab === "favoris" && !e.isFavori) return false;
      if (q && !(e.titre ?? "").toLowerCase().includes(q)) return false;
      return true;
    });

    const sorter = TRIS[sortBy]?.fn;
    if (sorter) list = [...list].sort(sorter);

    return list;
  }, [evenements, activeTab, search, sortBy]);

  const handleToggleFavori = async (ev) => {
    if (togglingFavoriId || ev.statut !== "accepte") return;
    setTogglingFavoriId(ev.id);

    try {
      const res = await fetch(`/api/evenements/${ev.id}/favori`, {
        method: "POST",
        credentials: "include",
      });

      if (!res.ok) {
        throw new Error("Impossible de mettre à jour les favoris.");
      }

      const updated = await res.json();
      setEvenements((prev) =>
        prev.map((item) => (item.id === updated.id ? updated : item))
      );
    } catch (err) {
      setError(err.message || "Erreur lors de la mise à jour du favori.");
    } finally {
      setTogglingFavoriId(null);
    }
  };

  const handleDelete = async (id, titre) => {
    if (!window.confirm(`Voulez-vous vraiment supprimer l'évènement « ${titre} » ?`)) {
      return;
    }

    setDeletingId(id);
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

      setEvenements((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      setError(err.message || "Impossible de supprimer l'évènement.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-semibold text-[#0F3D3E]">
            Évènements médicaux
          </h1>
          <p className="mt-1 text-sm text-[#737873]">
            Gérez vos évènements et explorez ceux publiés par vos confrères
          </p>
        </div>

        <Link
          to="/dashboard/medecin/evenements/ajouter"
          className="inline-flex items-center gap-2 rounded-xl border border-[#E6E1D5] bg-white px-5 py-3 text-sm font-semibold text-[#0F3D3E] shadow-sm transition hover:border-[#0F3D3E]/30 hover:bg-[#FAF8F5] hover:shadow-md"
        >
          <Plus size={16} /> Ajouter un évènement
        </Link>
      </div>

      {/* Onglets de navigation */}
      {!loading && evenements.length > 0 && (
        <div className="mb-6 flex flex-wrap gap-2 border-b border-[#E6E1D5] pb-4">
          
          <button
            type="button"
            onClick={() => setActiveTab("mine")}
            className={`rounded-xl px-4 py-2 text-sm font-medium transition ${
              activeTab === "mine"
                ? "bg-[#0F3D3E] text-white shadow-sm"
                : "border border-[#E6E1D5] bg-white text-[#0F3D3E] hover:bg-[#FAF8F5]"
            }`}
          >
            Mes évènements ({countMine})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("autres")}
            className={`rounded-xl px-4 py-2 text-sm font-medium transition ${
              activeTab === "autres"
                ? "bg-[#0F3D3E] text-white shadow-sm"
                : "border border-[#E6E1D5] bg-white text-[#0F3D3E] hover:bg-[#FAF8F5]"
            }`}
          >
            Evènements confrères ({countAutres})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("favoris")}
            className={`inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-medium transition ${
              activeTab === "favoris"
                ? "bg-[#0F3D3E] text-white shadow-sm"
                : "border border-[#E6E1D5] bg-white text-[#0F3D3E] hover:bg-[#FAF8F5]"
            }`}
          >
            <Heart
              size={15}
              className={
                activeTab === "favoris"
                  ? "fill-red-400 text-red-400"
                  : "text-red-500"
              }
            />
            Mes favoris ({countFavoris})
          </button>
        </div>
      )}

      {/* Recherche et tri */}
      <div className="mb-8 flex flex-col gap-3 sm:flex-row">
        <div className="relative w-full sm:w-80">
          <Search
            size={16}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#737873]"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher par titre..."
            className="w-full rounded-xl border border-[#E6E1D5] bg-white py-3 pl-9 pr-4 text-sm text-[#0F3D3E] shadow-sm outline-none transition focus:border-[#2A6B59]"
          />
        </div>

        <div className="relative w-full sm:w-60">
          <ArrowUpDown
            size={16}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#737873]"
          />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full appearance-none rounded-xl border border-[#E6E1D5] bg-white py-3 pl-9 pr-4 text-sm text-[#0F3D3E] shadow-sm outline-none transition focus:border-[#2A6B59]"
          >
            {Object.entries(TRIS).map(([key, t]) => (
              <option key={key} value={key}>
                {t.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading && <p className="text-sm text-[#737873]">Chargement...</p>}
      {error && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {!loading && !error && filtered.length === 0 && (
        <div className="rounded-2xl border border-dashed border-[#E6E1D5] bg-white p-10 text-center text-sm text-[#737873]">
          {search.trim() || activeTab !== "tous"
            ? "Aucun évènement ne correspond à vos filtres."
            : "Aucun évènement pour le moment."}
        </div>
      )}

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((e) => {
          const st = STATUTS[e.statut] ?? STATUTS.en_attente;
          const StatutIcon = st.icon;
          const isAccepte = e.statut === "accepte";

          return (
            <article
              key={e.id}
              className="flex flex-col justify-between rounded-2xl border border-[#E6E1D5] bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
            >
              <div>
                <div className="mb-3 flex items-center justify-between gap-2">
                  {e.isMine ? (
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${st.cls}`}
                    >
                      <StatutIcon size={13} /> {st.label}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-[#FAF8F5] px-3 py-1 text-xs font-semibold text-[#0F3D3E] border border-[#E6E1D5]">
                      <UserCheck size={13} className="text-[#2A6B59]" /> Confrère
                    </span>
                  )}

                  <div className="flex items-center gap-2">
                    <span className="shrink-0 rounded-full bg-[#EBF3F0] px-3 py-1 text-xs font-bold text-[#2A6B59]">
                      {e.prix > 0 ? `${e.prix} DT` : "Gratuit"}
                    </span>

                    {isAccepte && (
                      <button
                        type="button"
                        disabled={togglingFavoriId === e.id}
                        onClick={() => handleToggleFavori(e)}
                        title={
                          e.isFavori
                            ? "Retirer des favoris"
                            : "Ajouter aux favoris"
                        }
                        aria-label={
                          e.isFavori
                            ? "Retirer des favoris"
                            : "Ajouter aux favoris"
                        }
                        className={`rounded-full p-2 transition ${
                          e.isFavori
                            ? "bg-red-50 text-red-600 hover:bg-red-100"
                            : "bg-[#FAF8F5] text-[#737873] hover:bg-[#EBF3F0] hover:text-red-500"
                        } disabled:opacity-50`}
                      >
                        <Heart
                          size={15}
                          className={e.isFavori ? "fill-red-500 text-red-500" : ""}
                        />
                      </button>
                    )}
                  </div>
                </div>

                <h2 className="text-lg font-semibold text-[#0F3D3E]">{e.titre}</h2>

                {!e.isMine && e.auteurNom && (
                  <p className="mt-1 text-xs text-[#737873]">
                    Organisé par :{" "}
                    <span className="font-semibold text-[#0F3D3E]">
                      Dr. {e.auteurNom}
                    </span>
                  </p>
                )}

                <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-[#737873]">
                  {e.description}
                </p>

                <ul className="mt-4 space-y-2 text-sm text-[#4A4D4A]">
                  <li className="flex items-center gap-2">
                    <CalendarDays size={15} className="text-[#2A6B59]" />
                    {fmt(e.dateDebut)} → {fmt(e.dateFin)}
                  </li>
                  <li className="flex items-center gap-2">
                    <Clock size={15} className="text-[#2A6B59]" /> {e.duree} h
                  </li>
                  <li className="flex items-center gap-2">
                    <MapPin size={15} className="text-[#2A6B59]" /> {e.localisation}
                  </li>
                  <li className="flex items-center gap-2">
                    <Users size={15} className="text-[#2A6B59]" /> {e.nombreDeParticipant} participants
                  </li>
                </ul>

                {e.isMine && (
                  <div className={`mt-4 rounded-lg px-3 py-2 text-xs ${st.infoCls}`}>
                    <p>{st.info}</p>
                    {e.statut === "refuse" && e.motifRefus && (
                      <p className="mt-1 font-semibold">Motif : {e.motifRefus}</p>
                    )}
                    {e.statut !== "en_attente" && e.dateDecision && (
                      <p className="mt-1 opacity-80">Décision du {fmt(e.dateDecision)}</p>
                    )}
                  </div>
                )}
              </div>

              <div className="mt-5 flex flex-wrap items-center justify-end gap-2 border-t border-[#E6E1D5] pt-4">
                <Link
                  to={`/dashboard/medecin/evenements/${e.id}`}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-[#2A6B59]/25 bg-[#EBF3F0]/60 px-3 py-2 text-xs font-semibold text-[#2A6B59] transition hover:bg-[#2A6B59] hover:text-white"
                >
                  <Eye size={14} /> Détails
                </Link>

                {e.isMine && (
                  <>
                    <Link
                      to={`/dashboard/medecin/evenements/modifier/${e.id}`}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-[#0F3D3E]/20 bg-[#FAF8F5] px-3 py-2 text-xs font-semibold text-[#0F3D3E] transition hover:bg-[#0F3D3E] hover:text-white"
                    >
                      <Pencil size={14} /> Modifier
                    </Link>
                    <button
                      type="button"
                      onClick={() => handleDelete(e.id, e.titre)}
                      disabled={deletingId === e.id}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 transition hover:bg-red-600 hover:text-white disabled:opacity-50"
                    >
                      <Trash2 size={14} />
                      {deletingId === e.id ? "Suppression..." : "Supprimer"}
                    </button>
                  </>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}