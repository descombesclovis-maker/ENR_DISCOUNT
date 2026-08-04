import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  CreditCard,
  Heart,
  LoaderCircle,
  Minus,
  PackageCheck,
  Plus,
  ShieldCheck,
  ShoppingBag,
  Truck,
} from "lucide-react";

import { toast } from "sonner";

import { supabase } from "../lib/supabase";

import {
  useCart,
} from "../context/CartContext";

import {
  useWishlist,
} from "../context/WishlistContext";

import {
  priceLabel,
} from "../lib/api";

import TechnicalSpecsTable, {
  parseTechnicalSpecifications,
} from "../components/TechnicalSpecsTable";

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

function sortProductImages(
  images
) {
  if (!Array.isArray(images)) {
    return [];
  }

  return [...images].sort(
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
}

function sortProductVariants(
  variants
) {
  if (!Array.isArray(variants)) {
    return [];
  }

  return [...variants]
    .filter(
      (variant) =>
        variant.is_active
    )
    .sort(
      (
        firstVariant,
        secondVariant
      ) =>
        Number(
          firstVariant.display_order ||
            0
        ) -
        Number(
          secondVariant.display_order ||
            0
        )
    );
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

      className:
        "text-emerald-600",

      dotClassName:
        "bg-emerald-500",
    };
  }

  if (onDemand) {
    return {
      label:
        "Disponible sur demande",

      className:
        "text-amber-600",

      dotClassName:
        "bg-amber-500",
    };
  }

  return {
    label: "Indisponible",

    className:
      "text-red-600",

    dotClassName:
      "bg-red-500",
  };
}

