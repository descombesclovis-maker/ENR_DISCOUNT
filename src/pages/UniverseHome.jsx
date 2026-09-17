import React, { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  BadgeEuro,
  Boxes,
  Factory,
  LoaderCircle,
  Map,
  PackageSearch,
  ShieldCheck,
  Sparkles,
  Store,
  SunMedium,
  Truck,
  UserCheck,
  Users,
} from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase";

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

const shortcuts = [
  { label: "Prix déstockage", detail: "Voir les bonnes affaires", to: "/produits", icon: BadgeEuro, accent: "#ff5a00" },
  { label: "Suivi précis", detail: "Suivre ma commande", to: "/suivi-commande", icon: Truck, accent: "#55a8ff" },
  { label: "Carte solaire", detail: "Explorer les projets", to: "/qeh-energies/carte-solaire", icon: Map, accent: "#82d246" },
  { label: "Accès Pro", detail: "Candidater ou se connecter", to: "/qeh-partner/connexion-pro", icon: UserCheck, accent: "#f2cf79" },
];

const currencyFormatter = new Intl.NumberFormat("fr-FR", {
  style: "currency",
  currency: "EUR",
});

function getPrimaryImage(images, productName) {
  if (!Array.isArray(images) || images.length === 0) {
    return { url: "/images/product-placeholder.png", alt: productName };
  }

  const sortedImages = [...images].sort((first, second) => {
    if (first.is_primary !== second.is_primary) {
      return first.is_primary ? -1 : 1;
    }
    return Number(first.display_order || 0) - Number(second.display_order || 0);
  });

  return {
    url: sortedImages[0]?.image_url || "/images/product-placeholder.png",
    alt: sortedImages[0]?.alt_text || productName,
  };
}

function displayPrice(product) {
  const activePrice = product.is_on_sale && Number(product.sale_price) > 0
    ? Number(product.sale_price)
    : Number(product.price || 0);
  return activePrice > 0 ? currencyFormatter.format(activePrice) : "Sur demande";
}

