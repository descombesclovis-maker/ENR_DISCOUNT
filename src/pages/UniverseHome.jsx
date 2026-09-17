import React, { useEffect } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Boxes, Factory, Map, PackageSearch, Sparkles, Store, SunMedium, Users } from "lucide-react";
import { Link } from "react-router-dom";

const universes = [
  {
    id: "outlet",
    name: "QEH OUTLET",
    tagline: "Le matériel technique à prix déstockage",
    description: "Équipements solaires, chauffage, climatisation, plomberie et électricité sélectionnés pour leur valeur réelle.",
    logo: "/images/qeh-outlet-logo.jpg",
    image: "/images/editorial/qeh-outlet-showroom.jpg",
    to: "/qeh-outlet",
    accent: "#ff5a00",
    glow: "rgba(255,90,0,.32)",
    links: [
      { label: "Catalogue", to: "/produits", icon: Boxes },
      { label: "Prix outlet", to: "/qeh-outlet", icon: Store },
      { label: "Suivi de commande", to: "/suivi-commande", icon: PackageSearch },
    ],
  },
  {
    id: "energies",
    name: "QEH ÉNERGIES",
    tagline: "L'énergie solaire produite près de chez vous",
    description: "Un univers dédié à la production locale, aux projets photovoltaïques et aux communautés énergétiques de demain.",
    logo: "/images/qeh-energies-logo.png",
    image: "/images/editorial/qeh-energies-territoire.jpg",
    to: "/qeh-energies",
    accent: "#82d246",
    glow: "rgba(130,210,70,.28)",
    links: [
      { label: "Carte solaire", to: "/qeh-energies/carte-solaire", icon: Map },
      { label: "Comment ça marche", to: "/qeh-energies/comment-ca-marche", icon: SunMedium },
      { label: "Participer", to: "/qeh-energies/participer", icon: Users },
    ],
  },
  {
    id: "partner",
    name: "QEH PARTNER",
    tagline: "Le réseau professionnel qui construit plus loin",
    description: "Production, franchises et matériel réservé aux professionnels dans une expérience sécurisée et spécialisée.",
    logo: "/images/qeh-partner-logo-gold.png",
    image: "/images/editorial/qeh-partner-logistique.jpg",
    to: "/qeh-partner",
    accent: "#f2cf79",
    glow: "rgba(242,207,121,.26)",
    links: [
      { label: "Production", to: "/qeh-partner/production", icon: Factory },
      { label: "Matériel Pro", to: "/qeh-partner/connexion-pro", icon: Boxes },
      { label: "Franchise", to: "/qeh-partner/franchise", icon: Sparkles },
    ],
  },
];

