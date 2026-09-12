import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import { 
  Stethoscope, 
  Mail, 
  Lock, 
  ArrowRight, 
  AlertCircle, 
  CheckCircle2, 
  Eye, 
  EyeOff 
} from "lucide-react";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [success, setSuccess] = useState("");
  const formRef = useRef(null);

  // Validation d'email
  const isValidEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmail(value);
    if (!value.trim()) {
      setValidationErrors((prev) => ({ ...prev, email: "L'email est requis" }));
    } else if (!isValidEmail(value)) {
      setValidationErrors((prev) => ({ ...prev, email: "Email invalide" }));
    } else {
      setValidationErrors((prev) => ({ ...prev, email: "" }));
    }
  };

  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setPassword(value);
    if (!value) {
      setValidationErrors((prev) => ({ ...prev, password: "Le mot de passe est requis" }));
    } else if (value.length < 6) {
      setValidationErrors((prev) => ({ ...prev, password: "Min 6 caractères" }));
    } else {
      setValidationErrors((prev) => ({ ...prev, password: "" }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const trimmedEmail = email.trim();
    const newErrors = {};

    // Vérification explicite des champs vides avant toute autre validation
    if (!trimmedEmail) {
      newErrors.email = "L'email est requis";
    } else if (!isValidEmail(trimmedEmail)) {
      newErrors.email = "Email invalide";
    }

    if (!password) {
      newErrors.password = "Le mot de passe est requis";
    } else if (password.length < 6) {
      newErrors.password = "Min 6 caractères";
    }

    if (newErrors.email || newErrors.password) {
      setValidationErrors(newErrors);
      return; // On bloque la soumission tant qu'un champ requis est vide ou invalide
    }

    setLoading(true);

    try {
      const data = await login(trimmedEmail, password);
      setSuccess("Connexion réussie !");

      // Redirection selon le rôle renvoyé par l'API
      const role = data?.user?.role;
      setTimeout(() => {
        if (role === "ROLE_MEDECIN") {
          navigate("/dashboard/medecin");
        } else if (role === "ROLE_ETUDIANT") {
          navigate("/dashboard/etudiant");
        } else if (role === "ROLE_ADMIN") {
          navigate("/dashboard/admin");   // ← nouvel endpoint admin
        } else {
          navigate("/");
        }
      }, 800);
    } catch (err) {
      setError(err.message || "Identifiants incorrects. Veuillez réessayer.");
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
    <div className="relative min-h-screen w-full flex flex-col items-center justify-center bg-[#FBF9F4] px-4 py-8 overflow-hidden select-none">
      
      {/* Cercles de fond décoratifs floutés */}
      <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-[#0F3D3E]/5 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full bg-[#E8C77E]/15 blur-3xl pointer-events-none" />

      {/* Container du formulaire centré avec largeur augmentée pour 2 colonnes */}
      <div className="relative w-full max-w-2xl mx-auto my-auto animate-slideUp">
        
        {/* En-tête premium */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-3.5 mb-4 rounded-2xl bg-gradient-to-br from-[#0F3D3E] via-[#0F3D3E] to-[#1A5658] text-[#E8C77E] shadow-2xl shadow-[#0F3D3E]/20 transform transition-all duration-300 hover:scale-110 hover:shadow-[#0F3D3E]/30">
            <Stethoscope size={32} strokeWidth={1.8} />
          </div>

          <h1 className="font-serif text-4xl font-bold tracking-tight text-[#0F3D3E] mb-2">
            Bienvenue
          </h1>

          <p className="text-sm leading-relaxed text-[#5C5A54]">
            Accédez à votre espace <span className="font-semibold text-[#0F3D3E]">Tbibna</span> pour continuer votre parcours médical
          </p>
        </div>

        {/* Carte du Formulaire Premium */}
        <div className="relative backdrop-blur-md bg-white/97 rounded-3xl border border-white/60 p-8 sm:p-10 shadow-2xl shadow-[#0F3D3E]/8 transition-all duration-300 hover:shadow-[#0F3D3E]/12">
          
          {/* Badge "Sécurisé" */}
          <div className="mb-6 flex items-center justify-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200/60 bg-emerald-50/80 px-4 py-2 backdrop-blur-sm">
              <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-medium text-emerald-700">Connexion sécurisée</span>
            </div>
          </div>
          
          {/* Notification d'erreur */}
          {error && (
            <div className="mb-6 flex items-center gap-3 rounded-2xl border border-red-200/80 bg-red-50/90 p-4 text-sm text-red-700 animate-slideDown backdrop-blur-sm">
              <AlertCircle size={18} className="shrink-0 text-red-600 font-bold" />
              <span className="font-medium">{error}</span>
            </div>
          )}

          {/* Notification de succès */}
          {success && (
            <div className="mb-6 flex items-center gap-3 rounded-2xl border border-emerald-200/80 bg-emerald-50/90 p-4 text-sm text-emerald-700 animate-slideDown backdrop-blur-sm">
              <CheckCircle2 size={18} className="shrink-0 text-emerald-600 font-bold" />
              <span className="font-medium">{success}</span>
            </div>
          )}

          <form ref={formRef} onSubmit={handleSubmit} className="space-y-5" noValidate>
            
            {/* Grille : Email et Mot de Passe côte à côte */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Champ Email */}
              <div className="animate-slideUp" style={{ animationDelay: "0.1s", animationFillMode: "both" }}>
                <label htmlFor="login-email" className="mb-2 block text-xs font-bold uppercase tracking-widest text-[#0F3D3E]">
                  Adresse Email
                </label>

                <div className="relative group">
                  <Mail
                    size={19}
                    className={`absolute left-4 top-1/2 -translate-y-1/2 group-focus-within:scale-110 transition-all duration-200 ${
                      validationErrors.email
                        ? "text-red-400"
                        : "text-[#B0AEA6] group-focus-within:text-[#0F3D3E]"
                    }`}
                  />

                  <input
                    id="login-email"
                    type="email"
                    value={email}
                    onChange={handleEmailChange}
                    required
                    placeholder="exemple@domaine.com"
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

              {/* Champ Mot de passe */}
              <div className="animate-slideUp" style={{ animationDelay: "0.2s", animationFillMode: "both" }}>
                <div className="mb-2 flex items-center justify-between">
                  <label htmlFor="login-password" className="text-xs font-bold uppercase tracking-widest text-[#0F3D3E]">
                    Mot de passe
                  </label>

                  <Link
                    to="/forgot-password"
                    className="text-xs font-semibold text-[#3E7C6A] hover:text-[#0F3D3E] transition-colors hover:underline underline-offset-2"
                  >
                    Oublié ?
                  </Link>
                </div>

                <div className="relative group">
                  <Lock
                    size={19}
                    className={`absolute left-4 top-1/2 -translate-y-1/2 group-focus-within:scale-110 transition-all duration-200 ${
                      validationErrors.password
                        ? "text-red-400"
                        : "text-[#B0AEA6] group-focus-within:text-[#0F3D3E]"
                    }`}
                  />

                  <input
                    id="login-password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={handlePasswordChange}
                    required
                    placeholder="Minimum 6 caractères"
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
                    tabIndex={-1}
                    aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
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
            </div>

            {/* Case à cocher */}
            <div className="flex items-center justify-between pt-1 animate-slideUp" style={{ animationDelay: "0.3s", animationFillMode: "both" }}>
              <label className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded-lg border-[#E4DFD3] text-[#0F3D3E] focus:ring-2 focus:ring-[#0F3D3E]/30 accent-[#0F3D3E] cursor-pointer transition-all"
                />
                <span className="text-xs font-semibold text-[#5C5A54] group-hover:text-[#0F3D3E] transition-colors">Se souvenir de moi</span>
              </label>
            </div>

            {/* Bouton submit */}
            <button
              type="submit"
              disabled={loading}
              className="mt-7 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#0F3D3E] via-[#0F3D3E] to-[#1A5658] py-3.5 text-sm font-bold text-[#FBF9F4] shadow-lg shadow-[#0F3D3E]/25 transition-all duration-300 hover:shadow-2xl hover:shadow-[#0F3D3E]/35 hover:-translate-y-0.5 active:translate-y-0 active:shadow-lg disabled:cursor-not-allowed disabled:opacity-60 disabled:-translate-y-0 disabled:shadow-lg focus:outline-none focus:ring-2 focus:ring-[#0F3D3E]/30 focus:ring-offset-2 focus:ring-offset-[#FBF9F4] animate-slideUp uppercase tracking-wide"
              style={{ animationDelay: "0.4s", animationFillMode: "both" }}
            >
              {loading ? (
                <div className="flex items-center gap-2.5">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  <span>Connexion en cours</span>
                </div>
              ) : (
                <>
                  <span>Se Connecter</span>
                  <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
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

          {/* Lien vers Inscription */}
          <div className="text-center">
            <p className="text-sm text-[#5C5A54]">
              Vous n'avez pas encore de compte ?{" "}
              <Link 
                to="/register" 
                className="font-bold text-[#0F3D3E] hover:text-[#1A5658] hover:underline underline-offset-4 transition-all duration-200"
              >
                Créer un compte
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