import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  LoaderCircle,
  Plus,
  Save,
  Trash2,
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

function createVariant() {
  return {
    local_id: crypto.randomUUID(),
    id: null,
    name: "",
    price: "",
    stock: "0",
    reference: "",
    sku: "",
    is_active: true,
    display_order: 0,
  };
}

function normalizeVariant(variant, index) {
  return {
    local_id:
      variant.id || crypto.randomUUID(),

    id:
      variant.id || null,

    name:
      variant.name || "",

    price:
      variant.price === null ||
      variant.price === undefined
        ? ""
        : String(variant.price),

    stock:
      variant.stock === null ||
      variant.stock === undefined
        ? "0"
        : String(variant.stock),

    reference:
      variant.reference || "",

    sku:
      variant.sku || "",

    is_active:
      variant.is_active !== false,

    display_order:
      variant.display_order ?? index,
  };
}

export default function AdminProductEdit() {
  const { productId } = useParams();
  const navigate = useNavigate();

  const [form, setForm] =
    useState(initialForm);

  const [categories, setCategories] =
    useState([]);

  const [currentImage, setCurrentImage] =
    useState(null);

  const [variants, setVariants] =
    useState([]);

  const [
    deletedVariantIds,
    setDeletedVariantIds,
  ] = useState([]);

  const [loading, setLoading] =
    useState(true);

  const [submitting, setSubmitting] =
    useState(false);

  const variantsStock = useMemo(
    () =>
      variants.reduce(
        (total, variant) =>
          total +
          Math.max(
            0,
            Number.parseInt(
              variant.stock || "0",
              10
            ) || 0
          ),
        0
      ),
    [variants]
  );

  const activeVariantsCount = useMemo(
    () =>
      variants.filter(
        (variant) => variant.is_active
      ).length,
    [variants]
  );

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
          variantsResult,
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

          supabase
            .from("product_variants")
            .select(`
              id,
              product_id,
              name,
              price,
              stock,
              reference,
              sku,
              is_active,
              display_order
            `)
            .eq("product_id", productId)
            .order("display_order", {
              ascending: true,
            })
            .order("created_at", {
              ascending: true,
            }),
        ]);

        if (categoriesResult.error) {
          throw categoriesResult.error;
        }

        if (productResult.error) {
          throw productResult.error;
        }

        if (variantsResult.error) {
          throw variantsResult.error;
        }

        if (!productResult.data) {
          throw new Error(
            "Le produit demandé est introuvable."
          );
        }

        const product =
          productResult.data;

        const sortedImages =
          Array.isArray(
            product.product_images
          )
            ? [...product.product_images].sort(
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

        setVariants(
          (variantsResult.data || []).map(
            normalizeVariant
          )
        );

        setDeletedVariantIds([]);

        setForm({
          name:
            product.name || "",

          slug:
            product.slug || "",

          category_id:
            product.category_id || "",

          brand:
            product.brand || "",

          manufacturer:
            product.manufacturer || "",

          reference:
            product.reference || "",

          sku:
            product.sku || "",

          short_description:
            product.short_description || "",

          description:
            product.description || "",

          price:
            product.price === null ||
            product.price === undefined
              ? ""
              : String(product.price),

          stock:
            product.stock === null ||
            product.stock === undefined
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

        navigate(
          "/admin/produits",
          {
            replace: true,
          }
        );
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

  const handleFieldChange = (
    event
  ) => {
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

  const handleSlugChange = (
    event
  ) => {
    setForm((currentForm) => ({
      ...currentForm,

      slug: createSlug(
        event.target.value
      ),
    }));
  };

  const addVariant = () => {
    setVariants(
      (currentVariants) => [
        ...currentVariants,

        {
          ...createVariant(),

          display_order:
            currentVariants.length,
        },
      ]
    );
  };

  const updateVariant = (
    localId,
    field,
    value
  ) => {
    setVariants(
      (currentVariants) =>
        currentVariants.map(
          (variant) =>
            variant.local_id === localId
              ? {
                  ...variant,
                  [field]: value,
                }
              : variant
        )
    );
  };

  const removeVariant = (
    variantToRemove
  ) => {
    if (variantToRemove.id) {
      setDeletedVariantIds(
        (currentIds) => [
          ...new Set([
            ...currentIds,
            variantToRemove.id,
          ]),
        ]
      );
    }

    setVariants(
      (currentVariants) =>
        currentVariants
          .filter(
            (variant) =>
              variant.local_id !==
              variantToRemove.local_id
          )
          .map((variant, index) => ({
            ...variant,
            display_order: index,
          }))
    );
  };

  const moveVariant = (
    index,
    direction
  ) => {
    setVariants(
      (currentVariants) => {
        const newIndex =
          direction === "up"
            ? index - 1
            : index + 1;

        if (
          newIndex < 0 ||
          newIndex >=
            currentVariants.length
        ) {
          return currentVariants;
        }

        const reorderedVariants = [
          ...currentVariants,
        ];

        const [movedVariant] =
          reorderedVariants.splice(
            index,
            1
          );

        reorderedVariants.splice(
          newIndex,
          0,
          movedVariant
        );

        return reorderedVariants.map(
          (variant, variantIndex) => ({
            ...variant,

            display_order:
              variantIndex,
          })
        );
      }
    );
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
      Number.isNaN(
        Number(form.price)
      ) ||
      Number(form.price) < 0
    ) {
      return "Le prix général doit être supérieur ou égal à zéro.";
    }

    if (
      form.stock === "" ||
      Number.isNaN(
        Number(form.stock)
      ) ||
      Number(form.stock) < 0 ||
      !Number.isInteger(
        Number(form.stock)
      )
    ) {
      return "Le stock général doit être un nombre entier supérieur ou égal à zéro.";
    }

    for (
      let index = 0;
      index < variants.length;
      index += 1
    ) {
      const variant =
        variants[index];

      const variantNumber =
        index + 1;

      if (!variant.name.trim()) {
        return `Le nom de la variante ${variantNumber} est obligatoire.`;
      }

      if (
        variant.price === "" ||
        Number.isNaN(
          Number(variant.price)
        ) ||
        Number(variant.price) < 0
      ) {
        return `Le prix de la variante « ${variant.name} » doit être supérieur ou égal à zéro.`;
      }

      if (
        variant.stock === "" ||
        Number.isNaN(
          Number(variant.stock)
        ) ||
        Number(variant.stock) < 0 ||
        !Number.isInteger(
          Number(variant.stock)
        )
      ) {
        return `Le stock de la variante « ${variant.name} » doit être un nombre entier supérieur ou égal à zéro.`;
      }
    }

    const normalizedReferences =
      variants
        .map((variant) =>
          variant.reference
            .trim()
            .toLowerCase()
        )
        .filter(Boolean);

    if (
      new Set(
        normalizedReferences
      ).size !==
      normalizedReferences.length
    ) {
      return "Deux variantes possèdent la même référence.";
    }

    const normalizedSkus =
      variants
        .map((variant) =>
          variant.sku
            .trim()
            .toLowerCase()
        )
        .filter(Boolean);

    if (
      new Set(normalizedSkus).size !==
      normalizedSkus.length
    ) {
      return "Deux variantes possèdent le même SKU.";
    }

    return "";
  };

  const handleSubmit = async (
    event
  ) => {
    event.preventDefault();

    const validationError =
      validateForm();

    if (validationError) {
      toast.error(validationError);
      return;
    }

    setSubmitting(true);

    try {
      /*
       * Lorsqu’il existe des variantes,
       * le stock général devient la somme
       * de leurs stocks.
       */
      const calculatedProductStock =
        variants.length > 0
          ? variantsStock
          : Number.parseInt(
              form.stock,
              10
            );

      const {
        error: productError,
      } = await supabase
        .from("products")
        .update({
          category_id:
            form.category_id,

          name:
            form.name.trim(),

          slug:
            createSlug(form.slug),

          brand:
            form.brand.trim() || null,

          manufacturer:
            form.manufacturer.trim() ||
            null,

          reference:
            form.reference.trim() ||
            null,

          sku:
            form.sku.trim() || null,

          short_description:
            form.short_description.trim() ||
            null,

          description:
            form.description.trim() ||
            null,

          price:
            Number(form.price),

          stock:
            calculatedProductStock,

          on_demand:
            form.on_demand,

          is_active:
            form.is_active,

          is_featured:
            form.is_featured,
        })
        .eq("id", productId);

      if (productError) {
        throw productError;
      }

      /*
       * Supprime les variantes retirées
       * depuis l’interface.
       */
      if (
        deletedVariantIds.length > 0
      ) {
        const {
          error: deleteError,
        } = await supabase
          .from("product_variants")
          .delete()
          .in(
            "id",
            deletedVariantIds
          );

        if (deleteError) {
          throw deleteError;
        }
      }

      /*
       * Met à jour les variantes
       * déjà existantes.
       */
      const existingVariants =
        variants.filter(
          (variant) => variant.id
        );

      for (
        const variant
        of existingVariants
      ) {
        const {
          error: variantUpdateError,
        } = await supabase
          .from("product_variants")
          .update({
            name:
              variant.name.trim(),

            price:
              Number(variant.price),

            stock:
              Number.parseInt(
                variant.stock,
                10
              ),

            reference:
              variant.reference.trim() ||
              null,

            sku:
              variant.sku.trim() || null,

            is_active:
              variant.is_active,

            display_order:
              variant.display_order,
          })
          .eq("id", variant.id)
          .eq(
            "product_id",
            productId
          );

        if (variantUpdateError) {
          throw variantUpdateError;
        }
      }

      /*
       * Insère les nouvelles variantes.
       */
      const newVariants =
        variants.filter(
          (variant) => !variant.id
        );

      if (newVariants.length > 0) {
        const {
          error: insertError,
        } = await supabase
          .from("product_variants")
          .insert(
            newVariants.map(
              (variant) => ({
                product_id:
                  productId,

                name:
                  variant.name.trim(),

                price:
                  Number(
                    variant.price
                  ),

                stock:
                  Number.parseInt(
                    variant.stock,
                    10
                  ),

                reference:
                  variant.reference.trim() ||
                  null,

                sku:
                  variant.sku.trim() ||
                  null,

                is_active:
                  variant.is_active,

                display_order:
                  variant.display_order,
              })
            )
          );

        if (insertError) {
          throw insertError;
        }
      }

      toast.success(
        "Produit et variantes modifiés avec succès."
      );

      navigate(
        "/admin/produits"
      );
    } catch (error) {
      console.error(
        "Erreur lors de la modification :",
        error
      );

      let errorMessage =
        error?.message ||
        "Impossible de modifier le produit.";

      const normalizedMessage =
        errorMessage.toLowerCase();

      if (
        normalizedMessage.includes(
          "duplicate key"
        ) ||
        normalizedMessage.includes(
          "unique constraint"
        )
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
        <div className="max-w-6xl mx-auto px-5 sm:px-8 min-h-20 py-4 flex items-center justify-between gap-4">
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

      <main className="max-w-6xl mx-auto px-5 sm:px-8 py-10">
        <div className="mb-9">
          <p className="overline text-primary mb-2">
            Catalogue
          </p>

          <h1 className="font-display font-black text-3xl sm:text-4xl tracking-tight">
            Modifier le produit
          </h1>

          <p className="text-muted-foreground mt-3">
            Modifie le produit et gère ses différentes variantes.
          </p>
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
                  onChange={
                    handleFieldChange
                  }
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
                  onChange={
                    handleSlugChange
                  }
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
                  value={
                    form.category_id
                  }
                  onChange={
                    handleFieldChange
                  }
                  disabled={submitting}
                  className="w-full h-12 rounded-xl border border-border bg-background px-4"
                >
                  <option value="">
                    Choisir une catégorie
                  </option>

                  {categories.map(
                    (category) => (
                      <option
                        key={category.id}
                        value={category.id}
                      >
                        {category.name}
                      </option>
                    )
                  )}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">
                  Marque
                </label>

                <input
                  name="brand"
                  value={form.brand}
                  onChange={
                    handleFieldChange
                  }
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
                  value={
                    form.manufacturer
                  }
                  onChange={
                    handleFieldChange
                  }
                  disabled={submitting}
                  className="w-full h-12 rounded-xl border border-border bg-background px-4"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">
                  Référence générale
                </label>

                <input
                  name="reference"
                  value={
                    form.reference
                  }
                  onChange={
                    handleFieldChange
                  }
                  disabled={submitting}
                  className="w-full h-12 rounded-xl border border-border bg-background px-4"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">
                  SKU général
                </label>

                <input
                  name="sku"
                  value={form.sku}
                  onChange={
                    handleFieldChange
                  }
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
                  value={
                    form.short_description
                  }
                  onChange={
                    handleFieldChange
                  }
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
                  value={
                    form.description
                  }
                  onChange={
                    handleFieldChange
                  }
                  disabled={submitting}
                  rows={7}
                  className="w-full rounded-xl border border-border bg-background px-4 py-3"
                />
              </div>
            </div>
          </section>

          <section className="rounded-3xl border border-border bg-card p-6 sm:p-8">
            <h2 className="font-display font-bold text-xl">
              Prix et disponibilité générale
            </h2>

            <p className="text-sm text-muted-foreground mt-2 mb-6">
              Ces informations sont utilisées lorsque le produit ne possède aucune variante.
            </p>

            <div className="grid sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold mb-2">
                  Prix général en euros *
                </label>

                <input
                  name="price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.price}
                  onChange={
                    handleFieldChange
                  }
                  disabled={submitting}
                  className="w-full h-12 rounded-xl border border-border bg-background px-4"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">
                  Stock général
                </label>

                <input
                  name="stock"
                  type="number"
                  min="0"
                  step="1"
                  value={
                    variants.length > 0
                      ? String(
                          variantsStock
                        )
                      : form.stock
                  }
                  onChange={
                    handleFieldChange
                  }
                  disabled={
                    submitting ||
                    variants.length > 0
                  }
                  className="w-full h-12 rounded-xl border border-border bg-background px-4 disabled:opacity-60"
                />

                {variants.length > 0 && (
                  <p className="text-xs text-muted-foreground mt-2">
                    Calculé automatiquement avec la somme des stocks des variantes.
                  </p>
                )}
              </div>
            </div>

            <div className="grid sm:grid-cols-3 gap-4 mt-6">
              <label className="flex items-start gap-3 rounded-2xl border border-border p-4">
                <input
                  name="on_demand"
                  type="checkbox"
                  checked={
                    form.on_demand
                  }
                  onChange={
                    handleFieldChange
                  }
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
                  checked={
                    form.is_active
                  }
                  onChange={
                    handleFieldChange
                  }
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
                  checked={
                    form.is_featured
                  }
                  onChange={
                    handleFieldChange
                  }
                  disabled={submitting}
                  className="mt-1"
                />

                <span className="text-sm font-semibold">
                  Produit vedette
                </span>
              </label>
            </div>
          </section>

          <section className="rounded-3xl border border-border bg-card p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-5 mb-7">
              <div>
                <h2 className="font-display font-bold text-xl">
                  Variantes du produit
                </h2>

                <p className="text-sm text-muted-foreground mt-2">
                  Chaque variante possède son propre prix, stock, nom, SKU et référence.
                </p>
              </div>

              <button
                type="button"
                onClick={addVariant}
                disabled={submitting}
                className="inline-flex items-center justify-center gap-2 h-11 px-5 rounded-full bg-primary text-primary-foreground font-semibold disabled:opacity-60"
              >
                <Plus className="w-4 h-4" />
                Ajouter une variante
              </button>
            </div>

            {variants.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border p-8 text-center">
                <p className="font-semibold">
                  Aucune variante
                </p>

                <p className="text-sm text-muted-foreground mt-2">
                  Le produit utilise actuellement son prix et son stock généraux.
                </p>

                <button
                  type="button"
                  onClick={addVariant}
                  disabled={submitting}
                  className="inline-flex items-center justify-center gap-2 h-11 px-5 rounded-full border border-border mt-5 font-semibold hover:bg-secondary"
                >
                  <Plus className="w-4 h-4" />
                  Créer la première variante
                </button>
              </div>
            ) : (
              <div className="space-y-5">
                {variants.map(
                  (variant, index) => (
                    <article
                      key={
                        variant.local_id
                      }
                      className="rounded-2xl border border-border bg-secondary/20 p-5 sm:p-6"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
                        <div>
                          <p className="font-display font-bold text-lg">
                            Variante{" "}
                            {index + 1}
                          </p>

                          <p className="text-sm text-muted-foreground mt-1">
                            {variant.name ||
                              "Nouvelle variante"}
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            title="Monter la variante"
                            onClick={() =>
                              moveVariant(
                                index,
                                "up"
                              )
                            }
                            disabled={
                              submitting ||
                              index === 0
                            }
                            className="w-10 h-10 rounded-full border border-border bg-card grid place-items-center hover:bg-secondary disabled:opacity-40"
                          >
                            <ArrowUp className="w-4 h-4" />
                          </button>

                          <button
                            type="button"
                            title="Descendre la variante"
                            onClick={() =>
                              moveVariant(
                                index,
                                "down"
                              )
                            }
                            disabled={
                              submitting ||
                              index ===
                                variants.length -
                                  1
                            }
                            className="w-10 h-10 rounded-full border border-border bg-card grid place-items-center hover:bg-secondary disabled:opacity-40"
                          >
                            <ArrowDown className="w-4 h-4" />
                          </button>

                          <button
                            type="button"
                            title="Supprimer la variante"
                            onClick={() =>
                              removeVariant(
                                variant
                              )
                            }
                            disabled={submitting}
                            className="w-10 h-10 rounded-full border border-destructive/30 bg-destructive/10 text-destructive grid place-items-center hover:bg-destructive/20 disabled:opacity-40"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        <div className="sm:col-span-2 lg:col-span-1">
                          <label className="block text-sm font-semibold mb-2">
                            Nom de la variante *
                          </label>

                          <input
                            value={
                              variant.name
                            }
                            onChange={(
                              event
                            ) =>
                              updateVariant(
                                variant.local_id,
                                "name",
                                event.target
                                  .value
                              )
                            }
                            disabled={
                              submitting
                            }
                            placeholder="Ex. 3 kW"
                            className="w-full h-12 rounded-xl border border-border bg-background px-4"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold mb-2">
                            Prix en euros *
                          </label>

                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={
                              variant.price
                            }
                            onChange={(
                              event
                            ) =>
                              updateVariant(
                                variant.local_id,
                                "price",
                                event.target
                                  .value
                              )
                            }
                            disabled={
                              submitting
                            }
                            placeholder="0.00"
                            className="w-full h-12 rounded-xl border border-border bg-background px-4"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold mb-2">
                            Stock *
                          </label>

                          <input
                            type="number"
                            min="0"
                            step="1"
                            value={
                              variant.stock
                            }
                            onChange={(
                              event
                            ) =>
                              updateVariant(
                                variant.local_id,
                                "stock",
                                event.target
                                  .value
                              )
                            }
                            disabled={
                              submitting
                            }
                            className="w-full h-12 rounded-xl border border-border bg-background px-4"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold mb-2">
                            Référence
                          </label>

                          <input
                            value={
                              variant.reference
                            }
                            onChange={(
                              event
                            ) =>
                              updateVariant(
                                variant.local_id,
                                "reference",
                                event.target
                                  .value
                              )
                            }
                            disabled={
                              submitting
                            }
                            placeholder="Ex. 3000TLM-V3"
                            className="w-full h-12 rounded-xl border border-border bg-background px-4"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold mb-2">
                            SKU
                          </label>

                          <input
                            value={
                              variant.sku
                            }
                            onChange={(
                              event
                            ) =>
                              updateVariant(
                                variant.local_id,
                                "sku",
                                event.target
                                  .value
                              )
                            }
                            disabled={
                              submitting
                            }
                            placeholder="Ex. ZCS-3KW"
                            className="w-full h-12 rounded-xl border border-border bg-background px-4"
                          />
                        </div>

                        <div className="flex items-end">
                          <label className="w-full h-12 flex items-center gap-3 rounded-xl border border-border bg-background px-4">
                            <input
                              type="checkbox"
                              checked={
                                variant.is_active
                              }
                              onChange={(
                                event
                              ) =>
                                updateVariant(
                                  variant.local_id,
                                  "is_active",
                                  event.target
                                    .checked
                                )
                              }
                              disabled={
                                submitting
                              }
                            />

                            <span className="text-sm font-semibold">
                              Variante active
                            </span>
                          </label>
                        </div>
                      </div>
                    </article>
                  )
                )}

                <div className="rounded-2xl border border-border bg-card p-5 flex flex-wrap justify-between gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Nombre de variantes
                    </p>

                    <p className="font-display font-bold text-xl mt-1">
                      {variants.length}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground">
                      Variantes actives
                    </p>

                    <p className="font-display font-bold text-xl mt-1">
                      {activeVariantsCount}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground">
                      Stock total
                    </p>

                    <p className="font-display font-bold text-xl mt-1">
                      {variantsStock}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </section>

          {currentImage?.image_url && (
            <section className="rounded-3xl border border-border bg-card p-6 sm:p-8">
              <h2 className="font-display font-bold text-xl mb-5">
                Image actuelle
              </h2>

              <div className="rounded-2xl border border-border bg-white p-5">
                <img
                  src={
                    currentImage.image_url
                  }
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
                  Enregistrer le produit
                </>
              )}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}