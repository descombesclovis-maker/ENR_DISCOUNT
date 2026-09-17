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
    description:
      "Panneaux solaires, chauffage, climatisation, plomberie et équipements techniques disponibles immédiatement ou sur demande.",
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
    description:
      "Explorez les projets et producteurs autour de vous, comprenez l'écosystème et participez à une énergie plus locale.",
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
    description:
      "Accédez au matériel professionnel, développez la production QEH ou rejoignez le réseau en devenant franchisé.",
    accent: "#e5bd58",
    accentSoft: "#f6df98",
    logo: "/images/qeh-partner-logo-gold.png",
    image: "/images/editorial/qeh-partner-logistique.jpg",
    imageAlt: "Univers QEH PARTNER",
    glow: "rgba(229,189,88,.28)",
  },
];

const INITIAL_POSITIONS = {
  outlet: { left: "39%", top: "54%", size: 220, rotate: -8, zIndex: 3 },
  energies: { left: "51%", top: "43%", size: 210, rotate: 5, zIndex: 2 },
  partner: { left: "59%", top: "58%", size: 198, rotate: 9, zIndex: 1 },
};

const COMPACT_POSITIONS = {
  outlet: { left: "44%", top: "36%", size: 122, rotate: -5, zIndex: 3 },
  energies: { left: "53%", top: "51%", size: 118, rotate: 4, zIndex: 2 },
  partner: { left: "42%", top: "66%", size: 112, rotate: 7, zIndex: 1 },
};

function FloatingLogo({ universe, activeId, onSelect, reduceMotion, index }) {
  if (activeId === universe.id) return null;

  const compact = Boolean(activeId);
  const position = compact
    ? COMPACT_POSITIONS[universe.id]
    : INITIAL_POSITIONS[universe.id];

  const floatAmount = compact ? 6 : 12 + index * 2;
  const duration = 4.8 + index * 0.7;

  return (
    <motion.button
      type="button"
      layoutId={`qeh-universe-logo-${universe.id}`}
      onClick={() => onSelect(universe.id)}
      className="group absolute -translate-x-1/2 -translate-y-1/2 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-white/80"
      style={{
        left: position.left,
        top: position.top,
        width: position.size,
        height: position.size,
        zIndex: position.zIndex,
      }}
      initial={reduceMotion ? false : { opacity: 0, scale: 0.78 }}
      animate={
        reduceMotion
          ? { opacity: compact ? 0.62 : 1, scale: 1, rotate: position.rotate }
          : {
              opacity: compact ? 0.62 : 1,
              scale: compact ? 0.92 : 1,
              y: [0, -floatAmount, 0],
              rotate: [position.rotate, position.rotate + 2, position.rotate],
            }
      }
      transition={
        reduceMotion
          ? { duration: 0.25 }
          : {
              opacity: { duration: 0.35 },
              scale: { duration: 0.55, type: "spring", stiffness: 120, damping: 16 },
              y: { duration, repeat: Infinity, ease: "easeInOut" },
              rotate: { duration: duration + 0.7, repeat: Infinity, ease: "easeInOut" },
            }
      }
      whileHover={reduceMotion ? undefined : { scale: compact ? 1 : 1.06 }}
      aria-label={`Choisir ${universe.title}`}
    >
      <span
        className="absolute -inset-8 rounded-full opacity-55 blur-3xl transition duration-500 group-hover:opacity-90"
        style={{ background: universe.glow }}
      />
      <span
        className="absolute inset-2 rounded-full border border-white/15 bg-black/20 shadow-[0_28px_80px_rgba(0,0,0,.50)] backdrop-blur-xl"
        style={{ boxShadow: `0 26px 78px rgba(0,0,0,.48), 0 0 55px ${universe.glow}` }}
      />
      <span className="absolute inset-[11px] overflow-hidden rounded-full border border-white/15 bg-[#06101d] p-5">
        <img
          src={universe.logo}
          alt={universe.title}
          className="h-full w-full rounded-full object-contain"
          draggable="false"
        />
      </span>
      {!compact ? (
        <span className="absolute -bottom-9 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] font-black uppercase tracking-[.22em] text-white/55 opacity-0 transition group-hover:opacity-100">
          Choisir
        </span>
      ) : null}
    </motion.button>
  );
}

