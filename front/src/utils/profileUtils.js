// src/utils/profileUtils.js

// =====================================================
// Vérifie si le profil est complet selon le rôle
// =====================================================
export function isProfileComplete(profile) {
  if (!profile) return false;

  // Champs communs obligatoires
  const baseOk =
    !!profile.nom &&
    !!profile.prenom &&
    !!profile.dateNaissance;

  if (!baseOk) return false;

  // -------------------------
  // Étudiant
  // -------------------------
  if (profile.role === "ROLE_ETUDIANT") {
    const e = profile.etudiant;
    return !!(
      e &&
      e.faculte &&
      e.numeroCarteEtudiant &&
      e.niveauEtude &&
      e.pays &&
      e.ville
    );
  }

  // -------------------------
  // Médecin
  // -------------------------
  if (profile.role === "ROLE_MEDECIN") {
    const m = profile.medecin;
    return !!(
      m &&
      m.numeroLicence &&
      m.specialite &&
      m.hopital &&
      m.faculte &&
      (m.anneeExperience !== null && m.anneeExperience !== undefined && m.anneeExperience !== "")
    );
  }

  return baseOk;
}