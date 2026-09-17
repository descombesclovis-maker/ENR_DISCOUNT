import React, { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  BadgeEuro,
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

function ProLockedPreview() {
  return (
    <div className="grid grid-cols-2 gap-2.5">
      {[0, 1].map((item) => (
        <div
          key={item}
          className="relative overflow-hidden rounded-[20px] border border-[#17649e]/45 bg-[#0a2744] p-2.5 shadow-[0_12px_34px_rgba(2,7,20,.18)]"
        >
          <div className="relative aspect-square overflow-hidden rounded-[15px] bg-[#071b31]">
            <img
              src="/images/editorial/qeh-partner-logistique.jpg"
              alt="Catalogue professionnel QEH Partner verrouillé"
              className="h-full w-full scale-110 object-cover opacity-35 blur-[5px]"
            />
            <div className="absolute inset-0 grid place-items-center bg-[#071b31]/55">
              <span className="grid h-10 w-10 place-items-center rounded-full border border-[#f2cf79]/45 bg-[#080704]/80 text-[#f2cf79] shadow-xl">
                <Lock className="h-4 w-4" />
              </span>
            </div>
          </div>
          <div className="mt-2.5">
            <p className="text-[9px] font-black uppercase tracking-[.16em] text-[#f2cf79]">Matériel Pro</p>
            <p className="mt-1 text-xs font-black text-white/80">Produit réservé</p>
            <p className="mt-1 text-[10px] font-bold text-white/35">Prix masqué</p>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function UniverseHome() {
  const reduceMotion = useReducedMotion();
  const { isProfessional, professionalAccount, professionalLoading } = useProfessionalAuth();
  const [outletProducts, setOutletProducts] = useState([]);
  const [proProducts, setProProducts] = useState([]);
  const [outletLoading, setOutletLoading] = useState(true);
  const [proLoading, setProLoading] = useState(false);

  useEffect(() => {
    document.title = "QEH | Trois univers";

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
        setOutletProducts((data || []).map((product) => ({
          ...product,
          image: getPrimaryImage(product.product_images, product.name),
        })));
      }
      setOutletLoading(false);
    }

    loadOutletProducts();
    return () => { active = false; };
  }, []);

  useEffect(() => {
    let active = true;

    async function loadProfessionalProducts() {
      if (professionalLoading || !isProfessional) {
        if (!isProfessional) {
          setProProducts([]);
          setProLoading(false);
        }
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
    return () => { active = false; };
  }, [isProfessional, professionalLoading]);

  const panelAnimation = (delay) => ({
    initial: reduceMotion ? false : { opacity: 0, y: 24 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6, delay: reduceMotion ? 0 : delay },
  });

  return (
    <main className="min-h-screen bg-[#020711] text-white">
      <div className="grid min-h-screen grid-cols-1 lg:grid-cols-3">
        {/* QEH OUTLET */}
        <motion.section
          {...panelAnimation(0)}
          className="relative overflow-hidden border-b border-white/10 bg-[radial-gradient(circle_at_20%_0%,rgba(255,90,0,.30),transparent_38%),linear-gradient(160deg,#07111f_0%,#0a2440_52%,#11100d_100%)] lg:min-h-screen lg:border-b-0 lg:border-r"
        >
          <div className="pointer-events-none absolute inset-x-0 top-0 h-1.5 bg-[#ff5a00]" />
          <div className="pointer-events-none absolute -left-28 top-28 h-72 w-72 rounded-full bg-[#ff5a00]/16 blur-[90px]" />
          <div className="relative flex h-full flex-col p-4 pb-8 pt-7 sm:p-7 lg:p-6 xl:p-8">
            <Link to="/qeh-outlet" className="flex min-h-[78px] items-center justify-center rounded-[22px] border border-white/15 bg-black/25 p-3 backdrop-blur-xl transition hover:border-[#ff5a00]/70">
              <img src="/images/qeh-outlet-logo.jpg" alt="QEH OUTLET" className="max-h-[58px] w-full object-contain" />
            </Link>

            <div className="mt-6">
              <p className="text-[10px] font-black uppercase tracking-[.2em] text-[#ff8a4b]">Déstockage · équipement · bonnes affaires</p>
              <h1 className="mt-2 font-display text-3xl font-black leading-[.95] tracking-[-.04em] xl:text-4xl">Le matériel technique au prix juste.</h1>
              <p className="mt-3 text-sm leading-relaxed text-white/65">Panneaux solaires, climatisation, chauffage, plomberie et équipements techniques disponibles immédiatement ou sur demande.</p>
            </div>

            <div className="mt-5 grid grid-cols-3 gap-2">
              {[
                [Boxes, "Catalogue", "/produits"],
                [BadgeEuro, "Prix Outlet", "/qeh-outlet"],
                [PackageSearch, "Suivi", "/suivi-commande"],
              ].map(([Icon, label, to]) => (
                <Link key={label} to={to} className="flex min-h-[78px] flex-col items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[.055] px-2 text-center text-[10px] font-black transition hover:-translate-y-0.5 hover:border-[#ff5a00]/70 hover:bg-white/[.09] sm:text-xs">
                  <Icon className="h-5 w-5 text-[#ff7a32]" />
                  {label}
                </Link>
              ))}
            </div>

            <div className="mt-6 flex items-end justify-between gap-3">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[.18em] text-white/35">En vitrine</p>
                <h2 className="mt-1 font-display text-lg font-black">Produits QEH OUTLET</h2>
              </div>
              <Link to="/produits" className="text-[11px] font-black text-[#ff8a4b]">Tout voir</Link>
            </div>

            {outletLoading ? (
              <div className="mt-3 grid min-h-44 place-items-center rounded-[22px] border border-white/10 bg-white/[.04] text-xs font-bold text-white/40">Chargement…</div>
            ) : outletProducts.length > 0 ? (
              <div className="mt-3 grid grid-cols-2 gap-2.5">
                {outletProducts.map((product) => (
                  <Link key={product.id} to={`/produits/${product.slug}`} className="group overflow-hidden rounded-[20px] border border-[#17649e]/45 bg-[#0a2744] text-white shadow-[0_12px_34px_rgba(2,7,20,.18)] transition hover:-translate-y-1 hover:border-[#ff5a00]">
                    <div className="relative aspect-square bg-[#0a2744] p-2.5">
                      <img src={product.image.url} alt={product.image.alt} loading="lazy" className="h-full w-full object-contain transition duration-300 group-hover:scale-105" />
                      {product.is_on_sale && Number(product.sale_price) > 0 ? <span className="absolute left-2 top-2 rounded-full bg-[#ff5a00] px-2 py-1 text-[8px] font-black text-white">PROMO</span> : null}
                    </div>
                    <div className="border-t border-white/10 p-2.5">
                      <p className="line-clamp-2 min-h-[32px] text-[10px] font-black leading-snug sm:text-xs">{product.name}</p>
                      <p className="mt-2 text-xs font-black text-[#ff7a32] sm:text-sm">{outletPrice(product)}</p>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <Link to="/produits" className="mt-3 flex min-h-40 items-center justify-center rounded-[22px] border border-dashed border-white/20 bg-white/[.04] text-sm font-black">Découvrir le catalogue</Link>
            )}

            <Link to="/qeh-outlet" className="mt-5 inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#ff5a00] px-5 text-sm font-black shadow-[0_16px_44px_rgba(255,90,0,.28)] transition hover:bg-[#ff742b]">
              Entrer dans QEH OUTLET <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </motion.section>

        {/* QEH ENERGIES */}
        <motion.section
          {...panelAnimation(0.08)}
          className="relative overflow-hidden border-b border-white/10 bg-[radial-gradient(circle_at_50%_0%,rgba(130,210,70,.30),transparent_40%),linear-gradient(165deg,#08170f_0%,#10291b_48%,#07110c_100%)] lg:min-h-screen lg:border-b-0 lg:border-r"
        >
          <div className="pointer-events-none absolute inset-x-0 top-0 h-1.5 bg-[#82d246]" />
          <div className="pointer-events-none absolute -right-20 top-40 h-72 w-72 rounded-full bg-[#82d246]/14 blur-[95px]" />
          <div className="relative flex h-full flex-col p-4 pb-8 pt-7 sm:p-7 lg:p-6 xl:p-8">
            <Link to="/qeh-energies" className="flex min-h-[78px] items-center justify-center rounded-[22px] border border-white/15 bg-black/25 p-3 backdrop-blur-xl transition hover:border-[#82d246]/70">
              <img src="/images/qeh-energies-logo.png" alt="QEH ÉNERGIES" className="max-h-[58px] w-full object-contain" />
            </Link>

            <div className="mt-6">
              <p className="text-[10px] font-black uppercase tracking-[.2em] text-[#a8eb75]">Production locale · solaire · partage</p>
              <h2 className="mt-2 font-display text-3xl font-black leading-[.95] tracking-[-.04em] xl:text-4xl">L'énergie produite près de chez vous.</h2>
              <p className="mt-3 text-sm leading-relaxed text-white/65">QEH ÉNERGIES connecte projets photovoltaïques, producteurs et territoires pour rendre l'énergie locale plus simple et plus visible.</p>
            </div>

            <div className="mt-5 overflow-hidden rounded-[24px] border border-white/10 bg-black/20">
              <div className="relative aspect-[16/10] overflow-hidden">
                <img src="/images/editorial/qeh-energies-territoire.jpg" alt="Territoire et production solaire QEH ÉNERGIES" className="h-full w-full object-cover opacity-75" />
                <div className="absolute inset-0 bg-gradient-t from-[#07110c] via-transparent to-transparent" />
                <div className="absolute bottom-3 left-3 right-3 flex items-center gap-2 rounded-2xl border border-white/10 bg-black/45 px-3 py-2 backdrop-blur-md">
                  <SunMedium className="h-5 w-5 text-[#a8eb75]" />
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-[.16em] text-[#a8eb75]">Énergie locale</p>
                    <p className="text-xs font-bold text-white/80">Voir ce qui se produit autour de vous</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-5 space-y-2.5">
             {[
                [Map, "Carte solaire", "Explorer les projets et producteurs autour de vous", "/qeh-energies/carte-solaire"],
                [SunMedium, "Comment ça marche", "Comprendre le fonctionnement de l'écosystème énergétique", "/qeh-energies/comment-ca-marche"],
                [Users, "Participer", "Proposer un projet ou rejoindre la dynamique locale", "/qeh-energies/participer"],
             ].map(([Icon, title, detail, to]) => (
                <Link key={title} to={to} className="group flex min-h-[74px] items-center gap-3 rounded-[20px] border border-white/10 bg-white/[.055] p-3 transition hover:-translate-y-0.5 hover:border-[#82d246]/65 hover:bg-white/[.09]">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-[#82d246]/12 text-[#a8eb75]"><Icon className="h-5 w-5" /></span>
                  <span className="min-w-0">
                    <strong className="block text-xs font-black sm:text-sm">{title}</strong>
                    <span className="mt-0.5 block text-[10px] leading-snug text-white/45 sm:text-[11px]">{detail}</span>
                  </span>
                  <ArrowRight className="ml-auto h-4 w-4 shrink-0 text-white/30 transition group-hover:text-[#a8eb75]" />
                </Link>
             ))}
            </div>

            <div className="mt-5 grid grid-cols-2 gap-2.5">
              <div className="rounded-[18px] border border-white/10 bg-white/[.045] p-3">
                <ShieldCheck className="h-5 w-5 text-[#a8eb75]" />
                <p className="mt-2 text-xs font-black">Projets identifiés</p>
                <p className="mt-1 text-[10px] leading-relaxed text-white/40">Une lecture claire des initiatives du territoire.</p>
              </div>
              <div className="rounded-[18px] border border-white/10 bg-white/[.045] p-3">
                <Users className="h-5 w-5 text-[#a8eb75]" />
                <p className="mt-2 text-xs font-black">Réseau local</p>
                <p className="mt-1 text-[10px] leading-relaxed text-white/40">Producteurs, clients et partenaires réunis.</p>
              </div>
            </div>

            <Link to="/qeh-energies" className="mt-5 inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#82d246] px-5 text-sm font-black text-[#07110c] shadow-[0_16px_44px_rgba(130,210,70,.20)] transition hover:brightness-110">
              Entrer dans QEH ÉNERGIES <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </motion.section>

        {/* QEH PARTNER */}
        <motion.section
          {...panelAnimation(0.16)}
          className="relative overflow-hidden bg-[radial-gradient(circle_at_80%_0%,rgba(242,207,121,.26),transparent_40%),linear-gradient(160deg,#151108_0%,#20190b_50%,#0c0a06_100%)] lg:min-h-screen"
        >
          <div className="pointer-events-none absolute inset-x-0 top-0 h-1.5 bg-[#f2cf79]" />
          <div className="pointer-events-none absolute -right-20 top-24 h-72 w-72 rounded-full bg-[#f2cf79]/13 blur-[95px]" />
          <div className="relative flex h-full flex-col p-4 pb-8 pt-7 sm:p-7 lg:p-6 xl:p-8">
            <Link to="/qeh-partner" className="flex min-h-[78px] items-center justify-center rounded-[22px] border border-white/15 bg-black/30 p-3 backdrop-blur-xl transition hover:border-[#f2cf79]/70">
              <img src="/images/qeh-partner-logo-gold.png" alt="QEH PARTNER" className="max-h-[58px] w-full object-contain" />
            </Link>

            <div className="mt-6">
              <p className="text-[10px] font-black uppercase tracking-[.2em] text-[#f2cf79]">Professionnels · production · franchise</p>
              <h2 className="mt-2 font-display text-3xl font-black leading-[.95] tracking-[-.04em] xl:text-4xl">L'univers réservé à ceux qui développent QEH.</h2>
              <p className="mt-3 text-sm leading-relaxed text-white/65">Accédez au matériel professionnel, devenez producteur ou développez votre propre implantation avec le réseau QEH PARTNER.</p>
            </div>

            <div className="mt-5 flex items-center justify-between gap-3 rounded-[20px] border border-[#f2cf79]/20 bg-[#f2cf79]/[.07] p-3">
              <div className="flex items-center gap-3">
                <span className={`grid h-10 w-10 place-items-center rounded-full ${isProfessional ? "bg-emerald-400/15 text-emerald-300" : "bg-[#f2cf79]/12 text-[#f2cf79]"}`}>
                  {isProfessional ? <UserCheck className="h-5 w-5" /> : <Lock className="h-5 w-5" />}
                </span>
                <div>
                  <p className="text-xs font-black">{isProfessional ? `Compte Pro ${professionalAccount?.company_name || "validé"}` : "Catalogue professionnel verrouillé"}</p>
                  <p className="mt-0.5 text-[10px] text-white/45">{isProfessional ? "Vos prix et produits sont accessibles." : "Connectez-vous avec un compte Pro QEH validé."}</p>
                </div>
              </div>
              {!isProfessional && !professionalLoading ? <Lock className="h-4 w-4 shrink-0 text-[#f2cf79]" /> : null}
            </div>

            <div className="mt-5">
              <div className="mb-3 flex items-end justify-between gap-3">
                <div>
                  <p className="text-[9px] font-black uppercase tracking-[.16em] text-[#f2cf79]">Matériel professionnel</p>
                  <h3 className="mt-1 font-display text-lg font-black">Catalogue QEH Partner</h3>
                </div>
                {isProfessional ? <Link to="/qeh-partner/materiel-pro" className="text-[11px] font-black text-[#f2cf79]">Ouvrir</Link> : null}
              </div>

              {professionalLoading || proLoading ? (
                <div className="grid min-h-40 place-items-center rounded-[20px] border border-white/10 bg-white/[.04] text-xs font-bold text-white/40">Vérification du compte…</div>
              ) : isProfessional && proProducts.length > 0 ? (
                <div className="grid grid-cols-2 gap-2.5">
                  {proProducts.map((product) => (
                    <Link key={product.id} to="/qeh-partner/materiel-pro" className="group overflow-hidden rounded-[20px] border border-[#17649e]/45 bg-[#0a2744] text-white shadow-[0_12px_34px_rgba(2,7,20,.18)] transition hover:-translate-y-1 hover:border-[#f2cf79]">
                      <div className="aspect-square bg-[#0a2744] p-2.5">
                        {product.image_url ? <img src={product.image_url} alt={product.name} loading="lazy" className="h-full w-full object-contain transition group-hover:scale-105" /> : <div className="grid h-full place-items-center rounded-xl bg-[#071b31]"><Boxes className="h-8 w-8 text-[#f2cf79]" /></div>}
                      </div>
                    <div className="border-t border-white/10 p-2.5">
                        <p className="line-clamp-2 min-h-[32px] text-[10px] font-black leading-snug sm:text-xs">{product.name}</p>
                        <p className="mt-2 text-xs font-black text-[#f2cf79]">{euro.format(Number(product.price_excluding_tax || 0))} HT</p>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <ProLockedPreview />
              )}
            </div>

            {!isProfessional ? (
              <div className="mt-3 grid grid-cols-2 gap-2.5">
                <Link to="/qeh-partner/connexion-pro" className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-full border border-[#f2cf79]/35 bg-[#f2cf79]/10 px-3 text-[11px] font-black text-[#f2cf79] transition hover:bg-[#f2cf79]/15">
                  <Lock className="h-3.5 w-3.5" /> Connexion Pro
                </Link>
                <Link to="/qeh-partner/inscription-pro" className="inline-flex min-h-11 items-center justify-center rounded-full bg-[#f2cf79] px-3 text-[11px] font-black text-[#151108] transition hover:brightness-110">
                  Devenir Pro
                </Link>
              </div>
            ) : null}

            <div className="mt-5 space-y-2.5">
              {[
                [Factory, "Devenir producteur", "Produire ou référencer du matériel au sein du réseau QEH.", "/qeh-partner/production"],
                [Sparkles, "Être franchisé", "Développer QEH sur votre territoire avec un accompagnement dédié.", "/qeh-partner/franchise"],
              ].map(([Icon, title, detail, to]) => (
                <Link key={title} to={to} className="group flex min-h-[74px] items-center gap-3 rounded-[20px] border border-white/10 bg-white/[.055] p-3 transition hover:-translate-y-0.5 hover:border-[#f2cf79]/65 hover:bg-white/[.09]">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-[#f2cf79]/12 text-[#f2cf79]"><Icon className="h-5 w-5" /></span>
                  <span className="min-w-0">
                    <strong className="block text-xs font-black sm:text-sm">{title}</strong>
                    <span className="mt-0.5 block text-[10px] leading-snug text-white/45 sm:text-[11px]">{detail}</span>
                  </span>
                  <ArrowRight className="ml-auto h-4 w-4 shrink-0 text-white/30 transition group-hover:text-[#f2cf79]" />
                </Link>
              ))}
            </div>

            <Link to={isProfessional ? "/qeh-partner/materiel-pro" : "/qeh-partner"} className="mt-5 inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#f2cf79] px-5 text-sm font-black text-[#151108] shadow-[0_16px_44px_rgba(242,207,121,.18)] transition hover:brightness-110">
              {isProfessional ? "Accéder au matériel Pro" : "Entrer dans QEH PARTNER"} <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </motion.section>
      </div>
    </main>
  );
}