function UniverseSelector({ activeId, onSelect }) {
  return (
    <div className="mx-auto flex w-full max-w-[720px] items-center justify-center gap-1 rounded-full border border-white/10 bg-white/[.045] p-1.5 shadow-[0_18px_60px_rgba(0,0,0,.22)] backdrop-blur-xl">
      {UNIVERSES.map((universe) => {
        const active = activeId === universe.id;
        return (
          <motion.button
            key={universe.id}
            type="button"
            onClick={() => onSelect(universe.id)}
            className="relative flex min-h-11 flex-1 items-center justify-center rounded-full px-3 text-[10px] font-black uppercase tracking-[.14em] text-white/55 transition hover:text-white sm:text-xs"
            aria-pressed={active}
          >
            {active ? (
              <motion.span
                layoutId="qeh-active-selector"
                className="absolute inset-0 rounded-full border border-white/15 bg-white/[.09] shadow-[0_10px_28px_rgba(0,0,0,.20)]"
                transition={{ type: "spring", stiffness: 320, damping: 30 }}
              />
            ) : null}
            <span className="relative flex items-center gap-2">
              <span
                className="h-2 w-2 rounded-full transition"
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
      className={`group flex min-h-[74px] items-center justify-between gap-4 rounded-[22px] border px-5 py-4 transition duration-300 hover:-translate-y-1 ${
        primary
          ? "border-transparent text-white shadow-[0_18px_50px_rgba(0,0,0,.28)]"
          : "border-white/10 bg-white/[.055] text-white hover:bg-white/[.085]"
      }`}
      style={primary ? { background: accent } : undefined}
    >
      <span className="flex items-center gap-3">
        <span
          className={`grid h-10 w-10 shrink-0 place-items-center rounded-full ${
            primary ? "bg-black/15" : "bg-white/[.07]"
          }`}
        >
          <Icon className="h-5 w-5" />
        </span>
        <span className="text-sm font-black leading-tight">{action.label}</span>
      </span>
      <ArrowRight className="h-4 w-4 shrink-0 transition-transform group-hover:translate-x-1" />
    </Link>
  );
}

function DesktopActivePanel({ universe, actions, reduceMotion }) {
  return (
    <AnimatePresence mode="wait">
      <motion.section
        key={universe.id}
        initial={reduceMotion ? false : { opacity: 0, x: 55, scale: 0.97 }}
        animate={{ opacity: 1, x: 0, scale: 1 }}
        exit={reduceMotion ? undefined : { opacity: 0, x: 30, scale: 0.985 }}
        transition={{ duration: reduceMotion ? 0.15 : 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="absolute bottom-[5%] right-[3%] top-[5%] w-[62%]"
      >
        <div className="relative h-[68%] min-h-[410px] overflow-visible rounded-[38px] border border-white/10 bg-black/25 shadow-[0_42px_120px_rgba(0,0,0,.48)]">
          <div className="absolute inset-0 overflow-hidden rounded-[38px]">
            <motion.img
              key={universe.image}
              src={universe.image}
              alt={universe.imageAlt}
              className="h-full w-full object-cover"
              initial={reduceMotion ? false : { scale: 1.08, opacity: 0.4 }}
              animate={{ scale: 1, opacity: 0.9 }}
              transition={{ duration: reduceMotion ? 0.15 : 0.8 }}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#030811]/90 via-[#030811]/35 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#030811]/92 via-transparent to-[#030811]/10" />
          </div>

          <motion.div
            layoutId={`qeh-universe-logo-${universe.id}`}
            className="absolute left-0 top-[26%] z-20 h-[142px] w-[142px] -translate-x-1/2 overflow-hidden rounded-full border border-white/20 bg-[#06101d] p-4 shadow-[0_28px_80px_rgba(0,0,0,.58)]"
            transition={{ type: "spring", stiffness: 105, damping: 18, mass: 0.85 }}
          >
            <span
              className="absolute inset-0 rounded-full blur-2xl"
              style={{ background: universe.glow }}
            />
            <img
              src={universe.logo}
              alt={universe.title}
              className="relative h-full w-full rounded-full object-contain"
              draggable="false"
            />
          </motion.div>

          <div className="absolute bottom-0 left-0 right-0 z-10 p-8 pl-16 xl:p-10 xl:pl-20">
            <p
              className="text-[10px] font-black uppercase tracking-[.22em]"
              style={{ color: universe.accentSoft }}
            >
              {universe.eyebrow}
            </p>
            <h2 className="mt-3 max-w-3xl font-display text-4xl font-black leading-[.95] tracking-[-.045em] xl:text-5xl">
              {universe.headline}
            </h2>
            <p className="mt-4 max-w-2xl text-sm font-medium leading-relaxed text-white/62 xl:text-base">
              {universe.description}
            </p>
          </div>
        </div>

        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: reduceMotion ? 0 : 0.2, duration: 0.45 }}
          className="mt-5 grid grid-cols-3 gap-3"
        >
          {actions.map((action, index) => (
            <ActionButton
              key={`${universe.id}-${action.label}`}
              action={action}
              accent={universe.accent}
              primary={index === 0}
            />
          ))}
        </motion.div>
      </motion.section>
    </AnimatePresence>
  );
}

function MobileHome({ activeId, onSelect, universe, actions, reduceMotion }) {
  return (
    <div className="relative min-h-screen overflow-hidden px-4 pb-10 pt-8 lg:hidden">
      <div className="mx-auto max-w-xl text-center">
        <p className="text-[10px] font-black uppercase tracking-[.28em] text-white/35">QEH</p>
        <h1 className="mt-2 font-display text-3xl font-black tracking-[-.045em]">Un groupe. Trois univers.</h1>
        <p className="mt-2 text-sm text-white/48">Choisissez votre univers.</p>
      </div>

      <div className="mx-auto mt-6 max-w-xl">
        <UniverseSelector activeId={activeId} onSelect={onSelect} />
      </div>

      <div className="relative mx-auto mt-4 h-[250px] max-w-xl">
        {UNIVERSES.map((item, index) => {
          const isActive = item.id === activeId;
          const mobilePositions = [
            { left: "30%", top: "54%", rotate: -8 },
            { left: "50%", top: "43%", rotate: 4 },
            { left: "68%", top: "56%", rotate: 8 },
          ];
          const position = mobilePositions[index];

          return (
            <motion.button
              key={item.id}
              type="button"
              onClick={() => onSelect(item.id)}
              className="absolute h-[118px] w-[118px] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-full border bg-[#06101d] p-3 shadow-2xl"
              style={{
                left: position.left,
                top: position.top,
                zIndex: isActive ? 4 : 2 - index,
                borderColor: isActive ? item.accent : "rgba(255,255,255,.12)",
                boxShadow: isActive ? `0 18px 55px ${item.glow}` : "0 18px 45px rgba(0,0,0,.40)",
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
                  : { duration: 4.5 + index * 0.6, repeat: Infinity, ease: "easeInOut" }
              }
              aria-label={`Choisir ${item.title}`}
            >
              <img src={item.logo} alt={item.title} className="h-full w-full rounded-full object-contain" />
            </motion.button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        {universe ? (
          <motion.div
            key={universe.id}
            initial={reduceMotion ? false : { opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduceMotion ? undefined : { opacity: 0, y: 12 }}
            className="mx-auto max-w-xl"
          >
            <div className="relative overflow-hidden rounded-[30px] border border-white/10 bg-black/25 shadow-2xl">
              <div className="relative aspect-[4/3]">
                <img src={universe.image} alt={universe.imageAlt} className="h-full w-full object-cover opacity-80" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#030811] via-[#030811]/30 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-5">
                  <p className="text-[9px] font-black uppercase tracking-[.18em]" style={{ color: universe.accentSoft }}>
                    {universe.eyebrow}
                  </p>
                  <h2 className="mt-2 font-display text-2xl font-black leading-none tracking-[-.04em]">{universe.headline}</h2>
                </div>
              </div>
            </div>

            <div className="mt-3 space-y-2.5">
              {actions.map((action, index) => (
                <ActionButton
                  key={`${universe.id}-mobile-${action.label}`}
                  action={action}
                  accent={universe.accent}
                  primary={index === 0}
                />
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mx-auto max-w-xl text-center text-sm font-bold text-white/42"
          >
            Touchez un logo ou utilisez le sélecteur pour ouvrir un univers.
          </motion.p>
        )}
      </AnimatePresence>
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

      <MobileHome
        activeId={activeId}
        onSelect={setActiveId}
        universe={activeUniverse}
        actions={actions}
        reduceMotion={reduceMotion}
      />

      <div className="relative hidden min-h-screen lg:block">
        <header className="relative z-30 mx-auto flex min-h-[190px] max-w-[1500px] flex-col items-center justify-center px-10 pt-6 text-center">
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: -14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <p className="text-[10px] font-black uppercase tracking-[.32em] text-white/32">QEH</p>
            <h1 className="mt-2 font-display text-[clamp(2.4rem,4vw,4.5rem)] font-black leading-none tracking-[-.055em]">
              Un groupe. Trois univers.
            </h1>
            <p className="mt-3 text-sm font-semibold text-white/45">Choisissez votre univers.</p>
          </motion.div>

          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: reduceMotion ? 0 : 0.12 }}
            className="mt-5 w-full"
          >
            <UniverseSelector activeId={activeId} onSelect={setActiveId} />
          </motion.div>
        </header>

        <div className="relative mx-auto h-[calc(100vh-190px)] min-h-[650px] max-w-[1600px] px-8">
          <motion.div
            className="absolute bottom-0 left-0 top-0"
            animate={{ width: activeUniverse ? "35%" : "100%" }}
            transition={{ duration: reduceMotion ? 0.15 : 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="absolute inset-0">
              {UNIVERSES.map((universe, index) => (
                <FloatingLogo
                  key={universe.id}
                  universe={universe}
                  activeId={activeId}
                  onSelect={setActiveId}
                  reduceMotion={reduceMotion}
                  index={index}
                />
              ))}
            </div>

            <AnimatePresence>
              {!activeUniverse ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute bottom-[10%] left-1/2 -translate-x-1/2 text-center"
                >
                  <p className="text-[10px] font-black uppercase tracking-[.24em] text-white/28">Navigation QEH</p>
                  <p className="mt-2 whitespace-nowrap text-sm font-semibold text-white/42">
                    Cliquez sur un logo ou utilisez le sélecteur.
                  </p>
                </motion.div>
              ) : (
                <motion.div
                  initial={reduceMotion ? false : { opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute bottom-[11%] left-[12%] right-[8%]"
                >
                  <p className="text-[10px] font-black uppercase tracking-[.22em] text-white/30">Autres univers</p>
                  <p className="mt-2 max-w-[260px] text-sm font-medium leading-relaxed text-white/42">
                    Les deux autres logos restent accessibles. Changez d'univers sans quitter la page.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          <AnimatePresence>
            {activeUniverse ? (
              <DesktopActivePanel
                universe={activeUniverse}
                actions={actions}
                reduceMotion={reduceMotion}
              />
            ) : null}
          </AnimatePresence>
        </div>
      </div>
    </main>
  );
}
