import React, {
  useEffect,
  useState,
} from "react";

import {
  motion,
} from "framer-motion";

import {
  Link,
} from "react-router-dom";

import {
  AlertCircle,
  ArrowRight,
  ArrowUpRight,
  BadgeEuro,
  LoaderCircle,
  MapPin,
  PackageCheck,
  ShieldCheck,
  Sun,
  Zap,
} from "lucide-react";

import {
  supabase,
} from "../lib/supabase";

import {
  priceLabel,
} from "../lib/api";

const PRODUCT_CONDITIONS = {
  new_packaged: {
    label:
      "Neuf avec emballage",

    className:
      "border-emerald-200 bg-emerald-50 text-emerald-700",
  },

  good_opened: {
    label:
      "Bon état déballé",

    className:
      "border-yellow-200 bg-yellow-50 text-yellow-700",
  },

  used: {
    label:
      "Occasion",

    className:
      "border-orange-200 bg-orange-50 text-orange-700",
  },

  for_parts: {
    label:
      "Pour pièces",

    className:
      "border-red-200 bg-red-50 text-red-700",
  },
};

const advantages = [
  {
    icon:
      PackageCheck,

    title:
      "Produits contrôlés",

    description:
      "Chaque article est identifié et présenté avec son état réel.",
  },

  {
    icon:
      BadgeEuro,

    title:
      "Prix bas",

    description:
      "Des équipements professionnels proposés à prix outlet.",
  },

  {
    icon:
      ShieldCheck,

    title:
      "Achat sécurisé",

    description:
      "Paiement sécurisé et suivi de commande directement en ligne.",
  },
];

function getPrimaryImage(
  images,
  productName
) {
  if (
    !Array.isArray(images) ||
    images.length === 0
  ) {
    return {
      url:
        "/images/product-placeholder.png",

      alt:
        productName,
    };
  }

  const sortedImages = [
    ...images,
  ].sort(
    (
      firstImage,
      secondImage
    ) => {
      if (
        firstImage.is_primary &&
        !secondImage.is_primary
      ) {
        return -1;
      }

      if (
        !firstImage.is_primary &&
        secondImage.is_primary
      ) {
        return 1;
      }

      return (
        Number(
          firstImage.display_order ||
            0
        ) -
        Number(
          secondImage.display_order ||
            0
        )
      );
    }
  );

  const primaryImage =
    sortedImages[0];

  return {
    url:
      primaryImage?.image_url ||
      "/images/product-placeholder.png",

    alt:
      primaryImage?.alt_text ||
      productName,
  };
}

function getAvailability(
  stock,
  onDemand
) {
  const numericStock =
    Number(stock || 0);

  if (numericStock > 0) {
    return {
      label:
        "Disponible",

      className:
        "text-emerald-600",
    };
  }

  if (onDemand) {
    return {
      label:
        "Disponible sur demande",

      className:
        "text-amber-600",
    };
  }

  return {
    label:
      "Indisponible",

    className:
      "text-red-600",
  };
}

