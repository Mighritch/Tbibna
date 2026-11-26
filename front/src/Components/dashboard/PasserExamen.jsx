import { useEffect, useState, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Clock,
  Loader2,
  AlertCircle,
  CheckCircle2,
  ArrowLeft,
  Send,
  AlertTriangle,
} from "lucide-react";

export default function PasserExamen() {
  const { id } = useParams();

  const [examen, setExamen] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reponses, setReponses] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(null);

  // Fonction de soumission mémorisée avec useCallback
  const handleSubmit = useCallback(
    async (auto = false) => {
      if (submitted || submitting) return;

      if (!auto) {
        const confirm = window.confirm(
          "Êtes-vous sûr de vouloir soumettre vos réponses ? Cette action est définitive."
        );
        if (!confirm) return;
      }

      try {
        setSubmitting(true);
        const token = localStorage.getItem("token");

        const reponsesArray = (examen?.questions || []).map((_, index) => ({
          questionIndex: index,
          reponse: reponses[index] || "",
        }));

        const response = await fetch(`/api/examens/${id}/soumettre`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ reponses: reponsesArray }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Erreur lors de la soumission");
        }

        setSubmitted(true);
      } catch (err) {
        alert(err.message);
      } finally {
        setSubmitting(false);
      }
    },
    [examen, id, reponses, submitted, submitting]
  );

  // Chargement de l'examen
  useEffect(() => {
    let isMounted = true;

    const fetchExamen = async () => {
      try {
        setLoading(true);
        setError(null);

        const token = localStorage.getItem("token");
        const response = await fetch(`/api/examens/${id}/etudiant`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Impossible de charger l'examen");
        }

        if (isMounted) {
          setExamen(data);

          const initialReponses = {};
          (data.questions || []).forEach((_, index) => {
            initialReponses[index] = "";
          });
          setReponses(initialReponses);

          if (data.duree) {
            setTimeLeft(data.duree * 60);
          }
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || "Une erreur est survenue");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchExamen();

    return () => {
      isMounted = false;
    };
  }, [id]);

  // Chronomètre
  useEffect(() => {
    if (timeLeft === null || timeLeft <= 0 || submitted) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit(true); // Auto-soumission
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, submitted, handleSubmit]);

  const formatTime = (seconds) => {
    if (seconds === null) return "--:--";
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const handleChange = (index, value) => {
    setReponses((prev) => ({
      ...prev,
      [index]: value,
    }));
  };

  // ---------- États de chargement / erreur ----------
  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] flex flex-col items-center justify-center">
        <Loader2 size={40} className="animate-spin text-[#0F3D3E]" />
        <p className="mt-4 text-sm text-[#737873]">Chargement de l'examen...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] flex flex-col items-center justify-center px-4">
        <AlertCircle size={48} className="text-red-500" />
        <p className="mt-4 text-lg font-medium text-red-600 text-center">{error}</p>
        <Link
          to="/dashboard/etudiant/examens"
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#0F3D3E] px-5 py-2.5 text-sm font-semibold text-white"
        >
          <ArrowLeft size={16} />
          Retour aux examens
        </Link>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] flex flex-col items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-2xl border border-[#E6E1D5] p-8 text-center shadow-sm">
          <CheckCircle2 size={56} className="mx-auto text-green-600" />
          <h2 className="mt-4 text-2xl font-semibold text-[#0F3D3E]">
            Examen soumis avec succès !
          </h2>
          <p className="mt-2 text-sm text-[#737873]">
            Vos réponses ont bien été enregistrées. Vous pourrez consulter vos résultats plus tard.
          </p>
          <Link
            to="/dashboard/etudiant/examens"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#0F3D3E] px-6 py-3 text-sm font-semibold text-white hover:bg-[#082829] transition"
          >
            <ArrowLeft size={16} />
            Retour à la liste des examens
          </Link>
        </div>
      </div>
    );
  }

  // ---------- Page principale ----------
  return (
    <div className="min-h-screen bg-[#FAF8F5] py-8 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        {/* Header + Chrono */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              to="/dashboard/etudiant/examens"
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#E6E1D5] bg-white text-[#0F3D3E] hover:bg-[#0F3D3E] hover:text-white transition"
            >
              <ArrowLeft size={18} />
            </Link>
            <div>
              <h1 className="font-serif text-2xl font-semibold text-[#0F3D3E] line-clamp-1">
                {examen.titre}
              </h1>
              <p className="text-sm text-[#737873]">
                {examen.questions?.length || 0} question(s) • {examen.pointsTotaux} pts
              </p>
            </div>
          </div>

          <div
            className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold ${
              timeLeft !== null && timeLeft < 300
                ? "bg-red-100 text-red-700"
                : "bg-[#0F3D3E] text-white"
            }`}
          >
            <Clock size={18} />
            <span>{formatTime(timeLeft)}</span>
          </div>
        </div>

        {/* Instructions */}
        {examen.instructions && (
          <div className="mb-8 rounded-2xl border border-[#E6E1D5] bg-white p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle size={18} className="text-[#D4AF37]" />
              <h2 className="font-semibold text-[#0F3D3E]">Instructions</h2>
            </div>
            <p className="text-sm text-[#4A4D4A] leading-relaxed whitespace-pre-line">
              {examen.instructions}
            </p>
          </div>
        )}

        {/* Liste des questions + champs de réponse */}
        <div className="space-y-6">
          {(examen.questions || []).map((question, index) => {
            const q = typeof question === "string" ? { enonce: question } : question;
            const enonce = q.enonce || q.texte || q.question || `Question ${index + 1}`;
            const type = q.type || (q.options || q.choix ? "qcm" : "ouverte");
            const options = q.options || q.choix || [];
            const points = q.points || q.note || 1;

            return (
              <div
                key={index}
                className="rounded-2xl border border-[#E6E1D5] bg-white p-6 shadow-sm"
              >
                <div className="flex items-start justify-between gap-4 mb-4">
                  <h3 className="text-base font-semibold text-[#0F3D3E]">
                    <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-[#EBF3F0] text-[#2A6B59] text-sm mr-2">
                      {index + 1}
                    </span>
                    {enonce}
                  </h3>
                  <span className="shrink-0 rounded-full bg-[#FAF8F5] px-2.5 py-1 text-xs font-medium text-[#737873]">
                    {points} pt{points > 1 ? "s" : ""}
                  </span>
                </div>

                {type === "qcm" && options.length > 0 ? (
                  <div className="space-y-2.5 ml-9">
                    {options.map((opt, optIndex) => {
                      const value =
                        typeof opt === "string"
                          ? opt
                          : opt.texte || opt.label || `Option ${optIndex + 1}`;
                      return (
                        <label
                          key={optIndex}
                          className={`flex items-center gap-3 rounded-xl border px-4 py-3 cursor-pointer transition-all ${
                            reponses[index] === value
                              ? "border-[#0F3D3E] bg-[#EBF3F0]"
                              : "border-[#E6E1D5] hover:border-[#0F3D3E]/40"
                          }`}
                        >
                          <input
                            type="radio"
                            name={`question-${index}`}
                            value={value}
                            checked={reponses[index] === value}
                            onChange={(e) => handleChange(index, e.target.value)}
                            className="h-4 w-4 text-[#0F3D3E] focus:ring-[#0F3D3E]"
                          />
                          <span className="text-sm text-[#0F3D3E]">{value}</span>
                        </label>
                      );
                    })}
                  </div>
                ) : (
                  <div className="ml-9">
                    <textarea
                      value={reponses[index] || ""}
                      onChange={(e) => handleChange(index, e.target.value)}
                      placeholder="Écrivez votre réponse ici..."
                      rows={4}
                      className="w-full rounded-xl border border-[#E6E1D5] bg-[#FAF8F5] px-4 py-3 text-sm text-[#0F3D3E] placeholder:text-[#A0A0A0] focus:border-[#0F3D3E] focus:outline-none focus:ring-2 focus:ring-[#0F3D3E]/20 resize-y"
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Bouton de soumission */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-[#E6E1D5] pt-8">
          <p className="text-sm text-[#737873]">
            {Object.values(reponses).filter((r) => r && r.trim() !== "").length} /{" "}
            {examen.questions?.length || 0} question(s) répondue(s)
          </p>

          <button
            onClick={() => handleSubmit(false)}
            disabled={submitting}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#2A6B59] px-8 py-3.5 text-sm font-semibold text-white transition-all hover:bg-[#1e4f42] hover:shadow-md disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Soumission en cours...
              </>
            ) : (
              <>
                <Send size={18} />
                Soumettre mes réponses
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}