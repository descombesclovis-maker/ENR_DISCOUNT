import React, { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  Lock,
  Map,
} from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useProfessionalAuth } from "../context/ProfessionalAuthContext";
import QEHIntro from "../components/QEHIntro";

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
          className="group min-w-0 overflow-hidden rounded-[18px] border border-white/10 bg-[#081b2e]/85 p-2 transition hover:-translate-y-0.5 hover:border-[#ff5a00]/70"
        >
          <div className="aspect-square w-full overflow-hidden rounded-[12px] bg-white p-1.5">
            <img
              src={product.image.url}
              alt={product.image.alt}
              loading="lazy"
              className="h-full w-full object-contain transition duration-300 group-hover:scale-105"
            />
          </div>
          <div className="min-w-0 px-0.5 pb-0.5 pt-2">
            <p className="line-clamp-2 text-[9px] font-black leading-tight text-white/88">
              {product.name}
            </p>
            <p className="mt-1 text-[10px] font-black text-[#ff7a32]">{outletPrice(product)}</p>
          </div>
        </Link>
      ))}
    </div>
  );
}

function LockedPartnerPreview() {
  return (
    <div className="grid grid-cols-2 gap-2">
      {[0, 1, 2, 3].map((item) => (
        <div
          key={item}
          className="relative aspect-square overflow-hidden rounded-[18px] border border-[#f2cf79]/15 bg-black/25"
        >
          <img
            src="/images/editorial/qeh-partner-logistique.jpg"
            alt="Aperçu du catalogue professionnel QEH PARTNER"
            className="h-full w-full scale-110 object-cover opacity-25 blur-[4px]"
            style={{ objectPosition: `center ${20 + item * 20}%` }}
          />
          <div className="absolute inset-0 grid place-items-center bg-[#07111f]/48">
            <span className="grid h-8 w-8 place-items-center rounded-full border border-[#f2cf79]/45 bg-black/70 text-[#f2cf79]">
              <Lock className="h-3.5 w-3.5" />
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
      {products.slice(0, 4).map((product) => (
        <Link
          key={product.id}
          to="/qeh-partner/materiel-pro"
          className="group min-w-0 overflow-hidden rounded-[18px] border border-[#f2cf79]/16 bg-black/25 p-2 transition hover:-translate-y-0.5 hover:border-[#f2cf79]/50"
        >
          <div className="aspect-square w-full rounded-[12px] bg-white/95 p-1.5">
            <img
              src={product.image_url || "/images/product-placeholder.png"}
              alt={product.name}
              className="h-full w-full object-contain"
            />
          </div>
          <div className="min-w-0 px-0.5 pb-0.5 pt-2">
            <p className="line-clamp-2 text-[9px] font-black text-white/90">{product.name}</p>
            <p className="mt-1 text-[9px] font-black text-[#f2cf79]">
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

function UniverseCard({ universe, children }) {
  return (
    <section
      className="relative h-full min-w-0 overflow-hidden rounded-[28px] border border-white/10 shadow-[0_24px_75px_rgba(0,0,0,.30)]"
      style={{ background: universe.background }}
    >
      <div className="absolute inset-x-0 top-0 h-1" style={{ backgroundColor: universe.accent }} />
      <div className="flex h-full flex-col p-4 sm:p-5">
        <div className="flex h-[104px] items-center justify-center rounded-[22px] border border-white/12 bg-black/22 px-5 py-3 backdrop-blur-xl">
          <img
            src={universe.logo}
            alt={universe.title}
            className="max-h-[82px] w-full object-contain"
          />
        </div>

        <div className="mt-4">
          <div className="flex items-center justify-between gap-3">
            <p className="text-[9px] font-black uppercase tracking-[.2em]" style={{ color: universe.softAccent }}>
              {universe.tagline}
            </p>
            <span className="text-[9px] font-black uppercase tracking-[.14em] text-white/28">{universe.title}</span>
          </div>
          <h2 className="mt-1.5 font-display text-[22px] font-black leading-[1] tracking-[-.035em]">
            {universe.headline}
          </h2>
          <p className="mt-2 text-[12px] font-medium leading-relaxed text-white/52">
            {universe.description}
          </p>
        </div>

        <div className="mt-4 flex flex-1 flex-col">{children}</div>
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
        .limit(4);

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
      <QEHIntro />

      <div className="mx-auto w-4/5 [zoom:1.25]">
        <header className="relative z-20 border-b border-white/10 bg-[#030811]/90 px-3 py-3 backdrop-blur-2xl sm:px-5">
          <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-4">
            <div>
              <p className="font-display text-xl font-black tracking-[-.05em]">QEH</p>
              <p className="text-[8px] font-bold uppercase tracking-[.16em] text-white/30 sm:text-[9px]">
                Trois expertises. Un même écosystème.
              </p>
            </div>
            <p className="text-right text-[8px] font-black uppercase tracking-[.14em] text-white/35 sm:text-[10px]">
              Choisissez votre univers
            </p>
          </div>
        </header>

        <motion.section
          initial={reduceMotion ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mx-auto max-w-[1400px] px-2 pb-8 pt-4 sm:px-4 lg:pt-5"
        >
          <div className="mb-4 px-1 text-center">
            <h1 className="font-display text-2xl font-black tracking-[-.04em] sm:text-3xl">
              Trois univers. Toutes les solutions QEH.
            </h1>
            <p className="mx-auto mt-2 max-w-2xl text-[10px] leading-relaxed text-white/42 sm:text-xs">
              Achetez vos équipements, explorez l'énergie produite localement ou accédez aux services réservés aux professionnels.
            </p>
          </div>

          <div className="grid items-stretch gap-3 lg:grid-cols-3">
            <UniverseCard universe={outlet}>
              <OutletProducts products={outletProducts} loading={outletLoading} />
              <div className="mt-3 grid grid-cols-2 gap-2">
                <Link
                  to="/produits"
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-[#ff5a00] px-3 text-center text-[10px] font-black text-white"
                >
                  Produits en vedette <ArrowRight className="h-3.5 w-3.5 shrink-0" />
                </Link>
                <Link
                  to="/qeh-outlet"
                  className="inline-flex min-h-11 items-center justify-center rounded-full border border-white/12 bg-white/[.055] px-3 text-[10px] font-black"
                >
                  Entrer dans Outlet
                </Link>
              </div>
              <div className="mt-auto pt-3 text-[9px] leading-relaxed text-white/38">
                Produits disponibles, promotions, nouveautés et suivi précis de vos commandes.
              </div>
            </UniverseCard>

            <UniverseCard universe={energies}>
              <div className="relative h-36 overflow-hidden rounded-[18px] border border-white/10">
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
                    className="flex min-h-11 items-center justify-center rounded-full border border-white/10 bg-white/[.055] px-3 text-center text-[10px] font-black"
                  >
                    Comment ça marche
                  </Link>
                  <Link
                    to="/qeh-energies/participer"
                    className="flex min-h-11 items-center justify-center rounded-full border border-white/10 bg-white/[.055] px-3 text-center text-[10px] font-black"
                  >
                    Participer
                  </Link>
                </div>
              </div>
              <Link
                to="/qeh-energies"
                className="mt-auto flex min-h-11 items-center justify-center gap-2 pt-3 text-[10px] font-black text-[#a8eb75]"
              >
                Entrer dans QEH Énergies <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </UniverseCard>

            <UniverseCard universe={partner}>
              {isProfessional ? (
                <ProfessionalProducts products={proProducts} loading={proLoading || professionalLoading} />
              ) : (
                <>
                  <LockedPartnerPreview />
                  <p className="mt-2 px-1 text-[9px] leading-relaxed text-white/40">
                    Les produits sont masqués jusqu'à la validation de votre accès professionnel.
                  </p>
                </>
              )}
              <div className="mt-3 grid gap-2">
                <Link
                  to={isProfessional ? "/qeh-partner/materiel-pro" : "/qeh-partner/connexion-pro"}
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-[#f2cf79] px-4 text-[10px] font-black text-[#171109]"
                >
                  {isProfessional ? "Catalogue Pro" : "Connexion Pro"} <ArrowRight className="h-3.5 w-3.5" />
                </Link>
                {!isProfessional ? (
                  <Link
                    to="/qeh-partner/inscription-pro"
                    className="flex min-h-10 items-center justify-center rounded-full border border-[#f2cf79]/20 bg-[#f2cf79]/[.07] px-3 text-center text-[10px] font-black text-[#ffe4a0]"
                  >
                    Demander mon accès Pro
                  </Link>
                ) : null}
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    to="/qeh-partner/production"
                    className="flex min-h-11 items-center justify-center rounded-full border border-[#f2cf79]/20 bg-[#f2cf79]/[.07] px-3 text-center text-[10px] font-black text-[#ffe4a0]"
                  >
                    Devenir producteur
                  </Link>
                  <Link
                    to="/qeh-partner/franchise"
                    className="flex min-h-11 items-center justify-center rounded-full border border-[#f2cf79]/20 bg-[#f2cf79]/[.07] px-3 text-center text-[10px] font-black text-[#ffe4a0]"
                  >
                    Être franchisé
                  </Link>
                </div>
              </div>
              <Link
                to="/qeh-partner"
                className="mt-auto flex min-h-11 items-center justify-center gap-2 pt-3 text-[10px] font-black text-[#ffe4a0]"
              >
                Entrer dans QEH Partner <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </UniverseCard>
          </div>
        </motion.section>
      </div>
    </main>
  );
}