export default function ProductDetail() {
  const { slug } =
    useParams();

  const navigate =
    useNavigate();

  const {
    addItem,
  } = useCart();

  const {
    isFavorite,
    toggleFavorite,
  } = useWishlist();

  const [
    product,
    setProduct,
  ] = useState(null);

  const [
    quantity,
    setQuantity,
  ] = useState(1);

  const [
    imageIndex,
    setImageIndex,
  ] = useState(0);

  const [
    variantIndex,
    setVariantIndex,
  ] = useState(0);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    errorMessage,
    setErrorMessage,
  ] = useState("");

  useEffect(() => {
    let componentIsMounted =
      true;

    const loadProduct =
      async () => {
        setLoading(true);
        setErrorMessage("");

        try {
          if (!slug) {
            throw new Error(
              "Le slug du produit est absent."
            );
          }

          const {
            data,
            error,
          } = await supabase
            .from("products")
            .select(`
              id,
              category_id,
              name,
              slug,
              brand,
              manufacturer,
              reference,
              sku,
              short_description,
              description,
              price,
sale_price,
sale_start,
sale_end,
is_on_sale,
stock,
              product_condition,
              on_demand,
              is_active,
              is_featured,
              specifications,
              created_at,
              categories (
                id,
                name,
                slug
              ),
              product_variants (
                id,
                name,
                sku,
                reference,
                price,
                stock,
                image_url,
                is_active,
                display_order
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
              "slug",
              slug
            )
            .eq(
              "is_active",
              true
            )
            .maybeSingle();

          if (error) {
            throw error;
          }

          if (!data) {
            throw new Error(
              "Produit introuvable."
            );
          }

          const sortedImages =
            sortProductImages(
              data.product_images
            );

          const sortedVariants =
            sortProductVariants(
              data.product_variants
            );

          const normalizedProduct =
            {
              ...data,
              price:
  Number(data.price || 0),

sale_price:
  data.sale_price === null
    ? null
    : Number(data.sale_price),

sale_start:
  data.sale_start,

sale_end:
  data.sale_end,

is_on_sale:
  Boolean(data.is_on_sale),

              category:
                data.categories
                  ?.name || "",

              images:
                sortedImages.map(
                  (image) => ({
                    id:
                      image.id,

                    url:
                      image.image_url,

                    alt:
                      image.alt_text ||
                      data.name,

                    isPrimary:
                      Boolean(
                        image.is_primary
                      ),

                    displayOrder:
                      Number(
                        image.display_order ||
                          0
                      ),
                  })
                ),

              variants:
                sortedVariants.map(
                  (variant) => ({
                    ...variant,

                    price:
                      variant.price ===
                        null ||
                      variant.price ===
                        undefined
                        ? null
                        : Number(
                            variant.price
                          ),

                    stock:
                      variant.stock ===
                        null ||
                      variant.stock ===
                        undefined
                        ? 0
                        : Number(
                            variant.stock
                          ),
                  })
                ),

              specifications:
                Array.isArray(
                  data.specifications
                )
                  ? data.specifications
                  : [],
            };

          if (
            !componentIsMounted
          ) {
            return;
          }

          setProduct(
            normalizedProduct
          );

          setImageIndex(0);
          setVariantIndex(0);
          setQuantity(1);

          document.title =
            `${normalizedProduct.name} | QEH OUTLET`;
        } catch (error) {
          console.error(
            "Erreur lors du chargement du produit :",
            error
          );

          if (
            !componentIsMounted
          ) {
            return;
          }

          setProduct(null);

          setErrorMessage(
            error?.message ||
              "Impossible de charger ce produit."
          );
        } finally {
          if (
            componentIsMounted
          ) {
            setLoading(false);
          }
        }
      };

    loadProduct();

    return () => {
      componentIsMounted =
        false;
    };
  }, [slug]);

  const selectedVariant =
    useMemo(() => {
      if (
        !product?.variants
          ?.length
      ) {
        return null;
      }

      return (
        product.variants[
          variantIndex
        ] || null
      );
    }, [
      product,
      variantIndex,
    ]);

  const normalPrice =
selectedVariant?.price ??
Number(product?.price || 0);

const displayedPrice =
product?.is_on_sale &&
product?.sale_price
  ? Number(product.sale_price)
  : Number(normalPrice);

  const displayedStock =
    selectedVariant?.stock !==
      null &&
    selectedVariant?.stock !==
      undefined
      ? Number(
          selectedVariant.stock
        )
      : Number(
          product?.stock || 0
        );

  const displayedReference =
    selectedVariant?.reference ||
    product?.reference ||
    "";

  const displayedSku =
    selectedVariant?.sku ||
    product?.sku ||
    "";

  const availability =
    useMemo(
      () =>
        getAvailability(
          displayedStock,
          product?.on_demand
        ),
      [
        displayedStock,
        product?.on_demand,
      ]
    );

  const productCondition =
    PRODUCT_CONDITIONS[
      product?.product_condition
    ] ||
    PRODUCT_CONDITIONS.new_packaged;

  const galleryImages =
    useMemo(() => {
      if (!product) {
        return [];
      }

      const productImages = [
        ...(product.images || []),
      ];

      if (
        selectedVariant?.image_url
      ) {
        const imageAlreadyExists =
          productImages.some(
            (image) =>
              image.url ===
              selectedVariant.image_url
          );

        if (!imageAlreadyExists) {
          productImages.unshift({
            id:
              `variant-${selectedVariant.id}`,

            url:
              selectedVariant.image_url,

            alt:
              `${product.name} - ${selectedVariant.name}`,

            isVariantImage:
              true,
          });
        } else {
          const selectedImageIndex =
            productImages.findIndex(
              (image) =>
                image.url ===
                selectedVariant.image_url
            );

          if (
            selectedImageIndex >
            0
          ) {
            const [
              variantImage,
            ] =
              productImages.splice(
                selectedImageIndex,
                1
              );

            productImages.unshift(
              variantImage
            );
          }
        }
      }

      return productImages;
    }, [
      product,
      selectedVariant,
    ]);

  useEffect(() => {
    setImageIndex(0);
    setQuantity(1);
  }, [variantIndex]);

  useEffect(() => {
    if (
      imageIndex >=
      galleryImages.length
    ) {
      setImageIndex(0);
    }
  }, [
    galleryImages.length,
    imageIndex,
  ]);

  const activeImage =
    galleryImages[
      imageIndex
    ]?.url ||
    "/images/product-placeholder.png";

  const activeImageAlt =
    galleryImages[
      imageIndex
    ]?.alt ||
    product?.name ||
    "Image du produit";

  const parsedDescription =
    useMemo(
      () =>
        parseTechnicalSpecifications(
          product?.description ||
            ""
        ),
      [product?.description]
    );

  const displayedProduct =
    product
      ? {
          ...product,

          price:
            displayedPrice,

          stock:
            displayedStock,
        }
      : null;

  const productIsFavorite =
    product
      ? isFavorite(
          product.id
        )
      : false;

  const decreaseQuantity =
    () => {
      setQuantity(
        (
          currentQuantity
        ) =>
          Math.max(
            1,
            currentQuantity - 1
          )
      );
    };

  const increaseQuantity =
    () => {
      setQuantity(
        (
          currentQuantity
        ) => {
          if (
            displayedStock <= 0
          ) {
            return currentQuantity;
          }

          return Math.min(
            displayedStock,
            currentQuantity + 1
          );
        }
      );
    };

  const handleVariantChange =
    (index) => {
      setVariantIndex(index);
      setQuantity(1);
      setImageIndex(0);
    };

  const handleFavorite =
    () => {
      if (!product) {
        return;
      }

      toggleFavorite({
        id:
          product.id,

        slug:
          product.slug,

        name:
          product.name,

        brand:
          product.brand ||
          "",

        reference:
          product.reference ||
          "",

        image:
          product.images?.[0]
            ?.url ||
          selectedVariant
            ?.image_url ||
          "/images/product-placeholder.png",
      });

      if (
        productIsFavorite
      ) {
        toast.success(
          "Produit retiré des favoris."
        );
      } else {
        toast.success(
          "Produit ajouté aux favoris."
        );
      }
    };

  const handleAddToCart =
    () => {
      if (!product) {
        return;
      }

      if (
        displayedStock <= 0
      ) {
        toast.error(
          "Ce produit est actuellement indisponible."
        );

        return;
      }

      const variantLabel =
        selectedVariant?.name ||
        selectedVariant
          ?.reference ||
        "";

      const cartItemId =
        selectedVariant
          ? `${product.id}-${selectedVariant.id}`
          : product.id;

      const cartImage =
        selectedVariant
          ?.image_url ||
        product.images?.[0]
          ?.url ||
        "/images/product-placeholder.png";

      const cartProduct = {
        id:
          cartItemId,

        product_id:
          cartItemId,

        database_product_id:
          product.id,

        variant_id:
          selectedVariant?.id ||
          null,

        slug:
          product.slug,

        name:
          product.name,

        brand:
          product.brand,

        reference:
          displayedReference,

        sku:
          displayedSku,

        price:
          displayedPrice,

        stock:
          displayedStock,

        product_condition:
          product.product_condition,

        image:
          cartImage,

        images:
          galleryImages.map(
            (image) =>
              image.url
          ),

        selectedVariant:
          selectedVariant
            ? {
                id:
                  selectedVariant.id,

                name:
                  selectedVariant.name,

                label:
                  variantLabel,

                reference:
                  selectedVariant.reference,

                sku:
                  selectedVariant.sku,

                price:
                  displayedPrice,

                stock:
                  displayedStock,

                image_url:
                  selectedVariant.image_url ||
                  null,
              }
            : null,
      };

      addItem(
        cartProduct,
        quantity
      );

      toast.success(
        `${product.name} ajouté au panier`,
        {
          description:
            selectedVariant
              ? `${variantLabel} — Quantité : ${quantity}`
              : `Quantité : ${quantity}`,
        }
      );
    };

  if (loading) {
    return (
      <div className="min-h-[70vh] bg-slate-50 grid place-items-center px-5">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto rounded-3xl bg-[#020714] text-[#55a8ff] grid place-items-center">
            <LoaderCircle className="w-8 h-8 animate-spin" />
          </div>

          <h1 className="font-display font-black text-2xl text-slate-950 mt-5">
            Chargement du produit
          </h1>

          <p className="text-sm text-slate-500 mt-2">
            QEH OUTLET prépare les informations du produit.
          </p>
        </div>
      </div>
    );
  }

  if (
    errorMessage ||
    !product
  ) {
    return (
      <div className="min-h-[70vh] bg-slate-50 grid place-items-center px-5 py-20">
        <div className="max-w-xl w-full rounded-3xl border border-red-200 bg-white p-8 sm:p-10 text-center shadow-[0_20px_55px_rgba(2,7,20,0.08)]">
          <div className="w-16 h-16 mx-auto rounded-3xl bg-red-50 text-red-600 grid place-items-center">
            <AlertCircle className="w-8 h-8" />
          </div>

          <h1 className="font-display font-black text-3xl text-slate-950 mt-6">
            Produit introuvable
          </h1>

          <p className="text-slate-500 leading-relaxed mt-3">
            {errorMessage}
          </p>

          <Link
            to="/produits"
            className="inline-flex items-center justify-center min-h-12 px-7 mt-7 rounded-full bg-[#020714] text-white font-bold hover:bg-[#0b5ca8] transition-colors"
          >
            Retour aux produits
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div
      data-testid="product-detail-page"
      className="min-h-screen bg-slate-50"
    >
      <section className="relative overflow-hidden bg-[#020714]">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-40 -left-40 w-[420px] h-[420px] rounded-full bg-[#0b5ca8]/20 blur-3xl" />

          <div className="absolute -bottom-52 -right-36 w-[480px] h-[480px] rounded-full bg-[#ff5a00]/10 blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-5 sm:px-8 py-8 sm:py-10">
          <button
            type="button"
            onClick={() =>
              navigate(-1)
            }
            className="inline-flex items-center gap-2 text-sm font-semibold text-white/60 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour
          </button>

          <div className="mt-7 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-5">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.22em] text-[#ff5a00]">
                QEH OUTLET
              </p>

              <p className="text-sm text-white/55 mt-2">
                {product.category ||
                  "Catalogue"}
              </p>
            </div>

            <div
              className={`inline-flex items-center min-h-10 px-4 rounded-full border text-sm font-black ${productCondition.className}`}
            >
              {
                productCondition.label
              }
            </div>
          </div>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-5 sm:px-8 py-10 sm:py-14">
        <div className="grid lg:grid-cols-[1.08fr_0.92fr] gap-8 lg:gap-12 items-start">
          <section>
            <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-5 sm:p-8 shadow-[0_20px_55px_rgba(2,7,20,0.08)]">
              <div className="absolute top-5 left-5 z-10">
                <span
                  className={`inline-flex items-center min-h-9 px-4 rounded-full border text-xs font-black shadow-sm ${productCondition.className}`}
                >
                  {
                    productCondition.label
                  }
                </span>
              </div>
              {product.is_on_sale &&
product.sale_price && (

  <div className="absolute top-20 left-5 z-10">

    <span className="rounded-full bg-[#ff5a00] px-4 py-2 text-white font-black shadow-lg">

      -
      {Math.round(
        ((product.price - product.sale_price) / product.price) * 100
      )}
      %

    </span>

  </div>

)}

              <button
                type="button"
                onClick={
                  handleFavorite
                }
                aria-label={
                  productIsFavorite
                    ? "Retirer des favoris"
                    : "Ajouter aux favoris"
                }
                aria-pressed={
                  productIsFavorite
                }
                title={
                  productIsFavorite
                    ? "Retirer des favoris"
                    : "Ajouter aux favoris"
                }
                className={`absolute top-5 right-5 z-10 w-12 h-12 rounded-full border grid place-items-center transition-colors ${
                  productIsFavorite
                    ? "border-[#ff5a00] bg-[#ff5a00] text-white"
                    : "border-slate-200 bg-white text-slate-600 hover:border-[#ff5a00] hover:text-[#ff5a00]"
                }`}
              >
                <Heart
                  className={`w-5 h-5 ${
                    productIsFavorite
                      ? "fill-current"
                      : ""
                  }`}
                />
              </button>

              <div className="min-h-[340px] sm:min-h-[520px] grid place-items-center pt-12">
                <img
                  src={
                    activeImage
                  }
                  alt={
                    activeImageAlt
                  }
                  className="w-full h-[340px] sm:h-[500px] object-contain"
                  onError={(
                    event
                  ) => {
                    event.currentTarget.onerror =
                      null;

                    event.currentTarget.src =
                      "/images/product-placeholder.png";
                  }}
                />
              </div>
            </div>

            {galleryImages.length >
              1 && (
              <div className="flex gap-3 mt-4 overflow-x-auto pb-2">
                {galleryImages.map(
                  (
                    image,
                    index
                  ) => (
                    <button
                      type="button"
                      key={
                        image.id ||
                        `${image.url}-${index}`
                      }
                      onClick={() =>
                        setImageIndex(
                          index
                        )
                      }
                      aria-label={`Afficher l’image ${index + 1}`}
                      className={`relative w-24 h-24 shrink-0 rounded-2xl overflow-hidden border-2 bg-white transition-all ${
                        index ===
                        imageIndex
                          ? "border-[#0b5ca8] shadow-[0_8px_24px_rgba(11,92,168,0.15)]"
                          : "border-slate-200 hover:border-[#0b5ca8]/50"
                      }`}
                    >
                      <img
                        src={
                          image.url
                        }
                        alt={
                          image.alt
                        }
                        className="w-full h-full object-contain p-2"
                        onError={(
                          event
                        ) => {
                          event.currentTarget.onerror =
                            null;

                          event.currentTarget.src =
                            "/images/product-placeholder.png";
                        }}
                      />

                      {image.isVariantImage && (
                        <span className="absolute bottom-1 left-1 right-1 rounded-md bg-[#0b5ca8] text-white text-[9px] font-black py-1">
                          Variante
                        </span>
                      )}
                    </button>
                  )
                )}
              </div>
            )}
          </section>

          <aside className="lg:sticky lg:top-28">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-[0_20px_55px_rgba(2,7,20,0.08)]">
              {product.category && (
                <p className="text-xs font-black uppercase tracking-[0.18em] text-[#0b5ca8]">
                  {
                    product.category
                  }
                </p>
              )}

              <h1 className="font-display font-black text-3xl sm:text-4xl text-slate-950 tracking-tight leading-tight mt-3">
                {product.name}
              </h1>

              {product.brand && (
                <p className="text-sm font-bold text-slate-500 mt-3">
                  Marque :{" "}
                  <span className="text-slate-950">
                    {product.brand}
                  </span>
                </p>
              )}

              <div className="flex flex-wrap gap-3 mt-4">
                {displayedReference && (
                  <span className="inline-flex items-center min-h-8 px-3 rounded-full bg-slate-100 text-slate-600 text-xs font-semibold">
                    Réf.{" "}
                    {
                      displayedReference
                    }
                  </span>
                )}

                {displayedSku && (
                  <span className="inline-flex items-center min-h-8 px-3 rounded-full bg-slate-100 text-slate-600 text-xs font-semibold">
                    SKU :{" "}
                    {
                      displayedSku
                    }
                  </span>
                )}
              </div>

              {product.short_description && (
                <p className="text-base font-medium text-slate-700 leading-relaxed mt-6">
                  {
                    product.short_description
                  }
                </p>
              )}

              {parsedDescription.descriptionText && (
                <p className="text-sm text-slate-500 leading-relaxed whitespace-pre-line mt-4">
                  {
                    parsedDescription.descriptionText
                  }
                </p>
              )}

              {product.variants.length >
                0 && (
                <div className="mt-7">
                  <p className="text-sm font-black text-slate-950 mb-3">
                    Choisir une version
                  </p>

                  <div className="grid sm:grid-cols-2 gap-3">
                    {product.variants.map(
                      (
                        variant,
                        index
                      ) => (
                        <button
                          type="button"
                          key={
                            variant.id
                          }
                          onClick={() =>
                            handleVariantChange(
                              index
                            )
                          }
                          className={`min-h-12 px-4 py-3 rounded-2xl text-sm font-bold border text-left transition-all ${
                            index ===
                            variantIndex
                              ? "border-[#0b5ca8] bg-[#0b5ca8] text-white shadow-[0_10px_30px_rgba(11,92,168,0.18)]"
                              : "border-slate-200 bg-white text-slate-700 hover:border-[#0b5ca8]/50 hover:bg-[#0b5ca8]/5"
                          }`}
                        >
                          {
                            variant.name
                          }
                        </button>
                      )
                    )}
                  </div>

                  {selectedVariant?.image_url && (
                    <p className="text-xs text-slate-500 mt-3">
                      La photo affichée correspond à la variante sélectionnée.
                    </p>
                  )}
                </div>
              )}

              <div className="mt-8 rounded-3xl bg-[#020714] p-6 text-white">
                <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.18em] text-white/45">
                      Prix 
                    </p>

                    {product.is_on_sale &&
product.sale_price ? (

<div>

<p className="text-lg text-white/50 line-through">

{Number(product.price).toFixed(2)} €

</p>

<p className="font-display font-black text-4xl text-[#ff7a33] mt-1">

{Number(product.sale_price).toFixed(2)} €

</p>

<p className="text-sm text-green-400 mt-2">

Vous économisez{" "}

{(
Number(product.price)-
Number(product.sale_price)
).toFixed(2)} €

</p>

</div>

) : (

<p className="font-display font-black text-3xl sm:text-4xl text-white mt-2">

{priceLabel(displayedProduct)}

</p>

)}
                  </div>

                  <div>
                    <p
                      className={`inline-flex items-center gap-2 text-sm font-black ${availability.className}`}
                    >
                      <span
                        className={`w-2.5 h-2.5 rounded-full ${availability.dotClassName}`}
                      />

                      {
                        availability.label
                      }
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex flex-col sm:flex-row gap-4">
                <div className="flex items-center h-12 rounded-full border border-slate-200 bg-slate-50">
                  <button
                    type="button"
                    onClick={
                      decreaseQuantity
                    }
                    disabled={
                      quantity <= 1
                    }
                    aria-label="Diminuer la quantité"
                    className="w-12 h-12 grid place-items-center text-slate-600 hover:text-[#ff5a00] disabled:opacity-30 transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>

                  <span className="w-10 text-center font-black text-slate-950">
                    {
                      quantity
                    }
                  </span>

                  <button
                    type="button"
                    onClick={
                      increaseQuantity
                    }
                    disabled={
                      displayedStock <=
                        0 ||
                      quantity >=
                        displayedStock
                    }
                    aria-label="Augmenter la quantité"
                    className="w-12 h-12 grid place-items-center text-slate-600 hover:text-[#0b5ca8] disabled:opacity-30 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={
                    handleAddToCart
                  }
                  disabled={
                    displayedStock <=
                    0
                  }
                  className="flex-1 inline-flex items-center justify-center gap-2 min-h-12 px-7 rounded-full bg-[#ff5a00] text-white font-black hover:bg-[#e95000] disabled:opacity-50 transition-colors shadow-[0_12px_35px_rgba(255,90,0,0.22)]"
                >
                  <ShoppingBag className="w-5 h-5" />

                  {displayedStock > 0
                    ? "Ajouter au panier"
                    : "Indisponible"}
                </button>
              </div>

              <button
                type="button"
                onClick={
                  handleFavorite
                }
                className={`w-full inline-flex items-center justify-center gap-2 min-h-11 mt-4 rounded-full border font-bold transition-colors ${
                  productIsFavorite
                    ? "border-[#ff5a00] bg-[#ff5a00]/10 text-[#ff5a00]"
                    : "border-slate-200 text-slate-700 hover:border-[#0b5ca8] hover:text-[#0b5ca8]"
                }`}
              >
                <Heart
                  className={`w-4 h-4 ${
                    productIsFavorite
                      ? "fill-current"
                      : ""
                  }`}
                />

                {productIsFavorite
                  ? "Retirer des favoris"
                  : "Ajouter aux favoris"}
              </button>
            </div>
          </aside>
        </div>

        <section className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-10">
          <article className="rounded-2xl border border-slate-200 bg-white p-5">
            <PackageCheck className="w-6 h-6 text-[#0b5ca8]" />

            <h2 className="font-display font-black text-base text-slate-950 mt-4">
              État contrôlé
            </h2>

            <p className="text-sm text-slate-500 leading-relaxed mt-2">
              L’état réel du produit est clairement indiqué.
            </p>
          </article>

          <article className="rounded-2xl border border-slate-200 bg-white p-5">
            <CreditCard className="w-6 h-6 text-[#0b5ca8]" />

            <h2 className="font-display font-black text-base text-slate-950 mt-4">
              Paiement sécurisé
            </h2>

            <p className="text-sm text-slate-500 leading-relaxed mt-2">
              Votre paiement est protégé par Stripe.
            </p>
          </article>

          <article className="rounded-2xl border border-slate-200 bg-white p-5">
            <Truck className="w-6 h-6 text-[#0b5ca8]" />

            <h2 className="font-display font-black text-base text-slate-950 mt-4">
              Livraison suivie
            </h2>

            <p className="text-sm text-slate-500 leading-relaxed mt-2">
              Suivez votre colis après son expédition.
            </p>
          </article>

          <article className="rounded-2xl border border-slate-200 bg-white p-5">
            <ShieldCheck className="w-6 h-6 text-[#0b5ca8]" />

            <h2 className="font-display font-black text-base text-slate-950 mt-4">
              Achat transparent
            </h2>

            <p className="text-sm text-slate-500 leading-relaxed mt-2">
              Référence, variante et disponibilité clairement affichées.
            </p>
          </article>
        </section>
<section className="mt-12">
  <TechnicalSpecsTable
    description={product.description}
    specifications={product.specifications}
  />
</section>

        <div className="mt-10 text-center">
          <Link
            to="/produits"
            className="inline-flex items-center justify-center gap-2 min-h-12 px-8 rounded-full bg-[#020714] text-white font-bold hover:bg-[#0b5ca8] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />

            Retour au catalogue
          </Link>
        </div>
      </main>
    </div>
  );
}