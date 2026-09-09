/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Vérifie si l'utilisateur est déjà connecté au chargement
  useEffect(() => {
    fetch("/api/me", {
      credentials: "include", // important pour les cookies de session
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && !data.error) setUser(data);
      })
      .catch(() => {
        // Pas grave : simplement pas de session active
      })
      .finally(() => setLoading(false));
  }, []);

  const login = async (email, password) => {
    const response = await fetch("/api/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Identifiants incorrects");
    }

    setUser(data.user);
    return data;
  };

  const logout = async () => {
    try {
      await fetch("/api/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch (err) {
      // On log l'erreur mais on continue quand même la déconnexion côté front
      console.error("Erreur lors de la déconnexion côté serveur :", err);
    } finally {
      // Toujours nettoyer l'état local, même si la requête serveur échoue
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook personnalisé pour consommer le contexte facilement
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}