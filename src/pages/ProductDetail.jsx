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
  Heart,
  LoaderCircle,
  Minus,
  Plus,
  ShoppingBag,
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
      className: "text-primary",
    };
  }

  if (onDemand) {
    return {
      label:
        "Disponible sur demande",
      className: "text-amber-600",
    };
  }

  return {
    label: "Indisponible",
    className: "text-destructive",
  };
}

export default function ProductDetail() {
  const { slug } = useParams();

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
              stock,
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
            .eq("slug", slug)
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
            `${normalizedProduct.name} | ENR Discount`;
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

  const displayedPrice =
    selectedVariant?.price !==
      null &&
    selectedVariant?.price !==
      undefined
      ? Number(
          selectedVariant.price
        )
      : Number(
          product?.price || 0
        );

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
      <div className="max-w-6xl mx-auto px-5 sm:px-8 py-24">
        <div className="flex flex-col items-center text-center">
          <LoaderCircle className="w-10 h-10 animate-spin text-primary mb-4" />

          <h1 className="font-display font-bold text-2xl">
            Chargement du produit
          </h1>
        </div>
      </div>
    );
  }

  if (
    errorMessage ||
    !product
  ) {
    return (
      <div className="max-w-3xl mx-auto px-5 sm:px-8 py-24">
        <div className="rounded-3xl border border-destructive/30 bg-card p-8 text-center">
          <AlertCircle className="w-10 h-10 mx-auto text-destructive mb-4" />

          <h1 className="font-display font-bold text-3xl mb-3">
            Produit introuvable
          </h1>

          <p className="text-muted-foreground mb-7">
            {errorMessage}
          </p>

          <Link
            to="/produits"
            className="inline-flex items-center justify-center h-12 px-7 rounded-full bg-primary text-primary-foreground font-semibold"
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
      className="max-w-6xl mx-auto px-5 sm:px-8 py-10"
    >
      <button
        type="button"
        onClick={() =>
          navigate(-1)
        }
        className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary mb-8"
      >
        <ArrowLeft className="w-4 h-4" />
        Retour
      </button>

      <div className="grid lg:grid-cols-2 gap-10 items-start">
        <div>
          <div className="rounded-3xl overflow-hidden border border-border bg-white p-6 grid place-items-center">
            <img
              src={activeImage}
              alt={
                activeImageAlt
              }
              className="w-full h-[340px] sm:h-[440px] object-contain"
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

          {galleryImages.length >
            1 && (
            <div className="flex flex-wrap gap-3 mt-4">
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
                    className={`relative w-20 h-20 rounded-xl overflow-hidden border-2 bg-white transition-colors ${
                      index ===
                      imageIndex
                        ? "border-primary"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <img
                      src={image.url}
                      alt={image.alt}
                      className="w-full h-full object-contain p-1"
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
                      <span className="absolute bottom-1 left-1 right-1 rounded-md bg-primary text-primary-foreground text-[9px] font-bold py-1">
                        Variante
                      </span>
                    )}
                  </button>
                )
              )}
            </div>
          )}
        </div>

        <div className="lg:pt-4">
          <div className="flex items-start justify-between gap-5">
            <div className="min-w-0">
              {product.category && (
                <p className="overline text-primary mb-2">
                  {
                    product.category
                  }
                </p>
              )}

              <h1 className="font-display font-black text-3xl sm:text-4xl tracking-tight mb-2">
                {product.name}
              </h1>
            </div>

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
              className={`w-12 h-12 shrink-0 rounded-full border grid place-items-center transition-colors ${
                productIsFavorite
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card hover:bg-secondary"
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
          </div>

          {product.brand && (
            <p className="text-sm font-semibold text-muted-foreground mb-1">
              {product.brand}
            </p>
          )}

          {displayedReference && (
            <p className="text-sm text-muted-foreground">
              Réf.{" "}
              {
                displayedReference
              }
            </p>
          )}

          {displayedSku && (
            <p className="text-xs text-muted-foreground mt-1 mb-5">
              SKU :{" "}
              {displayedSku}
            </p>
          )}

          {!displayedSku &&
            displayedReference && (
              <div className="mb-5" />
            )}

          {product.short_description && (
            <p className="font-medium leading-relaxed mb-4">
              {
                product.short_description
              }
            </p>
          )}

          {parsedDescription.descriptionText && (
            <p className="text-muted-foreground leading-relaxed whitespace-pre-line mb-7">
              {
                parsedDescription.descriptionText
              }
            </p>
          )}

          {product.variants.length >
            0 && (
            <div className="mb-7">
              <p className="text-sm font-semibold mb-3">
                Choisir une version
              </p>

              <div className="flex flex-wrap gap-2">
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
                      className={`min-h-11 px-5 py-2 rounded-full text-sm font-semibold border transition-colors ${
                        index ===
                        variantIndex
                          ? "bg-primary text-primary-foreground border-primary"
                          : "border-border hover:bg-secondary"
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
                <p className="text-xs text-muted-foreground mt-3">
                  La photo affichée correspond à la variante sélectionnée.
                </p>
              )}
            </div>
          )}

          <p className="font-display font-bold text-3xl mb-2">
            {priceLabel(
              displayedProduct
            )}
          </p>

          <p
            className={`text-sm font-semibold mb-6 ${availability.className}`}
          >
            {
              availability.label
            }
          </p>

          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex items-center border border-border rounded-full h-12 w-fit">
              <button
                type="button"
                onClick={
                  decreaseQuantity
                }
                disabled={
                  quantity <= 1
                }
                aria-label="Diminuer la quantité"
                className="w-12 h-12 grid place-items-center disabled:opacity-40"
              >
                <Minus className="w-4 h-4" />
              </button>

              <span className="w-10 text-center font-semibold">
                {quantity}
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
                className="w-12 h-12 grid place-items-center disabled:opacity-40"
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
                displayedStock <= 0
              }
              className="flex-1 inline-flex items-center justify-center gap-2 h-12 px-7 rounded-full bg-primary text-primary-foreground font-semibold disabled:opacity-50"
            >
              <ShoppingBag className="w-5 h-5" />

              {displayedStock > 0
                ? "Ajouter au panier"
                : "Indisponible"}
            </button>
          </div>
        </div>
      </div>

      <TechnicalSpecsTable
        description={
          product.description
        }
        specifications={
          product.specifications
        }
      />
    </div>
  );
}