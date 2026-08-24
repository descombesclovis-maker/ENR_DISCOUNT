import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  AnimatePresence,
  motion,
  useReducedMotion,
} from "framer-motion";

import {
  Link,
} from "react-router-dom";

import {
  ArrowLeft,
  ArrowRight,
  BadgePercent,
  CarFront,
  ChevronRight,
  Clock3,
  Gauge,
  PanelsTopLeft,
  ShieldCheck,
} from "lucide-react";

// Ces valeurs sont les seuls réglages à modifier pour une prochaine offre.
export const SOLOPORT_PROMOTION = {
  endsAt:
    "2026-09-30T23:59:59+02:00",

  originalPrice:
    16929.9,

  promotionalPrice:
    14990.9,

  productPath:
    "/produits/abri-voiture-solaire-soloport-pp4-g12600-1",
};

const PRODUCT_IMAGES = [
  {
    src:
      "/images/promotions/soloport/soloport-hero.webp",

    alt:
      "Abri voiture solaire SoloPort PP4-G12600 avec quatre véhicules",

    label:
      "4 places protégées",
  },

  {
    src:
      "/images/promotions/soloport/soloport-parking.webp",

    alt:
      "Vue arrière de l’abri voiture solaire double face SoloPort",

    label:
      "Double face",
  },

  {
    src:
      "/images/promotions/soloport/soloport-overhead.webp",

    alt:
      "Vue aérienne des trente panneaux solaires du SoloPort PP4-G12600",

    label:
      "30 panneaux solaires",
  },

  {
    src:
      "/images/promotions/soloport/soloport-structure.webp",

    alt:
      "Structure en acier galvanisé du carport solaire SoloPort",

    label:
      "Acier galvanisé",
  },
];

const PRODUCT_HIGHLIGHTS = [
  {
    icon:
      Gauge,

    value:
      "12,6 kWp",

    label:
      "puissance totale",
  },

  {
    icon:
      PanelsTopLeft,

    value:
      "30 × 420 Wp",

    label:
      "modules monocristallins",
  },

  {
    icon:
      CarFront,

    value:
      "4 véhicules",

    label:
      "double couverture",
  },

  {
    icon:
      ShieldCheck,

    value:
      "100 kg/m²",

    label:
      "charge de toiture",
  },
];

function getRemainingTime(endDate) {
  const difference = Math.max(
    0,
    new Date(endDate).getTime() -
      Date.now()
  );

  return {
    total:
      difference,

    days:
      Math.floor(
        difference /
          (1000 * 60 * 60 * 24)
      ),

    hours:
      Math.floor(
        (difference /
          (1000 * 60 * 60)) %
          24
      ),

    minutes:
      Math.floor(
        (difference /
          (1000 * 60)) %
          60
      ),

    seconds:
      Math.floor(
        (difference / 1000) % 60
      ),
  };
}

function formatPrice(value) {
  return new Intl.NumberFormat(
    "fr-FR",
    {
      style:
        "currency",

      currency:
        "EUR",

      minimumFractionDigits:
        2,
    }
  ).format(value);
}

function CountdownUnit({
  label,
  value,
}) {
  return (
    <div className="relative min-w-0 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.07] px-2 py-3 text-center shadow-inner sm:px-3 sm:py-4">
      <span className="block font-display text-2xl font-black tabular-nums tracking-tight text-white sm:text-3xl">
        {String(value).padStart(
          2,
          "0"
        )}
      </span>

      <span className="mt-1 block text-[9px] font-black uppercase tracking-[0.16em] text-white/55 sm:text-[10px]">
        {label}
      </span>

      <span className="absolute inset-x-4 bottom-0 h-px bg-gradient-to-r from-transparent via-[#ff5a00] to-transparent" />
    </div>
  );
}

