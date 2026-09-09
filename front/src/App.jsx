import { Routes, Route } from "react-router-dom";
import Navbar from "./Components/Common/Navbar";
import Login from "./Components/auth/Login";       // adapte le chemin si besoin
import Register from "./Components/auth/Register"; // adapte le chemin si besoin
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
} from "lucide-react";

const SPECIALTIES = [
  {
    icon: Stethoscope,
    title: "Cardiologie",
    desc: "ECG, échographie cardiaque, pathologies coronariennes.",
  },
  {
    icon: BookOpen,
    title: "Pédiatrie",
    desc: "Croissance, vaccination, urgences pédiatriques.",
  },
  {
    icon: FileText,
    title: "Radiologie",
    desc: "Lecture d'imagerie, cas commentés, protocoles.",
  },
  {
    icon: Users,
    title: "Médecine générale",
    desc: "Consultation, diagnostic différentiel, suivi patient.",
  },
];

const STATS = [
  { value: "120+", label: "cours vidéo" },
  { value: "45", label: "spécialités" },
  { value: "8 000+", label: "apprenants" },
];

const BENEFITS = [
  {
    icon: ShieldCheck,
    title: "Contenu validé",
    desc: "Cours conçus et validés par des médecins praticiens tunisiens.",
  },
  {
    icon: Play,
    title: "Cas cliniques réels",
    desc: "Des situations concrètes mises à jour chaque mois.",
  },
  {
    icon: Smartphone,
    title: "Accès multi-device",
    desc: "Apprends sur ordinateur, tablette ou smartphone.",
  },
];

