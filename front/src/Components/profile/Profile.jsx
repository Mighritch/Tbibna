// src/Components/profile/Profile.jsx

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  User as UserIcon,
  Mail,
  Calendar,
  GraduationCap,
  Stethoscope,
  MapPin,
  Building2,
  Award,
  ArrowLeft,
  Pencil,
  X,
  Save,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

// =====================================================
// Facultés de médecine en Tunisie
// =====================================================
const FACULTES_MEDECINE = [
  "Faculté de Médecine de Tunis",
  "Faculté de Médecine de Sousse",
  "Faculté de Médecine de Monastir",
  "Faculté de Médecine de Sfax",
];

export default function Profile() {
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [saveSuccess, setSaveSuccess] = useState("");
  const [form, setForm] = useState(null);

  // =====================================================
  // Construire le formulaire à partir du profil
  // =====================================================
  const buildFormFromProfile = (data) => {
    const base = {
      nom: data.nom || "",
      prenom: data.prenom || "",
      dateNaissance: data.dateNaissance || "",
    };

    // -------------------------
    // Étudiant
    // -------------------------
    if (data.role === "ROLE_ETUDIANT" && data.etudiant) {
      return {
        ...base,
        faculte: data.etudiant.faculte || "",
        numeroCarteEtudiant: data.etudiant.numeroCarteEtudiant || "",
        niveauEtude: data.etudiant.niveauEtude || "",
        pays: data.etudiant.pays || "",
        ville: data.etudiant.ville || "",
      };
    }

    // -------------------------
    // Médecin
    // -------------------------
    if (data.role === "ROLE_MEDECIN" && data.medecin) {
      return {
        ...base,
        numeroLicence: data.medecin.numeroLicence || "",
        specialite: data.medecin.specialite || "",
        anneeExperience:
          data.medecin.anneeExperience !== null &&
          data.medecin.anneeExperience !== undefined
            ? data.medecin.anneeExperience
            : "",
        hopital: data.medecin.hopital || "",
        faculte: data.medecin.faculte || "",
      };
    }

    return base;
  };

  // =====================================================
  // Récupérer le profil
  // =====================================================
  const fetchProfile = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/profile", {
        credentials: "include",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.error || "Erreur lors du chargement du profil"
        );
      }

      setProfile(data);
      setForm(buildFormFromProfile(data));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // Chargement initial
  // =====================================================
  useEffect(() => {
    // fetchProfile est asynchrone : le setState qu'elle déclenche
    // intervient après l'appel réseau, pas de manière synchrone.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchProfile();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // =====================================================
  // Recharger le profil
  // =====================================================
  const loadProfile = () => {
    fetchProfile();
  };

  // =====================================================
  // Gestion des champs
  // =====================================================
  const handleChange = (field) => (e) => {
    const value = e.target.value;

    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // =====================================================
  // Commencer la modification
  // =====================================================
  const startEditing = () => {
    setForm(buildFormFromProfile(profile));
    setSaveError("");
    setSaveSuccess("");
    setEditing(true);
  };

  // =====================================================
  // Annuler la modification
  // =====================================================
  const cancelEditing = () => {
    setForm(buildFormFromProfile(profile));
    setSaveError("");
    setEditing(false);
  };

  // =====================================================
  // Sauvegarder
  // =====================================================
  const handleSave = async (e) => {
    e.preventDefault();

    setSaving(true);
    setSaveError("");
    setSaveSuccess("");

    const payload = { ...form };

    // Conversion numéro carte étudiant
    if (
      profile?.role === "ROLE_ETUDIANT" &&
      payload.numeroCarteEtudiant !== ""
    ) {
      payload.numeroCarteEtudiant = Number(
        payload.numeroCarteEtudiant
      );
    }

    // Conversion années expérience
    if (
      profile?.role === "ROLE_MEDECIN" &&
      payload.anneeExperience !== ""
    ) {
      payload.anneeExperience = Number(
        payload.anneeExperience
      );
    }

    try {
      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Erreur lors de la mise à jour du profil"
        );
      }

      setSaveSuccess("Profil mis à jour avec succès !");
      setEditing(false);

      loadProfile();
    } catch (err) {
      setSaveError(err.message);
    } finally {
      setSaving(false);
    }
  };

  // =====================================================
  // Masquer message succès automatiquement
  // =====================================================
  useEffect(() => {
    if (saveSuccess) {
      const timer = setTimeout(() => {
        setSaveSuccess("");
      }, 4000);

      return () => clearTimeout(timer);
    }
  }, [saveSuccess]);

  // =====================================================
  // Loading
  // =====================================================
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FBF9F4]">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-[#0F3D3E]/30 border-t-[#0F3D3E]" />
      </div>
    );
  }

  // =====================================================
  // Erreur
  // =====================================================
  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#FBF9F4] px-4 text-center">
        <p className="font-medium text-red-600">{error}</p>

        <button
          onClick={() => navigate(-1)}
          className="rounded-xl border border-[#0F3D3E]/20 px-4 py-2 text-sm font-semibold text-[#0F3D3E] hover:bg-white"
        >
          Retour
        </button>
      </div>
    );
  }

  const isMedecin = profile?.role === "ROLE_MEDECIN";
  const isEtudiant = profile?.role === "ROLE_ETUDIANT";

  // =====================================================
  // Styles
  // =====================================================
  const inputClass =
    "w-full rounded-xl border border-[#E4DFD3] bg-white py-2.5 px-3.5 text-sm font-medium text-[#1C1C1A] outline-none transition-all duration-200 focus:border-[#0F3D3E] focus:ring-4 focus:ring-[#0F3D3E]/10";

  const labelClass =
    "mb-1.5 block text-xs font-bold uppercase tracking-widest text-[#0F3D3E]";

  // =====================================================
  // Rendu
  // =====================================================
  return (
    <div className="min-h-screen bg-[#FBF9F4] px-4 py-10">
      <div className="mx-auto max-w-3xl">

        {/* =================================================
            Retour + actions
        ================================================= */}
        <div className="mb-6 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#0F3D3E] hover:underline"
          >
            <ArrowLeft size={16} />
            Retour
          </button>

          {!editing && (
            <button
              onClick={startEditing}
              className="inline-flex items-center gap-2 rounded-xl bg-[#0F3D3E] px-4 py-2 text-sm font-semibold text-[#FBF9F4] transition-colors hover:bg-[#082829]"
            >
              <Pencil size={16} />
              Modifier
            </button>
          )}
        </div>

        {/* =================================================
            Notification succès
        ================================================= */}
        {saveSuccess && (
          <div className="mb-6 flex items-center gap-3 rounded-2xl border border-emerald-200/80 bg-emerald-50/90 p-4 text-sm text-emerald-700">
            <CheckCircle2
              size={18}
              className="shrink-0 text-emerald-600"
            />

            <span className="font-medium">
              {saveSuccess}
            </span>
          </div>
        )}

        {/* =================================================
            Notification erreur
        ================================================= */}
        {saveError && (
          <div className="mb-6 flex items-center gap-3 rounded-2xl border border-red-200/80 bg-red-50/90 p-4 text-sm text-red-700">
            <AlertCircle
              size={18}
              className="shrink-0 text-red-600"
            />

            <span className="font-medium">
              {saveError}
            </span>
          </div>
        )}

        {/* =================================================
            En-tête profil
        ================================================= */}
        <div className="mb-8 flex flex-col items-center gap-4 text-center sm:flex-row sm:text-left">
          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#0F3D3E] to-[#1A5658] text-[#E8C77E] shadow-lg">
            {isMedecin ? (
              <Stethoscope size={32} />
            ) : (
              <GraduationCap size={32} />
            )}
          </div>

          <div>
            <h1 className="font-serif text-3xl font-bold text-[#0F3D3E]">
              {profile?.prenom} {profile?.nom}
            </h1>

            <p className="mt-1 text-sm font-medium text-[#5C5A54]">
              {isMedecin ? "Médecin" : "Étudiant"}
            </p>
          </div>
        </div>

        <form onSubmit={handleSave}>

          {/* =================================================
              Informations générales
          ================================================= */}
          <div className="mb-6 rounded-2xl border border-[#E4DFD3] bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-xs font-bold uppercase tracking-widest text-[#0F3D3E]">
              Informations générales
            </h2>

            {!editing ? (
              <div className="grid gap-4 sm:grid-cols-2">

                {/* Email */}
                <div className="flex items-center gap-3">
                  <Mail
                    size={18}
                    className="text-[#B0AEA6]"
                  />

                  <div>
                    <p className="text-xs text-[#8A877F]">
                      Email
                    </p>

                    <p className="text-sm font-medium text-[#1C1C1A]">
                      {profile?.email}
                    </p>
                  </div>
                </div>

                {/* Date naissance */}
                <div className="flex items-center gap-3">
                  <Calendar
                    size={18}
                    className="text-[#B0AEA6]"
                  />

                  <div>
                    <p className="text-xs text-[#8A877F]">
                      Date de naissance
                    </p>

                    <p className="text-sm font-medium text-[#1C1C1A]">
                      {profile?.dateNaissance ||
                        "Non renseignée"}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">

                {/* Nom */}
                <div>
                  <label className={labelClass}>
                    Nom
                  </label>

                  <input
                    type="text"
                    value={form?.nom || ""}
                    onChange={handleChange("nom")}
                    className={inputClass}
                  />
                </div>

                {/* Prénom */}
                <div>
                  <label className={labelClass}>
                    Prénom
                  </label>

                  <input
                    type="text"
                    value={form?.prenom || ""}
                    onChange={handleChange("prenom")}
                    className={inputClass}
                  />
                </div>

                {/* Date naissance */}
                <div>
                  <label className={labelClass}>
                    Date de naissance
                  </label>

                  <input
                    type="date"
                    value={form?.dateNaissance || ""}
                    onChange={handleChange("dateNaissance")}
                    className={inputClass}
                  />
                </div>

                {/* Email */}
                <div>
                  <label className={labelClass}>
                    Email
                  </label>

                  <input
                    type="email"
                    value={profile?.email || ""}
                    disabled
                    className={`${inputClass} cursor-not-allowed bg-[#F4F0E6]/60 text-[#8A877F]`}
                  />

                  <p className="mt-1 text-xs text-[#B0AEA6]">
                    L'email ne peut pas être modifié ici.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* =================================================
              INFORMATIONS ÉTUDIANT
          ================================================= */}
          {isEtudiant && (
            <div className="mb-6 rounded-2xl border border-[#E4DFD3] bg-white p-6 shadow-sm">

              <h2 className="mb-4 text-xs font-bold uppercase tracking-widest text-[#0F3D3E]">
                Informations académiques
              </h2>

              {!editing ? (
                <div className="grid gap-4 sm:grid-cols-2">

                  {/* Faculté */}
                  <div className="flex items-center gap-3">
                    <Building2
                      size={18}
                      className="text-[#B0AEA6]"
                    />

                    <div>
                      <p className="text-xs text-[#8A877F]">
                        Faculté
                      </p>

                      <p className="text-sm font-medium text-[#1C1C1A]">
                        {profile.etudiant?.faculte || "—"}
                      </p>
                    </div>
                  </div>

                  {/* Niveau */}
                  <div className="flex items-center gap-3">
                    <GraduationCap
                      size={18}
                      className="text-[#B0AEA6]"
                    />

                    <div>
                      <p className="text-xs text-[#8A877F]">
                        Niveau d'étude
                      </p>

                      <p className="text-sm font-medium text-[#1C1C1A]">
                        {profile.etudiant?.niveauEtude || "—"}
                      </p>
                    </div>
                  </div>

                  {/* Carte étudiant */}
                  <div className="flex items-center gap-3">
                    <UserIcon
                      size={18}
                      className="text-[#B0AEA6]"
                    />

                    <div>
                      <p className="text-xs text-[#8A877F]">
                        N° carte étudiant
                      </p>

                      <p className="text-sm font-medium text-[#1C1C1A]">
                        {profile.etudiant
                          ?.numeroCarteEtudiant || "—"}
                      </p>
                    </div>
                  </div>

                  {/* Localisation */}
                  <div className="flex items-center gap-3">
                    <MapPin
                      size={18}
                      className="text-[#B0AEA6]"
                    />

                    <div>
                      <p className="text-xs text-[#8A877F]">
                        Localisation
                      </p>

                      <p className="text-sm font-medium text-[#1C1C1A]">
                        {[
                          profile.etudiant?.ville,
                          profile.etudiant?.pays,
                        ]
                          .filter(Boolean)
                          .join(", ") || "—"}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2">

                  {/* =================================================
                      FACULTÉ ÉTUDIANT - SELECT
                  ================================================= */}
                  <div className="sm:col-span-2">
                    <label className={labelClass}>
                      Faculté de médecine
                    </label>

                    <div className="relative">
                      <Building2
                        size={18}
                        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#8A877F]"
                      />

                      <select
                        value={form?.faculte || ""}
                        onChange={handleChange("faculte")}
                        className={`${inputClass} cursor-pointer appearance-none pl-10 pr-10`}
                      >
                        <option value="">
                          Sélectionnez votre faculté
                        </option>

                        {FACULTES_MEDECINE.map((faculte) => (
                          <option
                            key={faculte}
                            value={faculte}
                          >
                            {faculte}
                          </option>
                        ))}
                      </select>

                      <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#5C5A54]">
                        ▼
                      </span>
                    </div>

                    <p className="mt-1.5 text-xs text-[#8A877F]">
                      Sélectionnez la faculté de médecine dans
                      laquelle vous étudiez.
                    </p>
                  </div>

                  {/* Niveau */}
                  <div>
                    <label className={labelClass}>
                      Niveau d'étude
                    </label>

                    <input
                      type="text"
                      value={form?.niveauEtude || ""}
                      onChange={handleChange("niveauEtude")}
                      className={inputClass}
                      placeholder="Ex : 3ème année"
                    />
                  </div>

                  {/* Carte étudiant */}
                  <div>
                    <label className={labelClass}>
                      N° carte étudiant
                    </label>

                    <input
                      type="number"
                      value={
                        form?.numeroCarteEtudiant || ""
                      }
                      onChange={handleChange(
                        "numeroCarteEtudiant"
                      )}
                      className={inputClass}
                    />
                  </div>

                  {/* Ville */}
                  <div>
                    <label className={labelClass}>
                      Ville
                    </label>

                    <input
                      type="text"
                      value={form?.ville || ""}
                      onChange={handleChange("ville")}
                      className={inputClass}
                    />
                  </div>

                  {/* Pays */}
                  <div>
                    <label className={labelClass}>
                      Pays
                    </label>

                    <input
                      type="text"
                      value={form?.pays || ""}
                      onChange={handleChange("pays")}
                      className={inputClass}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* =================================================
              INFORMATIONS MÉDECIN
          ================================================= */}
          {isMedecin && (
            <div className="mb-6 rounded-2xl border border-[#E4DFD3] bg-white p-6 shadow-sm">

              <h2 className="mb-4 text-xs font-bold uppercase tracking-widest text-[#0F3D3E]">
                Informations professionnelles
              </h2>

              {!editing ? (
                <div className="grid gap-4 sm:grid-cols-2">

                  {/* Licence */}
                  <div className="flex items-center gap-3">
                    <Award
                      size={18}
                      className="text-[#B0AEA6]"
                    />

                    <div>
                      <p className="text-xs text-[#8A877F]">
                        N° de licence
                      </p>

                      <p className="text-sm font-medium text-[#1C1C1A]">
                        {profile.medecin?.numeroLicence ||
                          "—"}
                      </p>
                    </div>
                  </div>

                  {/* Spécialité */}
                  <div className="flex items-center gap-3">
                    <Stethoscope
                      size={18}
                      className="text-[#B0AEA6]"
                    />

                    <div>
                      <p className="text-xs text-[#8A877F]">
                        Spécialité
                      </p>

                      <p className="text-sm font-medium text-[#1C1C1A]">
                        {profile.medecin?.specialite || "—"}
                      </p>
                    </div>
                  </div>

                  {/* Hôpital */}
                  <div className="flex items-center gap-3">
                    <Building2
                      size={18}
                      className="text-[#B0AEA6]"
                    />

                    <div>
                      <p className="text-xs text-[#8A877F]">
                        Hôpital
                      </p>

                      <p className="text-sm font-medium text-[#1C1C1A]">
                        {profile.medecin?.hopital || "—"}
                      </p>
                    </div>
                  </div>

                  {/* Faculté */}
                  <div className="flex items-center gap-3">
                    <GraduationCap
                      size={18}
                      className="text-[#B0AEA6]"
                    />

                    <div>
                      <p className="text-xs text-[#8A877F]">
                        Faculté de médecine
                      </p>

                      <p className="text-sm font-medium text-[#1C1C1A]">
                        {profile.medecin?.faculte || "—"}
                      </p>
                    </div>
                  </div>

                  {/* Expérience */}
                  <div className="flex items-center gap-3">
                    <Calendar
                      size={18}
                      className="text-[#B0AEA6]"
                    />

                    <div>
                      <p className="text-xs text-[#8A877F]">
                        Années d'expérience
                      </p>

                      <p className="text-sm font-medium text-[#1C1C1A]">
                        {profile.medecin?.anneeExperience ??
                          "—"}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2">

                  {/* Licence */}
                  <div>
                    <label className={labelClass}>
                      N° de licence
                    </label>

                    <input
                      type="text"
                      value={form?.numeroLicence || ""}
                      onChange={handleChange("numeroLicence")}
                      className={inputClass}
                    />
                  </div>

                  {/* Spécialité */}
                  <div>
                    <label className={labelClass}>
                      Spécialité
                    </label>

                    <input
                      type="text"
                      value={form?.specialite || ""}
                      onChange={handleChange("specialite")}
                      className={inputClass}
                    />
                  </div>

                  {/* Hôpital */}
                  <div>
                    <label className={labelClass}>
                      Hôpital
                    </label>

                    <input
                      type="text"
                      value={form?.hopital || ""}
                      onChange={handleChange("hopital")}
                      className={inputClass}
                    />
                  </div>

                  {/* =================================================
                      FACULTÉ MÉDECIN - SELECT
                  ================================================= */}
                  <div>
                    <label className={labelClass}>
                      Faculté de médecine
                    </label>

                    <div className="relative">
                      <GraduationCap
                        size={18}
                        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#8A877F]"
                      />

                      <select
                        value={form?.faculte || ""}
                        onChange={handleChange("faculte")}
                        className={`${inputClass} cursor-pointer appearance-none pl-10 pr-10`}
                      >
                        <option value="">
                          Sélectionnez votre faculté
                        </option>

                        {FACULTES_MEDECINE.map((faculte) => (
                          <option
                            key={faculte}
                            value={faculte}
                          >
                            {faculte}
                          </option>
                        ))}
                      </select>

                      <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#5C5A54]">
                        ▼
                      </span>
                    </div>
                  </div>

                  {/* Expérience */}
                  <div>
                    <label className={labelClass}>
                      Années d'expérience
                    </label>

                    <input
                      type="number"
                      min="0"
                      value={form?.anneeExperience || ""}
                      onChange={handleChange(
                        "anneeExperience"
                      )}
                      className={inputClass}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* =================================================
              Boutons
          ================================================= */}
          {editing && (
            <div className="flex items-center justify-end gap-3">

              {/* Annuler */}
              <button
                type="button"
                onClick={cancelEditing}
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-xl border border-[#0F3D3E]/20 px-4 py-2.5 text-sm font-semibold text-[#0F3D3E] transition-colors hover:bg-white disabled:opacity-60"
              >
                <X size={16} />
                Annuler
              </button>

              {/* Enregistrer */}
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-xl bg-[#0F3D3E] px-5 py-2.5 text-sm font-semibold text-[#FBF9F4] transition-colors hover:bg-[#082829] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
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
          )}
        </form>
      </div>
    </div>
  );
}