export default function UniverseHome() {
  const reduceMotion = useReducedMotion();
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);

  useEffect(() => {
    document.title = "QEH | Trois univers, une même exigence";

    let isMounted = true;
    const loadProducts = async () => {
      const { data, error } = await supabase
        .from("products")
        .select(`
          id,
          name,
          slug,
          brand,
          price,
          sale_price,
          is_on_sale,
          stock,
          on_demand,
          created_at,
          categories (name),
          product_images (image_url, alt_text, is_primary, display_order)
        `)
        .eq("is_active", true)
        .order("is_featured", { ascending: false })
        .order("created_at", { ascending: false })
        .limit(4);

      if (!isMounted) return;

      if (error) {
        console.error("Impossible de charger les aperçus produits :", error);
        setProducts([]);
      } else {
        setProducts((data || []).map((product) => ({
          ...product,
          image: getPrimaryImage(product.product_images, product.name),
        })));
      }
      setProductsLoading(false);
    };

    loadProducts();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#020711] text-white">
      <div className="pointer-events-none absolute inset-0">
        <motion.div
          className="absolute left-[-12rem] top-[-12rem] h-[34rem] w-[34rem] rounded-full bg-[#0b5ca8]/25 blur-[110px]"
          animate={reduceMotion ? undefined : { x: [0, 50, 0], y: [0, 30, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-[-15rem] right-[-12rem] h-[38rem] w-[38rem] rounded-full bg-[#82d246]/15 blur-[120px]"
          animate={reduceMotion ? undefined : { x: [0, -45, 0], scale: [1, 1.12, 1] }}
          transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
        />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.035)_1px,transparent_1px)] bg-[size:52px_52px] [mask-image:linear-gradient(to_bottom,black,transparent_92%)]" />
      </div>

      <section className="relative mx-auto max-w-[1600px] px-3 pb-16 pt-8 sm:px-8 sm:pb-20 sm:pt-14">
        <motion.header
          initial={reduceMotion ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65 }}
          className="mx-auto max-w-5xl text-center"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[.05] px-3 py-2 text-[10px] font-black uppercase tracking-[.2em] text-white/70 backdrop-blur-xl sm:px-4 sm:text-[11px] sm:tracking-[.24em]">
            <Sparkles className="h-4 w-4 text-[#f2cf79]" />
            Bienvenue dans l'écosystème QEH
          </div>
          <h1 className="mt-5 font-display text-[2.65rem] font-black leading-[.94] tracking-[-.05em] sm:mt-6 sm:text-6xl lg:text-7xl">
            Équipez. Produisez.
            <span className="block bg-gradient-to-r from-[#55a8ff] via-[#82d246] to-[#f2cf79] bg-clip-text text-transparent">
              Développez.
            </span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-sm leading-relaxed text-slate-300 sm:text-base">
            Produits techniques à prix outlet, énergie solaire locale et services professionnels : découvrez immédiatement ce que QEH peut faire pour vous.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Link to="/produits" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#ff5a00] px-6 text-sm font-black text-white shadow-[0_14px_40px_rgba(255,90,0,.28)] transition hover:-translate-y-0.5 hover:bg-[#ff742b]">
              Voir les produits <ArrowRight className="h-4 w-4" />
            </Link>
            <Link to="/qeh-energies/carte-solaire" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-white/20 bg-white/[.06] px-6 text-sm font-black text-white transition hover:border-[#82d246] hover:bg-white/[.1]">
              Explorer la carte solaire
            </Link>
          </div>
        </motion.header>

        <div className="mt-9 grid grid-cols-2 gap-2.5 sm:mt-12 sm:gap-4 lg:grid-cols-4">
          {shortcuts.map((shortcut, index) => {
            const Icon = shortcut.icon;
            return (
              <motion.div
                key={shortcut.label}
                initial={reduceMotion ? false : { opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: reduceMotion ? 0 : 0.12 + index * 0.07 }}
              >
                <Link to={shortcut.to} className="group flex h-full min-h-[104px] items-center gap-3 rounded-[22px] border border-white/10 bg-white/[.055] p-3 backdrop-blur-xl transition hover:-translate-y-1 hover:border-[var(--shortcut-accent)] hover:bg-white/[.09] sm:min-h-[116px] sm:gap-4 sm:p-5" style={{ "--shortcut-accent": shortcut.accent }}>
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-white/[.07] text-[var(--shortcut-accent)] sm:h-12 sm:w-12">
                    <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
                  </span>
                  <span className="min-w-0">
                    <span className="block font-display text-sm font-black leading-tight sm:text-base">{shortcut.label}</span>
                    <span className="mt-1 block text-[10px] leading-snug text-white/50 sm:text-xs">{shortcut.detail}</span>
                  </span>
                </Link>
              </motion.div>
            );
          })}
        </div>

        <section className="mt-12 sm:mt-16" aria-labelledby="products-preview-title">
          <div className="mb-5 flex items-end justify-between gap-4 sm:mb-7">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[.2em] text-[#ff7a32] sm:text-xs">À découvrir maintenant</p>
              <h2 id="products-preview-title" className="mt-2 font-display text-2xl font-black sm:text-4xl">Une sélection déjà en vitrine</h2>
            </div>
            <Link to="/produits" className="hidden items-center gap-2 text-sm font-black text-white/70 transition hover:text-white sm:flex">Tout voir <ArrowRight className="h-4 w-4" /></Link>
          </div>

          {productsLoading ? (
            <div className="grid min-h-44 place-items-center rounded-[28px] border border-white/10 bg-white/[.04]">
              <LoaderCircle className="h-8 w-8 animate-spin text-[#55a8ff]" aria-label="Chargement des produits" />
            </div>
          ) : products.length > 0 ? (
            <div className="grid grid-cols-2 gap-2.5 sm:gap-5 lg:grid-cols-4">
              {products.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={reduceMotion ? false : { opacity: 0, y: 22 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.45, delay: reduceMotion ? 0 : index * 0.07 }}
                >
                  <Link to={`/produits/${product.slug}`} className="group flex h-full flex-col overflow-hidden rounded-[22px] border border-white/10 bg-white text-[#07101f] transition hover:-translate-y-1.5 hover:border-[#ff5a00] hover:shadow-[0_24px_70px_rgba(0,0,0,.34)] sm:rounded-[28px]">
                    <div className="relative aspect-square overflow-hidden bg-white p-2 sm:p-5">
                      <img src={product.image.url} alt={product.image.alt} loading="lazy" className="h-full w-full object-contain transition duration-500 group-hover:scale-105" onError={(event) => { event.currentTarget.onerror = null; event.currentTarget.src = "/images/product-placeholder.png"; }} />
                      {product.is_on_sale && Number(product.sale_price) > 0 ? (
                        <span className="absolute left-2 top-2 rounded-full bg-[#ff5a00] px-2 py-1 text-[9px] font-black text-white shadow-lg sm:left-4 sm:top-4 sm:px-3 sm:text-xs">PROMO</span>
                      ) : null}
                    </div>
                    <div className="flex flex-1 flex-col border-t border-slate-100 p-3 sm:p-5">
                      <p className="line-clamp-1 text-[9px] font-black uppercase tracking-[.1em] text-[#0b5ca8] sm:text-xs">{product.categories?.name || product.brand || "QEH OUTLET"}</p>
                      <h3 className="mt-1 line-clamp-2 font-display text-xs font-black leading-snug sm:mt-2 sm:text-base">{product.name}</h3>
                      <div className="mt-auto pt-3 sm:pt-5">
                        <p className="font-display text-sm font-black text-[#ff5a00] sm:text-xl">{displayPrice(product)}</p>
                        <p className={`mt-1 text-[9px] font-bold sm:text-xs ${Number(product.stock) > 0 ? "text-emerald-600" : product.on_demand ? "text-amber-600" : "text-slate-400"}`}>
                          {Number(product.stock) > 0 ? "En stock" : product.on_demand ? "Sur demande" : "Voir la fiche"}
                        </p>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          ) : (
            <Link to="/produits" className="flex min-h-40 items-center justify-center rounded-[28px] border border-dashed border-white/20 bg-white/[.04] text-center font-black text-white/70 transition hover:border-[#ff5a00] hover:text-white">Découvrir le catalogue QEH OUTLET</Link>
          )}
          <Link to="/produits" className="mt-4 flex min-h-11 items-center justify-center gap-2 rounded-full border border-white/15 text-sm font-black sm:hidden">Voir tout le catalogue <ArrowRight className="h-4 w-4" /></Link>
        </section>

        <section className="mt-12 sm:mt-20" aria-labelledby="universes-title">
          <div className="mb-5 text-center sm:mb-8">
            <p className="text-[10px] font-black uppercase tracking-[.2em] text-white/45 sm:text-xs">Tout l'écosystème QEH</p>
            <h2 id="universes-title" className="mt-2 font-display text-2xl font-black sm:text-4xl">Choisissez votre univers</h2>
          </div>

          <div className="grid grid-cols-2 gap-2.5 sm:gap-5 lg:grid-cols-3">
            {universes.map((universe, index) => (
              <motion.article
                key={universe.id}
                initial={reduceMotion ? false : { opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.15 }}
                transition={{ duration: 0.55, delay: reduceMotion ? 0 : index * 0.09 }}
                whileHover={reduceMotion ? undefined : { y: -7 }}
                className={`group relative overflow-hidden rounded-[24px] border border-white/10 bg-[#07101f] shadow-[0_30px_90px_rgba(0,0,0,.3)] sm:rounded-[34px] ${index === 0 ? "col-span-2 min-h-[510px] lg:col-span-1 lg:min-h-[600px]" : "min-h-[410px] lg:min-h-[600px]"}`}
                style={{ "--universe-accent": universe.accent, "--universe-glow": universe.glow }}
              >
                <img src={universe.image} alt="" aria-hidden="true" className="absolute inset-0 h-full w-full object-cover opacity-50 transition duration-700 group-hover:scale-105 group-hover:opacity-65" />
                <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(2,7,17,.08)_0%,rgba(2,7,17,.7)_45%,#020711_86%)]" />
                <div className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-[var(--universe-accent)] to-transparent opacity-90" />
                <div className="absolute -right-20 top-20 h-52 w-52 rounded-full bg-[var(--universe-glow)] blur-[75px] transition duration-700 group-hover:scale-125" />

                <div className="relative flex h-full flex-col p-3 sm:p-6 lg:p-8">
                  <Link to={universe.to} aria-label={`Entrer dans ${universe.name}`} className="flex min-h-[76px] items-center justify-center overflow-hidden rounded-2xl border border-white/15 bg-[#020711]/85 p-2 shadow-2xl backdrop-blur-xl transition hover:border-[var(--universe-accent)] sm:min-h-[108px] sm:rounded-3xl sm:p-4">
                    <img src={universe.logo} alt={universe.name} className="max-h-[65px] w-full object-contain sm:max-h-[82px]" />
                  </Link>

                  <div className="mt-auto pt-20 sm:pt-24">
                    <p className="text-[9px] font-black uppercase leading-relaxed tracking-[.12em] text-[var(--universe-accent)] sm:text-xs sm:tracking-[.18em]">{universe.tagline}</p>
                    <p className={`mt-3 text-sm leading-relaxed text-slate-300 ${index === 0 ? "block" : "hidden sm:block"}`}>{universe.description}</p>

                    <div className={`mt-5 space-y-2 ${index === 0 ? "grid grid-cols-2 gap-2 space-y-0 sm:block sm:space-y-2" : "hidden lg:block"}`}>
                      {universe.links.map((item, itemIndex) => {
                        const Icon = item.icon;
                        return (
                          <Link key={item.to} to={item.to} className={`min-h-11 items-center gap-2 rounded-xl border border-white/[.08] bg-white/[.05] px-3 text-[11px] font-extrabold text-white/85 transition hover:border-[var(--universe-accent)] hover:bg-white/[.1] sm:min-h-12 sm:gap-3 sm:rounded-2xl sm:px-4 sm:text-sm ${index === 0 && itemIndex === 2 ? "col-span-2 flex" : "flex"}`}>
                            <Icon className="h-4 w-4 shrink-0 text-[var(--universe-accent)] sm:h-5 sm:w-5" />
                            <span className="truncate">{item.label}</span>
                            <ArrowRight className="ml-auto h-3.5 w-3.5 shrink-0" />
                          </Link>
                        );
                      })}
                    </div>

                    <Link to={universe.to} className="mt-4 inline-flex min-h-11 w-full items-center justify-center gap-1.5 rounded-full bg-[var(--universe-accent)] px-2 text-[11px] font-black text-[#020711] shadow-[0_14px_40px_var(--universe-glow)] transition hover:brightness-110 sm:mt-5 sm:min-h-12 sm:gap-2 sm:px-6 sm:text-base">
                      {index === 0 ? "Entrer dans l'univers" : "Découvrir"}
                      <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5" />
                    </Link>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        </section>

        <section className="mt-12 grid grid-cols-2 gap-2.5 rounded-[28px] border border-white/10 bg-white/[.045] p-3 backdrop-blur-xl sm:mt-16 sm:grid-cols-4 sm:gap-4 sm:p-5">
          {[
            [ShieldCheck, "Paiement sécurisé"],
            [PackageSearch, "Suivi de commande"],
            [SunMedium, "Projets solaires"],
            [UserCheck, "Compte professionnel"],
          ].map(([Icon, label]) => (
            <div key={label} className="flex min-h-[72px] items-center gap-2.5 rounded-2xl bg-[#020711]/55 p-3 text-xs font-black text-white/80 sm:justify-center sm:text-sm">
              <Icon className="h-5 w-5 shrink-0 text-[#82d246]" />
              <span>{label}</span>
            </div>
          ))}
        </section>

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