function HomePage() {
  return (
    <>
      {/* ===================== HERO ===================== */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-32 left-1/2 h-[520px] w-[900px] -translate-x-1/2 rounded-full bg-[#0F3D3E]/[0.03] blur-3xl" />
          <div className="absolute right-0 top-40 h-72 w-72 rounded-full bg-[#E8C77E]/10 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-6xl px-5 py-16 sm:px-6 md:py-20 lg:px-8 lg:py-28">
          <div className="grid items-center gap-14 lg:grid-cols-2 lg:gap-16">
            <div className="max-w-xl">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#E4DFD3] bg-white/70 px-3.5 py-1.5 text-[13px] font-medium text-[#3E7C6A] shadow-sm backdrop-blur">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#3E7C6A] opacity-60" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-[#3E7C6A]" />
                </span>
                Plateforme e-learning médicale
              </div>

              <h1 className="font-serif text-[2.4rem] font-medium leading-[1.12] tracking-tight text-[#0F3D3E] sm:text-4xl md:text-[2.85rem] lg:text-[3.15rem]">
                Apprends la médecine
                <br />
                <span className="text-[#3E7C6A]">avec des médecins tunisiens</span>
              </h1>

              <p className="mt-5 text-[16.5px] leading-relaxed text-[#3C3A34] sm:text-[17px]">
                Cours structurés, cas cliniques réels et ressources pensés pour
                les étudiants et les praticiens qui veulent progresser à leur rythme.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                <a
                  href="/register"
                  className="group inline-flex items-center gap-2 rounded-xl bg-[#0F3D3E] px-6 py-3.5 text-[15px] font-medium text-[#FBF9F4] shadow-lg shadow-[#0F3D3E]/20 transition-all duration-200 hover:bg-[#0B2D2E] hover:shadow-xl active:scale-[0.98]"
                >
                  Commencer gratuitement
                  <ArrowRight
                    size={17}
                    className="transition-transform duration-200 group-hover:translate-x-0.5"
                  />
                </a>

                <a
                  href="#cours"
                  className="inline-flex items-center gap-2 rounded-xl border border-[#0F3D3E]/15 bg-white/60 px-6 py-3.5 text-[15px] font-medium text-[#0F3D3E] backdrop-blur transition-all duration-200 hover:border-[#0F3D3E]/30 hover:bg-white"
                >
                  <Play size={15} className="fill-current" />
                  Voir les cours
                </a>
              </div>

              <div className="mt-9 flex items-center gap-4">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-[#FBF9F4] bg-[#EFEAE0] text-[11px] font-semibold text-[#0F3D3E]"
                    >
                      {String.fromCharCode(64 + i)}
                    </div>
                  ))}
                </div>
                <div>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star
                        key={i}
                        size={13}
                        className="fill-[#E8C77E] text-[#E8C77E]"
                      />
                    ))}
                  </div>
                  <p className="mt-0.5 text-[13px] text-[#5C5A54]">
                    Aimé par +8 000 étudiants & médecins
                  </p>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="relative aspect-[4/3.2] overflow-hidden rounded-3xl bg-[#0F3D3E] shadow-[0_32px_64px_-16px_rgba(15,61,62,0.35)]">
                <div
                  className="absolute inset-0 opacity-[0.07]"
                  style={{
                    backgroundImage:
                      "radial-gradient(#E8C77E 1.2px, transparent 1.2px)",
                    backgroundSize: "22px 22px",
                  }}
                />
                <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-[#E8C77E]/15 blur-3xl" />
                <div className="absolute -bottom-24 -left-16 h-64 w-64 rounded-full bg-[#3E7C6A]/20 blur-3xl" />

                <div className="relative flex h-full flex-col items-center justify-center gap-6 p-8">
                  <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-white/10 backdrop-blur">
                    <Stethoscope size={48} strokeWidth={1.2} className="text-[#E8C77E]" />
                  </div>

                  <div className="text-center">
                    <p className="font-serif text-2xl font-medium text-white">
                      Apprends autrement
                    </p>
                    <p className="mt-1 text-[14px] text-white/70">
                      Cours • Cas cliniques • Progression
                    </p>
                  </div>

                  <div className="absolute bottom-6 left-6 right-6 flex gap-3">
                    {STATS.map((stat) => (
                      <div
                        key={stat.label}
                        className="flex-1 rounded-xl bg-white/10 px-3 py-2.5 text-center backdrop-blur"
                      >
                        <p className="font-serif text-lg font-medium text-white">
                          {stat.value}
                        </p>
                        <p className="text-[11px] text-white/65">{stat.label}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="absolute -bottom-5 -left-4 hidden rounded-2xl border border-[#E4DFD3] bg-white px-4 py-3 shadow-lg sm:block">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#EFEAE0]">
                    <CheckCircle2 size={18} className="text-[#3E7C6A]" />
                  </div>
                  <div>
                    <p className="text-[13px] font-medium text-[#0F3D3E]">
                      Contenu certifié
                    </p>
                    <p className="text-[12px] text-[#5C5A54]">Par des médecins</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===================== BENEFITS ===================== */}
      <section className="border-t border-[#E4DFD3] bg-white/40">
        <div className="mx-auto max-w-6xl px-5 py-14 sm:px-6 lg:px-8">
          <div className="grid gap-6 md:grid-cols-3">
            {BENEFITS.map((item) => (
              <div
                key={item.title}
                className="flex gap-4 rounded-2xl border border-[#E4DFD3]/80 bg-[#FBF9F4] p-5 transition-all duration-200 hover:border-[#0F3D3E]/20 hover:shadow-md"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#EFEAE0] text-[#3E7C6A]">
                  <item.icon size={20} strokeWidth={1.7} />
                </div>
                <div>
                  <h3 className="text-[15px] font-medium text-[#0F3D3E]">
                    {item.title}
                  </h3>
                  <p className="mt-1 text-[13.5px] leading-relaxed text-[#5C5A54]">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===================== SPÉCIALITÉS ===================== */}
      <section id="specialites" className="border-t border-[#E4DFD3] bg-[#F4F0E6]">
        <div className="mx-auto max-w-6xl px-5 py-16 sm:px-6 md:py-20 lg:px-8 lg:py-24">
          <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
            <div className="max-w-xl">
              <p className="mb-2 text-[13px] font-medium uppercase tracking-wider text-[#3E7C6A]">
                Catalogue
              </p>
              <h2 className="font-serif text-3xl font-medium tracking-tight text-[#0F3D3E] md:text-[2.2rem]">
                Explore par spécialité
              </h2>
              <p className="mt-3 text-[15.5px] leading-relaxed text-[#3C3A34]">
                Chaque spécialité regroupe des cours structurés, des cas
                cliniques réels et des ressources téléchargeables.
              </p>
            </div>

            <a
              href="#cours"
              className="inline-flex items-center gap-1.5 text-[14.5px] font-medium text-[#0F3D3E] transition-colors hover:text-[#3E7C6A]"
            >
              Voir tout le catalogue
              <ArrowRight size={15} />
            </a>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
            {SPECIALTIES.map((item) => (
              <a
                key={item.title}
                href={`#${item.title.toLowerCase()}`}
                className="group relative overflow-hidden rounded-2xl border border-[#E4DFD3] bg-[#FBF9F4] p-6 transition-all duration-300 hover:-translate-y-1 hover:border-[#0F3D3E]/25 hover:shadow-[0_12px_40px_-8px_rgba(15,61,62,0.15)]"
              >
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[#EFEAE0] text-[#3E7C6A] transition-all duration-300 group-hover:scale-105 group-hover:bg-[#0F3D3E] group-hover:text-[#E8C77E]">
                  <item.icon size={22} strokeWidth={1.6} />
                </span>

                <h3 className="mt-5 text-[16.5px] font-medium text-[#0F3D3E]">
                  {item.title}
                </h3>
                <p className="mt-2 text-[14px] leading-relaxed text-[#5C5A54]">
                  {item.desc}
                </p>

                <div className="mt-5 flex items-center gap-1 text-[13px] font-medium text-[#0F3D3E] opacity-0 transition-all duration-300 group-hover:opacity-100">
                  Explorer
                  <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ===================== CTA FINAL ===================== */}
      <section id="a-propos" className="relative overflow-hidden border-t border-[#E4DFD3]">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(15,61,62,0.04)_0%,_transparent_70%)]" />

        <div className="relative mx-auto max-w-3xl px-5 py-20 text-center sm:px-6 md:py-24 lg:px-8">
          <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#0F3D3E] text-[#E8C77E] shadow-lg">
            <Stethoscope size={26} strokeWidth={1.6} />
          </div>

          <h2 className="font-serif text-3xl font-medium tracking-tight text-[#0F3D3E] md:text-[2.3rem]">
            Prêt à rejoindre Tbibna ?
          </h2>
          <p className="mx-auto mt-4 max-w-md text-[16px] leading-relaxed text-[#3C3A34]">
            Crée ton compte gratuitement et commence à progresser dès aujourd’hui
            avec des cours de qualité.
          </p>

          <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
            <a
              href="/register"
              className="group inline-flex items-center gap-2 rounded-xl bg-[#0F3D3E] px-7 py-3.5 text-[15px] font-medium text-[#FBF9F4] shadow-lg shadow-[#0F3D3E]/20 transition-all duration-200 hover:bg-[#0B2D2E] hover:shadow-xl active:scale-[0.98]"
            >
              Créer un compte gratuit
              <ArrowRight
                size={16}
                className="transition-transform duration-200 group-hover:translate-x-0.5"
              />
            </a>
            <a
              href="/login"
              className="rounded-xl border border-[#0F3D3E]/15 bg-white/70 px-7 py-3.5 text-[15px] font-medium text-[#0F3D3E] transition-all hover:bg-white"
            >
              J’ai déjà un compte
            </a>
          </div>
        </div>
      </section>

      {/* ===================== FOOTER ===================== */}
      <footer className="border-t border-[#E4DFD3] bg-[#F4F0E6]/60">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-5 py-8 sm:flex-row sm:px-6 lg:px-8">
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#0F3D3E] text-[#E8C77E]">
              <Stethoscope size={15} strokeWidth={2} />
            </span>
            <span className="font-serif text-[15px] font-medium text-[#0F3D3E]">
              Tbibna
            </span>
          </div>
          <p className="text-[13px] text-[#5C5A54]">
            © {new Date().getFullYear()} Tbibna. Tous droits réservés.
          </p>
        </div>
      </footer>
    </>
  );
}

function App() {
  return (
    <div className="min-h-screen bg-[#FBF9F4] text-[#1C1C1A] antialiased">
      <Navbar />

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </div>
  );
}

export default App;