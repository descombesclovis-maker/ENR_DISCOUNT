import React, { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import {
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import {
  ArrowDown,
  ArrowRight,
  Building2,
  CheckCircle2,
  MapPin,
  Sparkles,
  Sun,
  Zap,
} from "lucide-react";

const realisations = [
  {
    image: "/images/qeh-energies/realisations/realisation-02.webp",
    alt: "Installation photovoltaïque noire sur une grande toiture en bac acier",
    eyebrow: "Produire localement",
    title: "Une toiture devient une source d’énergie pour son territoire.",
    description:
      "Une installation solaire produit au plus près des lieux de consommation. QEH Énergies identifie les producteurs et étudie comment cette énergie peut bénéficier à un collectif local.",
    accent: "#69b72d",
  },
  {
    image: "/images/qeh-energies/realisations/realisation-03.webp",
    alt: "Maison locale équipée de plusieurs champs de panneaux photovoltaïques",
    eyebrow: "Consommer autrement",
    title: "L’électricité solaire peut rester près de l’endroit où elle est produite.",
    description:
      "Habitants, commerces et petites entreprises peuvent demander l’étude de leur adresse. La carte solaire permet de repérer les zones et les producteurs déjà référencés.",
    accent: "#17649e",
  },
  {
    image: "/images/qeh-energies/realisations/realisation-04.webp",
    alt: "Grande installation photovoltaïque sur la toiture d’un bâtiment",
    eyebrow: "Valoriser chaque production",
    title: "Maisons, hangars et bâtiments professionnels peuvent alimenter le même élan.",
    description:
      "Chaque site possède ses propres caractéristiques. Nous réunissons les informations utiles pour mesurer la production disponible et la compatibilité avec les besoins voisins.",
    accent: "#69b72d",
  },
  {
    image: "/images/qeh-energies/realisations/realisation-05.webp",
    alt: "Auvent photovoltaïque en bois réalisé contre une maison",
    eyebrow: "Des supports variés",
    title: "Le solaire ne se limite pas à la toiture d’une maison.",
    description:
      "Carports, ombrières et bâtiments existants peuvent participer à un projet énergétique local. L’objectif reste le même : rapprocher une production réelle de consommateurs proches.",
    accent: "#17649e",
  },
  {
    image: "/images/qeh-energies/realisations/realisation-06.webp",
    alt: "Équipements électriques Victron Energy d’une installation solaire",
    eyebrow: "Piloter intelligemment",
    title: "Une installation performante repose aussi sur un pilotage précis.",
    description:
      "Protections, conversion et suivi de l’énergie forment le cœur technique du projet. Chaque équipement est pensé pour exploiter durablement la production disponible.",
    accent: "#69b72d",
  },
  {
    image: "/images/qeh-energies/realisations/realisation-07.webp",
    alt: "Grande centrale photovoltaïque installée sur une toiture professionnelle",
    eyebrow: "Changer d’échelle",
    title: "Une grande toiture peut accélérer toute une dynamique locale.",
    description:
      "Les sites professionnels offrent des surfaces capables de produire davantage. Ils peuvent devenir des points d’appui majeurs pour structurer un collectif cohérent et durable.",
    accent: "#17649e",
  },
  {
    image: "/images/qeh-energies/realisations/realisation-08.webp",
    alt: "Plusieurs bâtiments ruraux équipés de panneaux photovoltaïques",
    eyebrow: "Relier le territoire",
    title: "Plusieurs bâtiments, une même énergie et un projet qui rassemble.",
    description:
      "Chaque nouvelle toiture référencée agrandit le potentiel local. QEH Énergies rapproche les projets pour construire un réseau à taille humaine, ancré dans son territoire.",
    accent: "#69b72d",
  },
];

const particles = [
  { left: "6%", top: "21%", size: 4, delay: 0.2, duration: 5.7 },
  { left: "14%", top: "73%", size: 7, delay: 1.1, duration: 7.2 },
  { left: "29%", top: "14%", size: 5, delay: 2.4, duration: 6.3 },
  { left: "48%", top: "83%", size: 4, delay: 0.8, duration: 5.9 },
  { left: "62%", top: "19%", size: 6, delay: 1.8, duration: 7.5 },
  { left: "76%", top: "67%", size: 5, delay: 0.4, duration: 6.8 },
  { left: "91%", top: "26%", size: 8, delay: 2.1, duration: 8.1 },
];

const fadeUp = {
  initial: { opacity: 0, y: 32 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.2 },
  transition: { duration: 0.75, ease: [0.22, 1, 0.36, 1] },
};

function EnergyParticles({ reducedMotion }) {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {particles.map((particle, index) => (
        <motion.span
          key={`${particle.left}-${particle.top}`}
          className="absolute rounded-full bg-[#9ce565] shadow-[0_0_20px_rgba(156,229,101,0.9)]"
          style={{
            left: particle.left,
            top: particle.top,
            width: particle.size,
            height: particle.size,
          }}
          animate={
            reducedMotion
              ? { opacity: 0.5 }
              : {
                  opacity: [0.15, 0.95, 0.2],
                  y: [0, -28 - index * 3, 0],
                  x: [0, index % 2 === 0 ? 14 : -14, 0],
                  scale: [0.7, 1.35, 0.7],
                }
          }
          transition={{
            duration: particle.duration,
            delay: particle.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

function PhotoBubble({ item, reverse, index }) {
  const reducedMotion = useReducedMotion();

  return (
    <motion.article
      {...fadeUp}
      className={`group grid items-center gap-9 lg:grid-cols-2 lg:gap-16 ${
        reverse ? "lg:[&>*:first-child]:order-2" : ""
      }`}
    >
      <motion.div
        whileHover={
          reducedMotion
            ? undefined
            : {
                y: -10,
                rotate: reverse ? 0.8 : -0.8,
              }
        }
        transition={{ type: "spring", stiffness: 190, damping: 18 }}
        className="relative mx-auto w-full max-w-[620px]"
      >
        <motion.div
          animate={reducedMotion ? undefined : { y: [0, -8, 0] }}
          transition={{
            duration: 5.5 + index * 0.35,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="relative aspect-[4/3] overflow-hidden bg-[#071426] shadow-[0_28px_80px_rgba(2,7,17,0.2)]"
          style={{
            borderRadius: reverse
              ? "36% 64% 42% 58% / 55% 37% 63% 45%"
              : "58% 42% 61% 39% / 42% 57% 43% 58%",
          }}
        >
          <motion.img
            src={item.image}
            alt={item.alt}
            loading="lazy"
            className="h-full w-full object-cover"
            initial={{ scale: 1.08 }}
            whileInView={{ scale: 1 }}
            whileHover={reducedMotion ? undefined : { scale: 1.075 }}
            viewport={{ once: true, amount: 0.35 }}
            transition={{ duration: 1.15, ease: [0.22, 1, 0.36, 1] }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#020711]/40 via-transparent to-white/[0.04]" />
          <motion.div
            aria-hidden="true"
            className="absolute -inset-y-10 w-1/3 rotate-12 bg-gradient-to-r from-transparent via-white/25 to-transparent blur-sm"
            animate={
              reducedMotion ? { x: "360%" } : { x: ["-180%", "390%"] }
            }
            transition={{
              duration: 1.8,
              delay: 0.7 + index * 0.3,
              repeat: reducedMotion ? 0 : Infinity,
              repeatDelay: 4.8 + index * 0.3,
              ease: "easeInOut",
            }}
          />
        </motion.div>

        <motion.div
          className={`absolute -z-10 h-36 w-36 rounded-full blur-2xl ${
            reverse ? "-bottom-7 -left-7" : "-right-6 -top-7"
          }`}
          style={{ backgroundColor: `${item.accent}45` }}
          animate={
            reducedMotion
              ? undefined
              : { scale: [0.9, 1.25, 0.9], opacity: [0.45, 0.8, 0.45] }
          }
          transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
        />

        <motion.div
          className={`absolute grid h-16 w-16 place-items-center rounded-full border-4 border-white bg-[#020711] text-white shadow-xl ${
            reverse ? "-left-2 top-8" : "-right-2 bottom-8"
          }`}
          animate={reducedMotion ? undefined : { rotate: [0, 4, -4, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        >
          <span className="font-display text-lg font-black">
            {String(index + 1).padStart(2, "0")}
          </span>
          <motion.span
            aria-hidden="true"
            className="absolute inset-0 rounded-full border border-[#9ce565]"
            animate={
              reducedMotion
                ? undefined
                : { scale: [1, 1.5], opacity: [0.65, 0] }
            }
            transition={{ duration: 2.2, repeat: Infinity, ease: "easeOut" }}
          />
        </motion.div>
      </motion.div>

      <motion.div
        className={reverse ? "lg:pr-8" : "lg:pl-8"}
        initial={{ opacity: 0, x: reverse ? -34 : 34 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.8, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="flex items-center gap-3">
          <motion.span
            className="h-px w-10 origin-left"
            style={{ backgroundColor: item.accent }}
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.75, delay: 0.25 }}
          />
          <p
            className="text-xs font-black uppercase tracking-[0.24em]"
            style={{ color: item.accent }}
          >
            {item.eyebrow}
          </p>
        </div>
        <h2 className="mt-4 font-display text-3xl font-black leading-tight text-[#020711] sm:text-4xl">
          {item.title}
        </h2>
        <p className="mt-5 max-w-xl text-base leading-8 text-slate-600 sm:text-lg">
          {item.description}
        </p>
        <motion.div
          className="mt-6 flex items-center gap-3 text-sm font-black text-[#17649e]"
          whileHover={reducedMotion ? undefined : { x: 6 }}
        >
          <CheckCircle2 className="h-5 w-5 text-[#69b72d]" />
          Une étude claire avant toute proposition
        </motion.div>
      </motion.div>
    </motion.article>
  );
}

export default function QEHEnergiesAccueil() {
  const heroRef = useRef(null);
  const reducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 90,
    damping: 24,
    mass: 0.55,
  });
  const heroImageY = useTransform(smoothProgress, [0, 1], ["0%", "24%"]);
  const heroImageScale = useTransform(smoothProgress, [0, 1], [1.04, 1.17]);
  const heroContentY = useTransform(smoothProgress, [0, 1], [0, 100]);
  const heroContentOpacity = useTransform(smoothProgress, [0, 0.75], [1, 0]);

  useEffect(() => {
    document.title = "QEH Énergies | L’électricité solaire locale";
  }, []);

  return (
    <div
      className="overflow-hidden bg-[#f5f9fc]"
      data-testid="qeh-energies-accueil-page"
    >
      <section
        ref={heroRef}
        className="relative isolate overflow-hidden bg-[#020711] text-white"
      >
        <motion.div
          className="absolute -inset-x-5 -inset-y-16"
          style={{
            y: reducedMotion ? 0 : heroImageY,
            scale: reducedMotion ? 1.04 : heroImageScale,
          }}
        >
          <img
            src="/images/qeh-energies/realisations/realisation-01.webp"
            alt="Panneaux photovoltaïques installés sur une toiture en tuiles"
            className="h-full w-full object-cover opacity-[0.5]"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#020711] via-[#020711]/92 to-[#020711]/25" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#020711] via-transparent to-[#020711]/35" />
        </motion.div>

        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-[0.16]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(156,229,101,.2) 1px, transparent 1px), linear-gradient(90deg, rgba(23,100,158,.26) 1px, transparent 1px)",
            backgroundSize: "54px 54px",
          }}
          animate={
            reducedMotion
              ? undefined
              : { backgroundPosition: ["0px 0px", "54px 54px"] }
          }
          transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
        />

        <EnergyParticles reducedMotion={reducedMotion} />

        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute -right-20 top-20 hidden h-80 w-80 rounded-full border border-[#9ce565]/30 lg:block"
          animate={reducedMotion ? undefined : { rotate: 360 }}
          transition={{ duration: 28, repeat: Infinity, ease: "linear" }}
        >
          <div className="absolute inset-7 rounded-full border border-dashed border-white/20" />
          <div className="absolute inset-[72px] rounded-full bg-[#69b72d]/10 blur-xl" />
          <Sun className="absolute -left-5 top-1/2 h-10 w-10 -translate-y-1/2 text-[#9ce565] drop-shadow-[0_0_18px_rgba(156,229,101,0.8)]" />
        </motion.div>

        <motion.div
          className="relative mx-auto flex min-h-[720px] max-w-7xl items-center px-5 py-24 sm:px-8 lg:py-32"
          style={{
            y: reducedMotion ? 0 : heroContentY,
            opacity: reducedMotion ? 1 : heroContentOpacity,
          }}
        >
          <div className="max-w-3xl">
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.94 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.12 }}
              className="inline-flex items-center gap-2 rounded-full border border-[#82d246]/35 bg-[#69b72d]/10 px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-[#9ce565] backdrop-blur-md"
            >
              <motion.span
                animate={reducedMotion ? undefined : { rotate: [0, 16, -12, 0] }}
                transition={{ duration: 3.4, repeat: Infinity, ease: "easeInOut" }}
              >
                <Sparkles className="h-4 w-4" />
              </motion.span>
              L’énergie produite ici, consommée ici
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 34 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.85, delay: 0.22, ease: [0.22, 1, 0.36, 1] }}
              className="mt-7 font-display text-4xl font-black leading-[1.04] sm:text-6xl lg:text-7xl"
            >
              Le soleil de votre territoire peut devenir votre{" "}
              <motion.span
                className="bg-gradient-to-r from-[#82d246] via-[#d5ff9a] to-[#17649e] bg-clip-text text-transparent"
                style={{ backgroundSize: "220% auto" }}
                animate={
                  reducedMotion
                    ? undefined
                    : { backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }
                }
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              >
                énergie locale.
              </motion.span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.75, delay: 0.42 }}
              className="mt-7 max-w-2xl text-base leading-8 text-slate-200 sm:text-xl"
            >
              QEH Énergies rapproche les producteurs solaires et les consommateurs voisins pour faire naître des projets d’autoconsommation collective simples, humains et ancrés localement.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.58 }}
              className="mt-9 flex flex-wrap gap-3"
            >
              <motion.div
                whileHover={reducedMotion ? undefined : { y: -5, scale: 1.025 }}
                whileTap={reducedMotion ? undefined : { scale: 0.97 }}
              >
                <Link
                  to="/qeh-energies/carte-solaire"
                  className="group relative inline-flex min-h-[54px] items-center gap-2 overflow-hidden rounded-full bg-[#69b72d] px-7 font-black text-[#020711] shadow-[0_18px_45px_rgba(105,183,45,0.32)] transition hover:bg-[#82d246]"
                >
                  <motion.span
                    aria-hidden="true"
                    className="absolute inset-y-0 -left-16 w-12 skew-x-[-20deg] bg-white/45 blur-sm"
                    animate={reducedMotion ? undefined : { x: [0, 300] }}
                    transition={{ duration: 1.2, repeat: Infinity, repeatDelay: 3.2 }}
                  />
                  <span className="relative">Explorer la carte</span>
                  <MapPin className="relative h-5 w-5 transition group-hover:rotate-12" />
                </Link>
              </motion.div>
              <motion.div
                whileHover={reducedMotion ? undefined : { y: -5, scale: 1.025 }}
                whileTap={reducedMotion ? undefined : { scale: 0.97 }}
              >
                <Link
                  to="/qeh-energies/participer"
                  className="group inline-flex min-h-[54px] items-center gap-2 rounded-full border border-white/25 bg-white/[0.08] px-7 font-black backdrop-blur-md transition hover:border-[#17649e] hover:bg-[#17649e]/30"
                >
                  Participer au projet
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </motion.div>

        <motion.a
          href="#installations-solaires"
          aria-label="Découvrir les installations solaires"
          className="absolute bottom-7 left-1/2 z-10 hidden -translate-x-1/2 flex-col items-center gap-2 text-[10px] font-black uppercase tracking-[0.28em] text-white/70 sm:flex"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
        >
          Découvrir
          <motion.span
            className="grid h-9 w-6 place-items-center rounded-full border border-white/25 bg-white/5"
            animate={reducedMotion ? undefined : { y: [0, 6, 0] }}
            transition={{ duration: 1.7, repeat: Infinity, ease: "easeInOut" }}
          >
            <ArrowDown className="h-3.5 w-3.5" />
          </motion.span>
        </motion.a>
      </section>

      <section id="installations-solaires" className="relative bg-white py-20 sm:py-28">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-[0.32]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 16% 18%, rgba(105,183,45,.11), transparent 25%), radial-gradient(circle at 84% 62%, rgba(23,100,158,.11), transparent 28%)",
          }}
        />
        <div className="relative mx-auto max-w-7xl space-y-24 px-5 sm:px-8 lg:space-y-32">
          {realisations.map((item, index) => (
            <PhotoBubble
              key={item.image}
              item={item}
              index={index}
              reverse={index % 2 === 1}
            />
          ))}
        </div>
      </section>

      <section className="relative isolate overflow-hidden bg-[#020711] py-20 text-white sm:py-28">
        <motion.div
          aria-hidden="true"
          className="absolute -left-24 top-0 h-80 w-80 rounded-full bg-[#17649e]/28 blur-3xl"
          animate={
            reducedMotion
              ? undefined
              : { x: [0, 65, 0], y: [0, 30, 0], scale: [1, 1.18, 1] }
          }
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          aria-hidden="true"
          className="absolute -right-24 bottom-0 h-80 w-80 rounded-full bg-[#69b72d]/22 blur-3xl"
          animate={
            reducedMotion
              ? undefined
              : { x: [0, -55, 0], y: [0, -25, 0], scale: [1, 1.22, 1] }
          }
          transition={{ duration: 11.5, repeat: Infinity, ease: "easeInOut" }}
        />
        <EnergyParticles reducedMotion={reducedMotion} />

        <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
          <div className="grid items-center gap-10 lg:grid-cols-[1fr_0.8fr]">
            <motion.div {...fadeUp}>
              <p className="text-xs font-black uppercase tracking-[0.24em] text-[#82d246]">
                Votre adresse peut être le prochain point
              </p>
              <h2 className="mt-4 max-w-3xl font-display text-4xl font-black leading-tight sm:text-5xl">
                Découvrez si l’énergie solaire locale peut arriver jusqu’à vous.
              </h2>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-300">
                Consultez la carte, demandez l’étude de votre adresse ou proposez un site de production. Chaque nouvelle demande aide à faire grandir le réseau QEH Énergies.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <motion.div
                  whileHover={reducedMotion ? undefined : { y: -5, scale: 1.025 }}
                  whileTap={reducedMotion ? undefined : { scale: 0.97 }}
                >
                  <Link
                    to="/qeh-energies/carte-solaire"
                    className="inline-flex min-h-[52px] items-center gap-2 rounded-full bg-[#69b72d] px-7 font-black text-[#020711] shadow-[0_18px_45px_rgba(105,183,45,0.26)] transition hover:bg-[#82d246]"
                  >
                    <MapPin className="h-5 w-5" />
                    Tester mon adresse
                  </Link>
                </motion.div>
                <motion.div
                  whileHover={reducedMotion ? undefined : { y: -5, scale: 1.025 }}
                  whileTap={reducedMotion ? undefined : { scale: 0.97 }}
                >
                  <Link
                    to="/qeh-partner/production"
                    className="inline-flex min-h-[52px] items-center gap-2 rounded-full border border-white/20 px-7 font-black transition hover:border-[#69b72d] hover:text-[#82d246]"
                  >
                    <Building2 className="h-5 w-5" />
                    Devenir producteur
                  </Link>
                </motion.div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 35, rotate: -1.5 }}
              whileInView={{ opacity: 1, y: 0, rotate: 0 }}
              whileHover={
                reducedMotion
                  ? undefined
                  : {
                      y: -8,
                      rotate: 0.6,
                      boxShadow: "0 34px 90px rgba(105,183,45,0.16)",
                    }
              }
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-white/[0.07] p-6 backdrop-blur-sm sm:p-8"
            >
              <motion.div
                aria-hidden="true"
                className="absolute -right-16 -top-16 h-44 w-44 rounded-full border border-[#82d246]/20"
                animate={reducedMotion ? undefined : { rotate: 360, scale: [1, 1.08, 1] }}
                transition={{ duration: 16, repeat: Infinity, ease: "linear" }}
              />
              <motion.div
                className="relative grid h-14 w-14 place-items-center rounded-2xl bg-[#69b72d]/15 text-[#82d246]"
                animate={
                  reducedMotion
                    ? undefined
                    : {
                        boxShadow: [
                          "0 0 0 rgba(130,210,70,0)",
                          "0 0 34px rgba(130,210,70,.38)",
                          "0 0 0 rgba(130,210,70,0)",
                        ],
                      }
                }
                transition={{ duration: 2.8, repeat: Infinity }}
              >
                <Zap className="h-8 w-8" />
              </motion.div>
              <h3 className="relative mt-5 font-display text-2xl font-black">
                Comprendre avant de participer
              </h3>
              <p className="relative mt-3 leading-7 text-slate-300">
                Distance, organisation, rôle du producteur et du consommateur : notre page dédiée présente le parcours simplement.
              </p>
              <Link
                to="/qeh-energies/comment-ca-marche"
                className="group relative mt-6 inline-flex items-center gap-2 font-black text-[#82d246]"
              >
                Comment ça marche ?
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1.5" />
              </Link>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
