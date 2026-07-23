import React, {
  useEffect,
  useState,
} from "react";

import {
  Link,
} from "react-router-dom";

import {
  AlertCircle,
  ArrowRight,
  ArrowUpRight,
  LoaderCircle,
} from "lucide-react";

import {
  supabase,
} from "../lib/supabase";

import {
  priceLabel,
} from "../lib/api";

const PRODUCT_CONDITIONS = {
  new_packaged: {
    label: "Neuf avec emballage",
    className:
      "border-emerald-200 bg-emerald-50 text-emerald-700",
  },

  good_opened: {
    label: "Bon état déballé",
    className:
      "border-yellow-200 bg-yellow-50 text-yellow-700",
  },

  used: {
    label: "Occasion",
    className:
      "border-orange-200 bg-orange-50 text-orange-700",
  },

  for_parts: {
    label: "Pour pièces",
    className:
      "border-red-200 bg-red-50 text-red-700",
  },
};

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
        "text-primary",
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
      "text-destructive",
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
      "Accueil | EcoConfortHabitat.fr";

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
            .limit(3);

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
                    Number(
                      product.price ||
                        0
                    ),

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
    <div data-testid="home-page">
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 pt-16 pb-12 lg:pt-24 lg:pb-16">
          <div className="max-w-2xl">
            <h1 className="font-display font-black text-4xl sm:text-5xl lg:text-6xl tracking-tight leading-[1.05]">
              L&apos;énergie durable,
              <br />
              au juste prix.
            </h1>

            <p className="mt-6 text-base sm:text-lg text-muted-foreground max-w-md leading-relaxed">
              Panneaux solaires,
              climatiseurs, chauffe-eau,
              pompes à chaleur et
              solutions de stockage.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/produits"
                className="inline-flex items-center gap-2 h-12 px-7 rounded-full bg-primary text-primary-foreground font-semibold hover:bg-primary/90"
              >
                Voir les produits

                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                to="/contact"
                className="inline-flex items-center gap-2 h-12 px-7 rounded-full border border-border font-semibold hover:bg-secondary"
              >
                Nous contacter
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-5 sm:px-8 py-12">
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="overline text-primary mb-2">
              Catalogue
            </p>

            <h2 className="font-display font-bold text-3xl sm:text-4xl tracking-tight">
              Nos produits en vedette
            </h2>
          </div>

          <Link
            to="/produits"
            className="hidden sm:inline-flex items-center gap-1 text-sm font-semibold hover:text-primary"
          >
            Tout voir

            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>

        {loading && (
          <div className="rounded-3xl border border-border bg-card px-6 py-14 text-center">
            <LoaderCircle className="w-10 h-10 animate-spin text-primary mx-auto mb-4" />

            <h3 className="font-display font-bold text-xl">
              Chargement des produits
            </h3>
          </div>
        )}

        {!loading &&
          errorMessage && (
            <div className="rounded-3xl border border-destructive/30 bg-card px-6 py-14 text-center">
              <AlertCircle className="w-10 h-10 text-destructive mx-auto mb-4" />

              <h3 className="font-display font-bold text-xl">
                Impossible de charger les produits
              </h3>

              <p className="text-muted-foreground mt-2">
                {errorMessage}
              </p>
            </div>
          )}

        {!loading &&
          !errorMessage &&
          featuredProducts.length ===
            0 && (
            <div className="rounded-3xl border border-border bg-card px-6 py-14 text-center">
              <h3 className="font-display font-bold text-xl">
                Aucun produit vedette
              </h3>

              <p className="text-muted-foreground mt-2">
                Active l’option « Produit
                vedette » dans
                l’administration.
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
                    key={product.id}
                    to={`/produits/${product.slug}`}
                    className="group flex flex-col rounded-2xl border border-border bg-card overflow-hidden hover:-translate-y-1 transition-transform duration-200 hover:shadow-lg"
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

                    <div className="flex flex-col flex-1 p-5 border-t border-border">
                      {product.category && (
                        <p className="text-xs font-semibold uppercase tracking-wide text-primary mb-2">
                          {
                            product.category
                          }
                        </p>
                      )}

                      <h3 className="font-display font-semibold text-base leading-snug">
                        {product.name}
                      </h3>

                      {product.brand && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {
                            product.brand
                          }
                        </p>
                      )}

                      <div className="mt-auto pt-4">
                        <p className="font-display font-bold text-lg">
                          {priceLabel(
                            product
                          )}
                        </p>

                        <p
                          className={`text-xs font-semibold mt-1 ${product.availabilityClassName}`}
                        >
                          {
                            product.availabilityLabel
                          }
                        </p>
                      </div>
                    </div>
                  </Link>
                )
              )}
            </div>
          )}

        <Link
          to="/produits"
          className="sm:hidden mt-7 inline-flex items-center gap-2 h-11 px-6 rounded-full border border-border font-semibold hover:bg-secondary"
        >
          Voir tout le catalogue

          <ArrowUpRight className="w-4 h-4" />
        </Link>
      </section>
    </div>
  );
}