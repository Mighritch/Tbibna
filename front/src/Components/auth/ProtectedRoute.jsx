import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

export default function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FBF9F4]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#0F3D3E]/30 border-t-[#0F3D3E]" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Connecté mais mauvais rôle -> renvoyer vers son propre dashboard
    if (user.role === "ROLE_MEDECIN") {
      return <Navigate to="/dashboard/medecin" replace />;
    }
    if (user.role === "ROLE_ETUDIANT") {
      return <Navigate to="/dashboard/etudiant" replace />;
    }
    if (user.role === "ROLE_ADMIN") {
      return <Navigate to="/dashboard/admin" replace />;
    }
    return <Navigate to="/" replace />;
  }

  return children;
}