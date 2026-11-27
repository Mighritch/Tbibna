import { useEffect, useMemo, useState } from "react";
import {
  Search,
  MapPin,
  Users,
  Clock,
  CalendarDays,
  User as UserIcon,
} from "lucide-react";

const fmt = (iso) =>
  iso
    ? new Date(iso).toLocaleString("fr-FR", { dateStyle: "medium", timeStyle: "short" })
    : "—";

export default function EvenementsEtudiant() {
  const [evenements, setEvenements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

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

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return evenements;
    return evenements.filter((e) =>
      [e.titre, e.description, e.localisation, e.auteurNom]
        .filter(Boolean)
        .some((v) => v.toLowerCase().includes(q))
    );
  }, [evenements, search]);

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-serif text-3xl font-semibold text-[#0F3D3E]">Évènements</h1>

        <div className="relative w-full sm:w-80">
          <Search
            size={16}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#737873]"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher un évènement..."
            className="w-full rounded-xl border border-[#E6E1D5] bg-white py-3 pl-9 pr-4 text-sm text-[#0F3D3E] shadow-sm outline-none transition focus:border-[#2A6B59]"
          />
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
          Aucun évènement disponible pour le moment.
        </div>
      )}

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((e) => (
          <article
            key={e.id}
            className="flex flex-col rounded-2xl border border-[#E6E1D5] bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
          >
            <div className="mb-3 flex items-center justify-end">
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