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
  LoaderCircle,
  Minus,
  Plus,
  ShoppingBag,
} from "lucide-react";

import { toast } from "sonner";

import { supabase } from "../lib/supabase";
import { useCart } from "../context/CartContext";
import { priceLabel } from "../lib/api";

export default function ProductDetail() {
  const { slug } = useParams();

  const navigate = useNavigate();
  const { addItem } = useCart();

  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [imageIndex, setImageIndex] = useState(0);
  const [variantIndex, setVariantIndex] =
    useState(0);

  const [loading, setLoading] = useState(true);

  const [errorMessage, setErrorMessage] =
    useState("");

  useEffect(() => {
    let componentIsMounted = true;

    const loadProduct = async () => {
      setLoading(true);
      setErrorMessage("");

      try {
        if (!slug) {
          throw new Error(
            "Le slug du produit est absent."
          );
        }

        const { data, error } = await supabase
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
          .eq("is_active", true)
          .maybeSingle();

        if (error) {
          throw error;
        }

        if (!data) {
          throw new Error("Produit introuvable.");
        }

        const sortedImages = Array.isArray(
          data.product_images
        )
          ? [...data.product_images].sort(
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
            )
          : [];

        const sortedVariants = Array.isArray(
          data.product_variants
        )
          ? [...data.product_variants]
              .filter(
                (variant) => variant.is_active
              )
              .sort(
                (firstVariant, secondVariant) =>
                  (firstVariant.display_order || 0) -
                  (secondVariant.display_order || 0)
              )
          : [];

        const normalizedProduct = {
          ...data,

          category:
            data.categories?.name || "",

          images: sortedImages.map((image) => ({
            id: image.id,
            url: image.image_url,
            alt: image.alt_text || data.name,
            isPrimary: image.is_primary,
          })),

          variants: sortedVariants,

          specifications: Array.isArray(
            data.specifications
          )
            ? data.specifications
            : [],
        };

        if (!componentIsMounted) {
          return;
        }

        setProduct(normalizedProduct);
        setImageIndex(0);
        setVariantIndex(0);
        setQuantity(1);
      } catch (error) {
        console.error(
          "Erreur lors du chargement du produit :",
          error
        );

        if (!componentIsMounted) {
          return;
        }

        setProduct(null);

        setErrorMessage(
          error?.message ||
            "Impossible de charger ce produit."
        );
      } finally {
        if (componentIsMounted) {
          setLoading(false);
        }
      }
    };

    loadProduct();

    return () => {
      componentIsMounted = false;
    };
  }, [slug]);

  const selectedVariant = useMemo(() => {
    if (!product?.variants?.length) {
      return null;
    }

    return product.variants[variantIndex] || null;
  }, [product, variantIndex]);

  const displayedPrice =
    typeof selectedVariant?.price === "number"
      ? selectedVariant.price
      : Number(product?.price || 0);

  const displayedStock =
    typeof selectedVariant?.stock === "number"
      ? selectedVariant.stock
      : Number(product?.stock || 0);

  const displayedProduct = product
    ? {
        ...product,
        price: displayedPrice,
        stock: displayedStock,
      }
    : null;

  const activeImage =
    product?.images?.[imageIndex]?.url ||
    "/images/product-placeholder.png";

  const activeImageAlt =
    product?.images?.[imageIndex]?.alt ||
    product?.name ||
    "Image du produit";

  const decreaseQuantity = () => {
    setQuantity((currentQuantity) =>
      Math.max(1, currentQuantity - 1)
    );
  };

  const increaseQuantity = () => {
    setQuantity((currentQuantity) => {
      if (
        displayedStock > 0 &&
        currentQuantity >= displayedStock
      ) {
        return currentQuantity;
      }

      return currentQuantity + 1;
    });
  };

  const handleVariantChange = (index) => {
    setVariantIndex(index);
    setQuantity(1);
  };

  const handleAddToCart = () => {
    if (!product) {
      return;
    }

    if (displayedStock <= 0) {
      toast.error(
        "Ce produit est actuellement indisponible."
      );

      return;
    }

    const variantLabel =
      selectedVariant?.name ||
      selectedVariant?.reference ||
      "";

    const cartItemId = selectedVariant
      ? `${product.id}-${selectedVariant.id}`
      : product.id;

    const cartProduct = {
      id: cartItemId,
      product_id: cartItemId,

      database_product_id: product.id,
      variant_id: selectedVariant?.id || null,

      slug: product.slug,
      name: product.name,
      brand: product.brand,

      reference:
        selectedVariant?.reference ||
        product.reference,

      price: displayedPrice,
      stock: displayedStock,

      image:
        product.images?.[0]?.url ||
        "/images/product-placeholder.png",

      images:
        product.images?.map(
          (image) => image.url
        ) || [],

      selectedVariant: selectedVariant
        ? {
            id: selectedVariant.id,
            name: selectedVariant.name,
            label: variantLabel,
            reference:
              selectedVariant.reference,
            sku: selectedVariant.sku,
            price: displayedPrice,
            stock: displayedStock,
          }
        : null,
    };

    addItem(cartProduct, quantity);

    toast.success(
      `${product.name} ajouté au panier`,
      {
        description: selectedVariant
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

  if (errorMessage || !product) {
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
        onClick={() => navigate(-1)}
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
              alt={activeImageAlt}
              className="w-full h-[340px] sm:h-[440px] object-contain"
              onError={(event) => {
                event.currentTarget.onerror = null;

                event.currentTarget.src =
                  "/images/product-placeholder.png";
              }}
            />
          </div>

          {product.images.length > 1 && (
            <div className="flex flex-wrap gap-3 mt-4">
              {product.images.map(
                (image, index) => (
                  <button
                    type="button"
                    key={image.id}
                    onClick={() =>
                      setImageIndex(index)
                    }
                    className={`w-20 h-20 rounded-xl overflow-hidden border-2 bg-white ${
                      index === imageIndex
                        ? "border-primary"
                        : "border-border"
                    }`}
                  >
                    <img
                      src={image.url}
                      alt={image.alt}
                      className="w-full h-full object-contain p-1"
                    />
                  </button>
                )
              )}
            </div>
          )}
        </div>

        <div className="lg:pt-4">
          {product.category && (
            <p className="overline text-primary mb-2">
              {product.category}
            </p>
          )}

          <h1 className="font-display font-black text-3xl sm:text-4xl tracking-tight mb-2">
            {product.name}
          </h1>

          {product.brand && (
            <p className="text-sm font-semibold text-muted-foreground mb-1">
              {product.brand}
            </p>
          )}

          {product.reference && (
            <p className="text-sm text-muted-foreground mb-5">
              Réf. {product.reference}
            </p>
          )}

          {product.short_description && (
            <p className="font-medium leading-relaxed mb-4">
              {product.short_description}
            </p>
          )}

          {product.description && (
            <p className="text-muted-foreground leading-relaxed whitespace-pre-line mb-7">
              {product.description}
            </p>
          )}

          {product.variants.length > 0 && (
            <div className="mb-7">
              <p className="text-sm font-semibold mb-3">
                Choisir une version
              </p>

              <div className="flex flex-wrap gap-2">
                {product.variants.map(
                  (variant, index) => (
                    <button
                      type="button"
                      key={variant.id}
                      onClick={() =>
                        handleVariantChange(index)
                      }
                      className={`min-h-11 px-5 py-2 rounded-full text-sm font-semibold border ${
                        index === variantIndex
                          ? "bg-primary text-primary-foreground border-primary"
                          : "border-border hover:bg-secondary"
                      }`}
                    >
                      {variant.name}
                    </button>
                  )
                )}
              </div>
            </div>
          )}

          <p className="font-display font-bold text-3xl mb-2">
            {priceLabel(displayedProduct)}
          </p>

          <p
            className={`text-sm font-semibold mb-6 ${
              displayedStock > 0
                ? "text-primary"
                : "text-amber-600"
            }`}
          >
            {displayedStock > 0
              ? `${displayedStock} en stock`
              : product.on_demand
                ? "Disponible sur demande"
                : "Produit indisponible"}
          </p>

          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex items-center border border-border rounded-full h-12 w-fit">
              <button
                type="button"
                onClick={decreaseQuantity}
                disabled={quantity <= 1}
                className="w-12 h-12 grid place-items-center disabled:opacity-40"
              >
                <Minus className="w-4 h-4" />
              </button>

              <span className="w-10 text-center font-semibold">
                {quantity}
              </span>

              <button
                type="button"
                onClick={increaseQuantity}
                disabled={
                  displayedStock <= 0 ||
                  quantity >= displayedStock
                }
                className="w-12 h-12 grid place-items-center disabled:opacity-40"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            <button
              type="button"
              onClick={handleAddToCart}
              disabled={displayedStock <= 0}
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

      {product.specifications.length > 0 && (
        <section className="mt-16">
          <p className="overline text-primary mb-2">
            Caractéristiques
          </p>

          <h2 className="font-display font-bold text-2xl sm:text-3xl mb-8">
            Fiche technique
          </h2>

          <div className="rounded-2xl border border-border overflow-hidden">
            <table className="w-full text-sm">
              <tbody>
                {product.specifications.map(
                  (specification, index) => (
                    <tr
                      key={`${specification.label}-${index}`}
                      className="border-t border-border"
                    >
                      <td className="px-5 py-4 text-muted-foreground w-1/2">
                        {specification.label}
                      </td>

                      <td className="px-5 py-4 font-medium">
                        {specification.value}
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}