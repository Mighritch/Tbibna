import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

export default function RoleRedirect() {
  const { user, loading } = useAuth();

  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;

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