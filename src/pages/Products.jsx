import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Link,
  useSearchParams,
} from "react-router-dom";

import {
  AlertCircle,
  Filter,
  LoaderCircle,
  PackageSearch,
  X,
} from "lucide-react";

import { supabase } from "../lib/supabase";
import { priceLabel } from "../lib/api";

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
      url: "/images/product-placeholder.png",
      alt: productName,
    };
  }

  const sortedImages = [...images].sort(
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
          firstImage.display_order || 0
        ) -
        Number(
          secondImage.display_order || 0
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
      label: "Disponible",
      className: "text-primary",
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
    label: "Indisponible",
    className:
      "text-destructive",
  };
}

export default function Products() {
  const [
    searchParams,
    setSearchParams,
  ] = useSearchParams();

  const selectedCategorySlug =
    searchParams.get("categorie") ||
    "";

  const [
    products,
    setProducts,
  ] = useState([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    errorMessage,
    setErrorMessage,
  ] = useState("");

  const [
    sortMode,
    setSortMode,
  ] = useState("relevance");

  const [
    selectedBrand,
    setSelectedBrand,
  ] = useState("");

  const [
    selectedCondition,
    setSelectedCondition,
  ] = useState("");

  useEffect(() => {
    document.title =
      "Produits | EcoConfortHabitat.fr";

    let componentIsMounted =
      true;

    const loadProducts =
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
              reference,
              price,
              stock,
              product_condition,
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
            .eq(
              "is_active",
              true
            )
            .order(
              "created_at",
              {
                ascending: false,
              }
            );

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
                      product.price || 0
                    ),

                  category:
                    product.categories
                      ?.name || "",

                  categorySlug:
                    product.categories
                      ?.slug || "",

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

          setProducts(
            normalizedProducts
          );
        } catch (error) {
          console.error(
            "Erreur lors du chargement des produits :",
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

    loadProducts();

    return () => {
      componentIsMounted =
        false;
    };
  }, []);

  const availableBrands =
    useMemo(() => {
      return [
        ...new Set(
          products
            .map(
              (product) =>
                product.brand
            )
            .filter(Boolean)
        ),
      ].sort((firstBrand, secondBrand) =>
        firstBrand.localeCompare(
          secondBrand,
          "fr",
          {
            sensitivity: "base",
          }
        )
      );
    }, [products]);

  const visibleProducts =
    useMemo(() => {
      let filteredProducts = [
        ...products,
      ];

      if (
        selectedCategorySlug
      ) {
        filteredProducts =
          filteredProducts.filter(
            (product) =>
              product.categorySlug ===
              selectedCategorySlug
          );
      }

      if (selectedBrand) {
        filteredProducts =
          filteredProducts.filter(
            (product) =>
              product.brand ===
              selectedBrand
          );
      }

      if (
        selectedCondition
      ) {
        filteredProducts =
          filteredProducts.filter(
            (product) =>
              product.product_condition ===
              selectedCondition
          );
      }

      if (
        sortMode === "price-asc"
      ) {
        filteredProducts.sort(
          (
            firstProduct,
            secondProduct
          ) =>
            firstProduct.price -
            secondProduct.price
        );
      }

      if (
        sortMode === "price-desc"
      ) {
        filteredProducts.sort(
          (
            firstProduct,
            secondProduct
          ) =>
            secondProduct.price -
            firstProduct.price
        );
      }

      if (
        sortMode === "brand"
      ) {
        filteredProducts.sort(
          (
            firstProduct,
            secondProduct
          ) =>
            String(
              firstProduct.brand || ""
            ).localeCompare(
              String(
                secondProduct.brand || ""
              ),
              "fr",
              {
                sensitivity:
                  "base",
              }
            )
        );
      }

      if (
        sortMode === "condition"
      ) {
        filteredProducts.sort(
          (
            firstProduct,
            secondProduct
          ) =>
            String(
              firstProduct.conditionLabel ||
                ""
            ).localeCompare(
              String(
                secondProduct.conditionLabel ||
                  ""
              ),
              "fr",
              {
                sensitivity:
                  "base",
              }
            )
        );
      }

      if (
        sortMode === "used"
      ) {
        filteredProducts =
          filteredProducts.filter(
            (product) =>
              product.product_condition ===
              "used"
          );
      }

      return filteredProducts;
    }, [
      products,
      selectedCategorySlug,
      selectedBrand,
      selectedCondition,
      sortMode,
    ]);

  const selectedCategoryName =
    useMemo(() => {
      if (
        !selectedCategorySlug
      ) {
        return "";
      }

      const selectedProduct =
        products.find(
          (product) =>
            product.categorySlug ===
            selectedCategorySlug
        );

      return (
        selectedProduct?.category ||
        selectedCategorySlug
      );
    }, [
      products,
      selectedCategorySlug,
    ]);

  const hasActiveFilters =
    Boolean(
      selectedCategorySlug ||
        selectedBrand ||
        selectedCondition ||
        sortMode !==
          "relevance"
    );

  const clearAllFilters = () => {
    setSearchParams({});
    setSelectedBrand("");
    setSelectedCondition("");
    setSortMode("relevance");
  };

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
            onClick={() =>
              window.location.reload()
            }
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
<section className="relative overflow-hidden rounded-[32px] mb-10">

  <div className="absolute inset-0 bg-gradient-to-r from-[#041426] via-[#08233d] to-[#0b5ca8]" />

  <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-[#ff6b00]/20 blur-3xl" />

  <div className="absolute -bottom-20 -left-16 w-72 h-72 rounded-full bg-[#ffffff]/5 blur-3xl" />

  <div className="relative px-8 py-10 lg:px-12 lg:py-14 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">

    <div>

      <p className="uppercase tracking-[0.30em] text-[#ff8a3d] text-xs font-black mb-4">
        QEH OUTLET
      </p>

      <h1 className="font-display font-black text-white text-4xl lg:text-6xl leading-none">

        {selectedCategoryName
          ? selectedCategoryName
          : "Catalogue"}

      </h1>

      <p className="text-blue-100 mt-5 max-w-2xl text-lg">

        Découvrez notre sélection de matériels neufs,
        déstockés et d'occasion destinés aux
        professionnels et aux particuliers.

      </p>

    </div>

    <div className="flex flex-col items-start lg:items-end gap-4">


      {hasActiveFilters && (

        <button
          type="button"
          onClick={clearAllFilters}
          className="inline-flex items-center gap-2 px-6 h-12 rounded-full bg-[#ff6b00] hover:bg-[#ff7f23] text-white font-bold transition-all"
        >

          <X className="w-4 h-4" />

          Réinitialiser les filtres

        </button>

      )}

    </div>

  </div>

</section><section className="mb-12 rounded-[30px] border border-slate-200 bg-white shadow-sm overflow-hidden">

  <div className="bg-gradient-to-r from-[#0d2237] to-[#135ea8] px-8 py-6">

    <div className="flex items-center gap-4">

      <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-lg grid place-items-center">

        <Filter className="w-7 h-7 text-white" />

      </div>

      <div>

        <h2 className="font-display font-black text-2xl text-white">
          Recherche avancée
        </h2>

        <p className="text-blue-100 mt-1">
          Affinez rapidement votre sélection.
        </p>

      </div>

    </div>

  </div>

  <div className="grid lg:grid-cols-3 gap-8 p-8">

    <div>

      <label className="block mb-2 font-bold text-slate-700">
        Trier les produits
      </label>

      <select
        value={sortMode}
        onChange={(e)=>setSortMode(e.target.value)}
        className="w-full h-12 rounded-xl border border-slate-300 bg-white px-4 font-medium"
      >

        <option value="relevance">
          Pertinence
        </option>

        <option value="price-asc">
          Prix croissant
        </option>

        <option value="price-desc">
          Prix décroissant
        </option>

        <option value="brand">
          Marque
        </option>

        <option value="condition">
          Etat
        </option>

        <option value="used">
          Occasion uniquement
        </option>

      </select>

    </div>

    <div>

      <label className="block mb-2 font-bold text-slate-700">
        Marque
      </label>

      <select
        value={selectedBrand}
        onChange={(e)=>setSelectedBrand(e.target.value)}
        className="w-full h-12 rounded-xl border border-slate-300 bg-white px-4 font-medium"
      >

        <option value="">
          Toutes les marques
        </option>

        {availableBrands.map((brand)=>(

          <option
            key={brand}
            value={brand}
          >
            {brand}
          </option>

        ))}

      </select>

    </div>

    <div>

      <label className="block mb-2 font-bold text-slate-700">
        Etat du produit
      </label>

      <select
        value={selectedCondition}
        onChange={(e)=>setSelectedCondition(e.target.value)}
        className="w-full h-12 rounded-xl border border-slate-300 bg-white px-4 font-medium"
      >

        <option value="">
          Tous les états
        </option>

        <option value="new_packaged">
          Neuf avec emballage
        </option>

        <option value="good_opened">
          Bon état déballé
        </option>

        <option value="used">
          Occasion
        </option>

        <option value="for_parts">
          Pour pièces
        </option>

      </select>

    </div>

  </div>

</section>

      {visibleProducts.length ===
      0 ? (
        <div className="rounded-3xl border border-border bg-card px-6 py-16 text-center">
          <PackageSearch className="w-12 h-12 mx-auto text-muted-foreground mb-5" />

          <h2 className="font-display font-bold text-2xl">
            Aucun produit trouvé
          </h2>

          <p className="text-muted-foreground mt-3">
            Aucun produit ne correspond aux filtres sélectionnés.
          </p>

          <button
            type="button"
            onClick={
              clearAllFilters
            }
            className="inline-flex items-center justify-center h-11 px-6 mt-6 rounded-full bg-primary text-primary-foreground font-semibold"
          >
            Réinitialiser les filtres
          </button>
        </div>
      ) : (
        <div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          data-testid="product-grid"
        >
          {visibleProducts.map(
            (
              product,
              index
            ) => (
              <Link
                key={product.id}
                to={`/produits/${product.slug}`}
                data-testid={`product-card-${product.slug}`}
                className="group flex flex-col rounded-2xl border border-border bg-card overflow-hidden hover:-translate-y-1 transition-transform duration-200 hover:shadow-lg"
                style={{
                  animationDelay:
                    `${index * 60}ms`,
                }}
              >
                <div className="relative aspect-square overflow-hidden bg-white grid place-items-center p-6">
                  <img
                    src={product.image}
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
                    className={`absolute top-4 left-4 inline-flex items-center min-h-8 px-3 rounded-full border text-xs font-bold ${product.conditionClassName}`}
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

                  <h2 className="font-display font-semibold text-base leading-snug">
                    {product.name}
                  </h2>

                  {product.brand && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {product.brand}
                    </p>
                  )}

                  {product.reference && (
                    <p className="text-xs text-muted-foreground mt-2">
                      Réf.{" "}
                      {
                        product.reference
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
    </div>
  );
}