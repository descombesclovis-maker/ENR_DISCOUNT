import React, { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  Boxes,
  Factory,
  Lock,
  Map,
  PackageSearch,
  ShieldCheck,
  Sparkles,
  SunMedium,
  UserCheck,
  Users,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useProfessionalAuth } from "../context/ProfessionalAuthContext";

const UNIVERSES = [
  {
    id: "outlet",
    shortLabel: "OUTLET",
    title: "QEH OUTLET",
    eyebrow: "Équipement · Déstockage · Bonnes affaires",
    headline: "Le matériel technique au prix juste.",
    accent: "#ff5a00",
    accentSoft: "#ff9b62",
    logo: "/images/qeh-outlet-logo.jpg",
    image: "/images/editorial/qeh-outlet-showroom.jpg",
    imageAlt: "Univers QEH OUTLET",
    glow: "rgba(255,90,0,.30)",
  },
  {
    id: "energies",
    shortLabel: "ÉNERGIES",
    title: "QEH ÉNERGIES",
    eyebrow: "Production locale · Solaire · Territoire",
    headline: "L'énergie produite près de chez vous.",
    accent: "#82d246",
    accentSoft: "#b7ef8c",
    logo: "/images/qeh-energies-logo.png",
    image: "/images/editorial/qeh-energies-territoire.jpg",
    imageAlt: "Univers QEH ÉNERGIES",
    glow: "rgba(130,210,70,.28)",
  },
  {
    id: "partner",
    shortLabel: "PARTNER",
    title: "QEH PARTNER",
    eyebrow: "Professionnels · Production · Développement",
    headline: "L'univers professionnel du groupe QEH.",
    accent: "#e5bd58",
    accentSoft: "#f6df98",
    logo: "/images/qeh-partner-logo-gold.png",
    image: "/images/editorial/qeh-partner-logistique.jpg",
    imageAlt: "Univers QEH PARTNER",
    glow: "rgba(229,189,88,.28)",
  },
];

function UniverseSelector({ activeId, onSelect }) {
  return (
    <div className="mx-auto flex w-[min(92vw,980px)] items-center justify-center gap-1 rounded-full border border-white/10 bg-white/[.045] p-1.5 shadow-[0_18px_60px_rgba(0,0,0,.22)] backdrop-blur-xl">
      {UNIVERSES.map((universe) => {
        const active = activeId === universe.id;

        return (
          <motion.button
            key={universe.id}
            type="button"
            onClick={() => onSelect(universe.id)}
            className="relative flex min-h-[clamp(44px,5vw,56px)] flex-1 items-center justify-center rounded-full px-2 text-[clamp(9px,1.1vw,14px)] font-black uppercase tracking-[.12em] text-white/55 transition hover:text-white"
            aria-pressed={active}
          >
            {active ? (
              <motion.span
                layoutId="qeh-active-selector"
                className="absolute inset-0 rounded-full border border-white/15 bg-white/[.09] shadow-[0_10px_28px_rgba(0,0,0,.20)]"
                transition={{ type: "spring", stiffness: 320, damping: 30 }}
              />
            ) : null}

            <span className="relative flex items-center gap-[clamp(6px,1vw,12px)]">
              <span
                className="h-[clamp(7px,.8vw,10px)] w-[clamp(7px,.8vw,10px)] rounded-full"
                style={{
                  background: universe.accent,
                  boxShadow: active ? `0 0 16px ${universe.accent}` : "none",
                }}
              />
              {universe.shortLabel}
            </span>
          </motion.button>
        );
      })}
    </div>
  );
}

function ActionButton({ action, accent, primary }) {
  const Icon = action.icon;

  return (
    <Link
      to={action.to}
      className={`group flex min-h-[clamp(68px,7vw,88px)] items-center justify-between gap-4 rounded-[clamp(18px,2vw,26px)] border px-[clamp(16px,2.2vw,28px)] py-[clamp(14px,1.8vw,20px)] transition duration-300 hover:-translate-y-1 ${
        primary
          ? "border-transparent text-white shadow-[0_18px_50px_rgba(0,0,0,.28)]"
          : "border-white/10 bg-white/[.055] text-white hover:bg-white/[.085]"
      }`}
      style={primary ? { background: accent } : undefined}
    >
      <span className="flex items-center gap-[clamp(10px,1.4vw,16px)]">
        <span
          className={`grid h-[clamp(38px,4vw,48px)] w-[clamp(38px,4vw,48px)] shrink-0 place-items-center rounded-full ${
            primary ? "bg-black/15" : "bg-white/[.07]"
          }`}
        >
          <Icon className="h-[clamp(18px,2vw,24px)] w-[clamp(18px,2vw,24px)]" />
        </span>
        <span className="text-[clamp(13px,1.35vw,16px)] font-black leading-tight">{action.label}</span>
      </span>
      <ArrowRight className="h-[clamp(16px,1.8vw,20px)] w-[clamp(16px,1.8vw,20px)] shrink-0 transition-transform group-hover:translate-x-1" />
    </Link>
  );
}

