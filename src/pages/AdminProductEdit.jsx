import React, {
  useEffect,
  useState,
} from "react";

import {
  ArrowLeft,
  LoaderCircle,
  Save,
} from "lucide-react";

import {
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";

import { toast } from "sonner";

import { supabase } from "../lib/supabase";

const initialForm = {
  name: "",
  slug: "",
  category_id: "",
  brand: "",
  manufacturer: "",
  reference: "",
  sku: "",
  short_description: "",
  description: "",
  price: "",
  stock: "0",
  on_demand: false,
  is_active: true,
  is_featured: false,
};

function createSlug(value) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function AdminProductEdit() {
  const { productId } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState(initialForm);
  const [categories, setCategories] = useState([]);
  const [currentImage, setCurrentImage] =
    useState(null);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] =
    useState(false);

  useEffect(() => {
    document.title =
      "Modifier un produit | ENR Discount";

    let componentIsMounted = true;

    const loadPageData = async () => {
      setLoading(true);

      try {
        const [
          categoriesResult,
          productResult,
        ] = await Promise.all([
          supabase
            .from("categories")
            .select(`
              id,
              name,
              slug,
              is_active,
              display_order
            `)
            .eq("is_active", true)
            .order("display_order", {
              ascending: true,
            })
            .order("name", {
              ascending: true,
            }),

          supabase
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
              product_images (
                id,
                image_url,
                alt_text,
                is_primary,
                display_order
              )
            `)
            .eq("id", productId)
            .maybeSingle(),
        ]);

        if (categoriesResult.error) {
          throw categoriesResult.error;
        }

        if (productResult.error) {
          throw productResult.error;
        }

        if (!productResult.data) {
          throw new Error(
            "Le produit demandé est introuvable."
          );
        }

        const product = productResult.data;

        const sortedImages = Array.isArray(
          product.product_images
        )
          ? [...product.product_images].sort(
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

        if (!componentIsMounted) {
          return;
        }

        setCategories(
          categoriesResult.data || []
        );

        setCurrentImage(
          sortedImages[0] || null
        );

        setForm({
          name: product.name || "",
          slug: product.slug || "",
          category_id:
            product.category_id || "",
          brand: product.brand || "",
          manufacturer:
            product.manufacturer || "",
          reference:
            product.reference || "",
          sku: product.sku || "",
          short_description:
            product.short_description || "",
          description:
            product.description || "",
          price:
            product.price === null
              ? ""
              : String(product.price),
          stock:
            product.stock === null
              ? "0"
              : String(product.stock),
          on_demand:
            Boolean(product.on_demand),
          is_active:
            Boolean(product.is_active),
          is_featured:
            Boolean(product.is_featured),
        });
      } catch (error) {
        console.error(
          "Erreur lors du chargement du produit :",
          error
        );

        toast.error(
          error?.message ||
            "Impossible de charger le produit."
        );

        navigate("/admin/produits", {
          replace: true,
        });
      } finally {
        if (componentIsMounted) {
          setLoading(false);
        }
      }
    };

    loadPageData();

    return () => {
      componentIsMounted = false;
    };
  }, [navigate, productId]);

  const handleFieldChange = (event) => {
    const {
      name,
      value,
      checked,
      type,
    } = event.target;

    setForm((currentForm) => ({
      ...currentForm,
      [name]:
        type === "checkbox"
          ? checked
          : value,
    }));
  };

  const handleSlugChange = (event) => {
    setForm((currentForm) => ({
      ...currentForm,
      slug: createSlug(event.target.value),
    }));
  };

  const validateForm = () => {
    if (!form.name.trim()) {
      return "Le nom du produit est obligatoire.";
    }

    if (!form.slug.trim()) {
      return "Le slug est obligatoire.";
    }

    if (!form.category_id) {
      return "Choisis une catégorie.";
    }

    if (
      form.price === "" ||
      Number.isNaN(Number(form.price)) ||
      Number(form.price) < 0
    ) {
      return "Le prix doit être supérieur ou égal à zéro.";
    }

    if (
      form.stock === "" ||
      Number.isNaN(Number(form.stock)) ||
      Number(form.stock) < 0
    ) {
      return "Le stock doit être supérieur ou égal à zéro.";
    }

    return "";
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const validationError = validateForm();

    if (validationError) {
      toast.error(validationError);
      return;
    }

    setSubmitting(true);

    try {
      const { error } = await supabase
        .from("products")
        .update({
          category_id: form.category_id,
          name: form.name.trim(),
          slug: createSlug(form.slug),

          brand:
            form.brand.trim() || null,

          manufacturer:
            form.manufacturer.trim() || null,

          reference:
            form.reference.trim() || null,

          sku:
            form.sku.trim() || null,

          short_description:
            form.short_description.trim() ||
            null,

          description:
            form.description.trim() || null,

          price: Number(form.price),

          stock: Number.parseInt(
            form.stock,
            10
          ),

          on_demand: form.on_demand,
          is_active: form.is_active,
          is_featured: form.is_featured,
        })
        .eq("id", productId);

      if (error) {
        throw error;
      }

      toast.success(
        "Produit modifié avec succès."
      );

      navigate("/admin/produits");
    } catch (error) {
      console.error(
        "Erreur lors de la modification :",
        error
      );

      let errorMessage =
        error?.message ||
        "Impossible de modifier le produit.";

      if (
        errorMessage
          .toLowerCase()
          .includes("duplicate key")
      ) {
        errorMessage =
          "Ce slug, cette référence ou ce SKU est déjà utilisé.";
      }

      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen grid place-items-center bg-secondary/30">
        <div className="text-center">
          <LoaderCircle className="w-10 h-10 animate-spin text-primary mx-auto mb-4" />

          <p className="font-semibold">
            Chargement du produit…
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary/30">
      <header className="border-b border-border bg-card">
        <div className="max-w-5xl mx-auto px-5 sm:px-8 min-h-20 py-4 flex items-center justify-between gap-4">
          <div>
            <p className="font-display font-black text-xl">
              ENR Discount
            </p>

            <p className="text-xs text-muted-foreground">
              Administration
            </p>
          </div>

          <Link
            to="/admin/produits"
            className="inline-flex items-center gap-2 h-10 px-5 rounded-full border border-border font-semibold text-sm hover:bg-secondary"
          >
            <ArrowLeft className="w-4 h-4" />
            Produits
          </Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-5 sm:px-8 py-10">
        <div className="mb-9">
          <p className="overline text-primary mb-2">
            Catalogue
          </p>

          <h1 className="font-display font-black text-3xl sm:text-4xl tracking-tight">
            Modifier le produit
          </h1>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-7"
        >
          <section className="rounded-3xl border border-border bg-card p-6 sm:p-8">
            <h2 className="font-display font-bold text-xl mb-6">
              Informations principales
            </h2>

            <div className="grid sm:grid-cols-2 gap-5">
              <div className="sm:col-span-2">
                <label className="block text-sm font-semibold mb-2">
                  Nom du produit *
                </label>

                <input
                  name="name"
                  value={form.name}
                  onChange={handleFieldChange}
                  disabled={submitting}
                  className="w-full h-12 rounded-xl border border-border bg-background px-4"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">
                  Slug *
                </label>

                <input
                  name="slug"
                  value={form.slug}
                  onChange={handleSlugChange}
                  disabled={submitting}
                  className="w-full h-12 rounded-xl border border-border bg-background px-4"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">
                  Catégorie *
                </label>

                <select
                  name="category_id"
                  value={form.category_id}
                  onChange={handleFieldChange}
                  disabled={submitting}
                  className="w-full h-12 rounded-xl border border-border bg-background px-4"
                >
                  <option value="">
                    Choisir une catégorie
                  </option>

                  {categories.map((category) => (
                    <option
                      key={category.id}
                      value={category.id}
                    >
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">
                  Marque
                </label>

                <input
                  name="brand"
                  value={form.brand}
                  onChange={handleFieldChange}
                  disabled={submitting}
                  className="w-full h-12 rounded-xl border border-border bg-background px-4"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">
                  Fabricant
                </label>

                <input
                  name="manufacturer"
                  value={form.manufacturer}
                  onChange={handleFieldChange}
                  disabled={submitting}
                  className="w-full h-12 rounded-xl border border-border bg-background px-4"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">
                  Référence
                </label>

                <input
                  name="reference"
                  value={form.reference}
                  onChange={handleFieldChange}
                  disabled={submitting}
                  className="w-full h-12 rounded-xl border border-border bg-background px-4"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">
                  SKU
                </label>

                <input
                  name="sku"
                  value={form.sku}
                  onChange={handleFieldChange}
                  disabled={submitting}
                  className="w-full h-12 rounded-xl border border-border bg-background px-4"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-sm font-semibold mb-2">
                  Description courte
                </label>

                <textarea
                  name="short_description"
                  value={form.short_description}
                  onChange={handleFieldChange}
                  disabled={submitting}
                  rows={3}
                  className="w-full rounded-xl border border-border bg-background px-4 py-3"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-sm font-semibold mb-2">
                  Description complète
                </label>

                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleFieldChange}
                  disabled={submitting}
                  rows={7}
                  className="w-full rounded-xl border border-border bg-background px-4 py-3"
                />
              </div>
            </div>
          </section>

          <section className="rounded-3xl border border-border bg-card p-6 sm:p-8">
            <h2 className="font-display font-bold text-xl mb-6">
              Prix et disponibilité
            </h2>

            <div className="grid sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold mb-2">
                  Prix en euros *
                </label>

                <input
                  name="price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.price}
                  onChange={handleFieldChange}
                  disabled={submitting}
                  className="w-full h-12 rounded-xl border border-border bg-background px-4"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">
                  Stock *
                </label>

                <input
                  name="stock"
                  type="number"
                  min="0"
                  step="1"
                  value={form.stock}
                  onChange={handleFieldChange}
                  disabled={submitting}
                  className="w-full h-12 rounded-xl border border-border bg-background px-4"
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-3 gap-4 mt-6">
              <label className="flex items-start gap-3 rounded-2xl border border-border p-4">
                <input
                  name="on_demand"
                  type="checkbox"
                  checked={form.on_demand}
                  onChange={handleFieldChange}
                  disabled={submitting}
                  className="mt-1"
                />

                <span className="text-sm font-semibold">
                  Sur demande
                </span>
              </label>

              <label className="flex items-start gap-3 rounded-2xl border border-border p-4">
                <input
                  name="is_active"
                  type="checkbox"
                  checked={form.is_active}
                  onChange={handleFieldChange}
                  disabled={submitting}
                  className="mt-1"
                />

                <span className="text-sm font-semibold">
                  Produit publié
                </span>
              </label>

              <label className="flex items-start gap-3 rounded-2xl border border-border p-4">
                <input
                  name="is_featured"
                  type="checkbox"
                  checked={form.is_featured}
                  onChange={handleFieldChange}
                  disabled={submitting}
                  className="mt-1"
                />

                <span className="text-sm font-semibold">
                  Produit vedette
                </span>
              </label>
            </div>
          </section>

          {currentImage?.image_url && (
            <section className="rounded-3xl border border-border bg-card p-6 sm:p-8">
              <h2 className="font-display font-bold text-xl mb-5">
                Image actuelle
              </h2>

              <div className="rounded-2xl border border-border bg-white p-5">
                <img
                  src={currentImage.image_url}
                  alt={
                    currentImage.alt_text ||
                    form.name
                  }
                  className="w-full h-72 object-contain"
                />
              </div>
            </section>
          )}

          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
            <Link
              to="/admin/produits"
              className="inline-flex items-center justify-center h-12 px-7 rounded-full border border-border bg-card font-semibold"
            >
              Annuler
            </Link>

            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center justify-center gap-2 h-12 px-8 rounded-full bg-primary text-primary-foreground font-semibold disabled:opacity-60"
            >
              {submitting ? (
                <>
                  <LoaderCircle className="w-5 h-5 animate-spin" />
                  Enregistrement…
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Enregistrer les modifications
                </>
              )}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}