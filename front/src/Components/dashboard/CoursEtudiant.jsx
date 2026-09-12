import { useEffect, useState, useMemo } from "react";
import {
  BookOpen,
  Clock,
  Globe,
  FileText,
  Video,
  Download,
  Search,
  Filter,
} from "lucide-react";

// Options fixes (affichées dans les filtres)
const NIVEAUX = ["Débutant", "Intermédiaire", "Avancé"];
const LANGUES = ["Français", "Arabe", "Anglais"];

export default function CoursEtudiant() {
  const [cours, setCours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filtres & recherche
  const [search, setSearch] = useState("");
  const [langue, setLangue] = useState("");
  const [niveau, setNiveau] = useState("");

  useEffect(() => {
    const fetchCours = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch("/api/cours/public", {
          credentials: "include",
        });

        if (!res.ok) {
          throw new Error("Impossible de charger les cours.");
        }

        const data = await res.json();
        setCours(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(err);
        setError(err.message || "Une erreur est survenue.");
      } finally {
        setLoading(false);
      }
    };

    fetchCours();
  }, []);

  // Filtrage côté client (insensible à la casse)
  const coursFiltres = useMemo(() => {
    const term = search.trim().toLowerCase();

    return cours.filter((c) => {
      const matchSearch =
        !term ||
        (c.titre && c.titre.toLowerCase().includes(term)) ||
        (c.description && c.description.toLowerCase().includes(term));

      const matchLangue =
        !langue ||
        (c.langueCours &&
          c.langueCours.toLowerCase() === langue.toLowerCase());

      const matchNiveau =
        !niveau ||
        (c.niveauCours &&
          c.niveauCours.toLowerCase() === niveau.toLowerCase());

      return matchSearch && matchLangue && matchNiveau;
    });
  }, [cours, search, langue, niveau]);

  const resetFiltres = () => {
    setSearch("");
    setLangue("");
    setNiveau("");
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case "video":
        return <Video size={18} className="text-[#0F3D3E]" />;
      case "pdf":
      case "word":
        return <FileText size={18} className="text-[#0F3D3E]" />;
      default:
        return <BookOpen size={18} className="text-[#0F3D3E]" />;
    }
  };

  const getTypeLabel = (type) => {
    switch (type) {
      case "video":
        return "Vidéo";
      case "pdf":
        return "PDF";
      case "word":
        return "Word";
      default:
        return type || "Document";
    }
  };

  return (
    <div className="min-h-screen bg-[#FBF9F4] p-6 md:p-8">
      <div className="mx-auto max-w-6xl">
        {/* En-tête */}
        <div className="mb-8">
          <h1 className="font-serif text-3xl font-bold text-[#0F3D3E]">
            Catalogue des cours
          </h1>
          <p className="mt-2 text-[#737873]">
            Accédez aux cours validés par l’équipe pédagogique.
          </p>
        </div>

        {/* Barre de recherche + filtres */}
        <div className="mb-8 rounded-2xl border border-[#E6E1D5] bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end">
            {/* Recherche */}
            <div className="flex-1">
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-[#737873]">
                Rechercher
              </label>
              <div className="relative">
                <Search
                  size={18}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#737873]"
                />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Titre ou description..."
                  className="w-full rounded-xl border border-[#E6E1D5] bg-[#FAF8F5] py-2.5 pl-11 pr-4 text-sm text-[#0F3D3E] outline-none transition focus:border-[#2A6B59] focus:ring-2 focus:ring-[#2A6B59]/20"
                />
              </div>
            </div>

            {/* Filtre Langue */}
            <div className="w-full lg:w-48">
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-[#737873]">
                Langue
              </label>
              <div className="relative">
                <Globe
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#737873]"
                />
                <select
                  value={langue}
                  onChange={(e) => setLangue(e.target.value)}
                  className="w-full appearance-none rounded-xl border border-[#E6E1D5] bg-[#FAF8F5] py-2.5 pl-10 pr-8 text-sm text-[#0F3D3E] outline-none transition focus:border-[#2A6B59] focus:ring-2 focus:ring-[#2A6B59]/20"
                >
                  <option value="">Toutes les langues</option>
                  {LANGUES.map((l) => (
                    <option key={l} value={l}>
                      {l}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Filtre Niveau */}
            <div className="w-full lg:w-48">
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-[#737873]">
                Niveau
              </label>
              <div className="relative">
                <Filter
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#737873]"
                />
                <select
                  value={niveau}
                  onChange={(e) => setNiveau(e.target.value)}
                  className="w-full appearance-none rounded-xl border border-[#E6E1D5] bg-[#FAF8F5] py-2.5 pl-10 pr-8 text-sm text-[#0F3D3E] outline-none transition focus:border-[#2A6B59] focus:ring-2 focus:ring-[#2A6B59]/20"
                >
                  <option value="">Tous les niveaux</option>
                  {NIVEAUX.map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Bouton réinitialiser */}
            {(search || langue || niveau) && (
              <button
                type="button"
                onClick={resetFiltres}
                className="rounded-xl border border-[#E6E1D5] bg-white px-4 py-2.5 text-sm font-medium text-[#737873] transition hover:border-[#0F3D3E]/30 hover:text-[#0F3D3E]"
              >
                Réinitialiser
              </button>
            )}
          </div>

          {/* Compteur de résultats */}
          {!loading && !error && (
            <p className="mt-4 text-sm text-[#737873]">
              {coursFiltres.length} cours trouvé
              {coursFiltres.length !== 1 ? "s" : ""}
              {(search || langue || niveau) && " (filtrés)"}
            </p>
          )}
        </div>

        {/* États */}
        {loading && (
          <div className="flex justify-center py-20">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#0F3D3E] border-t-transparent" />
          </div>
        )}

        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-red-700">
            {error}
          </div>
        )}

        {!loading && !error && coursFiltres.length === 0 && (
          <div className="rounded-2xl border border-[#E6E1D5] bg-white px-6 py-16 text-center">
            <BookOpen size={40} className="mx-auto text-[#0F3D3E]/40" />
            <p className="mt-4 text-lg font-medium text-[#0F3D3E]">
              Aucun cours trouvé
            </p>
            <p className="mt-1 text-sm text-[#737873]">
              Essayez de modifier votre recherche ou vos filtres.
            </p>
            {(search || langue || niveau) && (
              <button
                type="button"
                onClick={resetFiltres}
                className="mt-4 rounded-xl bg-[#2A6B59] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#1e5244]"
              >
                Réinitialiser les filtres
              </button>
            )}
          </div>
        )}

        {/* Liste des cours */}
        {!loading && !error && coursFiltres.length > 0 && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {coursFiltres.map((c) => (
              <article
                key={c.id}
                className="group flex flex-col overflow-hidden rounded-2xl border border-[#E6E1D5] bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#0F3D3E]/25 hover:shadow-lg"
              >
                {/* En-tête de carte */}
                <div className="flex items-start justify-between gap-3 border-b border-[#E6E1D5]/70 bg-[#FAF8F5] px-5 py-4">
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white shadow-sm">
                      {getTypeIcon(c.typeContenu)}
                    </span>
                    <span className="text-xs font-semibold uppercase tracking-wide text-[#737873]">
                      {getTypeLabel(c.typeContenu)}
                    </span>
                  </div>
                  <span className="rounded-full bg-[#EBF3F0] px-2.5 py-1 text-[11px] font-medium text-[#2A6B59]">
                    {c.niveauCours || "—"}
                  </span>
                </div>

                {/* Corps */}
                <div className="flex flex-1 flex-col p-5">
                  <h2 className="font-serif text-lg font-semibold leading-snug text-[#0F3D3E] line-clamp-2">
                    {c.titre}
                  </h2>

                  <p className="mt-2 flex-1 text-sm leading-relaxed text-[#737873] line-clamp-3">
                    {c.description}
                  </p>

                  <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-[#737873]">
                    <span className="inline-flex items-center gap-1.5">
                      <Clock size={14} />
                      {c.duree ? `${c.duree} min` : "—"}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <Globe size={14} />
                      {c.langueCours || "—"}
                    </span>
                  </div>
                </div>

                {/* Pied de carte */}
                <div className="border-t border-[#E6E1D5]/70 px-5 py-3.5">
                  {c.contenuCours ? (
                    <a
                      href={c.contenuCours}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#2A6B59] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#1e5244]"
                    >
                      <Download size={16} />
                      Accéder au cours
                    </a>
                  ) : (
                    <span className="block text-center text-sm text-[#737873]">
                      Fichier non disponible
                    </span>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}