function LogoCluster({ activeId, onSelect, reduceMotion, compact }) {
  const positions = [
    { left: "36%", top: "56%", rotate: -8 },
    { left: "50%", top: "40%", rotate: 4 },
    { left: "64%", top: "58%", rotate: 8 },
  ];

  return (
    <div className={`relative mx-auto w-full ${compact ? "h-[clamp(120px,15vw,185px)]" : "h-[clamp(240px,31vw,390px)]"}`}>
      {UNIVERSES.map((item, index) => {
        const isActive = item.id === activeId;
        const position = positions[index];
        const sizeClass = compact
          ? "h-[clamp(88px,10vw,150px)] w-[clamp(88px,10vw,150px)]"
          : "h-[clamp(108px,12vw,190px)] w-[clamp(108px,12vw,190px)]";

        return (
          <motion.button
            key={item.id}
            type="button"
            onClick={() => onSelect(item.id)}
            className={`absolute ${sizeClass} -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-full border bg-[#06101d] p-[clamp(9px,1.3vw,20px)] shadow-2xl outline-none focus-visible:ring-2 focus-visible:ring-white/80`}
            style={{
              left: position.left,
              top: position.top,
              zIndex: isActive ? 4 : 2 - index,
              borderColor: isActive ? item.accent : "rgba(255,255,255,.12)",
              boxShadow: isActive
                ? `0 24px 80px ${item.glow}`
                : "0 24px 70px rgba(0,0,0,.45)",
            }}
            animate={
              reduceMotion
                ? { scale: isActive ? 1.12 : 0.9, opacity: isActive ? 1 : 0.58 }
                : {
                    scale: isActive ? 1.12 : 0.9,
                    opacity: isActive ? 1 : 0.58,
                    y: [0, -6 - index * 2, 0],
                    rotate: [position.rotate, position.rotate + 2, position.rotate],
                  }
            }
            transition={
              reduceMotion
                ? { duration: 0.2 }
                : {
                    duration: 4.5 + index * 0.6,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }
            }
            aria-label={`Choisir ${item.title}`}
          >
            <img
              src={item.logo}
              alt={item.title}
              className="h-full w-full rounded-full object-contain"
              draggable="false"
            />
          </motion.button>
        );
      })}
    </div>
  );
}

