import { Routes, Route } from "react-router-dom";
import Navbar from "./Components/Common/Navbar";
import Login from "./Components/auth/Login";
import Register from "./Components/auth/Register";
import {
  BookOpen,
  Stethoscope,
  Users,
  FileText,
  ArrowRight,
  CheckCircle2,
  Play,
  Star,
  ShieldCheck,
  Smartphone,
  Award,
  Sparkles
} from "lucide-react";

const SPECIALTIES = [
  {
    icon: Stethoscope,
    title: "Cardiologie",
    desc: "ECG, échographie cardiaque, pathologies coronariennes.",
    coursesCount: "24 cours",
  },
  {
    icon: BookOpen,
    title: "Pédiatrie",
    desc: "Croissance, vaccination, urgences pédiatriques.",
    coursesCount: "18 cours",
  },
  {
    icon: FileText,
    title: "Radiologie",
    desc: "Lecture d'imagerie, cas commentés, protocoles.",
    coursesCount: "30 cours",
  },
  {
    icon: Users,
    title: "Médecine générale",
    desc: "Consultation, diagnostic différentiel, suivi patient.",
    coursesCount: "42 cours",
  },
];

const STATS = [
  { value: "120+", label: "Cours vidéo" },
  { value: "45", label: "Spécialités" },
  { value: "8 000+", label: "Praticiens" },
];

const BENEFITS = [
  {
    icon: ShieldCheck,
    title: "Contenu validé & certifié",
    desc: "Conçu et relu par un comité d'experts et enseignants universitaires tunisiens.",
  },
  {
    icon: Play,
    title: "Cas cliniques interactifs",
    desc: "Mises en situation pratiques et vidéos haute définition actualisées chaque mois.",
  },
  {
    icon: Smartphone,
    title: "Apprentissage nomade",
    desc: "Accès illimité et synchronisé sur votre ordinateur, tablette ou smartphone.",
  },
];

