import { useEffect, useState, useCallback } from "react";
import { Clock, Award, FileText, CheckCircle, XCircle, Shield } from "lucide-react";
import { useAuth } from "../auth/AuthContext";

export default function AdminExamens() {
  const [examens, setExamens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [filter, setFilter] = useState("all"); // all | brouillon | publié | archivé
  const { token } = useAuth();

  const fetchExamens = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/examens", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setExamens(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      try {
        const res = await fetch("/api/admin/examens", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok && isMounted) {
          const data = await res.json();
          setExamens(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, [token]);

  const handleApprove = async (id) => {
    setActionLoading(id);
    try {
      const res = await fetch(`/api/admin/examens/${id}/approve`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        await fetchExamens();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (id) => {
    if (!window.confirm("Voulez-vous vraiment rejeter / archiver cet examen ?")) return;
    setActionLoading(id);
    try {
      const res = await fetch(`/api/admin/examens/${id}/reject`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        await fetchExamens();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(null);
    }
  };

  const filtered = examens.filter((e) => {
    if (filter === "all") return true;
    return e.statut === filter;
  });

  const statusBadge = (statut) => {
    const styles = {
      brouillon: "bg-amber-100 text-amber-700",
      publié: "bg-green-100 text-green-700",
      archivé: "bg-gray-100 text-gray-600",
    };
    return (
      <span
        className={`text-xs font-medium px-2.5 py-1 rounded-full ${
          styles[statut] || "bg-gray-100 text-gray-600"
        }`}
      >
        {statut}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-[#737873]">Chargement des examens...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="font-serif text-3xl font-semibold text-[#0F3D3E] flex items-center gap-2">
            <Shield size={28} className="text-[#D4AF37]" />
            Gestion des Examens
          </h1>
          <p className="mt-1 text-sm text-[#737873]">
            Validez ou rejetez les examens soumis par les médecins
          </p>
        </div>
      </div>

      {/* Filtres */}
      <div className="flex flex-wrap gap-2 mb-6">
        {[
          { key: "all", label: "Tous" },
          { key: "brouillon", label: "En attente" },
          { key: "publié", label: "Publiés" },
          { key: "archivé", label: "Archivés" },
        ].map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
              filter === f.key
                ? "bg-[#0F3D3E] text-white"
                : "bg-white border border-[#E6E1D5] text-[#0F3D3E] hover:bg-[#FAF8F5]"
            }`}
          >
            {f.label}
            {f.key !== "all" && (
              <span className="ml-1.5 text-xs opacity-70">
                ({examens.filter((e) => e.statut === f.key).length})
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Liste vide */}
      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#E6E1D5] bg-white p-12 text-center">
          <FileText size={40} className="mx-auto text-[#D4AF37] mb-4" />
          <p className="text-[#0F3D3E] font-medium">Aucun examen trouvé</p>
          <p className="text-sm text-[#737873] mt-1">
            {filter === "brouillon"
              ? "Aucun examen en attente de validation."
              : "Aucun examen pour ce filtre."}
          </p>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((examen) => (
            <div
              key={examen.id}
              className="rounded-2xl border border-[#E6E1D5] bg-white p-6 shadow-sm hover:shadow-md transition"
            >
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-semibold text-[#0F3D3E] text-lg line-clamp-2">
                  {examen.titre}
                </h3>
                {statusBadge(examen.statut)}
              </div>

              {examen.instructions && (
                <p className="mt-2 text-sm text-[#737873] line-clamp-2">
                  {examen.instructions}
                </p>
              )}

              <div className="mt-4 space-y-2 text-sm text-[#737873]">
                <div className="flex items-center gap-2">
                  <Clock size={14} />
                  {examen.duree} min
                </div>
                <div className="flex items-center gap-2">
                  <Award size={14} />
                  {examen.pointsTotaux} pts (passage : {examen.pointsDePassage})
                </div>
                <div className="flex items-center gap-2">
                  <FileText size={14} />
                  {examen.questionsCount} question(s)
                </div>
              </div>

              <p className="mt-3 text-xs text-[#A0A0A0]">
                Créé le {examen.dateCreation}
              </p>

              {/* Actions admin — en attente */}
              {examen.statut === "brouillon" && (
                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => handleApprove(examen.id)}
                    disabled={actionLoading === examen.id}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-green-600 px-3 py-2 text-xs font-semibold text-white hover:bg-green-700 disabled:opacity-60 transition"
                  >
                    <CheckCircle size={14} />
                    {actionLoading === examen.id ? "..." : "Approuver"}
                  </button>
                  <button
                    onClick={() => handleReject(examen.id)}
                    disabled={actionLoading === examen.id}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-100 disabled:opacity-60 transition"
                  >
                    <XCircle size={14} />
                    Rejeter
                  </button>
                </div>
              )}

              {/* Actions admin — déjà publié */}
              {examen.statut === "publié" && (
                <div className="mt-4">
                  <button
                    onClick={() => handleReject(examen.id)}
                    disabled={actionLoading === examen.id}
                    className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 disabled:opacity-60 transition"
                  >
                    <XCircle size={14} />
                    Archiver
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}