import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Stethoscope,
  User,
  Mail,
  Lock,
  Calendar,
  ArrowRight,
  Eye,
  EyeOff,
  Loader2,
  GraduationCap,
  UserCheck,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

export default function Register() {
  const [form, setForm] = useState({
    nom: "",
    prenom: "",
    dateNaissance: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "ROLE_ETUDIANT",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [validationErrors, setValidationErrors] = useState({});
  const formRef = useRef(null);

  // Validations
  const isValidEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const validateField = (name, value) => {
    const errors = { ...validationErrors };

    switch (name) {
      case "nom":
      case "prenom":
        if (value && value.length < 2) {
          errors[name] = "Min 2 caractères";
        } else if (value && value.length > 50) {
          errors[name] = "Max 50 caractères";
        } else {
          errors[name] = "";
        }
        break;

      case "email":
        if (value && !isValidEmail(value)) {
          errors.email = "Email invalide";
        } else {
          errors.email = "";
        }
        break;

      case "password":
        if (value && value.length < 6) {
          errors.password = "Min 6 caractères";
        } else if (value && value.length > 50) {
          errors.password = "Max 50 caractères";
        } else {
          errors.password = "";
        }
        if (form.confirmPassword && value !== form.confirmPassword) {
          errors.confirmPassword = "Les mots de passe ne correspondent pas";
        } else if (form.confirmPassword && value === form.confirmPassword) {
          errors.confirmPassword = "";
        }
        break;

      case "confirmPassword":
        if (value && value !== form.password) {
          errors.confirmPassword = "Les mots de passe ne correspondent pas";
        } else {
          errors.confirmPassword = "";
        }
        break;

      case "dateNaissance":
        if (value) {
          const birthDate = new Date(value);
          const today = new Date();
          const age = today.getFullYear() - birthDate.getFullYear();
          if (age < 13) {
            errors.dateNaissance = "Vous devez avoir au moins 13 ans";
          } else {
            errors.dateNaissance = "";
          }
        }
        break;

      default:
        break;
    }

    setValidationErrors(errors);
    return errors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    validateField(name, value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const errors = {};

    if (!form.nom || form.nom.length < 2) errors.nom = "Nom requis (min 2 caractères)";
    if (!form.prenom || form.prenom.length < 2) errors.prenom = "Prénom requis (min 2 caractères)";
    if (!form.dateNaissance) errors.dateNaissance = "Date de naissance requise";
    if (!form.email || !isValidEmail(form.email)) errors.email = "Email valide requis";
    if (!form.password || form.password.length < 6)
      errors.password = "Mot de passe requis (min 6 caractères)";
    if (!form.confirmPassword) errors.confirmPassword = "Confirmation requise";
    if (form.password !== form.confirmPassword)
      errors.confirmPassword = "Les mots de passe ne correspondent pas";

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nom: form.nom,
          prenom: form.prenom,
          dateNaissance: form.dateNaissance,
          email: form.email,
          password: form.password,
          role: form.role,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erreur lors de l'inscription");
      }

      setSuccess(data.message || "Compte créé avec succès ! Redirection...");
      setForm({
        nom: "",
        prenom: "",
        dateNaissance: "",
        email: "",
        password: "",
        confirmPassword: "",
        role: "ROLE_ETUDIANT",
      });
      setValidationErrors({});
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(""), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(""), 5000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  return (
    <div
      className="w-full relative flex items-center justify-center px-4 py-12 overflow-hidden select-none"
      style={{
        minHeight: "calc(100vh - 64px)",
        backgroundColor: "#FBF9F4",
      }}
    >
      {/* Cercles de fond décoratifs */}
      <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-[#0F3D3E]/5 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-[#E8C77E]/15 blur-3xl pointer-events-none" />

      <div className="w-full max-w-2xl mx-auto relative">
        {/* Header Premium */}
        <div className="text-center mb-8 animate-slideUp">
          <div className="inline-flex items-center justify-center p-3.5 mb-4 rounded-2xl bg-gradient-to-br from-[#0F3D3E] via-[#0F3D3E] to-[#1A5658] text-[#E8C77E] shadow-2xl shadow-[#0F3D3E]/20 transform transition-all duration-300 hover:scale-110 hover:shadow-[#0F3D3E]/30">
            <Stethoscope size={32} strokeWidth={1.8} />
          </div>

          <h1 className="font-serif text-4xl font-bold tracking-tight text-[#0F3D3E] mb-2">
            Rejoindre Tbibna
          </h1>

          <p className="text-sm leading-relaxed text-[#5C5A54]">
            Commencez votre parcours avec la plateforme médicale de référence
          </p>
        </div>

        {/* Card Premium */}
        <div className="rounded-3xl border border-white/60 bg-white/97 p-8 sm:p-10 backdrop-blur-md shadow-2xl shadow-[#0F3D3E]/8 transition-all duration-300 hover:shadow-[#0F3D3E]/12 animate-slideUp">
          
          {/* Badge "Sécurisé" */}
          <div className="mb-6 flex items-center justify-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200/60 bg-emerald-50/80 px-4 py-2 backdrop-blur-sm">
              <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-medium text-emerald-700">Inscription sécurisée</span>
            </div>
          </div>

          {/* Messages d'erreur */}
          {error && (
            <div className="mb-6 flex items-center gap-3 rounded-2xl border border-red-200/80 bg-red-50/90 p-4 text-sm text-red-700 animate-slideDown backdrop-blur-sm">
              <AlertCircle size={18} className="shrink-0 text-red-600 font-bold" />
              <span className="font-medium">{error}</span>
            </div>
          )}

          {/* Message de succès */}
          {success && (
            <div className="mb-6 flex items-center gap-3 rounded-2xl border border-emerald-200/80 bg-emerald-50/90 p-4 text-sm text-emerald-700 animate-slideDown backdrop-blur-sm">
              <CheckCircle2 size={18} className="shrink-0 text-emerald-600 font-bold" />
              <span className="font-medium">{success}</span>
            </div>
          )}

          <form ref={formRef} onSubmit={handleSubmit} className="space-y-6" noValidate>
            
            {/* SECTION 1: Informations personnelles */}
            <div>
              <h3 className="mb-4 text-xs font-bold uppercase tracking-widest text-[#0F3D3E] flex items-center gap-2">
                <div className="h-1 w-1 rounded-full bg-[#E8C77E]" />
                Informations personnelles
              </h3>

              {/* Grid 1: Nom + Prénom côte à côte */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div className="animate-slideUp" style={{ animationDelay: "0.1s", animationFillMode: "both" }}>
                  <label htmlFor="nom" className="mb-2 block text-xs font-bold uppercase tracking-widest text-[#0F3D3E]">
                    Nom de famille
                  </label>
                  <div className="relative group">
                    <User
                      size={19}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-[#B0AEA6] group-focus-within:text-[#0F3D3E] group-focus-within:scale-110 transition-all duration-200"
                    />
                    <input
                      id="nom"
                      type="text"
                      name="nom"
                      value={form.nom}
                      onChange={handleChange}
                      autoComplete="family-name"
                      required
                      placeholder="Ben Ali"
                      aria-label="Nom"
                      aria-invalid={!!validationErrors.nom}
                      aria-describedby={validationErrors.nom ? "nom-error" : undefined}
                      className={`w-full rounded-xl border bg-gradient-to-br from-[#FBF9F4]/80 to-[#F4F0E6]/50 py-3 pl-12 pr-4 text-sm font-medium text-[#1C1C1A] placeholder-[#B0AEA6] outline-none transition-all duration-200 ${
                        validationErrors.nom
                          ? "border-red-400/80 focus:border-red-500 focus:ring-4 focus:ring-red-500/15 focus:bg-white"
                          : "border-[#E4DFD3]/80 focus:border-[#0F3D3E] focus:bg-white focus:ring-4 focus:ring-[#0F3D3E]/15"
                      }`}
                    />
                  </div>
                  {validationErrors.nom && (
                    <p id="nom-error" className="mt-2 flex items-center gap-1.5 text-xs font-medium text-red-600 animate-slideDown">
                      <AlertCircle size={14} className="shrink-0" />
                      {validationErrors.nom}
                    </p>
                  )}
                </div>

                <div className="animate-slideUp" style={{ animationDelay: "0.15s", animationFillMode: "both" }}>
                  <label htmlFor="prenom" className="mb-2 block text-xs font-bold uppercase tracking-widest text-[#0F3D3E]">
                    Prénom
                  </label>
                  <div className="relative group">
                    <User
                      size={19}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-[#B0AEA6] group-focus-within:text-[#0F3D3E] group-focus-within:scale-110 transition-all duration-200"
                    />
                    <input
                      id="prenom"
                      type="text"
                      name="prenom"
                      value={form.prenom}
                      onChange={handleChange}
                      autoComplete="given-name"
                      required
                      placeholder="Ahmed"
                      aria-label="Prénom"
                      aria-invalid={!!validationErrors.prenom}
                      aria-describedby={validationErrors.prenom ? "prenom-error" : undefined}
                      className={`w-full rounded-xl border bg-gradient-to-br from-[#FBF9F4]/80 to-[#F4F0E6]/50 py-3 pl-12 pr-4 text-sm font-medium text-[#1C1C1A] placeholder-[#B0AEA6] outline-none transition-all duration-200 ${
                        validationErrors.prenom
                          ? "border-red-400/80 focus:border-red-500 focus:ring-4 focus:ring-red-500/15 focus:bg-white"
                          : "border-[#E4DFD3]/80 focus:border-[#0F3D3E] focus:bg-white focus:ring-4 focus:ring-[#0F3D3E]/15"
                      }`}
                    />
                  </div>
                  {validationErrors.prenom && (
                    <p id="prenom-error" className="mt-2 flex items-center gap-1.5 text-xs font-medium text-red-600 animate-slideDown">
                      <AlertCircle size={14} className="shrink-0" />
                      {validationErrors.prenom}
                    </p>
                  )}
                </div>
              </div>

              {/* Grid 2: Date de Naissance + Email côte à côte */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="animate-slideUp" style={{ animationDelay: "0.2s", animationFillMode: "both" }}>
                  <label htmlFor="dateNaissance" className="mb-2 block text-xs font-bold uppercase tracking-widest text-[#0F3D3E]">
                    Date de naissance
                  </label>
                  <div className="relative group">
                    <Calendar
                      size={19}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-[#B0AEA6] group-focus-within:text-[#0F3D3E] group-focus-within:scale-110 transition-all duration-200"
                    />
                    <input
                      id="dateNaissance"
                      type="date"
                      name="dateNaissance"
                      value={form.dateNaissance}
                      onChange={handleChange}
                      autoComplete="bday"
                      required
                      aria-label="Date de naissance"
                      aria-invalid={!!validationErrors.dateNaissance}
                      aria-describedby={validationErrors.dateNaissance ? "date-error" : undefined}
                      className={`w-full rounded-xl border bg-gradient-to-br from-[#FBF9F4]/80 to-[#F4F0E6]/50 py-3 pl-12 pr-4 text-sm font-medium text-[#1C1C1A] outline-none transition-all duration-200 ${
                        validationErrors.dateNaissance
                          ? "border-red-400/80 focus:border-red-500 focus:ring-4 focus:ring-red-500/15 focus:bg-white"
                          : "border-[#E4DFD3]/80 focus:border-[#0F3D3E] focus:bg-white focus:ring-4 focus:ring-[#0F3D3E]/15"
                      }`}
                    />
                  </div>
                  {validationErrors.dateNaissance && (
                    <p id="date-error" className="mt-2 flex items-center gap-1.5 text-xs font-medium text-red-600 animate-slideDown">
                      <AlertCircle size={14} className="shrink-0" />
                      {validationErrors.dateNaissance}
                    </p>
                  )}
                </div>

                <div className="animate-slideUp" style={{ animationDelay: "0.25s", animationFillMode: "both" }}>
                  <label htmlFor="register-email" className="mb-2 block text-xs font-bold uppercase tracking-widest text-[#0F3D3E]">
                    Adresse Email
                  </label>
                  <div className="relative group">
                    <Mail
                      size={19}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-[#B0AEA6] group-focus-within:text-[#0F3D3E] group-focus-within:scale-110 transition-all duration-200"
                    />
                    <input
                      id="register-email"
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      autoComplete="email"
                      required
                      placeholder="ahmed@email.com"
                      aria-label="Email"
                      aria-invalid={!!validationErrors.email}
                      aria-describedby={validationErrors.email ? "email-error" : undefined}
                      className={`w-full rounded-xl border bg-gradient-to-br from-[#FBF9F4]/80 to-[#F4F0E6]/50 py-3 pl-12 pr-4 text-sm font-medium text-[#1C1C1A] placeholder-[#B0AEA6] outline-none transition-all duration-200 ${
                        validationErrors.email
                          ? "border-red-400/80 focus:border-red-500 focus:ring-4 focus:ring-red-500/15 focus:bg-white"
                          : "border-[#E4DFD3]/80 focus:border-[#0F3D3E] focus:bg-white focus:ring-4 focus:ring-[#0F3D3E]/15"
                      }`}
                    />
                  </div>
                  {validationErrors.email && (
                    <p id="email-error" className="mt-2 flex items-center gap-1.5 text-xs font-medium text-red-600 animate-slideDown">
                      <AlertCircle size={14} className="shrink-0" />
                      {validationErrors.email}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[#E4DFD3] to-transparent" />
            </div>

            {/* SECTION 2: Sécurité & Mots de passe */}
            <div>
              <h3 className="mb-4 text-xs font-bold uppercase tracking-widest text-[#0F3D3E] flex items-center gap-2">
                <div className="h-1 w-1 rounded-full bg-[#E8C77E]" />
                Vos identifiants
              </h3>

              {/* Grid 3: Mot de passe + Confirmation mot de passe côte à côte */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="animate-slideUp" style={{ animationDelay: "0.3s", animationFillMode: "both" }}>
                  <label htmlFor="register-password" className="mb-2 block text-xs font-bold uppercase tracking-widest text-[#0F3D3E]">
                    Mot de passe
                  </label>
                  <div className="relative group">
                    <Lock
                      size={19}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-[#B0AEA6] group-focus-within:text-[#0F3D3E] group-focus-within:scale-110 transition-all duration-200"
                    />
                    <input
                      id="register-password"
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={form.password}
                      onChange={handleChange}
                      autoComplete="new-password"
                      required
                      placeholder="Min. 6 caractères"
                      aria-label="Mot de passe"
                      aria-invalid={!!validationErrors.password}
                      aria-describedby={validationErrors.password ? "password-error" : undefined}
                      className={`w-full rounded-xl border bg-gradient-to-br from-[#FBF9F4]/80 to-[#F4F0E6]/50 py-3 pl-12 pr-12 text-sm font-medium text-[#1C1C1A] placeholder-[#B0AEA6] outline-none transition-all duration-200 ${
                        validationErrors.password
                          ? "border-red-400/80 focus:border-red-500 focus:ring-4 focus:ring-red-500/15 focus:bg-white"
                          : "border-[#E4DFD3]/80 focus:border-[#0F3D3E] focus:bg-white focus:ring-4 focus:ring-[#0F3D3E]/15"
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-[#B0AEA6] hover:text-[#0F3D3E] transition-all duration-200 p-1 hover:scale-110"
                      aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
                    </button>
                  </div>
                  {validationErrors.password && (
                    <p id="password-error" className="mt-2 flex items-center gap-1.5 text-xs font-medium text-red-600 animate-slideDown">
                      <AlertCircle size={14} className="shrink-0" />
                      {validationErrors.password}
                    </p>
                  )}
                </div>

                <div className="animate-slideUp" style={{ animationDelay: "0.35s", animationFillMode: "both" }}>
                  <label htmlFor="confirmPassword" className="mb-2 block text-xs font-bold uppercase tracking-widest text-[#0F3D3E]">
                    Confirmer le mot de passe
                  </label>
                  <div className="relative group">
                    <Lock
                      size={19}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-[#B0AEA6] group-focus-within:text-[#0F3D3E] group-focus-within:scale-110 transition-all duration-200"
                    />
                    <input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      value={form.confirmPassword}
                      onChange={handleChange}
                      autoComplete="new-password"
                      required
                      placeholder="Min. 6 caractères"
                      aria-label="Confirmation du mot de passe"
                      aria-invalid={!!validationErrors.confirmPassword}
                      aria-describedby={validationErrors.confirmPassword ? "confirm-error" : undefined}
                      className={`w-full rounded-xl border bg-gradient-to-br from-[#FBF9F4]/80 to-[#F4F0E6]/50 py-3 pl-12 pr-12 text-sm font-medium text-[#1C1C1A] placeholder-[#B0AEA6] outline-none transition-all duration-200 ${
                        validationErrors.confirmPassword
                          ? "border-red-400/80 focus:border-red-500 focus:ring-4 focus:ring-red-500/15 focus:bg-white"
                          : "border-[#E4DFD3]/80 focus:border-[#0F3D3E] focus:bg-white focus:ring-4 focus:ring-[#0F3D3E]/15"
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-[#B0AEA6] hover:text-[#0F3D3E] transition-all duration-200 p-1 hover:scale-110"
                      aria-label={showConfirmPassword ? "Masquer la confirmation" : "Afficher la confirmation"}
                      tabIndex={-1}
                    >
                      {showConfirmPassword ? <EyeOff size={19} /> : <Eye size={19} />}
                    </button>
                  </div>
                  {validationErrors.confirmPassword && (
                    <p id="confirm-error" className="mt-2 flex items-center gap-1.5 text-xs font-medium text-red-600 animate-slideDown">
                      <AlertCircle size={14} className="shrink-0" />
                      {validationErrors.confirmPassword}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[#E4DFD3] to-transparent" />
            </div>

            {/* SECTION 3: Rôle */}
            <div className="animate-slideUp" style={{ animationDelay: "0.4s", animationFillMode: "both" }}>
              <h3 className="mb-4 text-xs font-bold uppercase tracking-widest text-[#0F3D3E] flex items-center gap-2">
                <div className="h-1 w-1 rounded-full bg-[#E8C77E]" />
                Je suis
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <label
                  className={`flex cursor-pointer items-center justify-center gap-2 rounded-xl border py-3 px-4 text-sm font-bold transition-all focus-within:ring-2 focus-within:ring-[#0F3D3E]/30 duration-200 ${
                    form.role === "ROLE_ETUDIANT"
                      ? "border-[#0F3D3E] bg-gradient-to-br from-[#0F3D3E] to-[#1A5658] text-white shadow-lg shadow-[#0F3D3E]/20"
                      : "border-[#E4DFD3]/80 bg-[#FBF9F4] text-[#3C3A34] hover:border-[#0F3D3E]/40 hover:bg-white/50"
                  }`}
                >
                  <input
                    type="radio"
                    name="role"
                    value="ROLE_ETUDIANT"
                    checked={form.role === "ROLE_ETUDIANT"}
                    onChange={handleChange}
                    className="sr-only"
                  />
                  <GraduationCap size={18} />
                  <span>Étudiant</span>
                </label>

                <label
                  className={`flex cursor-pointer items-center justify-center gap-2 rounded-xl border py-3 px-4 text-sm font-bold transition-all focus-within:ring-2 focus-within:ring-[#0F3D3E]/30 duration-200 ${
                    form.role === "ROLE_MEDECIN"
                      ? "border-[#0F3D3E] bg-gradient-to-br from-[#0F3D3E] to-[#1A5658] text-white shadow-lg shadow-[#0F3D3E]/20"
                      : "border-[#E4DFD3]/80 bg-[#FBF9F4] text-[#3C3A34] hover:border-[#0F3D3E]/40 hover:bg-white/50"
                  }`}
                >
                  <input
                    type="radio"
                    name="role"
                    value="ROLE_MEDECIN"
                    checked={form.role === "ROLE_MEDECIN"}
                    onChange={handleChange}
                    className="sr-only"
                  />
                  <UserCheck size={18} />
                  <span>Médecin</span>
                </label>
              </div>
            </div>

            {/* Bouton submit */}
            <button
              type="submit"
              disabled={
                loading ||
                Object.values(validationErrors).some((e) => e) ||
                !form.nom ||
                !form.prenom ||
                !form.dateNaissance ||
                !form.email ||
                !form.password ||
                !form.confirmPassword
              }
              className="mt-8 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#0F3D3E] via-[#0F3D3E] to-[#1A5658] py-3.5 text-sm font-bold text-[#FBF9F4] shadow-lg shadow-[#0F3D3E]/25 transition-all duration-300 hover:shadow-2xl hover:shadow-[#0F3D3E]/35 hover:-translate-y-0.5 active:translate-y-0 active:shadow-lg disabled:cursor-not-allowed disabled:opacity-60 disabled:-translate-y-0 disabled:shadow-lg focus:outline-none focus:ring-2 focus:ring-[#0F3D3E]/30 focus:ring-offset-2 focus:ring-offset-[#FBF9F4] animate-slideUp uppercase tracking-wide"
              aria-label={loading ? "Inscription en cours" : "S'inscrire"}
              style={{ animationDelay: "0.45s", animationFillMode: "both" }}
            >
              {loading ? (
                <div className="flex items-center gap-2.5">
                  <Loader2 size={18} className="animate-spin" />
                  <span>Inscription en cours</span>
                </div>
              ) : (
                <>
                  <span>Créer Mon Compte</span>
                  <ArrowRight size={18} className="transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center gap-3">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[#E4DFD3] to-transparent" />
            <span className="text-xs text-[#B0AEA6] font-medium">OU</span>
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[#E4DFD3] to-transparent" />
          </div>

          {/* Lien vers Login */}
          <div className="text-center">
            <p className="text-sm text-[#5C5A54]">
              Tu as déjà un compte ?{" "}
              <Link
                to="/login"
                className="font-bold text-[#0F3D3E] hover:text-[#1A5658] hover:underline underline-offset-4 transition-all duration-200"
              >
                Se connecter
              </Link>
            </p>
          </div>
        </div>

        {/* Pied de page professionnel */}
        <p className="mt-8 text-center text-xs text-[#8A877F] font-medium">
          © {new Date().getFullYear()} Tbibna — Plateforme d'apprentissage médical
        </p>
      </div>
    </div>
  );
}