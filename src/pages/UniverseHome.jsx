import React, { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Lock,
  Map,
} from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useProfessionalAuth } from "../context/ProfessionalAuthContext";

const euro = new Intl.NumberFormat("fr-FR", {
  style: "currency",
  currency: "EUR",
});

const UNIVERSES = [
  {
    id: "outlet",
    label: "OUTLET",
    title: "QEH OUTLET",
    tagline: "Acheter",
    headline: "Le matériel technique au prix juste.",
    description: "Équipements techniques, déstockage et bonnes affaires.",
    accent: "#ff5a00",
    softAccent: "#ff8a4b",
    logo: "/images/qeh-outlet-logo.jpg",
    background:
      "radial-gradient(circle at 18% 8%, rgba(255,90,0,.25), transparent 34%), linear-gradient(155deg,#07111f 0%,#0a2440 58%,#11100d 100%)",
  },
  {
    id: "energies",
    label: "ÉNERGIES",
    title: "QEH ÉNERGIES",
    tagline: "Explorer",
    headline: "L'énergie produite près de chez vous.",
    description: "Projets, producteurs et initiatives photovoltaïques locales.",
    accent: "#82d246",
    softAccent: "#a8eb75",
    logo: "/images/qeh-energies-logo.png",
    background:
      "radial-gradient(circle at 50% 8%, rgba(130,210,70,.24), transparent 34%), linear-gradient(160deg,#07170e 0%,#11301e 55%,#061009 100%)",
  },
  {
    id: "partner",
    label: "PARTNER",
    title: "QEH PARTNER",
    tagline: "Développer",
    headline: "L'univers professionnel QEH.",
    description: "Matériel professionnel, production et développement du réseau.",
    accent: "#f2cf79",
    softAccent: "#ffe4a0",
    logo: "/images/qeh-partner-logo-gold.png",
    background:
      "radial-gradient(circle at 78% 8%, rgba(242,207,121,.20), transparent 34%), linear-gradient(155deg,#171109 0%,#2a2111 55%,#0c0905 100%)",
  },
];

function getPrimaryImage(images, productName) {
  if (!Array.isArray(images) || images.length === 0) {
    return { url: "/images/product-placeholder.png", alt: productName };
  }

  const sorted = [...images].sort((first, second) => {
    if (first.is_primary !== second.is_primary) return first.is_primary ? -1 : 1;
    return Number(first.display_order || 0) - Number(second.display_order || 0);
  });

  return {
    url: sorted[0]?.image_url || "/images/product-placeholder.png",
    alt: sorted[0]?.alt_text || productName,
  };
}

function outletPrice(product) {
  const value = product.is_on_sale && Number(product.sale_price) > 0
    ? Number(product.sale_price)
    : Number(product.price || 0);
  return value > 0 ? euro.format(value) : "Sur demande";
}

