import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X, LogOut, User as UserIcon } from "lucide-react";
import { useAuth } from "../auth/AuthContext";
import "./Navbar.css";

const NAV_LINKS = [
  { label: "Cours", href: "#cours" },
  { label: "Activités", href: "#activites" },
  { label: "Examens", href: "#examens" },
  { label: "Formations", href: "#formations" },
  { label: "Évènements", href: "#evenements" },
  { label: "À propos", href: "#a-propos" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user, loading, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const handleLogout = async () => {
    setOpen(false);
    await logout();
    navigate("/login");
  };

  return (
    <header className={`navbar ${scrolled ? "scrolled" : ""}`}>
      <div className="navbar__container">
        {/* Logo à gauche */}
        <Link to="/" className="navbar__logo">
          <span className="navbar__logo-icon">
            <img src="/assets/logo.jpg" alt="Tbibna" />
          </span>
          <span className="navbar__logo-text">Tbibna</span>
        </Link>

        {/* Liens de navigation (Visibles uniquement sur Grand Écran) */}
        <nav className="navbar__nav-desktop">
          {NAV_LINKS.map((link) => (
            <a key={link.label} href={link.href} className="navbar__link">
              {link.label}
            </a>
          ))}
        </nav>

        {/* Actions à droite (Grand Écran) & Toggle Hamburger (Petit Écran) */}
        <div className="navbar__right-actions">
          {/* Boutons de connexion / infos utilisateur visibles uniquement sur grand écran */}
          <div className="navbar__desktop-auth">
            <div className="navbar__divider" />

            {loading ? null : user ? (
              <>
                <Link to="/profile" className="navbar__user">
                  <UserIcon size={16} />
                  <span>{user.prenom || user.nom}</span>
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="navbar__logout"
                >
                  <LogOut size={16} />
                  Se déconnecter
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="navbar__login">
                  Se connecter
                </Link>
                <Link to="/register" className="navbar__cta">
                  Créer un compte
                </Link>
              </>
            )}
          </div>

          {/* Bouton Hamburger visible uniquement si la fenêtre est réduite */}
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="navbar__toggle"
            aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
            aria-expanded={open}
          >
            {open ? <X size={24} strokeWidth={2} /> : <Menu size={24} strokeWidth={2} />}
          </button>
        </div>
      </div>

      {/* Menu Hamburger déroulant (S'affiche au clic quand la fenêtre est réduite) */}
      <div className={`navbar__mobile-menu ${open ? "open" : ""}`}>
        <div className="navbar__mobile-inner">
          <nav className="navbar__mobile-nav">
            {NAV_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setOpen(false)}
                className="navbar__mobile-link"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="navbar__mobile-actions">
            {loading ? null : user ? (
              <>
                <Link
                  to="/profile"
                  onClick={() => setOpen(false)}
                  className="navbar__mobile-login"
                >
                  <UserIcon size={16} style={{ marginRight: 8 }} />
                  {user.prenom || user.nom}
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="navbar__mobile-cta navbar__mobile-logout"
                >
                  <LogOut size={16} style={{ marginRight: 8 }} />
                  Se déconnecter
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setOpen(false)}
                  className="navbar__mobile-login"
                >
                  Se connecter
                </Link>
                <Link
                  to="/register"
                  onClick={() => setOpen(false)}
                  className="navbar__mobile-cta"
                >
                  Créer un compte
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}