export default function Home() {
  const [
    featuredProducts,
    setFeaturedProducts,
  ] = useState([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    errorMessage,
    setErrorMessage,
  ] = useState("");

  useEffect(() => {
    document.title =
      "QEH OUTLET | Déstockage, prix bas et qualité";

    let componentIsMounted =
      true;

    const loadFeaturedProducts =
      async () => {
        setLoading(true);
        setErrorMessage("");

        try {
          const {
            data,
            error,
          } = await supabase
            .from("products")
            .select(`
              id,
              name,
              slug,
              brand,
              price,
sale_price,
sale_start,
sale_end,
is_on_sale,
stock,
              product_condition,
              on_demand,
              is_featured,
              created_at,
              categories (
                id,
                name,
                slug
              ),
              product_images (
                id,
                image_url,
                alt_text,
                is_primary,
                display_order
              )
            `)
            .eq(
              "is_active",
              true
            )
            .eq(
              "is_featured",
              true
            )
            .order(
              "created_at",
              {
                ascending:
                  false,
              }
            )
            .limit(6);

          if (error) {
            throw error;
          }

          const normalizedProducts =
            (data || []).map(
              (product) => {
                const primaryImage =
                  getPrimaryImage(
                    product.product_images,
                    product.name
                  );

                const availability =
                  getAvailability(
                    product.stock,
                    product.on_demand
                  );

                const condition =
                  PRODUCT_CONDITIONS[
                    product.product_condition
                  ] ||
                  PRODUCT_CONDITIONS.new_packaged;

                return {
                  ...product,

                  price:
  Number(product.price || 0),

sale_price:
  product.sale_price === null
    ? null
    : Number(product.sale_price),

sale_start:
  product.sale_start,

sale_end:
  product.sale_end,

is_on_sale:
  Boolean(product.is_on_sale),

                  category:
                    product.categories
                      ?.name || "",

                  image:
                    primaryImage.url,

                  imageAlt:
                    primaryImage.alt,

                  availabilityLabel:
                    availability.label,

                  availabilityClassName:
                    availability.className,

                  conditionLabel:
                    condition.label,

                  conditionClassName:
                    condition.className,
                };
              }
            );

          if (
            !componentIsMounted
          ) {
            return;
          }

          setFeaturedProducts(
            normalizedProducts
          );
        } catch (error) {
          console.error(
            "Erreur lors du chargement des produits vedettes :",
            error
          );

          if (
            !componentIsMounted
          ) {
            return;
          }

          setErrorMessage(
            error?.message ||
              "Impossible de charger les produits."
          );
        } finally {
          if (
            componentIsMounted
          ) {
            setLoading(false);
          }
        }
      };

    loadFeaturedProducts();

    return () => {
      componentIsMounted =
        false;
    };
  }, []);

  return (
    <div
      data-testid="home-page"
      className="bg-white"
    >
      <section className="relative overflow-hidden bg-[#020714]">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-44 -left-44 w-[430px] h-[430px] rounded-full bg-[#0b5ca8]/20 blur-3xl" />

          <div className="absolute -bottom-52 -right-40 w-[480px] h-[480px] rounded-full bg-[#ff5a00]/15 blur-3xl" />

          <div className="absolute inset-0 bg-[linear-gradient(rgba(11,92,168,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(11,92,168,0.08)_1px,transparent_1px)] bg-[size:48px_48px]" />
        </div>

        <div className="relative max-w-7xl mx-auto px-5 sm:px-8 py-16 sm:py-20 lg:py-24">
          <div className="max-w-5xl mx-auto text-center">
            <div className="inline-flex max-w-full rounded-3xl border border-[#0b5ca8]/60 bg-[#010611]/80 p-3 sm:p-5 shadow-[0_30px_100px_rgba(0,0,0,0.48)]">
              <img
                src="/images/qeh-outlet-logo.jpg"
                alt="QEH OUTLET — Déstockage, prix bas, qualité"
                className="w-full max-w-[900px] h-auto object-contain"
              />
            </div>

            <div className="mt-9 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                to="/produits"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 min-h-12 px-8 rounded-full bg-[#ff5a00] text-white font-bold shadow-[0_12px_35px_rgba(255,90,0,0.25)] hover:bg-[#e95000] transition-colors"
              >
                Découvrir les produits

                <ArrowRight className="w-5 h-5" />
              </Link>

              <Link
                to="/contact"
                className="w-full sm:w-auto inline-flex items-center justify-center min-h-12 px-8 rounded-full border border-white/25 bg-white/5 text-white font-semibold hover:border-[#0b5ca8] hover:bg-[#0b5ca8]/20 transition-colors"
              >
                Nous contacter
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="relative z-10 max-w-7xl mx-auto px-5 sm:px-8 -mt-2 sm:-mt-7">
        <motion.div
          initial={{
            opacity: 0,
            y: 24,
          }}
          whileInView={{
            opacity: 1,
            y: 0,
          }}
          viewport={{
            once: true,
            amount: 0.25,
          }}
          transition={{
            duration: 0.55,
          }}
        >
          <Link
            to="/qeh-energies"
            aria-label="Découvrir QEH énergies"
            className="group relative block overflow-hidden rounded-[2rem] border border-[#135f9d]/70 bg-[#020711] p-5 sm:p-7 lg:p-9 shadow-[0_24px_80px_rgba(2,7,20,0.32)]"
          >
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute -left-24 -top-28 h-72 w-72 rounded-full bg-[#135f9d]/30 blur-3xl" />
              <div className="absolute -bottom-32 right-0 h-72 w-72 rounded-full bg-[#63ae2b]/20 blur-3xl" />
              <div className="absolute inset-0 bg-[linear-gradient(115deg,transparent_20%,rgba(255,255,255,0.08)_45%,transparent_70%)] bg-[length:220%_100%] transition-[background-position] duration-1000 group-hover:bg-[position:100%_0]" />
            </div>

            <div className="relative grid items-center gap-7 lg:grid-cols-[280px_1fr_auto]">
              <div className="rounded-2xl border border-[#135f9d]/55 bg-black/35 p-3">
                <img
                  src="/images/qeh-energies-logo.png"
                  alt="QEH énergies"
                  className="h-auto w-full object-contain"
                />
              </div>

              <div>
                <div className="mb-3 flex flex-wrap items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-[#79c53a]">
                  <Sun className="h-4 w-4" />
                  Énergie solaire locale
                </div>

                <h2 className="max-w-3xl font-display text-2xl font-black leading-tight text-white sm:text-3xl lg:text-4xl">
                  Je veux payer mon électricité{" "}
                  <motion.span
                    className="relative inline-block text-[#79c53a]"
                    animate={{
                      opacity: [1, 0.68, 1],
                      textShadow: [
                        "0 0 0 rgba(121,197,58,0)",
                        "0 0 22px rgba(121,197,58,0.75)",
                        "0 0 0 rgba(121,197,58,0)",
                      ],
                    }}
                    transition={{
                      duration: 2.4,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  >
                    moins chère.
                  </motion.span>
                </h2>

                <p className="mt-3 max-w-3xl text-sm leading-relaxed text-slate-300 sm:text-base">
                  Localisez les producteurs solaires proches de chez vous et découvrez une solution d’énergie locale dans un rayon de 2 km.
                </p>

                <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs font-semibold text-slate-300 sm:text-sm">
                  <span className="inline-flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-[#79c53a]" />
                    Recherche locale
                  </span>

                  <span className="inline-flex items-center gap-2">
                    <Zap className="h-4 w-4 text-[#79c53a]" />
                    Circuit court de l’énergie
                  </span>
                </div>
              </div>

              <span className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#79c53a] px-6 font-black text-[#020711] transition-transform group-hover:scale-[1.03]">
                Découvrir
                <ArrowRight className="h-5 w-5" />
              </span>
            </div>
          </Link>
        </motion.div>
      </section>

      <section className="relative z-10 max-w-7xl mx-auto px-5 sm:px-8 mt-6 sm:mt-8">
        <div className="grid md:grid-cols-3 gap-4 rounded-3xl border border-slate-200 bg-white p-4 sm:p-6 shadow-[0_20px_65px_rgba(2,7,20,0.12)]">
          {advantages.map(
            (advantage) => {
              const Icon =
                advantage.icon;

              return (
                <article
                  key={
                    advantage.title
                  }
                  className="flex items-start gap-4 rounded-2xl p-4 sm:p-5 hover:bg-slate-50 transition-colors"
                >
                  <div className="w-12 h-12 shrink-0 rounded-2xl bg-[#0b5ca8]/10 text-[#0b5ca8] grid place-items-center">
                    <Icon className="w-6 h-6" />
                  </div>

                  <div>
                    <h2 className="font-display font-bold text-base text-slate-950">
                      {
                        advantage.title
                      }
                    </h2>

                    <p className="text-sm text-slate-500 leading-relaxed mt-1">
                      {
                        advantage.description
                      }
                    </p>
                  </div>
                </article>
              );
            }
          )}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-5 sm:px-8 py-16 sm:py-20">
        <div className="flex items-end justify-between gap-5 mb-9">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-[#ff5a00] mb-3">
              Sélection QEH OUTLET
            </p>

            <h2 className="font-display font-black text-3xl sm:text-4xl tracking-tight text-slate-950">
              Nos produits en vedette
            </h2>
          </div>

          <Link
            to="/produits"
            className="hidden sm:inline-flex items-center gap-2 text-sm font-bold text-[#0b5ca8] hover:text-[#ff5a00] transition-colors"
          >
            Tout le catalogue

            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>

        {loading && (
          <div className="rounded-3xl border border-slate-200 bg-white px-6 py-16 text-center">
            <LoaderCircle className="w-10 h-10 animate-spin text-[#0b5ca8] mx-auto mb-4" />

            <h3 className="font-display font-bold text-xl text-slate-950">
              Chargement des produits
            </h3>
          </div>
        )}

        {!loading &&
          errorMessage && (
            <div className="rounded-3xl border border-red-200 bg-white px-6 py-16 text-center">
              <AlertCircle className="w-10 h-10 text-red-600 mx-auto mb-4" />

              <h3 className="font-display font-bold text-xl text-slate-950">
                Impossible de charger les produits
              </h3>

              <p className="text-slate-500 mt-2">
                {errorMessage}
              </p>
            </div>
          )}

        {!loading &&
          !errorMessage &&
          featuredProducts.length ===
            0 && (
            <div className="rounded-3xl border border-slate-200 bg-white px-6 py-16 text-center">
              <h3 className="font-display font-bold text-xl text-slate-950">
                Aucun produit vedette
              </h3>

              <p className="text-slate-500 mt-2">
                Active l’option « Produit vedette » dans l’administration.
              </p>
            </div>
          )}

        {!loading &&
          !errorMessage &&
          featuredProducts.length >
            0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredProducts.map(
                (
                  product,
                  index
                ) => (
                  <Link
                    key={
                      product.id
                    }
                    to={`/produits/${product.slug}`}
                    className="group flex flex-col rounded-3xl border border-slate-200 bg-white overflow-hidden hover:-translate-y-1.5 hover:border-[#0b5ca8]/50 hover:shadow-[0_22px_55px_rgba(2,7,20,0.13)] transition-all duration-300"
                    style={{
                      animationDelay:
                        `${index * 60}ms`,
                    }}
                  >
                    <div className="relative aspect-square overflow-hidden bg-white grid place-items-center p-6">
                      <img
                        src={
                          product.image
                        }
                        alt={
                          product.imageAlt
                        }
                        className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                        onError={(
                          event
                        ) => {
                          event.currentTarget.onerror =
                            null;

                          event.currentTarget.src =
                            "/images/product-placeholder.png";
                        }}
                      />

                      <span
                        className={`absolute top-4 left-4 z-10 inline-flex items-center min-h-8 px-3 rounded-full border text-xs font-bold shadow-sm ${product.conditionClassName}`}
                      >
                        {
                          product.conditionLabel
                        }
                      </span>
                    </div>

                    <div className="flex flex-col flex-1 p-5 sm:p-6 border-t border-slate-100">
                      {product.category && (
                        <p className="text-xs font-black uppercase tracking-[0.12em] text-[#0b5ca8] mb-2">
                          {
                            product.category
                          }
                        </p>
                      )}

                      <h3 className="font-display font-bold text-base leading-snug text-slate-950 group-hover:text-[#0b5ca8] transition-colors">
                        {product.name}
                      </h3>

                      {product.brand && (
                        <p className="text-sm text-slate-500 mt-1">
                          {
                            product.brand
                          }
                        </p>
                      )}

                      <div className="mt-auto pt-5 flex items-end justify-between gap-4">
                        <div>
                          {product.is_on_sale &&
product.sale_price ? (

  <div>

    <p className="text-sm text-slate-400 line-through">

      {Number(product.price).toFixed(2)} €

    </p>

    <p className="font-display font-black text-2xl text-[#ff5a00]">

      {Number(product.sale_price).toFixed(2)} €

    </p>

  </div>

) : (

  <p className="font-display font-black text-xl text-slate-950">

    {priceLabel(product)}

  </p>

)}

                          <p
                            className={`text-xs font-bold mt-1 ${product.availabilityClassName}`}
                          >
                            {
                              product.availabilityLabel
                            }
                          </p>
                        </div>

                        <span className="w-10 h-10 rounded-full bg-[#020714] text-white grid place-items-center group-hover:bg-[#ff5a00] transition-colors">
                          <ArrowRight className="w-4 h-4" />
                        </span>
                      </div>
                    </div>
                  </Link>
                )
              )}
            </div>
          )}

        <Link
          to="/produits"
          className="sm:hidden mt-8 inline-flex items-center justify-center gap-2 min-h-12 w-full rounded-full bg-[#020714] text-white font-bold"
        >
          Voir tout le catalogue

          <ArrowUpRight className="w-4 h-4" />
        </Link>
      </section>
    </div>
  );
}