function UnifiedHome({ activeId, onSelect, universe, actions, reduceMotion }) {
  return (
    <div className="relative min-h-screen overflow-hidden px-[clamp(14px,3vw,40px)] pb-[clamp(32px,5vw,64px)] pt-[clamp(24px,4vw,48px)]">
      <div className="mx-auto max-w-[1100px] text-center">
        <p className="text-[clamp(9px,.8vw,12px)] font-black uppercase tracking-[.28em] text-white/35">QEH</p>
        <h1 className="mt-2 font-display text-[clamp(2rem,4.2vw,4rem)] font-black leading-none tracking-[-.05em]">
          Un groupe. Trois univers.
        </h1>
        <p className="mt-3 text-[clamp(12px,1.2vw,16px)] text-white/48">Choisissez votre univers.</p>
      </div>

      <div className="mt-[clamp(20px,2.5vw,32px)]">
        <UniverseSelector activeId={activeId} onSelect={onSelect} />
      </div>

      <div className="mx-auto mt-[clamp(12px,2vw,24px)] w-[min(94vw,920px)]">
        <AnimatePresence mode="wait">
          {universe ? (
            <motion.div
              key={universe.id}
              initial={reduceMotion ? false : { opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduceMotion ? undefined : { opacity: 0, y: 12 }}
              transition={{ duration: reduceMotion ? 0.15 : 0.4 }}
            >
              <div className="relative pt-[clamp(72px,8vw,110px)]">
                <div className="absolute left-1/2 top-0 z-20 w-full -translate-x-1/2">
                  <LogoCluster
                    activeId={activeId}
                    onSelect={onSelect}
                    reduceMotion={reduceMotion}
                    compact
                  />
                </div>

                <div className="relative overflow-hidden rounded-[clamp(24px,3vw,36px)] border border-white/10 bg-black/25 shadow-2xl">
                  <div className="relative aspect-[16/9]">
                    <img
                      src={universe.image}
                      alt={universe.imageAlt}
                      className="h-full w-full object-cover opacity-80"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#030811] via-[#030811]/30 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-[clamp(16px,3vw,32px)]">
                      <p
                        className="text-[clamp(8px,.9vw,12px)] font-black uppercase tracking-[.18em]"
                        style={{ color: universe.accentSoft }}
                      >
                        {universe.eyebrow}
                      </p>
                      <h2 className="mt-2 font-display text-[clamp(1.35rem,3vw,2.5rem)] font-black leading-none tracking-[-.04em]">
                        {universe.headline}
                      </h2>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-[clamp(10px,1.6vw,20px)] space-y-[clamp(8px,1vw,12px)]">
                {actions.map((action, index) => (
                  <ActionButton
                    key={`${universe.id}-${action.label}`}
                    action={action}
                    accent={universe.accent}
                    primary={index === 0}
                  />
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="idle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="pt-[clamp(8px,1vw,16px)]"
            >
              <LogoCluster
                activeId={activeId}
                onSelect={onSelect}
                reduceMotion={reduceMotion}
              />
              <p className="-mt-[clamp(18px,2vw,30px)] text-center text-[clamp(12px,1.2vw,16px)] font-bold text-white/42">
                Touchez un logo ou utilisez le sélecteur pour ouvrir un univers.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default function UniverseHome() {
  const reduceMotion = useReducedMotion();
  const { isProfessional } = useProfessionalAuth();
  const [activeId, setActiveId] = useState(null);

  useEffect(() => {
    document.title = "QEH | Trois univers";
  }, []);

  const activeUniverse = useMemo(
    () => UNIVERSES.find((universe) => universe.id === activeId) || null,
    [activeId]
  );

  const actions = useMemo(() => {
    if (!activeUniverse) return [];

    if (activeUniverse.id === "outlet") {
      return [
        { label: "Explorer le catalogue", to: "/produits", icon: Boxes },
        { label: "Découvrir QEH OUTLET", to: "/qeh-outlet", icon: Sparkles },
        { label: "Suivre ma commande", to: "/suivi-commande", icon: PackageSearch },
      ];
    }

    if (activeUniverse.id === "energies") {
      return [
        { label: "Explorer la carte solaire", to: "/qeh-energies/carte-solaire", icon: Map },
        { label: "Comment ça marche", to: "/qeh-energies/comment-ca-marche", icon: SunMedium },
        { label: "Participer", to: "/qeh-energies/participer", icon: Users },
      ];
    }

    return [
      {
        label: isProfessional ? "Accéder au matériel Pro" : "Accéder au catalogue Pro",
        to: isProfessional ? "/qeh-partner/materiel-pro" : "/qeh-partner/connexion-pro",
        icon: isProfessional ? ShieldCheck : Lock,
      },
      { label: "Devenir producteur", to: "/qeh-partner/production", icon: Factory },
      { label: "Devenir franchisé", to: "/qeh-partner/franchise", icon: UserCheck },
    ];
  }, [activeUniverse, isProfessional]);

  const background = activeUniverse
    ? `radial-gradient(circle at 70% 20%, ${activeUniverse.glow}, transparent 33%), radial-gradient(circle at 20% 72%, ${activeUniverse.glow}, transparent 28%), linear-gradient(145deg,#020711 0%,#06111f 48%,#02050b 100%)`
    : "radial-gradient(circle at 26% 70%, rgba(255,90,0,.18), transparent 30%), radial-gradient(circle at 50% 34%, rgba(130,210,70,.14), transparent 30%), radial-gradient(circle at 74% 70%, rgba(229,189,88,.14), transparent 30%), linear-gradient(145deg,#020711 0%,#071321 52%,#02050b 100%)";

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#020711] text-white">
      <motion.div
        className="pointer-events-none absolute inset-0"
        animate={{ opacity: 1 }}
        style={{ background }}
        transition={{ duration: reduceMotion ? 0 : 0.7 }}
      />

      <div className="pointer-events-none absolute inset-0 opacity-[.16] [background-image:linear-gradient(rgba(255,255,255,.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.08)_1px,transparent_1px)] [background-size:64px_64px] [mask-image:linear-gradient(to_bottom,black,transparent_88%)]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-black/35 to-transparent" />

      <UnifiedHome
        activeId={activeId}
        onSelect={setActiveId}
        universe={activeUniverse}
        actions={actions}
        reduceMotion={reduceMotion}
      />
    </main>
  );
}