export default function HomeSolarCarportPromotion() {
  const shouldReduceMotion =
    useReducedMotion();

  const [
    activeImage,
    setActiveImage,
  ] = useState(0);

  const [
    slideDirection,
    setSlideDirection,
  ] = useState(1);

  const [
    remainingTime,
    setRemainingTime,
  ] = useState(() =>
    getRemainingTime(
      SOLOPORT_PROMOTION.endsAt
    )
  );

  const promotionHasEnded =
    remainingTime.total === 0;

  const discount = useMemo(
    () =>
      SOLOPORT_PROMOTION.originalPrice -
      SOLOPORT_PROMOTION.promotionalPrice,
    []
  );

  const discountPercentage =
    Math.round(
      (discount /
        SOLOPORT_PROMOTION.originalPrice) *
        100
    );

  useEffect(() => {
    const updateCountdown = () => {
      setRemainingTime(
        getRemainingTime(
          SOLOPORT_PROMOTION.endsAt
        )
      );
    };

    updateCountdown();

    const countdownInterval =
      window.setInterval(
        updateCountdown,
        1000
      );

    return () =>
      window.clearInterval(
        countdownInterval
      );
  }, []);

  useEffect(() => {
    if (shouldReduceMotion) {
      return undefined;
    }

    const galleryInterval =
      window.setInterval(() => {
        setSlideDirection(1);

        setActiveImage(
          (currentImage) =>
            (currentImage + 1) %
            PRODUCT_IMAGES.length
        );
      }, 4800);

    return () =>
      window.clearInterval(
        galleryInterval
      );
  }, [shouldReduceMotion]);

  function showImage(index) {
    if (index === activeImage) {
      return;
    }

    setSlideDirection(
      index > activeImage ? 1 : -1
    );
    setActiveImage(index);
  }

  function showPreviousImage() {
    setSlideDirection(-1);

    setActiveImage(
      (currentImage) =>
        (currentImage -
          1 +
          PRODUCT_IMAGES.length) %
        PRODUCT_IMAGES.length
    );
  }

  function showNextImage() {
    setSlideDirection(1);

    setActiveImage(
      (currentImage) =>
        (currentImage + 1) %
        PRODUCT_IMAGES.length
    );
  }

  const activeProductImage =
    PRODUCT_IMAGES[activeImage];

  return (
    <section
      aria-labelledby="soloport-promotion-title"
      className="relative overflow-hidden bg-[#f4f7fb] py-14 sm:py-20"
    >
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-44 top-20 h-96 w-96 rounded-full bg-[#0b5ca8]/10 blur-3xl" />

        <div className="absolute -right-44 bottom-0 h-96 w-96 rounded-full bg-[#ff5a00]/10 blur-3xl" />
      </div>

      <motion.div
        initial={
          shouldReduceMotion
            ? false
            : {
                opacity: 0,
                y: 28,
              }
        }
        whileInView={{
          opacity: 1,
          y: 0,
        }}
        viewport={{
          once: true,
          amount: 0.12,
        }}
        transition={{
          duration: 0.65,
          ease: "easeOut",
        }}
        className="relative mx-auto max-w-7xl px-5 sm:px-8"
      >
        <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_35px_100px_rgba(2,7,20,0.16)] lg:grid lg:grid-cols-[1.08fr_0.92fr]">
          <div className="relative min-h-[430px] overflow-hidden bg-white sm:min-h-[570px] lg:min-h-[680px]">
            <div className="absolute left-5 top-5 z-20 flex items-center gap-2 rounded-full bg-[#020714]/90 px-4 py-2 text-xs font-black uppercase tracking-[0.16em] text-white shadow-xl backdrop-blur sm:left-7 sm:top-7">
              <span className="h-2 w-2 animate-pulse rounded-full bg-[#ff5a00]" />

              Offre événement
            </div>

            <AnimatePresence
              initial={false}
              mode="wait"
              custom={slideDirection}
            >
              <motion.figure
                key={
                  activeProductImage.src
                }
                custom={slideDirection}
                initial={
                  shouldReduceMotion
                    ? {
                        opacity: 0,
                      }
                    : {
                        opacity: 0,
                        x:
                          slideDirection *
                          45,
                        scale: 0.985,
                      }
                }
                animate={{
                  opacity: 1,
                  x: 0,
                  scale: 1,
                }}
                exit={
                  shouldReduceMotion
                    ? {
                        opacity: 0,
                      }
                    : {
                        opacity: 0,
                        x:
                          slideDirection *
                          -45,
                        scale: 1.015,
                      }
                }
                transition={{
                  duration:
                    shouldReduceMotion
                      ? 0.15
                      : 0.55,
                  ease: [
                    0.22,
                    1,
                    0.36,
                    1,
                  ],
                }}
                className="absolute inset-0 flex items-center justify-center p-5 pb-28 pt-20 sm:p-10 sm:pb-32 sm:pt-24"
              >
                <img
                  src={
                    activeProductImage.src
                  }
                  alt={
                    activeProductImage.alt
                  }
                  className="h-full w-full object-contain"
                  loading="lazy"
                  draggable="false"
                />

                <figcaption className="absolute bottom-[5.7rem] left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full border border-slate-200 bg-white/90 px-4 py-2 text-xs font-bold text-slate-700 shadow-lg backdrop-blur sm:bottom-[6.6rem]">
                  {
                    activeProductImage.label
                  }
                </figcaption>
              </motion.figure>
            </AnimatePresence>

            <button
              type="button"
              onClick={
                showPreviousImage
              }
              aria-label="Photo précédente"
              className="absolute left-4 top-1/2 z-20 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full border border-slate-200 bg-white/90 text-slate-950 shadow-lg backdrop-blur transition hover:-translate-y-1/2 hover:scale-105 hover:bg-[#020714] hover:text-white sm:left-6"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>

            <button
              type="button"
              onClick={showNextImage}
              aria-label="Photo suivante"
              className="absolute right-4 top-1/2 z-20 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full border border-slate-200 bg-white/90 text-slate-950 shadow-lg backdrop-blur transition hover:-translate-y-1/2 hover:scale-105 hover:bg-[#020714] hover:text-white sm:right-6"
            >
              <ArrowRight className="h-5 w-5" />
            </button>

            <div className="absolute inset-x-5 bottom-5 z-20 grid grid-cols-4 gap-2 sm:inset-x-8 sm:bottom-7 sm:gap-3">
              {PRODUCT_IMAGES.map(
                (image, index) => (
                  <button
                    key={image.src}
                    type="button"
                    onClick={() =>
                      showImage(index)
                    }
                    aria-label={`Afficher la photo ${
                      index + 1
                    } : ${image.label}`}
                    aria-current={
                      index === activeImage
                        ? "true"
                        : undefined
                    }
                    className={`relative h-14 overflow-hidden rounded-xl border-2 bg-white p-1 shadow-sm transition sm:h-16 ${
                      index === activeImage
                        ? "border-[#ff5a00] ring-4 ring-[#ff5a00]/10"
                        : "border-white hover:border-[#0b5ca8]/50"
                    }`}
                  >
                    <img
                      src={image.src}
                      alt=""
                      className="h-full w-full object-contain"
                      loading="lazy"
                    />
                  </button>
                )
              )}
            </div>
          </div>

          <div className="relative overflow-hidden bg-[#020714] p-6 text-white sm:p-9 lg:p-10 xl:p-12">
            <div className="pointer-events-none absolute -right-28 -top-28 h-72 w-72 rounded-full bg-[#0b5ca8]/35 blur-3xl" />

            <div className="pointer-events-none absolute -bottom-32 -left-28 h-72 w-72 rounded-full bg-[#ff5a00]/20 blur-3xl" />

            <div className="relative">
              <div className="mb-6 flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center gap-2 rounded-full bg-[#ff5a00] px-4 py-2 text-xs font-black uppercase tracking-[0.14em] text-white shadow-[0_10px_30px_rgba(255,90,0,0.32)]">
                  <BadgePercent className="h-4 w-4" />

                  -{discountPercentage}%
                </span>

                <span className="text-xs font-black uppercase tracking-[0.2em] text-[#65b9ff]">
                  Exclusivité QEH OUTLET
                </span>
              </div>

              <p className="mb-3 text-xs font-black uppercase tracking-[0.2em] text-white/45">
                SoloPort · PP4-G12600-1
              </p>

              <h2
                id="soloport-promotion-title"
                className="font-display text-3xl font-black leading-[1.05] tracking-tight sm:text-4xl xl:text-[2.9rem]"
              >
                Votre parking devient une
                <span className="text-[#ff5a00]">
                  {" "}
                  centrale solaire.
                </span>
              </h2>

              <p className="mt-5 max-w-xl text-sm leading-relaxed text-white/68 sm:text-base">
                Protégez quatre véhicules et produisez jusqu’à 12,6 kWp avec un carport double face en acier galvanisé, conçu pour durer et évoluer avec votre projet.
              </p>

              <div className="mt-7 grid grid-cols-2 gap-3">
                {PRODUCT_HIGHLIGHTS.map(
                  (highlight) => {
                    const Icon =
                      highlight.icon;

                    return (
                      <div
                        key={
                          highlight.value
                        }
                        className="rounded-2xl border border-white/10 bg-white/[0.055] p-3.5 backdrop-blur sm:p-4"
                      >
                        <Icon className="mb-2 h-5 w-5 text-[#65b9ff]" />

                        <p className="font-display text-base font-black text-white sm:text-lg">
                          {
                            highlight.value
                          }
                        </p>

                        <p className="mt-0.5 text-[11px] leading-snug text-white/48">
                          {
                            highlight.label
                          }
                        </p>
                      </div>
                    );
                  }
                )}
              </div>

              <div className="my-8 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />

              {!promotionHasEnded ? (
                <>
                  <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.16em] text-white/65">
                    <Clock3 className="h-4 w-4 text-[#ff5a00]" />

                    Fin de l’offre dans
                  </div>

                  <div
                    className="mt-3 grid grid-cols-4 gap-2 sm:gap-3"
                    aria-label={`L’offre se termine le ${new Date(
                      SOLOPORT_PROMOTION.endsAt
                    ).toLocaleString(
                      "fr-FR"
                    )}`}
                  >
                    <CountdownUnit
                      label="Jours"
                      value={
                        remainingTime.days
                      }
                    />

                    <CountdownUnit
                      label="Heures"
                      value={
                        remainingTime.hours
                      }
                    />

                    <CountdownUnit
                      label="Minutes"
                      value={
                        remainingTime.minutes
                      }
                    />

                    <CountdownUnit
                      label="Secondes"
                      value={
                        remainingTime.seconds
                      }
                    />
                  </div>

                  <div className="mt-7 flex flex-wrap items-end gap-x-4 gap-y-1">
                    <span className="text-sm text-white/40 line-through decoration-white/50">
                      {formatPrice(
                        SOLOPORT_PROMOTION.originalPrice
                      )}
                    </span>

                    <span className="font-display text-4xl font-black tracking-tight text-white sm:text-5xl">
                      {formatPrice(
                        SOLOPORT_PROMOTION.promotionalPrice
                      )}
                    </span>

                    <span className="pb-1 text-xs font-black uppercase tracking-[0.16em] text-white/45">
                      HT
                    </span>
                  </div>

                  <p className="mt-2 text-sm font-bold text-[#ff8a4b]">
                    Vous économisez {formatPrice(
                      discount
                    )} HT
                  </p>
                </>
              ) : (
                <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-5">
                  <p className="font-display text-2xl font-black">
                    L’offre est terminée
                  </p>

                  <p className="mt-1 text-sm text-white/55">
                    Consultez la fiche produit pour connaître le tarif et la disponibilité actuels.
                  </p>
                </div>
              )}

              <Link
                to={
                  SOLOPORT_PROMOTION.productPath
                }
                className="group mt-7 inline-flex min-h-14 w-full items-center justify-center gap-2 rounded-full bg-[#ff5a00] px-7 text-sm font-black uppercase tracking-[0.1em] text-white shadow-[0_16px_40px_rgba(255,90,0,0.3)] transition-all duration-300 hover:-translate-y-1 hover:bg-[#e95000] hover:shadow-[0_20px_48px_rgba(255,90,0,0.4)] active:translate-y-0"
              >
                {promotionHasEnded
                  ? "Voir la fiche produit"
                  : "Découvrir l’offre"}

                <ChevronRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>

              <p className="mt-4 text-center text-[10px] leading-relaxed text-white/35">
                Offre limitée, sous réserve de disponibilité. Installation, fondations et raccordement non inclus.
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
