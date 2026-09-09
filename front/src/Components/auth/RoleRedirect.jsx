import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

export default function RoleRedirect() {
  const { user, loading } = useAuth();

  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;

  return (
    <Navigate
      to={user.role === "ROLE_MEDECIN" ? "/dashboard/medecin" : "/dashboard/etudiant"}
      replace
    />
  );
}