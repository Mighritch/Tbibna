/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/me", {
      credentials: "include",
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && !data.error) setUser(data);
      })
      .catch(() => {})
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

    // Protection contre les réponses HTML (erreur 500 Symfony)
    const contentType = response.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) {
      const text = await response.text();
      console.error("Réponse non-JSON du serveur :", text.substring(0, 300));
      throw new Error("Erreur serveur (500). Vérifiez les logs Symfony.");
    }

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
      console.error("Erreur lors de la déconnexion côté serveur :", err);
    } finally {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}