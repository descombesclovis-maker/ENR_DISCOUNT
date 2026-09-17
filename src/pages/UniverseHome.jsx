import React, { useEffect, useState } from "react";
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
    description: "Équipements techniques, déstockage et bonnes affaires disponibles immédiatement ou sur demande.",
    accent: "#ff5a00",
    softAccent: "#ff8a4b",
    logo: "/images/qeh-outlet-logo.jpg",
    background:
      "radial-gradient(circle at 18% 8%, rgba(255,90,0,.28), transparent 34%), linear-gradient(155deg,#07111f 0%,#0a2440 58%,#11100d 100%)",
  },
  {
    id: "energies",
    label: "ÉNERGIES",
    title: "QEH ÉNERGIES",
    tagline: "Explorer",
    headline: "L'énergie produite près de chez vous.",
    description: "Découvrez les projets, producteurs et initiatives photovoltaïques de votre territoire.",
    accent: "#82d246",
    softAccent: "#a8eb75",
    logo: "/images/qeh-energies-logo.png",
    background:
      "radial-gradient(circle at 50% 8%, rgba(130,210,70,.27), transparent 34%), linear-gradient(160deg,#07170e 0%,#11301e 55%,#061009 100%)",
  },
  {
    id: "partner",
    label: "PARTNER",
    title: "QEH PARTNER",
    tagline: "Développer",
    headline: "L'univers réservé à ceux qui développent QEH.",
    description: "Matériel professionnel, production et développement du réseau QEH réunis dans un espace dédié.",
    accent: "#f2cf79",
    softAccent: "#ffe4a0",
    logo: "/images/qeh-partner-logo-gold.png",
    background:
      "radial-gradient(circle at 78% 8%, rgba(242,207,121,.22), transparent 34%), linear-gradient(155deg,#171109 0%,#2a2111 55%,#0c0905 100%)",
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

function OutletProducts({ products, loading, compact = false }) {
  if (loading) {
    return (
      <div className="grid min-h-40 place-items-center rounded-[24px] border border-white/10 bg-white/[.045] text-xs font-bold text-white/40">
        Chargement des produits…
      </div>
    );
  }

  if (!products.length) {
    return (
      <Link
        to="/produits"
        className="flex min-h-40 items-center justify-center rounded-[24px] border border-dashed border-white/20 bg-white/[.04] text-sm font-black transition hover:border-[#ff5a00]/60 hover:bg-white/[.07]"
      >
        Découvrir le catalogue
      </Link>
    );
  }

  return (
    <div className={`grid ${compact ? "grid-cols-2" : "grid-cols-2 xl:grid-cols-4"} gap-3`}>
      {products.slice(0, compact ? 2 : 4).map((product) => (
        <Link
          key={product.id}
          to={`/produits/${product.slug}`}
          className="group overflow-hidden rounded-[22px] border border-white/10 bg-[#081b2e]/85 shadow-[0_18px_50px_rgba(0,0,0,.22)] transition hover:-translate-y-1 hover:border-[#ff5a00]/70"
        >
          <div className="relative aspect-square bg-white p-2.5">
            <img
              src={product.image.url}
              alt={product.image.alt}
              loading="lazy"
              className="h-full w-full object-contain transition duration-300 group-hover:scale-105"
            />
            {product.is_on_sale && Number(product.sale_price) > 0 ? (
              <span className="absolute left-2 top-2 rounded-full bg-[#ff5a00] px-2 py-1 text-[8px] font-black uppercase tracking-[.08em] text-white">
                Promo
              </span>
            ) : null}
          </div>
          <div className="p-3">
            <p className="line-clamp-2 min-h-[34px] text-[11px] font-black leading-snug text-white/90">
              {product.name}
            </p>
            <p className="mt-2 text-sm font-black text-[#ff7a32]">
              {outletPrice(product)}
            </p>
          </div>
        </Link>
      ))}
    </div>
  );
}

function LockedPartnerPreview({ compact = false }) {
  return (
    <div className={`grid ${compact ? "grid-cols-2" : "grid-cols-2 md:grid-cols-3"} gap-3`}>
      {[0, 1, 2].slice(0, compact ? 2 : 3).map((item) => (
        <div
          key={item}
          className="overflow-hidden rounded-[22px] border border-[#f2cf79]/15 bg-black/25"
        >
          <div className="relative aspect-[4/3] overflow-hidden">
            <img
              src="/images/editorial/qeh-partner-logistique.jpg"
              alt="Aperçu du catalogue professionnel QEH PARTNER"
              className="h-full w-full scale-110 object-cover opacity-30 blur-[5px]"
            />
            <div className="absolute inset-0 grid place-items-center bg-[#07111f]/55">
              <span className="grid h-11 w-11 place-items-center rounded-full border border-[#f2cf79]/45 bg-black/70 text-[#f2cf79] shadow-xl">
                <Lock className="h-4 w-4" />
              </span>
            </div>
          </div>
          <div className="p-3">
            <p className="text-[9px] font-black uppercase tracking-[.16em] text-[#f2cf79]">
              Matériel professionnel
            </p>
            <p className="mt-1 text-xs font-black text-white/80">Catalogue réservé</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function ProfessionalProducts({ products, loading, compact = false }) {
  if (loading) {
    return (
      <div className="grid min-h-36 place-items-center rounded-[22px] border border-[#f2cf79]/15 bg-black/20 text-xs font-bold text-white/40">
        Chargement de l'espace professionnel…
      </div>
    );
  }

  if (!products.length) {
    return (
      <Link
        to="/qeh-partner/materiel-pro"
        className="flex min-h-36 items-center justify-center rounded-[22px] border border-dashed border-[#f2cf79]/25 bg-black/20 text-sm font-black text-[#f2cf79]"
      >
        Ouvrir le catalogue professionnel
      </Link>
    );
  }

  return (
    <div className={`grid ${compact ? "grid-cols-2" : "grid-cols-2 md:grid-cols-3"} gap-3`}>
      {products.slice(0, compact ? 2 : 3).map((product) => (
        <Link
          key={product.id}
          to="/qeh-partner/materiel-pro"
          className="group overflow-hidden rounded-[22px] border border-[#f2cf79]/16 bg-black/25 transition hover:-translate-y-1 hover:border-[#f2cf79]/50"
        >
          <div className="aspect-[4/3] bg-white/95 p-3">
            <img
              src={product.image_url || "/images/product-placeholder.png"}
              alt={product.name}
              className="h-full w-full object-contain transition duration-300 group-hover:scale-105"
            />
          </div>
          <div className="p-3">
            <p className="line-clamp-2 text-xs font-black text-white/90">{product.name}</p>
            <p className="mt-2 text-xs font-black text-[#f2cf79]">
              {Number(product.price_excluding_tax) > 0
                ? `${euro.format(Number(product.price_excluding_tax))} HT`
                : "Prix professionnel"}
            </p>
          </div>
        </Link>
      ))}
    </div>
  );
}

function ActionLink({ to, icon: Icon, title, detail, accent, filled = false }) {
  return (
    <Link
      to={to}
      className={`group flex min-h-[70px] items-center gap-3 rounded-[20px] border px-4 py-3 transition hover:-translate-y-0.5 ${
        filled
          ? "border-transparent text-[#071018] shadow-[0_16px_45px_rgba(0,0,0,.18)]"
          : "border-white/10 bg-white/[.055] text-white hover:bg-white/[.09]"
      }`}
      style={filled ? { backgroundColor: accent } : undefined}
    >
      <span
        className={`grid h-10 w-10 shrink-0 place-items-center rounded-2xl ${
          filled ? "bg-black/10" : "bg-black/20"
        }`}
        style={!filled ? { color: accent } : undefined}
      >
        <Icon className="h-5 w-5" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-black">{title}</span>
        {detail ? (
          <span className={`mt-0.5 block text-[11px] font-semibold ${filled ? "text-black/55" : "text-white/45"}`}>
            {detail}
          </span>
        ) : null}
      </span>
      <ArrowRight className="h-4 w-4 shrink-0 transition group-hover:translate-x-1" />
    </Link>
  );
}

function OutletExpanded({ products, loading }) {
  return (
    <div className="mt-7 grid min-h-0 flex-1 grid-cols-1 gap-5 xl:grid-cols-[.72fr_1.28fr]">
      <div className="flex flex-col gap-3">
        <ActionLink
          to="/produits"
          icon={Boxes}
          title="Explorer le catalogue"
          detail="Voir tous les produits QEH OUTLET"
          accent="#ff5a00"
          filled
        />
        <ActionLink
          to="/produits"
          icon={Sparkles}
          title="Bonnes affaires"
          detail="Promotions, déstockage et opportunités"
          accent="#ff7a32"
        />
        <ActionLink
          to="/suivi-commande"
          icon={PackageSearch}
          title="Suivre ma commande"
          detail="Retrouver l'avancement de votre livraison"
          accent="#ff7a32"
        />
        <div className="mt-auto rounded-[24px] border border-white/10 bg-black/20 p-4">
          <p className="text-[10px] font-black uppercase tracking-[.18em] text-[#ff8a4b]">QEH OUTLET</p>
          <p className="mt-2 text-sm font-semibold leading-relaxed text-white/55">
            Une boutique directe, lisible et orientée produit : vous trouvez, vous achetez, vous suivez.
          </p>
        </div>
      </div>

      <div className="min-w-0 rounded-[28px] border border-white/10 bg-black/15 p-4 backdrop-blur-sm">
        <div className="mb-4 flex items-end justify-between gap-4">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[.18em] text-white/35">En vitrine</p>
            <h3 className="mt-1 font-display text-xl font-black">Produits du moment</h3>
          </div>
          <Link to="/produits" className="text-xs font-black text-[#ff8a4b]">Tout voir</Link>
        </div>
        <OutletProducts products={products} loading={loading} />
      </div>
    </div>
  );
}

function EnergiesExpanded() {
  return (
    <div className="mt-7 grid min-h-0 flex-1 grid-cols-1 gap-5 xl:grid-cols-[1.2fr_.8fr]">
      <div className="relative min-h-[360px] overflow-hidden rounded-[30px] border border-white/10 bg-black/20">
        <img
          src="/images/editorial/qeh-energies-territoire.jpg"
          alt="Territoire et production solaire QEH ÉNERGIES"
          className="absolute inset-0 h-full w-full object-cover opacity-80"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#06120b] via-[#06120b]/15 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-5">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/45 px-3 py-2 text-xs font-black backdrop-blur-md">
            <SunMedium className="h-4 w-4 text-[#a8eb75]" />
            Énergie locale
          </div>
          <p className="mt-3 max-w-xl font-display text-2xl font-black leading-tight">
            Visualisez ce qui se produit et se construit autour de vous.
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <ActionLink
          to="/qeh-energies/carte-solaire"
          icon={Map}
          title="Explorer la carte"
          detail="Projets et producteurs autour de vous"
          accent="#82d246"
          filled
        />
        <ActionLink
          to="/qeh-energies/comment-ca-marche"
          icon={SunMedium}
          title="Comprendre QEH Énergies"
          detail="Le fonctionnement de l'écosystème local"
          accent="#a8eb75"
        />
        <ActionLink
          to="/qeh-energies/participer"
          icon={Users}
          title="Participer"
          detail="Proposer un projet ou rejoindre la dynamique"
          accent="#a8eb75"
        />
        <div className="mt-auto grid grid-cols-2 gap-3">
          <div className="rounded-[22px] border border-white/10 bg-white/[.045] p-4">
            <ShieldCheck className="h-5 w-5 text-[#a8eb75]" />
            <p className="mt-3 text-xs font-black">Projets identifiés</p>
            <p className="mt-1 text-[10px] font-semibold text-white/40">Lecture claire du territoire</p>
          </div>
          <div className="rounded-[22px] border border-white/10 bg-white/[.045] p-4">
            <Users className="h-5 w-5 text-[#a8eb75]" />
            <p className="mt-3 text-xs font-black">Réseau local</p>
            <p className="mt-1 text-[10px] font-semibold text-white/40">Producteurs, clients et partenaires</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function PartnerExpanded({ isProfessional, products, loading }) {
  return (
    <div className="mt-7 grid min-h-0 flex-1 grid-cols-1 gap-5 xl:grid-cols-[1.2fr_.8fr]">
      <div className="rounded-[28px] border border-[#f2cf79]/14 bg-black/20 p-4 backdrop-blur-sm">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[.18em] text-[#f2cf79]">Espace professionnel</p>
            <h3 className="mt-1 font-display text-xl font-black">
              {isProfessional ? "Votre catalogue QEH PARTNER" : "Aperçu du catalogue professionnel"}
            </h3>
          </div>
          {!isProfessional ? <Lock className="h-5 w-5 text-[#f2cf79]" /> : <UserCheck className="h-5 w-5 text-[#f2cf79]" />}
        </div>
        {isProfessional ? (
          <ProfessionalProducts products={products} loading={loading} />
        ) : (
          <LockedPartnerPreview />
        )}
      </div>

      <div className="flex flex-col gap-3">
        <ActionLink
          to={isProfessional ? "/qeh-partner/materiel-pro" : "/qeh-partner/connexion-pro"}
          icon={isProfessional ? UserCheck : Lock}
          title={isProfessional ? "Accéder au catalogue Pro" : "Se connecter"}
          detail={isProfessional ? "Votre matériel professionnel QEH" : "Accéder à votre espace professionnel"}
          accent="#f2cf79"
          filled
        />
        <ActionLink
          to="/qeh-partner/production"
          icon={Factory}
          title="Devenir producteur"
          detail="Produire ou référencer du matériel au sein du réseau"
          accent="#f2cf79"
        />
        <ActionLink
          to="/qeh-partner/franchise"
          icon={ShieldCheck}
          title="Être franchisé"
          detail="Développer QEH sur votre territoire"
          accent="#f2cf79"
        />
        {!isProfessional ? (
          <Link
            to="/qeh-partner/inscription-pro"
            className="mt-auto flex min-h-12 items-center justify-center gap-2 rounded-full border border-[#f2cf79]/25 bg-[#f2cf79]/10 px-5 text-sm font-black text-[#ffe4a0] transition hover:bg-[#f2cf79]/15"
          >
            Devenir professionnel <ArrowRight className="h-4 w-4" />
          </Link>
        ) : null}
      </div>
    </div>
  );
}

function DesktopUniversePanel({ universe, activeUniverse, setActiveUniverse, children, reducedMotion }) {
  const isActive = activeUniverse === universe.id;
  const anotherIsActive = Boolean(activeUniverse) && !isActive;

  return (
    <motion.section
      layout
      onMouseEnter={() => setActiveUniverse(universe.id)}
      animate={{
        flexGrow: activeUniverse ? (isActive ? 2.4 : 0.5) : 1,
        opacity: anotherIsActive ? 0.72 : 1,
      }}
      transition={reducedMotion ? { duration: 0 } : { type: "spring", stiffness: 150, damping: 24, mass: 0.9 }}
      className="relative min-w-0 overflow-hidden border-r border-white/10 last:border-r-0"
      style={{ background: universe.background }}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-1" style={{ backgroundColor: universe.accent }} />
      <div
        className="pointer-events-none absolute -top-24 h-80 w-80 rounded-full blur-[110px]"
        style={{ backgroundColor: `${universe.accent}22`, left: universe.id === "partner" ? "55%" : "-10%" }}
      />

      <div className={`relative flex h-full min-h-[690px] flex-col ${anotherIsActive ? "p-4 xl:p-5" : "p-6 xl:p-8"}`}>
        <div className={`${anotherIsActive ? "mx-auto w-full max-w-[170px]" : "w-full"}`}>
          <div className={`flex items-center ${anotherIsActive ? "justify-center" : "justify-between"} gap-4`}>
            <div
              className={`flex items-center justify-center overflow-hidden rounded-[20px] border border-white/12 bg-black/25 p-3 backdrop-blur-xl transition-all ${
                anotherIsActive ? "h-[62px] w-full" : "h-[72px] min-w-[180px] max-w-[330px]"
              }`}
            >
              <img src={universe.logo} alt={universe.title} className="max-h-[48px] w-full object-contain" />
            </div>

            {!anotherIsActive ? (
              <button
                type="button"
                onClick={() => setActiveUniverse(isActive ? null : universe.id)}
                className="hidden rounded-full border border-white/12 bg-black/20 px-4 py-2 text-[10px] font-black uppercase tracking-[.16em] text-white/60 transition hover:bg-white/10 xl:block"
              >
                {isActive ? "Vue globale" : "Découvrir"}
              </button>
            ) : null}
          </div>

          <div className={`${anotherIsActive ? "mt-8 text-center" : "mt-7"}`}>
            <p className="text-[10px] font-black uppercase tracking-[.22em]" style={{ color: universe.softAccent }}>
              {universe.tagline}
            </p>
            <h2
              className={`${anotherIsActive ? "mt-3 text-xl" : "mt-3 text-3xl xl:text-4xl"} font-display font-black leading-[.98] tracking-[-.04em]`}
            >
              {anotherIsActive ? universe.title : universe.headline}
            </h2>
            {!anotherIsActive ? (
              <p className="mt-3 max-w-2xl text-sm font-medium leading-relaxed text-white/58">
                {universe.description}
              </p>
            ) : null}
          </div>
        </div>

        <AnimatePresence mode="wait" initial={false}>
          {isActive ? (
            <motion.div
              key={`${universe.id}-expanded`}
              initial={reducedMotion ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reducedMotion ? undefined : { opacity: 0, y: 8 }}
              transition={{ duration: 0.24 }}
              className="flex min-h-0 flex-1 flex-col"
            >
              {children}
            </motion.div>
          ) : !activeUniverse ? (
            <motion.div
              key={`${universe.id}-overview`}
              initial={reducedMotion ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-auto pt-8"
            >
              <div className="rounded-[28px] border border-white/10 bg-black/20 p-5 backdrop-blur-md">
                <p className="text-xs font-black uppercase tracking-[.16em] text-white/35">{universe.title}</p>
                <p className="mt-3 text-sm font-semibold leading-relaxed text-white/65">
                  {universe.id === "outlet" && "Catalogue, produits, commandes."}
                  {universe.id === "energies" && "Carte solaire, projets, participation."}
                  {universe.id === "partner" && "Matériel Pro, production, franchise."}
                </p>
                <button
                  type="button"
                  onClick={() => setActiveUniverse(universe.id)}
                  className="mt-5 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full text-sm font-black text-[#071018] transition hover:brightness-110"
                  style={{ backgroundColor: universe.accent }}
                >
                  Découvrir cet univers <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key={`${universe.id}-collapsed`}
              initial={reducedMotion ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-auto pb-3 text-center"
            >
              <button
                type="button"
                onClick={() => setActiveUniverse(universe.id)}
                className="mx-auto grid h-12 w-12 place-items-center rounded-full border border-white/15 bg-black/25 transition hover:scale-105"
                style={{ color: universe.accent }}
                aria-label={`Ouvrir ${universe.title}`}
              >
                <ArrowRight className="h-5 w-5" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.section>
  );
}

function MobileUniverseCard({ universe, children }) {
  return (
    <section
      className="relative min-w-[88vw] max-w-[460px] snap-center overflow-hidden rounded-[30px] border border-white/10 shadow-[0_24px_80px_rgba(0,0,0,.32)]"
      style={{ background: universe.background }}
    >
      <div className="absolute inset-x-0 top-0 h-1" style={{ backgroundColor: universe.accent }} />
      <div className="p-5">
        <div className="flex min-h-[68px] items-center justify-center rounded-[19px] border border-white/12 bg-black/25 p-3 backdrop-blur-xl">
          <img src={universe.logo} alt={universe.title} className="max-h-[46px] w-full object-contain" />
        </div>
        <p className="mt-6 text-[10px] font-black uppercase tracking-[.2em]" style={{ color: universe.softAccent }}>
          {universe.tagline}
        </p>
        <h2 className="mt-2 font-display text-3xl font-black leading-[.98] tracking-[-.04em]">{universe.headline}</h2>
        <p className="mt-3 text-sm font-medium leading-relaxed text-white/58">{universe.description}</p>
        <div className="mt-5">{children}</div>
      </div>
    </section>
  );
}

export default function UniverseHome() {
  const reduceMotion = useReducedMotion();
  const { isProfessional, professionalLoading } = useProfessionalAuth();
  const [activeUniverse, setActiveUniverse] = useState(null);
  const [outletProducts, setOutletProducts] = useState([]);
  const [proProducts, setProProducts] = useState([]);
  const [outletLoading, setOutletLoading] = useState(true);
  const [proLoading, setProLoading] = useState(false);

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

  const outlet = UNIVERSES[0];
  const energies = UNIVERSES[1];
  const partner = UNIVERSES[2];

  return (
    <main className="min-h-screen overflow-hidden bg-[#020711] text-white">
      <header className="relative z-20 border-b border-white/10 bg-[#030811]/90 px-4 py-4 backdrop-blur-2xl sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-[1900px] items-center justify-between gap-5">
          <div>
            <p className="font-display text-2xl font-black tracking-[-.05em] sm:text-3xl">QEH</p>
            <p className="mt-0.5 text-[10px] font-bold uppercase tracking-[.16em] text-white/35 sm:text-[11px]">
              Trois expertises. Un même écosystème.
            </p>
          </div>

          <div className="hidden items-center gap-1.5 rounded-full border border-white/10 bg-white/[.04] p-1.5 lg:flex">
            {UNIVERSES.map((universe) => {
              const active = activeUniverse === universe.id;
              return (
                <button
                  key={universe.id}
                  type="button"
                  onClick={() => setActiveUniverse(active ? null : universe.id)}
                  className="relative min-w-[112px] rounded-full px-4 py-2.5 text-[10px] font-black uppercase tracking-[.16em] transition"
                  style={{ color: active ? "#071018" : universe.softAccent }}
                >
                  {active ? (
                    <motion.span
                      layoutId="qeh-active-universe"
                      className="absolute inset-0 rounded-full"
                      style={{ backgroundColor: universe.accent }}
                      transition={reduceMotion ? { duration: 0 } : { type: "spring", stiffness: 240, damping: 26 }}
                    />
                  ) : null}
                  <span className="relative z-10">{universe.label}</span>
                </button>
              );
            })}
          </div>

          <div className="hidden text-right xl:block">
            <p className="text-[10px] font-black uppercase tracking-[.18em] text-white/28">
              Sélectionnez un univers
            </p>
            <p className="mt-1 text-xs font-semibold text-white/48">
              Survolez pour l'ouvrir
            </p>
          </div>
        </div>
      </header>

      <div
        className="hidden min-h-[calc(100vh-89px)] lg:flex"
        onMouseLeave={() => setActiveUniverse(null)}
      >
        <DesktopUniversePanel
          universe={outlet}
          activeUniverse={activeUniverse}
          setActiveUniverse={setActiveUniverse}
          reducedMotion={reduceMotion}
        >
          <OutletExpanded products={outletProducts} loading={outletLoading} />
        </DesktopUniversePanel>

        <DesktopUniversePanel
          universe={energies}
          activeUniverse={activeUniverse}
          setActiveUniverse={setActiveUniverse}
          reducedMotion={reduceMotion}
        >
          <EnergiesExpanded />
        </DesktopUniversePanel>

        <DesktopUniversePanel
          universe={partner}
          activeUniverse={activeUniverse}
          setActiveUniverse={setActiveUniverse}
          reducedMotion={reduceMotion}
        >
          <PartnerExpanded
            isProfessional={isProfessional}
            products={proProducts}
            loading={proLoading || professionalLoading}
          />
        </DesktopUniversePanel>
      </div>

      <div className="lg:hidden">
        <div className="px-4 pb-2 pt-5 sm:px-6">
          <p className="text-xs font-semibold leading-relaxed text-white/48">
            Glissez horizontalement pour passer d'un univers QEH à l'autre.
          </p>
          <div className="mt-4 flex items-center gap-2">
            {UNIVERSES.map((universe) => (
              <span
                key={universe.id}
                className="h-1.5 flex-1 rounded-full opacity-85"
                style={{ backgroundColor: universe.accent }}
              />
            ))}
          </div>
        </div>

        <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto px-[6vw] pb-8 pt-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <MobileUniverseCard universe={outlet}>
            <OutletProducts products={outletProducts} loading={outletLoading} compact />
            <div className="mt-4 grid grid-cols-2 gap-2">
              <Link
                to="/produits"
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-[#ff5a00] px-4 text-xs font-black text-white"
              >
                Catalogue <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/suivi-commande"
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-white/12 bg-white/[.055] px-4 text-xs font-black"
              >
                Suivi
              </Link>
            </div>
          </MobileUniverseCard>

          <MobileUniverseCard universe={energies}>
            <div className="relative aspect-[16/10] overflow-hidden rounded-[24px] border border-white/10">
              <img
                src="/images/editorial/qeh-energies-territoire.jpg"
                alt="Production solaire locale QEH ÉNERGIES"
                className="h-full w-full object-cover opacity-80"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#07110c] via-transparent to-transparent" />
              <div className="absolute bottom-3 left-3 right-3 rounded-2xl border border-white/10 bg-black/45 px-3 py-2 backdrop-blur-md">
                <p className="text-[10px] font-black text-[#a8eb75]">Carte solaire locale</p>
              </div>
            </div>
            <div className="mt-4 grid gap-2">
              <ActionLink to="/qeh-energies/carte-solaire" icon={Map} title="Explorer la carte" accent="#82d246" filled />
              <div className="grid grid-cols-2 gap-2">
                <Link
                  to="/qeh-energies/comment-ca-marche"
                  className="flex min-h-11 items-center justify-center rounded-full border border-white/10 bg-white/[.055] px-3 text-center text-[11px] font-black"
                >
                  Comprendre
                </Link>
                <Link
                  to="/qeh-energies/participer"
                  className="flex min-h-11 items-center justify-center rounded-full border border-white/10 bg-white/[.055] px-3 text-center text-[11px] font-black"
                >
                  Participer
                </Link>
              </div>
            </div>
          </MobileUniverseCard>

          <MobileUniverseCard universe={partner}>
            {isProfessional ? (
              <ProfessionalProducts products={proProducts} loading={proLoading || professionalLoading} compact />
            ) : (
              <LockedPartnerPreview compact />
            )}
            <div className="mt-4 grid gap-2">
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
          </MobileUniverseCard>
        </div>
      </div>
    </main>
  );
}
