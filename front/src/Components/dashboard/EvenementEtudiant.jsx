import { useEffect, useMemo, useState } from "react";
import {
  Search,
  MapPin,
  Users,
  Clock,
  CalendarDays,
  ArrowUpDown,
  User as UserIcon,
  Heart,
} from "lucide-react";

const fmt = (iso) =>
  iso
    ? new Date(iso).toLocaleString("fr-FR", { dateStyle: "medium", timeStyle: "short" })
    : "—";

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

export default function EvenementsEtudiant() {
  const [evenements, setEvenements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("date");
  const [onlyFavoris, setOnlyFavoris] = useState(false);
  const [togglingIds, setTogglingIds] = useState({});

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/evenements/publies", { credentials: "include" });
        if (!res.ok) throw new Error();
        const data = await res.json();
        if (!cancelled) setEvenements(data);
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

  const handleToggleFavori = async (id) => {
    if (togglingIds[id]) return;

    const current = evenements.find((e) => e.id === id);
    if (!current) return;

    const optimisticValue = !current.isFavori;

    setTogglingIds((prev) => ({ ...prev, [id]: true }));
    setEvenements((prev) =>
      prev.map((e) => (e.id === id ? { ...e, isFavori: optimisticValue } : e))
    );

    try {
      const res = await fetch(`/api/evenements/${id}/favori`, {
        method: "POST",
        credentials: "include",
      });

      if (!res.ok) throw new Error();
      const data = await res.json();

      setEvenements((prev) =>
        prev.map((e) => (e.id === id ? { ...e, isFavori: Boolean(data.isFavori) } : e))
      );
    } catch {
      // Annule la mise à jour optimiste en cas d'erreur
      setEvenements((prev) =>
        prev.map((e) => (e.id === id ? { ...e, isFavori: current.isFavori } : e))
      );
      setError("Impossible de mettre à jour vos favoris.");
    } finally {
      setTogglingIds((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
    }
  };

  const favorisCount = useMemo(
    () => evenements.filter((e) => e.isFavori).length,
    [evenements]
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();

    let list = evenements.filter((e) => {
      if (onlyFavoris && !e.isFavori) return false;
      if (q && !(e.titre ?? "").toLowerCase().includes(q)) return false;
      return true;
    });

    const sorter = TRIS[sortBy]?.fn;
    if (sorter) list = [...list].sort(sorter);

    return list;
  }, [evenements, search, sortBy, onlyFavoris]);

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-serif text-3xl font-semibold text-[#0F3D3E]">Évènements</h1>

        <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
          <button
            type="button"
            onClick={() => setOnlyFavoris((prev) => !prev)}
            className={`inline-flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium shadow-sm transition ${
              onlyFavoris
                ? "border-[#2A6B59] bg-[#2A6B59] text-white"
                : "border-[#E6E1D5] bg-white text-[#0F3D3E] hover:border-[#2A6B59]"
            }`}
          >
            <Heart
              size={16}
              className={onlyFavoris ? "fill-white text-white" : "text-[#2A6B59]"}
            />
            <span>Mes favoris ({favorisCount})</span>
          </button>

          <div className="relative w-full sm:w-72">
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
      </div>

      {loading && <p className="text-sm text-[#737873]">Chargement...</p>}

      {error && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {!loading && !error && filtered.length === 0 && (
        <div className="rounded-2xl border border-dashed border-[#E6E1D5] bg-white p-10 text-center text-sm text-[#737873]">
          {onlyFavoris
            ? "Vous n'avez aucun évènement en favoris."
            : search.trim()
            ? "Aucun évènement ne correspond à votre recherche."
            : "Aucun évènement disponible pour le moment."}
        </div>
      )}

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((e) => (
          <article
            key={e.id}
            className="flex flex-col rounded-2xl border border-[#E6E1D5] bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
          >
            <div className="mb-3 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => handleToggleFavori(e.id)}
                disabled={Boolean(togglingIds[e.id])}
                aria-label={
                  e.isFavori ? "Retirer des favoris" : "Ajouter aux favoris"
                }
                title={e.isFavori ? "Retirer des favoris" : "Ajouter aux favoris"}
                className={`inline-flex h-9 w-9 items-center justify-center rounded-full border transition ${
                  e.isFavori
                    ? "border-red-200 bg-red-50 text-red-600"
                    : "border-[#E6E1D5] bg-white text-[#737873] hover:border-red-200 hover:text-red-500"
                }`}
              >
                <Heart
                  size={17}
                  className={e.isFavori ? "fill-red-500 text-red-500" : ""}
                />
              </button>

              <span className="shrink-0 rounded-full bg-[#EBF3F0] px-3 py-1 text-xs font-bold text-[#2A6B59]">
                {e.prix > 0 ? `${e.prix} DT` : "Gratuit"}
              </span>
            </div>

            <h2 className="text-lg font-semibold text-[#0F3D3E]">{e.titre}</h2>

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
              {e.auteurNom && (
                <li className="flex items-center gap-2">
                  <UserIcon size={15} className="text-[#2A6B59]" /> Organisé par {e.auteurNom}
                </li>
              )}
            </ul>
          </article>
        ))}
      </div>
    </div>
  );
}