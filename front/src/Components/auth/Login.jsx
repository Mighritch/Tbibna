import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "./AuthContext";
import { Stethoscope, Mail, Lock, ArrowRight, AlertCircle, CheckCircle2 } from "lucide-react";

export default function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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

  // Validation lors du changement
  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmail(value);
    if (value && !isValidEmail(value)) {
      setValidationErrors(prev => ({ ...prev, email: "Email invalide" }));
    } else {
      setValidationErrors(prev => ({ ...prev, email: "" }));
    }
  };

  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setPassword(value);
    if (value && value.length < 6) {
      setValidationErrors(prev => ({ ...prev, password: "Min 6 caractères" }));
    } else {
      setValidationErrors(prev => ({ ...prev, password: "" }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Validation finale
    if (!email || !isValidEmail(email)) {
      setValidationErrors(prev => ({ ...prev, email: "Email invalide" }));
      return;
    }
    if (!password || password.length < 6) {
      setValidationErrors(prev => ({ ...prev, password: "Min 6 caractères" }));
      return;
    }

    setLoading(true);

    try {
      await login(email, password);
      setSuccess("Connexion réussie !");
      // navigate("/dashboard");
    } catch (err) {
      setError(err.message || "Erreur de connexion");
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
  <div className="min-h-screen w-full bg-[#FBF9F4] flex items-center justify-center px-4 py-8">
    <div className="w-full max-w-[440px]">

      {/* Logo + titre */}
      <div className="text-center mb-7">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#0F3D3E] text-[#E8C77E] shadow-lg">
          <Stethoscope size={30} strokeWidth={1.8} />
        </div>

        <h1 className="font-serif text-3xl font-semibold text-[#0F3D3E]">
          Connexion
        </h1>

        <p className="mt-2 text-sm text-[#5C5A54]">
          Content de te revoir sur Tbibna
        </p>
      </div>

      {/* Carte de connexion */}
      <div className="rounded-2xl border border-[#E4DFD3] bg-white p-7 shadow-xl sm:p-9">

        {/* Erreur */}
        {error && (
          <div className="mb-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <AlertCircle size={18} className="mt-0.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Succès */}
        {success && (
          <div className="mb-5 flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            <CheckCircle2 size={18} className="mt-0.5 flex-shrink-0" />
            <span>{success}</span>
          </div>
        )}

        <form
          ref={formRef}
          onSubmit={handleSubmit}
          className="space-y-5"
          noValidate
        >

          {/* Email */}
          <div>
            <label
              htmlFor="login-email"
              className="mb-2 block text-sm font-semibold text-[#0F3D3E]"
            >
              Email
            </label>

            <div className="relative">
              <Mail
                size={19}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9C9A94]"
              />

              <input
                id="login-email"
                type="email"
                value={email}
                onChange={handleEmailChange}
                required
                placeholder="ahmed@email.com"
                aria-label="Email"
                aria-invalid={!!validationErrors.email}
                aria-describedby={
                  validationErrors.email ? "email-error" : undefined
                }
                className={`w-full rounded-xl border bg-[#FBF9F4] py-3 pl-11 pr-4 text-sm text-[#1C1C1A] outline-none transition duration-200 ${
                  validationErrors.email
                    ? "border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
                    : "border-[#E4DFD3] focus:border-[#0F3D3E] focus:bg-white focus:ring-2 focus:ring-[#0F3D3E]/20"
                }`}
              />
            </div>

            {validationErrors.email && (
              <p
                id="email-error"
                className="mt-1.5 flex items-center gap-1 text-xs text-red-600"
              >
                <AlertCircle size={14} />
                {validationErrors.email}
              </p>
            )}
          </div>

          {/* Mot de passe */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <label
                htmlFor="login-password"
                className="text-sm font-semibold text-[#0F3D3E]"
              >
                Mot de passe
              </label>

              <a
                href="#mot-de-passe-oublie"
                className="text-xs font-medium text-[#3E7C6A] hover:text-[#0F3D3E] hover:underline"
              >
                Mot de passe oublié ?
              </a>
            </div>

            <div className="relative">
              <Lock
                size={19}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9C9A94]"
              />

              <input
                id="login-password"
                type="password"
                value={password}
                onChange={handlePasswordChange}
                required
                placeholder="••••••••"
                aria-label="Mot de passe"
                aria-invalid={!!validationErrors.password}
                aria-describedby={
                  validationErrors.password ? "password-error" : undefined
                }
                className={`w-full rounded-xl border bg-[#FBF9F4] py-3 pl-11 pr-4 text-sm text-[#1C1C1A] outline-none transition duration-200 ${
                  validationErrors.password
                    ? "border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
                    : "border-[#E4DFD3] focus:border-[#0F3D3E] focus:bg-white focus:ring-2 focus:ring-[#0F3D3E]/20"
                }`}
              />
            </div>

            {validationErrors.password && (
              <p
                id="password-error"
                className="mt-1.5 flex items-center gap-1 text-xs text-red-600"
              >
                <AlertCircle size={14} />
                {validationErrors.password}
              </p>
            )}
          </div>

          {/* Bouton connexion */}
          <button
            type="submit"
            disabled={
              loading ||
              !email ||
              !password ||
              Object.values(validationErrors).some((e) => e)
            }
            className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-[#0F3D3E] py-3.5 text-sm font-semibold text-[#FBF9F4] shadow-lg shadow-[#0F3D3E]/20 transition duration-200 hover:bg-[#0B2D2E] hover:shadow-xl active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? (
              <>
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#FBF9F4]/30 border-t-[#FBF9F4]" />
                Connexion en cours...
              </>
            ) : (
              <>
                Se connecter
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        {/* Register */}
        <div className="mt-7 border-t border-[#E4DFD3] pt-6 text-center">
          <p className="text-sm text-[#5C5A54]">
            Pas encore de compte ?{" "}
            <Link
              to="/register"
              className="font-semibold text-[#0F3D3E] hover:underline"
            >
              Créer un compte
            </Link>
          </p>
        </div>
      </div>

      {/* Footer */}
      <p className="mt-6 text-center text-xs text-[#8A877F]">
        © 2026 Tbibna — Plateforme médicale
      </p>

    </div>
  </div>
);

}