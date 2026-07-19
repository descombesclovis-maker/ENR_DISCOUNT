import React, {
  useEffect,
  useState,
} from "react";

import { Link } from "react-router-dom";

import {
  AlertCircle,
  LoaderCircle,
  PackageSearch,
} from "lucide-react";

import { supabase } from "../lib/supabase";
import { priceLabel } from "../lib/api";

function getPrimaryImage(images, productName) {
  if (!Array.isArray(images) || images.length === 0) {
    return {
      url: "/images/product-placeholder.png",
      alt: productName,
    };
  }

  const sortedImages = [...images].sort(
    (firstImage, secondImage) => {
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
        (firstImage.display_order || 0) -
        (secondImage.display_order || 0)
      );
    }
  );

  const primaryImage = sortedImages[0];

  return {
    url:
      primaryImage?.image_url ||
      "/images/product-placeholder.png",

    alt:
      primaryImage?.alt_text ||
      productName,
  };
}

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] =
    useState("");

  useEffect(() => {
    let componentIsMounted = true;

    const loadProducts = async () => {
      setLoading(true);
      setErrorMessage("");

      try {
        const { data, error } = await supabase
          .from("products")
          .select(`
            id,
            name,
            slug,
            brand,
            reference,
            price,
            stock,
            on_demand,
            is_active,
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
          .eq("is_active", true)
          .order("created_at", {
            ascending: false,
          });

        if (error) {
          throw error;
        }

        const normalizedProducts = (data || []).map(
          (product) => {
            const primaryImage = getPrimaryImage(
              product.product_images,
              product.name
            );

            return {
              ...product,

              category:
                product.categories?.name || "",

              image: primaryImage.url,
              imageAlt: primaryImage.alt,
            };
          }
        );

        if (!componentIsMounted) {
          return;
        }

        setProducts(normalizedProducts);
      } catch (error) {
        console.error(
          "Erreur lors du chargement des produits :",
          error
        );

        if (!componentIsMounted) {
          return;
        }

        setErrorMessage(
          error?.message ||
            "Impossible de charger les produits."
        );
      } finally {
        if (componentIsMounted) {
          setLoading(false);
        }
      }
    };

    loadProducts();

    return () => {
      componentIsMounted = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-5 sm:px-8 py-24">
        <div className="flex flex-col items-center text-center">
          <LoaderCircle className="w-10 h-10 animate-spin text-primary mb-4" />

          <h1 className="font-display font-bold text-2xl">
            Chargement des produits
          </h1>
        </div>
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className="max-w-3xl mx-auto px-5 sm:px-8 py-24">
        <div className="rounded-3xl border border-destructive/30 bg-card p-8 text-center">
          <AlertCircle className="w-10 h-10 mx-auto text-destructive mb-4" />

          <h1 className="font-display font-bold text-2xl">
            Impossible de charger le catalogue
          </h1>

          <p className="text-muted-foreground mt-3">
            {errorMessage}
          </p>

          <button
            type="button"
            onClick={() => window.location.reload()}
            className="inline-flex items-center justify-center h-11 px-6 mt-6 rounded-full bg-primary text-primary-foreground font-semibold"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      data-testid="products-page"
      className="max-w-7xl mx-auto px-5 sm:px-8 py-12"
    >
      <p className="overline text-primary mb-2">
        Catalogue
      </p>

      <h1 className="font-display font-black text-4xl sm:text-5xl tracking-tight mb-12">
        Nos produits
      </h1>

      {products.length === 0 ? (
        <div className="rounded-3xl border border-border bg-card px-6 py-16 text-center">
          <PackageSearch className="w-12 h-12 mx-auto text-muted-foreground mb-5" />

          <h2 className="font-display font-bold text-2xl">
            Aucun produit disponible
          </h2>
        </div>
      ) : (
        <div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          data-testid="product-grid"
        >
          {products.map((product, index) => (
            <Link
              key={product.id}
              to={`/produits/${product.slug}`}
              data-testid={`product-card-${product.slug}`}
              className="group flex flex-col rounded-2xl border border-border bg-card overflow-hidden hover:-translate-y-1 transition-transform duration-200 hover:shadow-lg"
              style={{
                animationDelay: `${index * 60}ms`,
              }}
            >
              <div className="aspect-square overflow-hidden bg-white grid place-items-center p-6">
                <img
                  src={product.image}
                  alt={product.imageAlt}
                  className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                  onError={(event) => {
                    event.currentTarget.onerror = null;
                    event.currentTarget.src =
                      "/images/product-placeholder.png";
                  }}
                />
              </div>

              <div className="flex flex-col flex-1 p-5 border-t border-border">
                {product.category && (
                  <p className="text-xs font-semibold uppercase tracking-wide text-primary mb-2">
                    {product.category}
                  </p>
                )}

                <h2 className="font-display font-semibold text-base leading-snug">
                  {product.name}
                </h2>

                {product.brand && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {product.brand}
                  </p>
                )}

                <div className="mt-auto pt-4">
                  <p className="font-display font-bold text-lg">
                    {priceLabel(product)}
                  </p>

                  <p
                    className={`text-xs font-semibold mt-1 ${
                      product.stock > 0
                        ? "text-primary"
                        : "text-amber-600"
                    }`}
                  >
                    {product.stock > 0
                      ? `${product.stock} en stock`
                      : product.on_demand
                        ? "Disponible sur demande"
                        : "Indisponible"}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}