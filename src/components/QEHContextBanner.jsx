import React from "react";
import { Link } from "react-router-dom";
import {
  motion,
  useReducedMotion,
} from "framer-motion";
import {
  ArrowRight,
  Sparkles,
} from "lucide-react";

const themes = {
  outlet: {
    accent: "text-[#ff7a32]",
    badge:
      "border-[#ff5a00]/35 bg-[#ff5a00]/15 text-[#ff9a63]",
    primary:
      "bg-[#ff5a00] text-white shadow-[0_15px_38px_rgba(255,90,0,0.28)] hover:bg-[#ed5200]",
    glow: "bg-[#ff5a00]/25",
  },

  energies: {
    accent: "text-[#82d246]",
    badge:
      "border-[#82d246]/35 bg-[#69b72d]/15 text-[#a2e475]",
    primary:
      "bg-[#69b72d] text-[#020711] shadow-[0_15px_38px_rgba(105,183,45,0.25)] hover:bg-[#82d246]",
    glow: "bg-[#69b72d]/25",
  },

  partner: {
    accent: "text-[#f2cf79]",
    badge:
      "border-[#f2cf79]/35 bg-[#c99532]/15 text-[#ffe7a9]",
    primary:
      "bg-gradient-to-r from-[#ad771f] via-[#f2cf79] to-[#b77f22] text-[#020711] shadow-[0_15px_38px_rgba(201,149,50,0.25)]",
    glow: "bg-[#c99532]/25",
  },
};

export default function QEHContextBanner({
  theme = "outlet",
  eyebrow,
  title,
  description,
  image,
  imageAlt,
  links = [],
  reverse = false,
}) {
  const shouldReduceMotion =
    useReducedMotion();

  const colors =
    themes[theme] || themes.outlet;

  return (
    <section className="mx-auto max-w-7xl px-5 py-8 sm:px-8 sm:py-12">
      <motion.div
        initial={
          shouldReduceMotion
            ? false
            : {
                opacity: 0,
                y: 24,
              }
        }
        whileInView={{
          opacity: 1,
          y: 0,
        }}
        viewport={{
          once: true,
          amount: 0.18,
        }}
        transition={{
          duration: 0.6,
        }}
        className="relative overflow-hidden rounded-[32px] border border-white/10 bg-[#020711] text-white shadow-[0_28px_85px_rgba(2,7,17,0.2)]"
      >
        <div
          className={`pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full blur-3xl ${colors.glow}`}
        />

        <div className="relative grid min-h-[390px] lg:grid-cols-2">
          <div
            className={`relative min-h-[280px] overflow-hidden lg:min-h-full ${
              reverse
                ? "lg:order-2"
                : ""
            }`}
          >
            <motion.img
              src={image}
              alt={imageAlt}
              loading="lazy"
              className="absolute inset-0 h-full w-full object-cover"
              whileHover={
                shouldReduceMotion
                  ? undefined
                  : {
                      scale: 1.035,
                    }
              }
              transition={{
                duration: 0.8,
                ease: "easeOut",
              }}
            />

            <div className="absolute inset-0 bg-gradient-to-t from-[#020711]/85 via-transparent to-transparent lg:bg-gradient-to-r lg:from-transparent lg:to-[#020711]/35" />
          </div>

          <div className="relative flex flex-col justify-center p-7 sm:p-10 lg:p-14">
            <span
              className={`mb-5 inline-flex w-fit items-center gap-2 rounded-full border px-4 py-2 text-[11px] font-black uppercase tracking-[0.18em] ${colors.badge}`}
            >
              <Sparkles className="h-4 w-4" />

              {eyebrow}
            </span>

            <h2 className="max-w-xl font-display text-3xl font-black leading-tight sm:text-4xl lg:text-5xl">
              {title}
            </h2>

            <p className="mt-5 max-w-xl leading-relaxed text-slate-300">
              {description}
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              {links.map(
                (link, index) => (
                  <Link
                    key={`${link.to}-${link.label}`}
                    to={link.to}
                    className={`group inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-6 text-sm font-black transition hover:-translate-y-0.5 ${
                      index === 0
                        ? colors.primary
                        : "border border-white/20 bg-white/5 text-white hover:border-white/40 hover:bg-white/10"
                    }`}
                  >
                    <span
                      className={
                        index === 0
                          ? ""
                          : colors.accent
                      }
                    >
                      {link.label}
                    </span>

                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                )
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}