function OutletProducts({ products, loading }) {
  if (loading) {
    return (
      <div className="grid h-24 place-items-center rounded-[18px] border border-white/10 bg-white/[.04] text-[11px] font-bold text-white/40">
        Chargement…
      </div>
    );
  }

  if (!products.length) {
    return (
      <Link
        to="/produits"
        className="flex h-24 items-center justify-center rounded-[18px] border border-dashed border-white/20 bg-white/[.04] text-xs font-black"
      >
        Découvrir le catalogue
      </Link>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-2">
      {products.slice(0, 2).map((product) => (
        <Link
          key={product.id}
          to={`/produits/${product.slug}`}
          className="group flex min-w-0 items-center gap-2 overflow-hidden rounded-[18px] border border-white/10 bg-[#081b2e]/85 p-2 transition hover:border-[#ff5a00]/70"
        >
          <div className="h-16 w-16 shrink-0 overflow-hidden rounded-[12px] bg-white p-1.5">
            <img
              src={product.image.url}
              alt={product.image.alt}
              loading="lazy"
              className="h-full w-full object-contain transition duration-300 group-hover:scale-105"
            />
          </div>
          <div className="min-w-0">
            <p className="line-clamp-2 text-[10px] font-black leading-tight text-white/88">
              {product.name}
            </p>
            <p className="mt-1 text-[11px] font-black text-[#ff7a32]">{outletPrice(product)}</p>
          </div>
        </Link>
      ))}
    </div>
  );
}

function LockedPartnerPreview() {
  return (
    <div className="grid grid-cols-2 gap-2">
      {[0, 1].map((item) => (
        <div
          key={item}
          className="relative h-24 overflow-hidden rounded-[18px] border border-[#f2cf79]/15 bg-black/25"
        >
          <img
            src="/images/editorial/qeh-partner-logistique.jpg"
            alt="Aperçu du catalogue professionnel QEH PARTNER"
            className="h-full w-full scale-110 object-cover opacity-25 blur-[4px]"
          />
          <div className="absolute inset-0 grid place-items-center bg-[#07111f]/48">
            <span className="grid h-9 w-9 place-items-center rounded-full border border-[#f2cf79]/45 bg-black/70 text-[#f2cf79]">
              <Lock className="h-4 w-4" />
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

function ProfessionalProducts({ products, loading }) {
  if (loading) {
    return (
      <div className="grid h-24 place-items-center rounded-[18px] border border-[#f2cf79]/15 bg-black/20 text-[11px] font-bold text-white/40">
        Chargement…
      </div>
    );
  }

  if (!products.length) {
    return (
      <Link
        to="/qeh-partner/materiel-pro"
        className="flex h-24 items-center justify-center rounded-[18px] border border-dashed border-[#f2cf79]/25 bg-black/20 px-3 text-center text-xs font-black text-[#f2cf79]"
      >
        Ouvrir le catalogue professionnel
      </Link>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-2">
      {products.slice(0, 2).map((product) => (
        <Link
          key={product.id}
          to="/qeh-partner/materiel-pro"
          className="group flex min-w-0 items-center gap-2 rounded-[18px] border border-[#f2cf79]/16 bg-black/25 p-2 transition hover:border-[#f2cf79]/50"
        >
          <div className="h-16 w-16 shrink-0 rounded-[12px] bg-white/95 p-1.5">
            <img
              src={product.image_url || "/images/product-placeholder.png"}
              alt={product.name}
              className="h-full w-full object-contain"
            />
          </div>
          <div className="min-w-0">
            <p className="line-clamp-2 text-[10px] font-black text-white/90">{product.name}</p>
            <p className="mt-1 text-[10px] font-black text-[#f2cf79]">
              {Number(product.price_excluding_tax) > 0
                ? `${euro.format(Number(product.price_excluding_tax))} HT`
                : "Prix Pro"}
            </p>
          </div>
        </Link>
      ))}
    </div>
  );
}

function ActionLink({ to, icon: Icon, title, accent, filled = false }) {
  return (
    <Link
      to={to}
      className={`group flex min-h-11 items-center gap-3 rounded-full border px-4 text-xs font-black transition hover:-translate-y-0.5 ${
        filled
          ? "border-transparent text-[#071018]"
          : "border-white/10 bg-white/[.055] text-white hover:bg-white/[.09]"
      }`}
      style={filled ? { backgroundColor: accent } : undefined}
    >
      <Icon className="h-4 w-4 shrink-0" />
      <span className="min-w-0 flex-1">{title}</span>
      <ArrowRight className="h-4 w-4 shrink-0 transition group-hover:translate-x-1" />
    </Link>
  );
}

function UniverseCard({ universe, children, cardRef }) {
  return (
    <section
      ref={cardRef}
      className="relative w-[86vw] max-w-[420px] sm:w-[78vw] sm:max-w-[560px] lg:w-[620px] lg:max-w-[620px] shrink-0 snap-center overflow-hidden rounded-[28px] border border-white/10 shadow-[0_24px_75px_rgba(0,0,0,.30)]"
      style={{ background: universe.background }}
    >
      <div className="absolute inset-x-0 top-0 h-1" style={{ backgroundColor: universe.accent }} />
      <div className="p-4 sm:p-5 lg:p-6">
        <div className="flex h-[104px] sm:h-[138px] lg:h-[152px] items-center justify-center rounded-[22px] border border-white/12 bg-black/22 px-5 py-3 backdrop-blur-xl">
          <img
            src={universe.logo}
            alt={universe.title}
            className="max-h-[82px] sm:max-h-[112px] lg:max-h-[124px] w-full object-contain"
          />
        </div>

        <div className="mt-4 sm:mt-5">
          <div className="flex items-center justify-between gap-3">
            <p className="text-[9px] font-black uppercase tracking-[.2em]" style={{ color: universe.softAccent }}>
              {universe.tagline}
            </p>
            <span className="text-[9px] font-black uppercase tracking-[.14em] text-white/28">{universe.title}</span>
          </div>
          <h2 className="mt-1.5 font-display text-[22px] sm:text-[24px] lg:text-[26px] font-black leading-[1] tracking-[-.035em]">
            {universe.headline}
          </h2>
          <p className="mt-2 text-[12px] sm:text-[13px] font-medium leading-relaxed text-white/52">
            {universe.description}
          </p>
        </div>

        <div className="mt-4 sm:mt-5">{children}</div>
      </div>
    </section>
  );
}

export default function UniverseHome() {
  const reduceMotion = useReducedMotion();
  const { isProfessional, professionalLoading } = useProfessionalAuth();
  const [outletProducts, setOutletProducts] = useState([]);
  const [proProducts, setProProducts] = useState([]);
  const [outletLoading, setOutletLoading] = useState(true);
  const [proLoading, setProLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const carouselRef = useRef(null);
  const cardRefs = useRef([]);

  useEffect(() => {
    document.title = "QEH | Trois univers, un même écosystème";

    let active = true;
    async function loadOutletProducts() {
      const { data, error } = await supabase
        .from("products")
        .select(`
          id,
          name,
          slug,
          price,
          sale_price,
          is_on_sale,
          stock,
          on_demand,
          product_images (image_url, alt_text, is_primary, display_order)
        `)
        .eq("is_active", true)
        .order("is_featured", { ascending: false })
        .order("created_at", { ascending: false })
        .limit(4);

      if (!active) return;
      if (error) {
        console.error("Impossible de charger les produits QEH OUTLET :", error);
        setOutletProducts([]);
      } else {
        setOutletProducts(
          (data || []).map((product) => ({
            ...product,
            image: getPrimaryImage(product.product_images, product.name),
          }))
        );
      }
      setOutletLoading(false);
    }

    loadOutletProducts();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;

    async function loadProfessionalProducts() {
      if (professionalLoading) return;
      if (!isProfessional) {
        setProProducts([]);
        setProLoading(false);
        return;
      }

      setProLoading(true);
      const { data, error } = await supabase
        .from("qeh_partner_products")
        .select("id, name, category, price_excluding_tax, image_url, stock")
        .eq("is_active", true)
        .order("created_at", { ascending: false })
        .limit(3);

      if (!active) return;
      if (error) {
        console.error("Impossible de charger les produits QEH PARTNER :", error);
        setProProducts([]);
      } else {
        setProProducts(data || []);
      }
      setProLoading(false);
    }

    loadProfessionalProducts();
    return () => {
      active = false;
    };
  }, [isProfessional, professionalLoading]);

  const goToUniverse = (index) => {
    const nextIndex = Math.max(0, Math.min(UNIVERSES.length - 1, index));
    setActiveIndex(nextIndex);
    cardRefs.current[nextIndex]?.scrollIntoView({
      behavior: reduceMotion ? "auto" : "smooth",
      block: "nearest",
      inline: "center",
    });
  };

  const syncActiveCard = () => {
    const container = carouselRef.current;
    if (!container) return;

    const center = container.scrollLeft + container.clientWidth / 2;
    let nearest = 0;
    let distance = Infinity;

    cardRefs.current.forEach((card, index) => {
      if (!card) return;
      const cardCenter = card.offsetLeft + card.offsetWidth / 2;
      const currentDistance = Math.abs(center - cardCenter);
      if (currentDistance < distance) {
        distance = currentDistance;
        nearest = index;
      }
    });

    setActiveIndex(nearest);
  };

  const outlet = UNIVERSES[0];
  const energies = UNIVERSES[1];
  const partner = UNIVERSES[2];

  return (
    <main className="min-h-screen overflow-hidden bg-[#020711] text-white">
      <header className="relative z-20 border-b border-white/10 bg-[#030811]/90 px-4 py-3 backdrop-blur-2xl sm:px-6">
        <div className="mx-auto flex max-w-[1100px] items-center justify-between gap-4">
          <div>
            <p className="font-display text-xl font-black tracking-[-.05em]">QEH</p>
            <p className="text-[9px] font-bold uppercase tracking-[.16em] text-white/30">
              Trois expertises. Un même écosystème.
            </p>
          </div>
          <p className="hidden text-[10px] font-black uppercase tracking-[.16em] text-white/35 sm:block">
            {activeIndex + 1} / 3 · {UNIVERSES[activeIndex].label}
          </p>
        </div>
      </header>

      <motion.section
        initial={reduceMotion ? false : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="mx-auto max-w-[1400px] px-3 pb-8 pt-4 sm:px-6 lg:pt-5"
      >
        <div className="mx-auto mb-3 flex max-w-[690px] items-center justify-between gap-3 px-1">
          <div>
            <p className="text-[11px] font-black text-white/75">Choisissez votre univers</p>
            <p className="mt-0.5 text-[10px] text-white/35">Glissez ou utilisez les flèches.</p>
          </div>
          <div className="flex items-center gap-1.5">
            {UNIVERSES.map((universe, index) => (
              <button
                key={universe.id}
                type="button"
                onClick={() => goToUniverse(index)}
                aria-label={`Ouvrir ${universe.title}`}
                className="h-1.5 rounded-full transition-all"
                style={{
                  width: activeIndex === index ? 30 : 12,
                  backgroundColor: universe.accent,
                  opacity: activeIndex === index ? 1 : 0.35,
                }}
              />
            ))}
          </div>
        </div>

        <div className="relative mx-auto max-w-[780px]">
          <button
            type="button"
            onClick={() => goToUniverse(activeIndex - 1)}
            disabled={activeIndex === 0}
            aria-label="Univers précédent"
            className="absolute left-1 top-1/2 z-30 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full border border-white/12 bg-[#030811]/88 text-white shadow-xl backdrop-blur-xl transition hover:bg-white/10 disabled:pointer-events-none disabled:opacity-20 sm:-left-14 lg:-left-16"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          <div
            ref={carouselRef}
            onScroll={syncActiveCard}
            className="flex snap-x snap-mandatory gap-5 overflow-x-auto px-[7vw] pb-4 pt-1 [scrollbar-width:none] sm:px-16 lg:px-20 [&::-webkit-scrollbar]:hidden"
          >
            <UniverseCard universe={outlet} cardRef={(node) => { cardRefs.current[0] = node; }}>
              <OutletProducts products={outletProducts} loading={outletLoading} />
              <div className="mt-3 grid grid-cols-2 gap-2">
                <Link
                  to="/produits"
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-[#ff5a00] px-4 text-center text-xs font-black text-white"
                >
                  Nos produits en vedette <ArrowRight className="h-4 w-4 shrink-0" />
                </Link>
                <Link
                  to="/produits"
                  className="inline-flex min-h-11 items-center justify-center rounded-full border border-white/12 bg-white/[.055] px-4 text-xs font-black"
                >
                  Catalogue
                </Link>
              </div>
            </UniverseCard>

            <UniverseCard universe={energies} cardRef={(node) => { cardRefs.current[1] = node; }}>
              <div className="relative h-32 sm:h-40 lg:h-44 overflow-hidden rounded-[18px] border border-white/10">
                <img
                  src="/images/editorial/qeh-energies-territoire.jpg"
                  alt="Production solaire locale QEH ÉNERGIES"
                  className="h-full w-full object-cover opacity-80"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#07110c] via-transparent to-transparent" />
                <p className="absolute bottom-2 left-3 text-[10px] font-black text-[#a8eb75]">Carte solaire locale</p>
              </div>
              <div className="mt-3 grid gap-2">
                <ActionLink to="/qeh-energies/carte-solaire" icon={Map} title="Explorer la carte" accent="#82d246" filled />
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    to="/qeh-energies/comment-ca-marche"
                    className="flex min-h-11 items-center justify-center rounded-full border border-white/10 bg-white/[.055] px-3 text-center text-[11px] font-black"
                  >
                    En savoir plus
                  </Link>
                  <Link
                    to="/qeh-energies/participer"
                    className="flex min-h-11 items-center justify-center rounded-full border border-white/10 bg-white/[.055] px-3 text-center text-[11px] font-black"
                  >
                    En bénéficier
                  </Link>
                </div>
              </div>
            </UniverseCard>

            <UniverseCard universe={partner} cardRef={(node) => { cardRefs.current[2] = node; }}>
              {isProfessional ? (
                <ProfessionalProducts products={proProducts} loading={proLoading || professionalLoading} />
              ) : (
                <>
                  <LockedPartnerPreview />
                  <p className="mt-2 px-1 text-[10px] leading-relaxed text-white/40">
                    Vous devez d'abord créer un compte pour accéder au matériel Pro.
                  </p>
                </>
              )}
              <div className="mt-3 grid gap-2">
                <Link
                  to={isProfessional ? "/qeh-partner/materiel-pro" : "/qeh-partner/connexion-pro"}
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-[#f2cf79] px-4 text-xs font-black text-[#171109]"
                >
                  {isProfessional ? "Catalogue Pro" : "Se connecter"} <ArrowRight className="h-4 w-4" />
                </Link>
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    to="/qeh-partner/production"
                    className="flex min-h-11 items-center justify-center rounded-full border border-[#f2cf79]/20 bg-[#f2cf79]/[.07] px-3 text-center text-[11px] font-black text-[#ffe4a0]"
                  >
                    Devenir producteur
                  </Link>
                  <Link
                    to="/qeh-partner/franchise"
                    className="flex min-h-11 items-center justify-center rounded-full border border-[#f2cf79]/20 bg-[#f2cf79]/[.07] px-3 text-center text-[11px] font-black text-[#ffe4a0]"
                  >
                    Être franchisé
                  </Link>
                </div>
              </div>
            </UniverseCard>
          </div>

          <button
            type="button"
            onClick={() => goToUniverse(activeIndex + 1)}
            disabled={activeIndex === UNIVERSES.length - 1}
            aria-label="Univers suivant"
            className="absolute right-1 top-1/2 z-30 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full border border-white/12 bg-[#030811]/88 text-white shadow-xl backdrop-blur-xl transition hover:bg-white/10 disabled:pointer-events-none disabled:opacity-20 sm:-right-14 lg:-right-16"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </motion.section>
    </main>
  );
}