export default function UniverseHome() {
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    document.title = "QEH | Trois univers, une même exigence";
  }, []);

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#020711] text-white">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-12rem] top-[-12rem] h-[34rem] w-[34rem] rounded-full bg-[#0b5ca8]/20 blur-[110px]" />
        <div className="absolute bottom-[-15rem] right-[-12rem] h-[38rem] w-[38rem] rounded-full bg-[#82d246]/10 blur-[120px]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.035)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:linear-gradient(to_bottom,black,transparent_88%)]" />
      </div>

      <section className="relative mx-auto max-w-[1500px] px-4 pb-16 pt-10 sm:px-8 sm:pb-20 sm:pt-14">
        <motion.header
          initial={reduceMotion ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65 }}
          className="mx-auto max-w-4xl text-center"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[.05] px-4 py-2 text-[11px] font-black uppercase tracking-[.24em] text-white/65 backdrop-blur-xl">
            <Sparkles className="h-4 w-4 text-[#f2cf79]" />
            Bienvenue dans l'écosystème QEH
          </div>
          <h1 className="mt-6 font-display text-4xl font-black leading-[.98] tracking-[-.04em] sm:text-6xl lg:text-7xl">
            Trois univers.
            <span className="block bg-gradient-to-r from-[#55a8ff] via-[#82d246] to-[#f2cf79] bg-clip-text text-transparent">
              Une même exigence.
            </span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-sm leading-relaxed text-slate-300 sm:text-base">
            Choisissez votre univers et accédez directement aux services, produits et projets qui vous correspondent.
          </p>
        </motion.header>

        <div className="mt-10 grid gap-5 lg:mt-14 lg:grid-cols-3">
          {universes.map((universe, index) => (
            <motion.article
              key={universe.id}
              initial={reduceMotion ? false : { opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: reduceMotion ? 0 : index * 0.11 }}
              whileHover={reduceMotion ? undefined : { y: -8 }}
              className="group relative min-h-[590px] overflow-hidden rounded-[34px] border border-white/10 bg-[#07101f] shadow-[0_30px_90px_rgba(0,0,0,.3)]"
              style={{ "--universe-accent": universe.accent, "--universe-glow": universe.glow }}
            >
              <img
                src={universe.image}
                alt=""
                aria-hidden="true"
                className="absolute inset-0 h-full w-full object-cover opacity-50 transition duration-700 group-hover:scale-105 group-hover:opacity-60"
              />
              <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(2,7,17,.12)_0%,rgba(2,7,17,.72)_46%,#020711_82%)]" />
              <div className="absolute inset-x-12 top-0 h-px bg-gradient-to-r from-transparent via-[var(--universe-accent)] to-transparent opacity-90" />
              <div className="absolute -right-20 top-20 h-52 w-52 rounded-full bg-[var(--universe-glow)] blur-[75px] transition duration-700 group-hover:scale-125" />

              <div className="relative flex h-full flex-col p-6 sm:p-8">
                <Link
                  to={universe.to}
                  aria-label={`Entrer dans ${universe.name}`}
                  className="flex min-h-[116px] items-center justify-center overflow-hidden rounded-3xl border border-white/15 bg-[#020711]/85 p-4 shadow-2xl backdrop-blur-xl transition hover:border-[var(--universe-accent)]"
                >
                  <img src={universe.logo} alt={universe.name} className="max-h-[88px] w-full object-contain" />
                </Link>

                <div className="mt-auto pt-24">
                  <p className="text-xs font-black uppercase tracking-[.18em] text-[var(--universe-accent)]">
                    {universe.tagline}
                  </p>
                  <p className="mt-3 text-sm leading-relaxed text-slate-300">{universe.description}</p>

                  <div className="mt-6 space-y-2">
                    {universe.links.map((item) => {
                      const Icon = item.icon;
                      return (
                        <Link
                          key={item.to}
                          to={item.to}
                          className="flex min-h-12 items-center gap-3 rounded-2xl border border-white/[.08] bg-white/[.045] px-4 text-sm font-extrabold text-white/85 transition hover:border-[var(--universe-accent)] hover:bg-white/[.09] hover:text-white"
                        >
                          <Icon className="h-5 w-5 text-[var(--universe-accent)]" />
                          <span>{item.label}</span>
                          <ArrowRight className="ml-auto h-4 w-4 transition group-hover:translate-x-0.5" />
                        </Link>
                      );
                    })}
                  </div>

                  <Link
                    to={universe.to}
                    className="mt-5 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-[var(--universe-accent)] px-6 font-black text-[#020711] shadow-[0_14px_40px_var(--universe-glow)] transition hover:brightness-110"
                  >
                    Entrer dans l'univers
                    <ArrowRight className="h-5 w-5" />
                  </Link>
                </div>
              </div>
            </motion.article>
          ))}
        </div>

        <footer className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-7 text-center text-xs text-white/45 sm:flex-row sm:text-left">
          <p>© {new Date().getFullYear()} QEH — Tous droits réservés.</p>
          <div className="flex flex-wrap justify-center gap-x-5 gap-y-2 sm:justify-end">
            <Link to="/conditions-generales" className="transition hover:text-white">Conditions d'utilisation</Link>
            <Link to="/politique-de-confidentialite" className="transition hover:text-white">Politique de confidentialité</Link>
          </div>
        </footer>
      </section>
    </main>
  );
}
