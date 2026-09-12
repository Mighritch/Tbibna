import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X, LogOut, User as UserIcon } from "lucide-react";
import { useAuth } from "../auth/AuthContext";
import "./Navbar.css";

const BASE_NAV_LINKS = [
  { label: "Activités", href: "#activites" },
  { label: "Examens", href: "#examens" },
  { label: "Formations", href: "#formations" },
  { label: "Évènements", href: "#evenements" },
  { label: "À propos", href: "#a-propos" },
];

// Détection robuste du rôle médecin
function isMedecin(user) {
  if (!user) return false;

  if (Array.isArray(user.roles)) {
    return user.roles.some(
      (r) =>
        r === "ROLE_MEDECIN" ||
        r === "ROLE_MEDECIN".toLowerCase() ||
        String(r).toUpperCase().includes("MEDECIN")
    );
  }

  if (user.role) {
    return String(user.role).toUpperCase().includes("MEDECIN");
  }

  return false;
}

// Détection du rôle admin
function isAdmin(user) {
  if (!user) return false;

  if (Array.isArray(user.roles)) {
    return user.roles.some(
      (r) =>
        r === "ROLE_ADMIN" ||
        r === "ROLE_ADMIN".toLowerCase() ||
        String(r).toUpperCase().includes("ADMIN")
    );
  }

  if (user.role) {
    return String(user.role).toUpperCase().includes("ADMIN");
  }

  return false;
}

function getNavLinks(user) {
  const medecin = isMedecin(user);
  const admin = isAdmin(user);

  let coursLink;

  if (admin) {
    coursLink = { label: "Cours", to: "/dashboard/admin/cours" };
  } else if (medecin) {
    coursLink = { label: "Cours", to: "/dashboard/medecin/cours" };
  } else {
    coursLink = { label: "Cours", href: "#cours" };
  }

  return [coursLink, ...BASE_NAV_LINKS];
}

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user, loading, logout } = useAuth();
  const navigate = useNavigate();

  const navLinks = getNavLinks(user);

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
        {/* Logo */}
        <Link to="/" className="navbar__logo">
          <span className="navbar__logo-icon">
            <img src="/assets/logo.jpg" alt="Tbibna" />
          </span>
          <span className="navbar__logo-text">Tbibna</span>
        </Link>

        {/* Navigation Desktop */}
        <nav className="navbar__nav-desktop">
          {navLinks.map((link) =>
            link.to ? (
              <Link key={link.label} to={link.to} className="navbar__link">
                {link.label}
              </Link>
            ) : (
              <a key={link.label} href={link.href} className="navbar__link">
                {link.label}
              </a>
            )
          )}
        </nav>

        {/* Actions droite */}
        <div className="navbar__right-actions">
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

          {/* Hamburger */}
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

      {/* Menu Mobile */}
      <div className={`navbar__mobile-menu ${open ? "open" : ""}`}>
        <div className="navbar__mobile-inner">
          <nav className="navbar__mobile-nav">
            {navLinks.map((link) =>
              link.to ? (
                <Link
                  key={link.label}
                  to={link.to}
                  onClick={() => setOpen(false)}
                  className="navbar__mobile-link"
                >
                  {link.label}
                </Link>
              ) : (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="navbar__mobile-link"
                >
                  {link.label}
                </a>
              )
            )}
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