function HomePage() {
  return (
    <>
      {/* ===================== HERO SECTION ===================== */}
      <section className="relative overflow-hidden pt-6 pb-20 lg:pt-12 lg:pb-32">
        {/* Glow Effects d'arrière-plan */}
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="animate-glow absolute -top-24 left-1/2 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-[#0F3D3E]/[0.04] blur-3xl" />
          <div className="absolute right-10 top-1/3 h-80 w-80 rounded-full bg-[#D4AF37]/10 blur-3xl" />
        </div>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-8">
            
            {/* Contenu Gauche */}
            <div className="lg:col-span-7">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#0F3D3E]/10 bg-white/80 px-4 py-1.5 text-xs font-semibold tracking-wide text-[#0F3D3E] shadow-sm backdrop-blur-md">
                <span className="flex h-2 w-2 rounded-full bg-[#2A6B59]" />
                <Sparkles size={13} className="text-[#D4AF37]" />
                Plateforme E-learning Médicale Référence en Tunisie
              </div>

              <h1 className="font-serif text-4xl font-semibold leading-[1.15] text-[#0F3D3E] sm:text-5xl lg:text-6xl">
                L’excellence médicale <br />
                <span className="relative inline-block text-[#2A6B59]">
                  à portée de main.
                </span>
              </h1>

              <p className="mt-6 max-w-2xl text-lg text-[#4A4D4A] leading-relaxed">
                Accédez à des cours structurés, des cas cliniques interactifs et des ressources exclusives élaborés par les meilleurs spécialistes tunisiens.
              </p>

              {/* Boutons d'action */}
              <div className="mt-8 flex flex-wrap items-center gap-4">
                <a
                  href="/register"
                  className="group inline-flex items-center gap-2.5 rounded-xl bg-[#0F3D3E] px-7 py-4 text-sm font-semibold text-white shadow-lg shadow-[#0F3D3E]/20 transition-all duration-300 hover:bg-[#082829] hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0"
                >
                  Commencer gratuitement
                  <ArrowRight size={18} className="transition-transform duration-300 group-hover:translate-x-1" />
                </a>

                <a
                  href="#cours"
                  className="inline-flex items-center gap-2 rounded-xl border border-[#0F3D3E]/15 bg-white/60 px-6 py-4 text-sm font-semibold text-[#0F3D3E] backdrop-blur-md transition-all duration-300 hover:border-[#0F3D3E]/30 hover:bg-white hover:shadow-md"
                >
                  <Play size={16} className="fill-current text-[#0F3D3E]" />
                  Découvrir les cours
                </a>
              </div>

              {/* Preuve sociale */}
              <div className="mt-10 flex items-center gap-4 border-t border-[#E6E1D5] pt-6">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map((i) => (
                    <img
                      key={i}
                      className="inline-block h-10 w-10 rounded-full border-2 border-white object-cover shadow-sm"
                      src={`https://i.pravatar.cc/100?img=${i + 10}`}
                      alt="Utilisateur"
                    />
                  ))}
                </div>
                <div>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star key={i} size={14} className="fill-[#D4AF37] text-[#D4AF37]" />
                    ))}
                  </div>
                  <p className="mt-0.5 text-xs font-medium text-[#737873]">
                    Rejoint par <strong className="text-[#0F3D3E]">8 000+</strong> étudiants & médecins
                  </p>
                </div>
              </div>
            </div>

            {/* Visuel Droite */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto aspect-[4/4.2] w-full max-w-md overflow-hidden rounded-3xl bg-gradient-to-br from-[#0F3D3E] to-[#082829] p-8 text-white shadow-2xl">
                
                {/* Décoration en arrière-plan */}
                <div className="absolute inset-0 bg-[radial-gradient(#D4AF37_1px,transparent_1px)] [background-size:20px_20px] opacity-10" />
                <div className="absolute -right-10 -top-10 h-48 w-48 rounded-full bg-[#D4AF37]/20 blur-2xl" />

                <div className="relative flex h-full flex-col justify-between z-10">
                  <div className="flex items-center justify-between">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-md">
                      <Stethoscope size={24} className="text-[#D4AF37]" />
                    </div>
                    <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white/90 backdrop-blur-md">
                      <Award size={14} className="text-[#D4AF37]" />
                      Qualité Garantie
                    </span>
                  </div>

                  <div className="my-auto py-6">
                    <p className="font-serif text-2xl font-medium leading-snug">
                      Développez votre expertise clinique au quotidien.
                    </p>
                    <p className="mt-2 text-sm text-white/70">
                      Module en direct : Cas complexes en Cardiologie
                    </p>
                  </div>

                  {/* Badges de statistiques */}
                  <div className="grid grid-cols-3 gap-2 rounded-2xl bg-white/10 p-3 backdrop-blur-md">
                    {STATS.map((stat) => (
                      <div key={stat.label} className="text-center">
                        <p className="font-serif text-base font-semibold text-white">{stat.value}</p>
                        <p className="text-[10px] text-white/70 uppercase tracking-wider">{stat.label}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Floating Badge */}
              <div className="animate-float absolute -bottom-6 -left-6 hidden rounded-2xl border border-[#E6E1D5] bg-white p-4 shadow-xl sm:flex sm:items-center sm:gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#EBF3F0] text-[#2A6B59]">
                  <CheckCircle2 size={20} />
                </div>
                <div>
                  <p className="text-xs font-bold text-[#0F3D3E]">Contenu mis à jour</p>
                  <p className="text-[11px] text-[#737873]">Conforme aux dernières recommandations</p>
                </div>
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* ===================== BENEFITS SECTION ===================== */}
      <section className="border-y border-[#E6E1D5] bg-white/60 py-12 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 md:grid-cols-3">
            {BENEFITS.map((item) => (
              <div
                key={item.title}
                className="group flex gap-4 rounded-2xl border border-[#E6E1D5]/60 bg-[#FAF8F5] p-6 transition-all duration-300 hover:border-[#0F3D3E]/20 hover:bg-white hover:shadow-lg hover:-translate-y-1"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#EBF3F0] text-[#2A6B59] transition-colors duration-300 group-hover:bg-[#0F3D3E] group-hover:text-[#D4AF37]">
                  <item.icon size={22} />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-[#0F3D3E]">{item.title}</h3>
                  <p className="mt-1 text-sm text-[#737873] leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===================== SPECIALTIES SECTION ===================== */}
      <section id="specialites" className="py-20 lg:py-28 bg-[#F3EFE6]/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-[#2A6B59]">
                Découvrez nos modules
              </span>
              <h2 className="mt-2 font-serif text-3xl font-semibold text-[#0F3D3E] sm:text-4xl">
                Explorer par spécialité
              </h2>
            </div>
            <a
              href="#cours"
              className="group inline-flex items-center gap-2 text-sm font-semibold text-[#0F3D3E] transition-colors hover:text-[#2A6B59]"
            >
              Voir le catalogue complet
              <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
            </a>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {SPECIALTIES.map((item) => (
              <a
                key={item.title}
                href={`#${item.title.toLowerCase()}`}
                className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-[#E6E1D5] bg-white p-6 transition-all duration-300 hover:-translate-y-1.5 hover:border-[#0F3D3E]/30 hover:shadow-xl"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[#FAF8F5] text-[#0F3D3E] transition-colors duration-300 group-hover:bg-[#0F3D3E] group-hover:text-[#D4AF37]">
                      <item.icon size={22} />
                    </span>
                    <span className="text-[11px] font-medium text-[#737873] bg-[#FAF8F5] px-2.5 py-1 rounded-full border border-[#E6E1D5]">
                      {item.coursesCount}
                    </span>
                  </div>

                  <h3 className="mt-5 text-lg font-semibold text-[#0F3D3E]">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm text-[#737873] leading-relaxed">
                    {item.desc}
                  </p>
                </div>

                <div className="mt-6 flex items-center gap-1.5 text-xs font-bold text-[#0F3D3E] transition-colors group-hover:text-[#2A6B59]">
                  Accéder aux cours
                  <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ===================== CTA FINAL ===================== */}
      <section className="relative overflow-hidden py-20 lg:py-28 bg-white border-t border-[#E6E1D5]">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#0F3D3E] text-[#D4AF37] shadow-xl">
            <Stethoscope size={30} />
          </div>

          <h2 className="font-serif text-3xl font-semibold text-[#0F3D3E] sm:text-4xl">
            Prêt à perfectionner votre pratique médicale ?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base text-[#737873]">
            Rejoignez la communauté Tbibna et accédez dès aujourd'hui aux meilleures ressources médicales en ligne.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <a
              href="/register"
              className="group inline-flex items-center gap-2.5 rounded-xl bg-[#0F3D3E] px-8 py-4 text-sm font-semibold text-white shadow-lg transition-all duration-300 hover:bg-[#082829] hover:shadow-xl hover:-translate-y-0.5"
            >
              Créer mon compte gratuit
              <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
            </a>
            <a
              href="/login"
              className="rounded-xl border border-[#0F3D3E]/20 bg-[#FAF8F5] px-8 py-4 text-sm font-semibold text-[#0F3D3E] transition-all hover:bg-white hover:border-[#0F3D3E]/40"
            >
              Se connecter
            </a>
          </div>
        </div>
      </section>

      {/* ===================== FOOTER ===================== */}
      <footer className="border-t border-[#E6E1D5] bg-[#FAF8F5] py-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 sm:flex-row sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#0F3D3E] text-[#D4AF37]">
              <Stethoscope size={14} />
            </span>
            <span className="font-serif text-base font-bold text-[#0F3D3E]">
              Tbibna
            </span>
          </div>
          <p className="text-xs text-[#737873]">
            © {new Date().getFullYear()} Tbibna. Plateforme d'apprentissage médical. Tous droits réservés.
          </p>
        </div>
      </footer>
    </>
  );
}

function App() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F5] text-[#181919] antialiased">
      <Navbar />

      <main className="flex-1 flex flex-col">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;