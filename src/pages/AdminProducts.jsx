import React, {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  ArrowLeft,
  Edit3,
  ExternalLink,
  ImageOff,
  LoaderCircle,
  PackagePlus,
  RefreshCw,
  Trash2,
} from "lucide-react";

import { Link } from "react-router-dom";
import { toast } from "sonner";

import { supabase } from "../lib/supabase";
import { priceLabel } from "../lib/api";

function getPrimaryImage(images = []) {
  if (!Array.isArray(images) || images.length === 0) {
    return null;
  }

  return [...images].sort((firstImage, secondImage) => {
    if (firstImage.is_primary && !secondImage.is_primary) {
      return -1;
    }

    if (!firstImage.is_primary && secondImage.is_primary) {
      return 1;
    }

    return (
      (firstImage.display_order || 0) -
      (secondImage.display_order || 0)
    );
  })[0];
}

function getStoragePathFromPublicUrl(imageUrl) {
  if (!imageUrl) {
    return null;
  }

  const marker =
    "/storage/v1/object/public/produits/";

  const markerIndex = imageUrl.indexOf(marker);

  if (markerIndex === -1) {
    return null;
  }

  return decodeURIComponent(
    imageUrl.slice(markerIndex + marker.length)
  );
}

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  const loadProducts = useCallback(async () => {
    setLoading(true);

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
        .order("created_at", {
          ascending: false,
        });

      if (error) {
        throw error;
      }

      const normalizedProducts = (data || []).map(
        (product) => {
          const primaryImage = getPrimaryImage(
            product.product_images
          );

          return {
            ...product,
            category:
              product.categories?.name ||
              "Sans catégorie",
            image:
              primaryImage?.image_url || null,
            imageAlt:
              primaryImage?.alt_text ||
              product.name,
          };
        }
      );

      setProducts(normalizedProducts);
    } catch (error) {
      console.error(
        "Erreur lors du chargement des produits :",
        error
      );

      toast.error(
        error?.message ||
          "Impossible de charger les produits."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    document.title =
      "Gestion des produits | ENR Discount";

    loadProducts();
  }, [loadProducts]);

  const handleDelete = async (product) => {
    const confirmation = window.confirm(
      `Supprimer définitivement « ${product.name} » ?`
    );

    if (!confirmation) {
      return;
    }

    setDeletingId(product.id);

    try {
      const { data: imageRows, error: imagesReadError } =
        await supabase
          .from("product_images")
          .select("id, image_url")
          .eq("product_id", product.id);

      if (imagesReadError) {
        throw imagesReadError;
      }

      const storagePaths = (imageRows || [])
        .map((image) =>
          getStoragePathFromPublicUrl(
            image.image_url
          )
        )
        .filter(Boolean);

      if (storagePaths.length > 0) {
        const { error: storageError } =
          await supabase.storage
            .from("produits")
            .remove(storagePaths);

        if (storageError) {
          console.error(
            "Erreur Storage :",
            storageError
          );
        }
      }

      const { error: variantsError } =
        await supabase
          .from("product_variants")
          .delete()
          .eq("product_id", product.id);

      if (variantsError) {
        throw variantsError;
      }

      const { error: imagesError } =
        await supabase
          .from("product_images")
          .delete()
          .eq("product_id", product.id);

      if (imagesError) {
        throw imagesError;
      }

      const { error: productError } =
        await supabase
          .from("products")
          .delete()
          .eq("id", product.id);

      if (productError) {
        throw productError;
      }

      setProducts((currentProducts) =>
        currentProducts.filter(
          (currentProduct) =>
            currentProduct.id !== product.id
        )
      );

      toast.success("Produit supprimé.");
    } catch (error) {
      console.error(
        "Erreur lors de la suppression :",
        error
      );

      toast.error(
        error?.message ||
          "Impossible de supprimer le produit."
      );
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-secondary/30">
      <header className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 min-h-20 py-4 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="font-display font-black text-xl">
              ENR Discount
            </p>

            <p className="text-xs text-muted-foreground">
              Administration
            </p>
          </div>

          <Link
            to="/admin"
            className="inline-flex items-center gap-2 h-10 px-5 rounded-full border border-border font-semibold text-sm hover:bg-secondary"
          >
            <ArrowLeft className="w-4 h-4" />
            Tableau de bord
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-5 sm:px-8 py-10">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-5 mb-9">
          <div>
            <p className="overline text-primary mb-2">
              Catalogue
            </p>

            <h1 className="font-display font-black text-3xl sm:text-4xl tracking-tight">
              Gestion des produits
            </h1>

            <p className="text-muted-foreground mt-2">
              Consulte, modifie ou supprime les produits.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={loadProducts}
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 h-11 px-5 rounded-full border border-border bg-card font-semibold text-sm hover:bg-secondary disabled:opacity-60"
            >
              <RefreshCw
                className={`w-4 h-4 ${
                  loading ? "animate-spin" : ""
                }`}
              />
              Actualiser
            </button>

            <Link
              to="/admin/produits/nouveau"
              className="inline-flex items-center justify-center gap-2 h-11 px-6 rounded-full bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90"
            >
              <PackagePlus className="w-4 h-4" />
              Ajouter un produit
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="rounded-3xl border border-border bg-card py-20 text-center">
            <LoaderCircle className="w-10 h-10 animate-spin text-primary mx-auto mb-4" />

            <p className="font-semibold">
              Chargement des produits…
            </p>
          </div>
        ) : products.length === 0 ? (
          <div className="rounded-3xl border border-border bg-card py-20 px-6 text-center">
            <ImageOff className="w-12 h-12 text-muted-foreground mx-auto mb-4" />

            <h2 className="font-display font-bold text-2xl">
              Aucun produit
            </h2>
          </div>
        ) : (
          <div className="rounded-3xl border border-border bg-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[980px] text-left">
                <thead className="bg-secondary/60">
                  <tr>
                    <th className="px-5 py-4 text-sm font-semibold">
                      Produit
                    </th>

                    <th className="px-5 py-4 text-sm font-semibold">
                      Catégorie
                    </th>

                    <th className="px-5 py-4 text-sm font-semibold">
                      Prix
                    </th>

                    <th className="px-5 py-4 text-sm font-semibold">
                      Stock
                    </th>

                    <th className="px-5 py-4 text-sm font-semibold">
                      Statut
                    </th>

                    <th className="px-5 py-4 text-sm font-semibold text-right">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {products.map((product) => (
                    <tr
                      key={product.id}
                      className="border-t border-border"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-4">
                          <div className="w-16 h-16 shrink-0 rounded-xl border border-border bg-white overflow-hidden grid place-items-center">
                            {product.image ? (
                              <img
                                src={product.image}
                                alt={product.imageAlt}
                                className="w-full h-full object-contain p-1"
                              />
                            ) : (
                              <ImageOff className="w-5 h-5 text-muted-foreground" />
                            )}
                          </div>

                          <div>
                            <p className="font-semibold">
                              {product.name}
                            </p>

                            {product.brand && (
                              <p className="text-sm text-muted-foreground mt-1">
                                {product.brand}
                              </p>
                            )}

                            {product.reference && (
                              <p className="text-xs text-muted-foreground mt-1">
                                Réf. {product.reference}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4 text-sm">
                        {product.category}
                      </td>

                      <td className="px-5 py-4 font-semibold">
                        {priceLabel(product)}
                      </td>

                      <td className="px-5 py-4">
                        {product.stock}
                      </td>

                      <td className="px-5 py-4">
                        <span className="inline-flex rounded-full px-3 py-1 text-xs font-semibold bg-primary/10 text-primary">
                          {product.is_active
                            ? "Publié"
                            : "Masqué"}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            to={`/produits/${product.slug}`}
                            target="_blank"
                            rel="noreferrer"
                            title="Voir le produit"
                            className="w-10 h-10 rounded-full border border-border grid place-items-center hover:bg-secondary"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Link>

                          <Link
                            to={`/admin/produits/${product.id}/modifier`}
                            title="Modifier le produit"
                            className="w-10 h-10 rounded-full border border-border grid place-items-center hover:bg-secondary"
                          >
                            <Edit3 className="w-4 h-4" />
                          </Link>

                          <button
                            type="button"
                            onClick={() =>
                              handleDelete(product)
                            }
                            disabled={
                              deletingId === product.id
                            }
                            title="Supprimer le produit"
                            className="w-10 h-10 rounded-full border border-destructive/30 text-destructive grid place-items-center hover:bg-destructive/10 disabled:opacity-50"
                          >
                            {deletingId === product.id ? (
                              <LoaderCircle className="w-4 h-4 animate-spin" />
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}