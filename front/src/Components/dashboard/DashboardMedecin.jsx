import { useAuth } from "../auth/AuthContext";

export default function DashboardMedecin() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-[#FBF9F4] p-8">
      <div className="mx-auto max-w-5xl">
        <div className="flex items-center justify-between mb-8">
          <h1 className="font-serif text-3xl font-bold text-[#0F3D3E]">
            Bienvenue Dr. {user?.nom} à votre espace Médecin 👋
          </h1>
        </div>
      </div>
    </div>
  );
}