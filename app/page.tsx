"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import NeoCareLogo from "@/components/NeoCareLogo";
import { generateWhatsAppLink } from "@/lib/utils";
import {
  ArrowRight,
  Check,
  Clock3,
  MessageSquare,
  Shield,
  UserCheck,
  Calendar,
  Bell,
  Users,
  BarChart3,
  Zap,
  Sparkles,
  Clipboard,
  ChevronRight,
  Settings,
  LayoutDashboard,
  Globe,
  type LucideIcon,
} from "lucide-react";

const SUPER_ADMIN_PHONE = "+22656636039";

export default function Home() {
  const router = useRouter();
  const [demoStep, setDemoStep] = useState(0);
  const [typedText, setTypedText] = useState("");

  const fullResponse = "Bonjour, votre rendez-vous est confirmé pour le 15 mars à 14h00. Un rappel vous sera envoyé 24h avant.";

  useEffect(() => {
    if (demoStep === 1) {
      setTypedText("");
      let i = 0;
      const interval = setInterval(() => {
        if (i < fullResponse.length) {
          setTypedText(fullResponse.slice(0, i + 1));
          i++;
        } else {
          clearInterval(interval);
          setTimeout(() => setDemoStep(2), 500);
        }
      }, 25);
      return () => clearInterval(interval);
    }
  }, [demoStep]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (demoStep === 0) setDemoStep(1);
    }, 1500);
    return () => clearTimeout(timer);
  }, [demoStep]);

  useEffect(() => {
    if (demoStep === 2) {
      const timer = setTimeout(() => {
        setDemoStep(0);
        setTypedText("");
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [demoStep]);

  const handleWhatsAppClick = (message: string) => {
    const url = generateWhatsAppLink(SUPER_ADMIN_PHONE, message);
    window.open(url, "_blank");
  };

  const benefits: { icon: LucideIcon; title: string; description: string }[] = [
    {
      icon: Globe,
      title: "Page de rendez-vous publique",
      description: "Vos patients réservent en ligne 24/7 via votre page personnalisée et sécurisée.",
    },
    {
      icon: LayoutDashboard,
      title: "Dashboard de gestion",
      description: "Pilotez tous vos rendez-vous, services et statistiques depuis un tableau de bord intuitif.",
    },
    {
      icon: Bell,
      title: "Rappels automatiques",
      description: "Réduisez les no-show jusqu'à 40% avec des rappels WhatsApp envoyés automatiquement.",
    },
    {
      icon: BarChart3,
      title: "Statistiques en temps réel",
      description: "Suivez vos performances, taux de remplissage et optimisez votre planning.",
    },
  ];

  const gains: {
    icon: LucideIcon;
    title: string;
    description: string;
    color: string;
    borderColor: string;
    iconBg: string;
    iconColor: string;
  }[] = [
    {
      icon: Clock3,
      title: "Moins de temps perdu",
      description: "Fini les appels téléphoniques répétitifs. Vos patients réservent en ligne.",
      color: "from-blue-500/20 to-blue-600/5",
      borderColor: "border-blue-500/20",
      iconBg: "bg-blue-500/10",
      iconColor: "text-blue-400",
    },
    {
      icon: UserCheck,
      title: "Moins d'absences",
      description: "Réduisez les no-show jusqu'à 40% grâce aux rappels automatiques WhatsApp.",
      color: "from-emerald-500/20 to-emerald-600/5",
      borderColor: "border-emerald-500/20",
      iconBg: "bg-emerald-500/10",
      iconColor: "text-emerald-400",
    },
    {
      icon: MessageSquare,
      title: "Communication fluide",
      description: "Intégration WhatsApp native pour une expérience patient optimale.",
      color: "from-primary-500/20 to-primary-600/5",
      borderColor: "border-primary-500/20",
      iconBg: "bg-primary-500/10",
      iconColor: "text-primary-400",
    },
    {
      icon: Zap,
      title: "Mise en place rapide",
      description: "Configuration complète en moins de 24h. Vous recevez votre page et dashboard prêts à l'emploi.",
      color: "from-amber-500/20 to-amber-600/5",
      borderColor: "border-amber-500/20",
      iconBg: "bg-amber-500/10",
      iconColor: "text-amber-400",
    },
  ];

  const steps: { step: string; title: string; description: string; icon: LucideIcon }[] = [
    {
      step: "01",
      title: "Contactez-nous",
      description: "Envoyez-nous un message WhatsApp pour discuter de vos besoins.",
      icon: MessageSquare,
    },
    {
      step: "02",
      title: "Configuration",
      description: "Nous configurons votre espace : services, horaires, page publique personnalisée.",
      icon: Settings,
    },
    {
      step: "03",
      title: "Réception",
      description: "Vous recevez votre page de RDV publique et votre dashboard de gestion.",
      icon: Sparkles,
    },
    {
      step: "04",
      title: "C'est parti !",
      description: "Commencez à recevoir des rendez-vous en ligne dès le jour même.",
      icon: Calendar,
    },
  ];

  const testimonials = [
    {
      quote: "NeoCare a transformé notre gestion de rendez-vous. Plus de 80% de réduction des no-show grâce aux rappels automatiques. La page publique est très professionnelle.",
      author: "Dr. Amadou D.",
      detail: "Clinique dentaire, Dakar",
      initials: "AD",
    },
    {
      quote: "Le dashboard est très intuitif. Je gère tous mes rendez-vous en quelques clics. Mes patients adorent réserver en ligne.",
      author: "Dr. Fatou K.",
      detail: "Cabinet médical",
      initials: "FK",
    },
    {
      quote: "Configuration en 24h, page publique personnalisée, tout était prêt. Je recommande NeoCare à tous mes confrères.",
      author: "Dr. Mamadou S.",
      detail: "Clinique spécialisée",
      initials: "MS",
    },
  ];

  const stats = [
    { value: "24/7", label: "Prise de RDV disponible", icon: Calendar },
    { value: "40%", label: "Réduction des no-show", icon: UserCheck },
    { value: "24h", label: "Mise en place", icon: Zap },
    { value: "100%", label: "Sécurisé", icon: Shield },
  ];

  return (
    <div className="min-h-screen bg-dark-950">
      {/* ========== HERO ========== */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-4 overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary-500/10 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-primary-700/5 rounded-full blur-[80px]" />
        </div>

        {/* Header */}
        <header className="absolute top-0 left-0 right-0 z-50 border-b border-dark-800/50 bg-dark-950/80 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-2">
                <NeoCareLogo size={32} />
                <span className="text-lg font-bold text-white">NeoCare</span>
              </div>
              <nav className="flex items-center gap-4">
                <button
                  onClick={() => router.push("/login")}
                  className="text-sm text-dark-400 hover:text-white transition-colors"
                >
                  Connexion
                </button>
                <button
                  onClick={() =>
                    handleWhatsAppClick(
                      "Bonjour, je souhaite mettre en place NeoCare pour ma clinique. Pouvez-vous me donner plus d'informations ?"
                    )
                  }
                  className="btn-primary text-sm px-4 py-2"
                >
                  <MessageSquare className="w-4 h-4 mr-2 inline" />
                  Demander un devis
                </button>
              </nav>
            </div>
          </div>
        </header>

        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-primary-500/10 border border-primary-500/20 rounded-full px-4 py-1.5 mb-8">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary-500" />
          </span>
          <span className="text-primary-400 text-xs font-medium">Disponible maintenant</span>
        </div>

        {/* Logo */}
        <div className="mb-6 rounded-3xl overflow-hidden shadow-2xl shadow-primary-500/20">
          <NeoCareLogo size={80} />
        </div>

        {/* Titre */}
        <h1 className="text-5xl sm:text-6xl font-extrabold text-center leading-tight mb-4">
          <span className="bg-gradient-to-r from-white via-white to-dark-300 bg-clip-text text-transparent">
            Votre page de rendez-vous
          </span>
          <br />
          <span className="bg-gradient-to-r from-primary-400 to-primary-600 bg-clip-text text-transparent">
            et votre dashboard en 24h
          </span>
        </h1>

        {/* Sous-titre */}
        <p className="text-dark-400 text-lg sm:text-xl text-center max-w-md mx-auto mb-8 leading-relaxed">
          NeoCare vous fournit une{" "}
          <span className="text-white font-semibold">page de rendez-vous publique</span> et un{" "}
          <span className="text-white font-semibold">dashboard de gestion</span> prêts à l&apos;emploi. Configuration
          complète en moins de 24h.
        </p>

        {/* CTA */}
        <div className="flex flex-col items-center gap-3 w-full max-w-xs">
          <button
            onClick={() =>
              handleWhatsAppClick(
                "Bonjour, je souhaite mettre en place NeoCare pour ma clinique. Pouvez-vous me donner plus d'informations sur les tarifs et le processus de configuration ?"
              )
            }
            className="btn-primary w-full text-center text-lg py-4 shadow-xl shadow-primary-500/30"
          >
            <MessageSquare className="w-5 h-5 mr-2 inline" />
            Demander une démo via WhatsApp
            <ArrowRight className="ml-2 w-5 h-5 inline" />
          </button>
          <p className="text-dark-500 text-xs flex items-center gap-1.5">
            <Check className="w-3.5 h-3.5 text-emerald-500" />
            Configuration en 24h · Page publique personnalisée · Dashboard inclus
          </p>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 animate-bounce">
          <svg
            className="w-5 h-5 text-dark-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </section>

      {/* ========== SOCIAL PROOF STRIP ========== */}
      <section className="py-10 px-4 relative">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-dark-950 via-primary-500/[0.02] to-dark-950" />
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat, i) => {
              const Icon = stat.icon;
              return (
                <div key={i} className="text-center group">
                  <div className="inline-flex items-center justify-center w-10 h-10 rounded-2xl bg-primary-500/10 mb-2 group-hover:scale-110 transition-transform">
                    <Icon className="w-5 h-5 text-primary-400" />
                  </div>
                  <div className="text-2xl sm:text-3xl font-extrabold text-white">{stat.value}</div>
                  <div className="text-xs text-dark-400 mt-0.5">{stat.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ========== CE QUE VOUS RECEVEZ ========== */}
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-14">
            <span className="inline-block text-primary-400 text-sm font-semibold tracking-wider uppercase mb-3">
              Ce que vous recevez
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Page de rendez-vous + Dashboard
            </h2>
            <p className="text-dark-400 max-w-lg mx-auto">
              Tout ce dont vous avez besoin pour moderniser la gestion de vos rendez-vous.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {benefits.map((benefit, i) => (
              <div
                key={i}
                className="group glass-card hover:border-primary-500/30 transition-all duration-300 hover:-translate-y-1"
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 mt-0.5 group-hover:scale-110 transition-transform duration-300 w-10 h-10 rounded-xl bg-primary-500/10 flex items-center justify-center">
                    <benefit.icon className="w-5 h-5 text-primary-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white mb-1.5">{benefit.title}</h3>
                    <p className="text-sm text-dark-400 leading-relaxed">{benefit.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== CE QUE VOUS Y GAGNEZ ========== */}
      <section className="py-20 px-4 relative">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-transparent via-primary-500/[0.03] to-transparent" />
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-14">
            <span className="inline-block text-primary-400 text-sm font-semibold tracking-wider uppercase mb-3">
              Bénéfices
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Ce que vous y gagnez
            </h2>
            <p className="text-dark-400 max-w-lg mx-auto">
              Des résultats concrets pour votre pratique médicale.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {gains.map((gain, i) => (
              <div
                key={i}
                className={`relative overflow-hidden rounded-3xl border ${gain.borderColor} bg-gradient-to-br ${gain.color} p-5 sm:p-6 transition-all duration-300 hover:scale-[1.02]`}
              >
                <div className={`inline-flex items-center justify-center w-10 h-10 rounded-2xl ${gain.iconBg} mb-3`}>
                  <gain.icon className={`w-5 h-5 ${gain.iconColor}`} />
                </div>
                <h3 className="font-semibold text-white mb-1">{gain.title}</h3>
                <p className="text-xs sm:text-sm text-dark-400 leading-relaxed">{gain.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== MINI DEMO ========== */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <span className="inline-block text-primary-400 text-sm font-semibold tracking-wider uppercase mb-3">
              Démo en direct
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Voyez NeoCare en action
            </h2>
            <p className="text-dark-400 max-w-lg mx-auto">
              Un patient réserve en ligne, vous recevez une notification instantanée dans votre dashboard.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            {/* Phone demo */}
            <div className="order-1 md:order-1">
              <div className="relative max-w-sm mx-auto">
                <div className="bg-dark-900 border border-dark-700 rounded-[2rem] p-1.5 shadow-2xl shadow-black/50">
                  <div className="bg-dark-950 rounded-[1.6rem] overflow-hidden">
                    <div className="flex items-center justify-between px-6 py-2 text-[10px] text-dark-400">
                      <span>9:41</span>
                      <div className="flex gap-1">
                        <div className="w-3.5 h-2 bg-dark-600 rounded-sm" />
                        <div className="w-1 h-2 bg-dark-600 rounded-sm" />
                      </div>
                    </div>

                    <div className="px-4 py-2.5 bg-dark-900/50 border-b border-dark-800 flex items-center gap-2.5">
                      <NeoCareLogo size={28} />
                      <div>
                        <div className="text-xs font-semibold text-white">NeoCare</div>
                        <div className="text-[10px] text-primary-400 flex items-center gap-1">
                          Rappel automatique <Bell className="w-2.5 h-2.5" />
                        </div>
                      </div>
                    </div>

                    <div className="p-4 space-y-3 min-h-[220px]">
                      <div className="flex justify-start">
                        <div className="bg-dark-800 rounded-2xl rounded-tl-md px-3.5 py-2.5 max-w-[85%]">
                          <p className="text-xs text-dark-300 mb-1 font-medium">Patient</p>
                          <p className="text-sm text-white">Je souhaite prendre rendez-vous</p>
                        </div>
                      </div>

                      {demoStep >= 1 && (
                        <div className="flex justify-end">
                          <div className="bg-gradient-to-br from-primary-500/20 to-primary-600/10 border border-primary-500/30 rounded-2xl rounded-tr-md px-3.5 py-2.5 max-w-[85%]">
                            <p className="text-xs text-primary-400 mb-1 font-medium">NeoCare</p>
                            <p className="text-sm text-white">
                              {typedText}
                              {demoStep === 1 && (
                                <span className="inline-block w-0.5 h-4 bg-primary-400 ml-0.5 animate-pulse" />
                              )}
                            </p>
                          </div>
                        </div>
                      )}

                      {demoStep === 2 && (
                        <div className="flex justify-center pt-1">
                          <div className="inline-flex items-center gap-1.5 bg-primary-500/20 text-primary-400 text-[11px] font-medium px-3 py-1.5 rounded-full animate-pulse">
                            <Check className="w-3 h-3" /> Rendez-vous confirmé
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="absolute -inset-4 bg-primary-500/10 rounded-[3rem] blur-2xl -z-10" />
              </div>
            </div>

            {/* Explanation */}
            <div className="order-2 md:order-2 space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-dark-800 border border-dark-700 flex items-center justify-center text-sm font-bold text-dark-400 flex-shrink-0">
                  1
                </div>
                <div>
                  <h4 className="font-semibold text-white mb-1">Le patient réserve sur votre page publique</h4>
                  <p className="text-sm text-dark-400">
                    Votre page personnalisée permet la réservation 24/7, même en dehors des heures d&apos;ouverture.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-primary-500/20 border border-primary-500/30 flex items-center justify-center text-sm font-bold text-primary-400 flex-shrink-0">
                  2
                </div>
                <div>
                  <h4 className="font-semibold text-white mb-1">Notification dans votre dashboard</h4>
                  <p className="text-sm text-dark-400">
                    Le rendez-vous apparaît immédiatement dans votre dashboard avec tous les détails du patient.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-dark-800 border border-dark-700 flex items-center justify-center text-sm font-bold text-dark-400 flex-shrink-0">
                  3
                </div>
                <div>
                  <h4 className="font-semibold text-white mb-1">Rappel automatique envoyé</h4>
                  <p className="text-sm text-dark-400">
                    NeoCare envoie un rappel WhatsApp 24h avant pour réduire les absences.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========== COMMENT ÇA MARCHE ========== */}
      <section className="py-20 px-4 relative">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-transparent via-primary-500/[0.03] to-transparent" />
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-14">
            <span className="inline-block text-primary-400 text-sm font-semibold tracking-wider uppercase mb-3">
              En 4 étapes
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Comment ça marche
            </h2>
            <p className="text-dark-400 max-w-lg mx-auto">
              Simple, rapide, efficace. Configuration complète en moins de 24h.
            </p>
          </div>

          <div className="relative">
            <div className="hidden sm:block absolute top-12 left-[calc(12.5%+20px)] right-[calc(12.5%+20px)] h-px bg-gradient-to-r from-primary-500/30 via-primary-500/50 to-primary-500/30" />

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
              {steps.map((step, i) => (
                <div key={i} className="text-center group">
                  <div className="relative inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-dark-800 border border-dark-700 mb-4 group-hover:border-primary-500/50 group-hover:bg-primary-500/10 transition-all duration-300">
                    <step.icon className="w-6 h-6 text-primary-400" />
                    <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-primary-500 text-white text-[10px] font-bold flex items-center justify-center shadow-lg shadow-primary-500/30">
                      {step.step.replace("0", "")}
                    </div>
                  </div>
                  <h4 className="font-semibold text-white text-sm mb-1">{step.title}</h4>
                  <p className="text-xs text-dark-400 leading-relaxed">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ========== TÉMOIGNAGES ========== */}
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-14">
            <span className="inline-block text-primary-400 text-sm font-semibold tracking-wider uppercase mb-3">
              Témoignages
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Ils utilisent NeoCare
            </h2>
            <p className="text-dark-400 max-w-lg mx-auto">
              Découvrez ce que nos utilisateurs en pensent.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {testimonials.map((t, i) => (
              <div key={i} className="glass-card hover:border-primary-500/20 transition-all duration-300">
                <div className="flex gap-0.5 mb-3">
                  {[...Array(5)].map((_, j) => (
                    <svg
                      key={j}
                      className="w-4 h-4 text-amber-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-sm text-dark-300 leading-relaxed mb-4 italic">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-500/20 to-primary-600/10 border border-primary-500/20 flex items-center justify-center text-xs font-bold text-primary-400">
                    {t.initials}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{t.author}</p>
                    <p className="text-[11px] text-dark-500">{t.detail}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== CTA FINAL ========== */}
      <section className="py-20 px-4 relative">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary-500/10 rounded-full blur-[100px]" />
        </div>

        <div className="max-w-lg mx-auto text-center">
          <div className="mb-6 rounded-3xl overflow-hidden inline-block shadow-2xl shadow-primary-500/20">
            <NeoCareLogo size={56} />
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Prêt à moderniser votre gestion de rendez-vous ?
          </h2>
          <p className="text-dark-400 mb-8 text-lg">
            Contactez-nous via WhatsApp et recevez votre page de rendez-vous et dashboard en moins de 24h.
            <br />
            <span className="text-primary-400 font-medium">Configuration complète incluse.</span>
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full max-w-md mx-auto">
            <button
              onClick={() =>
                handleWhatsAppClick(
                  "Bonjour, je souhaite mettre en place NeoCare pour ma clinique. Pouvez-vous me donner plus d'informations sur les tarifs et le processus de configuration ?"
                )
              }
              className="btn-primary text-lg px-8 py-4 shadow-xl shadow-primary-500/30 w-full sm:w-auto"
            >
              <MessageSquare className="w-5 h-5 mr-2 inline" />
              Demander une démo
              <ArrowRight className="ml-2 w-5 h-5 inline" />
            </button>
            <button
              onClick={() =>
                handleWhatsAppClick(
                  "Bonjour, j'aimerais voir un exemple de page de rendez-vous et de dashboard NeoCare avant de me décider."
                )
              }
              className="inline-flex items-center gap-2 px-6 py-4 bg-dark-800 border border-dark-700 text-white font-medium rounded-2xl hover:bg-dark-700 transition-all text-sm w-full sm:w-auto justify-center"
            >
              <Globe className="w-4 h-4" />
              Voir un exemple
            </button>
          </div>

          <p className="text-dark-500 text-xs mt-4">
            Réponse sous 2h · Configuration en 24h · Support en français
          </p>
        </div>
      </section>

      {/* ========== FOOTER ========== */}
      <footer className="py-8 px-4 border-t border-dark-800">
        <div className="max-w-3xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <NeoCareLogo size={24} />
            <span className="text-sm font-semibold text-dark-400">NeoCare</span>
          </div>
          <div className="flex items-center gap-6 text-xs text-dark-500">
            <button
              onClick={() =>
                handleWhatsAppClick("Bonjour, je souhaite obtenir plus d'informations sur NeoCare.")
              }
              className="hover:text-white transition-colors"
            >
              Nous contacter
            </button>
            <button
              onClick={() =>
                handleWhatsAppClick(
                  "Bonjour, je souhaite mettre en place NeoCare pour ma clinique."
                )
              }
              className="hover:text-primary-400 transition-colors"
            >
              Demander un devis
            </button>
          </div>
          <p className="text-dark-600 text-xs">© {new Date().getFullYear()} NeoCare. Tous droits réservés.</p>
        </div>
      </footer>
    </div>
  );
}
