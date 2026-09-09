import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { Stethoscope, User, Mail, Lock, Calendar, ArrowRight, Eye, EyeOff, Loader2, GraduationCap, UserCheck, AlertCircle, CheckCircle2 } from "lucide-react";

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
        // Check password confirmation if exists
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

    // Validation finale
    const errors = {};
    
    if (!form.nom || form.nom.length < 2) errors.nom = "Nom requis (min 2 caractères)";
    if (!form.prenom || form.prenom.length < 2) errors.prenom = "Prénom requis (min 2 caractères)";
    if (!form.dateNaissance) errors.dateNaissance = "Date de naissance requise";
    if (!form.email || !isValidEmail(form.email)) errors.email = "Email valide requis";
    if (!form.password || form.password.length < 6) errors.password = "Mot de passe requis (min 6 caractères)";
    if (!form.confirmPassword) errors.confirmPassword = "Confirmation requise";
    if (form.password !== form.confirmPassword) errors.confirmPassword = "Les mots de passe ne correspondent pas";

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

  // Fermer les messages après 5 secondes
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
    <div className="min-h-[calc(100vh-64px)] bg-[#FBF9F4] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8 animate-fadeIn">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#0F3D3E] text-[#E8C77E] shadow-lg shadow-[#0F3D3E]/10 transition-transform hover:scale-105">
            <Stethoscope size={26} strokeWidth={1.6} />
          </div>
          <h1 className="font-serif text-3xl font-medium tracking-tight text-[#0F3D3E]">
            Créer un compte
          </h1>
          <p className="mt-2 text-[15px] text-[#5C5A54]">
            Rejoins la communauté Tbibna
          </p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-[#E4DFD3] bg-white/80 p-6 shadow-sm backdrop-blur sm:p-8 animate-slideUp">
          {/* Messages d'erreur */}
          {error && (
            <div className="mb-5 rounded-xl border border-red-200 bg-red-50/80 px-4 py-3 flex gap-3 items-start text-[14px] text-red-700 animate-slideDown">
              <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Message de succès */}
          {success && (
            <div className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50/80 px-4 py-3 flex gap-3 items-start text-[14px] text-emerald-700 animate-slideDown">
              <CheckCircle2 size={18} className="flex-shrink-0 mt-0.5" />
              <span>{success}</span>
            </div>
          )}

          <form ref={formRef} onSubmit={handleSubmit} className="space-y-4" noValidate>
            {/* Nom + Prénom */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="nom" className="mb-1.5 block text-[13px] font-medium text-[#0F3D3E]">
                  Nom
                </label>
                <div className="relative">
                  <User
                    size={18}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9C9A94] pointer-events-none"
                  />
                  <input
                    id="nom"
                    type="text"
                    name="nom"
                    value={form.nom}
                    onChange={handleChange}
                    required
                    placeholder="Ben Ali"
                    aria-label="Nom"
                    aria-invalid={!!validationErrors.nom}
                    aria-describedby={validationErrors.nom ? "nom-error" : undefined}
                    className={`w-full rounded-xl border bg-[#FBF9F4] py-2.5 pl-10 pr-3 text-[14.5px] text-[#1C1C1A] placeholder-[#9C9A94] outline-none transition focus:bg-white ${
                      validationErrors.nom
                        ? "border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
                        : "border-[#E4DFD3] focus:border-[#0F3D3E] focus:ring-2 focus:ring-[#0F3D3E]/10"
                    }`}
                  />
                </div>
                {validationErrors.nom && (
                  <p id="nom-error" className="mt-1 text-[12.5px] text-red-600 flex items-center gap-1">
                    <AlertCircle size={12} />
                    {validationErrors.nom}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="prenom" className="mb-1.5 block text-[13px] font-medium text-[#0F3D3E]">
                  Prénom
                </label>
                <div className="relative">
                  <User
                    size={18}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9C9A94] pointer-events-none"
                  />
                  <input
                    id="prenom"
                    type="text"
                    name="prenom"
                    value={form.prenom}
                    onChange={handleChange}
                    required
                    placeholder="Ahmed"
                    aria-label="Prénom"
                    aria-invalid={!!validationErrors.prenom}
                    aria-describedby={validationErrors.prenom ? "prenom-error" : undefined}
                    className={`w-full rounded-xl border bg-[#FBF9F4] py-2.5 pl-10 pr-3 text-[14.5px] text-[#1C1C1A] placeholder-[#9C9A94] outline-none transition focus:bg-white ${
                      validationErrors.prenom
                        ? "border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
                        : "border-[#E4DFD3] focus:border-[#0F3D3E] focus:ring-2 focus:ring-[#0F3D3E]/10"
                    }`}
                  />
                </div>
                {validationErrors.prenom && (
                  <p id="prenom-error" className="mt-1 text-[12.5px] text-red-600 flex items-center gap-1">
                    <AlertCircle size={12} />
                    {validationErrors.prenom}
                  </p>
                )}
              </div>
            </div>

            {/* Date de naissance */}
            <div>
              <label htmlFor="dateNaissance" className="mb-1.5 block text-[13px] font-medium text-[#0F3D3E]">
                Date de naissance
              </label>
              <div className="relative">
                <Calendar
                  size={18}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9C9A94] pointer-events-none"
                />
                <input
                  id="dateNaissance"
                  type="date"
                  name="dateNaissance"
                  value={form.dateNaissance}
                  onChange={handleChange}
                  required
                  aria-label="Date de naissance"
                  aria-invalid={!!validationErrors.dateNaissance}
                  aria-describedby={validationErrors.dateNaissance ? "date-error" : undefined}
                  className={`w-full rounded-xl border bg-[#FBF9F4] py-2.5 pl-10 pr-3 text-[14.5px] text-[#1C1C1A] outline-none transition focus:bg-white ${
                    validationErrors.dateNaissance
                      ? "border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
                      : "border-[#E4DFD3] focus:border-[#0F3D3E] focus:ring-2 focus:ring-[#0F3D3E]/10"
                  }`}
                />
              </div>
              {validationErrors.dateNaissance && (
                <p id="date-error" className="mt-1 text-[12.5px] text-red-600 flex items-center gap-1">
                  <AlertCircle size={12} />
                  {validationErrors.dateNaissance}
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <label htmlFor="register-email" className="mb-1.5 block text-[13px] font-medium text-[#0F3D3E]">
                Email
              </label>
              <div className="relative">
                <Mail
                  size={18}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9C9A94] pointer-events-none"
                />
                <input
                  id="register-email"
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  placeholder="ahmed@email.com"
                  aria-label="Email"
                  aria-invalid={!!validationErrors.email}
                  aria-describedby={validationErrors.email ? "email-error" : undefined}
                  className={`w-full rounded-xl border bg-[#FBF9F4] py-2.5 pl-10 pr-3 text-[14.5px] text-[#1C1C1A] placeholder-[#9C9A94] outline-none transition focus:bg-white ${
                    validationErrors.email
                      ? "border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
                      : "border-[#E4DFD3] focus:border-[#0F3D3E] focus:ring-2 focus:ring-[#0F3D3E]/10"
                  }`}
                />
              </div>
              {validationErrors.email && (
                <p id="email-error" className="mt-1 text-[12.5px] text-red-600 flex items-center gap-1">
                  <AlertCircle size={12} />
                  {validationErrors.email}
                </p>
              )}
            </div>

            {/* Mot de passe */}
            <div>
              <label htmlFor="register-password" className="mb-1.5 block text-[13px] font-medium text-[#0F3D3E]">
                Mot de passe
              </label>
              <div className="relative">
                <Lock
                  size={18}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9C9A94] pointer-events-none"
                />
                <input
                  id="register-password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  required
                  placeholder="••••••••"
                  aria-label="Mot de passe"
                  aria-invalid={!!validationErrors.password}
                  aria-describedby={validationErrors.password ? "password-error" : undefined}
                  className={`w-full rounded-xl border bg-[#FBF9F4] py-2.5 pl-10 pr-11 text-[14.5px] text-[#1C1C1A] placeholder-[#9C9A94] outline-none transition focus:bg-white ${
                    validationErrors.password
                      ? "border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
                      : "border-[#E4DFD3] focus:border-[#0F3D3E] focus:ring-2 focus:ring-[#0F3D3E]/10"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#9C9A94] hover:text-[#0F3D3E] transition-colors focus:outline-none focus:ring-2 focus:ring-[#0F3D3E]/20 rounded px-1"
                  aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {validationErrors.password && (
                <p id="password-error" className="mt-1 text-[12.5px] text-red-600 flex items-center gap-1">
                  <AlertCircle size={12} />
                  {validationErrors.password}
                </p>
              )}
            </div>

            {/* Confirmation mot de passe */}
            <div>
              <label htmlFor="confirmPassword" className="mb-1.5 block text-[13px] font-medium text-[#0F3D3E]">
                Confirmer le mot de passe
              </label>
              <div className="relative">
                <Lock
                  size={18}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9C9A94] pointer-events-none"
                />
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  required
                  placeholder="••••••••"
                  aria-label="Confirmation du mot de passe"
                  aria-invalid={!!validationErrors.confirmPassword}
                  aria-describedby={validationErrors.confirmPassword ? "confirm-error" : undefined}
                  className={`w-full rounded-xl border bg-[#FBF9F4] py-2.5 pl-10 pr-11 text-[14.5px] text-[#1C1C1A] placeholder-[#9C9A94] outline-none transition focus:bg-white ${
                    validationErrors.confirmPassword
                      ? "border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
                      : "border-[#E4DFD3] focus:border-[#0F3D3E] focus:ring-2 focus:ring-[#0F3D3E]/10"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#9C9A94] hover:text-[#0F3D3E] transition-colors focus:outline-none focus:ring-2 focus:ring-[#0F3D3E]/20 rounded px-1"
                  aria-label={showConfirmPassword ? "Masquer la confirmation" : "Afficher la confirmation"}
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {validationErrors.confirmPassword && (
                <p id="confirm-error" className="mt-1 text-[12.5px] text-red-600 flex items-center gap-1">
                  <AlertCircle size={12} />
                  {validationErrors.confirmPassword}
                </p>
              )}
            </div>

            {/* Rôle */}
            <div>
              <span className="mb-1.5 block text-[13px] font-medium text-[#0F3D3E]">
                Je suis
              </span>
              <div className="grid grid-cols-2 gap-3">
                <label
                  className={`flex cursor-pointer items-center justify-center gap-2 rounded-xl border py-2.5 px-3 text-[14px] font-medium transition-all focus-within:ring-2 focus-within:ring-[#0F3D3E]/20 ${
                    form.role === "ROLE_ETUDIANT"
                      ? "border-[#0F3D3E] bg-[#0F3D3E] text-white shadow-sm"
                      : "border-[#E4DFD3] bg-[#FBF9F4] text-[#3C3A34] hover:border-[#0F3D3E]/40"
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
                  <GraduationCap size={16} />
                  Étudiant
                </label>

                <label
                  className={`flex cursor-pointer items-center justify-center gap-2 rounded-xl border py-2.5 px-3 text-[14px] font-medium transition-all focus-within:ring-2 focus-within:ring-[#0F3D3E]/20 ${
                    form.role === "ROLE_MEDECIN"
                      ? "border-[#0F3D3E] bg-[#0F3D3E] text-white shadow-sm"
                      : "border-[#E4DFD3] bg-[#FBF9F4] text-[#3C3A34] hover:border-[#0F3D3E]/40"
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
                  <UserCheck size={16} />
                  Médecin
                </label>
              </div>
            </div>

            {/* Bouton */}
            <button
              type="submit"
              disabled={loading || Object.values(validationErrors).some(e => e) || !form.nom || !form.prenom || !form.dateNaissance || !form.email || !form.password || !form.confirmPassword}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-[#0F3D3E] py-3 text-[15px] font-medium text-[#FBF9F4] shadow-lg shadow-[#0F3D3E]/15 transition duration-200 hover:bg-[#0B2D2E] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-[#0F3D3E]/30"
              aria-label={loading ? "Inscription en cours" : "S'inscrire"}
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span>Inscription en cours...</span>
                </>
              ) : (
                <>
                  <span>S'inscrire</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Lien vers Login */}
          <p className="mt-6 text-center text-[14px] text-[#5C5A54]">
            Tu as déjà un compte ?{" "}
            <Link
              to="/login"
              className="font-medium text-[#0F3D3E] hover:underline focus:outline-none focus:ring-2 focus:ring-[#0F3D3E]/20 rounded px-1"
            >
              Se connecter
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}