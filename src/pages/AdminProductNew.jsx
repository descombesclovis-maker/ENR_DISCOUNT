import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  ArrowLeft,
  ImagePlus,
  LoaderCircle,
  PackagePlus,
  Save,
  X,
} from "lucide-react";

import {
  Link,
  useNavigate,
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

function sanitizeFileName(value) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9.]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function AdminProductNew() {
  const navigate = useNavigate();

  const [form, setForm] = useState(initialForm);
  const [categories, setCategories] = useState([]);

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] =
    useState("");

  const [loadingCategories, setLoadingCategories] =
    useState(true);

  const [submitting, setSubmitting] =
    useState(false);

  const [slugManuallyChanged, setSlugManuallyChanged] =
    useState(false);

  useEffect(() => {
    document.title =
      "Ajouter un produit | ENR Discount";

    let componentIsMounted = true;

    const loadCategories = async () => {
      setLoadingCategories(true);

      try {
        const { data, error } = await supabase
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
          });

        if (error) {
          throw error;
        }

        if (componentIsMounted) {
          setCategories(data || []);
        }
      } catch (error) {
        console.error(
          "Erreur lors du chargement des catégories :",
          error
        );

        toast.error(
          error?.message ||
            "Impossible de charger les catégories."
        );
      } finally {
        if (componentIsMounted) {
          setLoadingCategories(false);
        }
      }
    };

    loadCategories();

    return () => {
      componentIsMounted = false;
    };
  }, []);

  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  const selectedCategory = useMemo(
    () =>
      categories.find(
        (category) =>
          category.id === form.category_id
      ) || null,
    [categories, form.category_id]
  );

  const handleFieldChange = (event) => {
    const {
      name,
      value,
      type,
      checked,
    } = event.target;

    const nextValue =
      type === "checkbox" ? checked : value;

    setForm((currentForm) => {
      const updatedForm = {
        ...currentForm,
        [name]: nextValue,
      };

      if (
        name === "name" &&
        !slugManuallyChanged
      ) {
        updatedForm.slug = createSlug(value);
      }

      return updatedForm;
    });
  };

  const handleSlugChange = (event) => {
    setSlugManuallyChanged(true);

    setForm((currentForm) => ({
      ...currentForm,
      slug: createSlug(event.target.value),
    }));
  };

  const handleImageChange = (event) => {
    const selectedFile =
      event.target.files?.[0];

    if (!selectedFile) {
      return;
    }

    if (!selectedFile.type.startsWith("image/")) {
      toast.error(
        "Le fichier sélectionné doit être une image."
      );
      event.target.value = "";
      return;
    }

    const maximumSize = 5 * 1024 * 1024;

    if (selectedFile.size > maximumSize) {
      toast.error(
        "L’image ne doit pas dépasser 5 Mo."
      );
      event.target.value = "";
      return;
    }

    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }

    setImageFile(selectedFile);
    setImagePreview(
      URL.createObjectURL(selectedFile)
    );
  };

  const removeImage = () => {
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }

    setImageFile(null);
    setImagePreview("");
  };

  const validateForm = () => {
    if (!form.name.trim()) {
      return "Le nom du produit est obligatoire.";
    }

    if (!form.slug.trim()) {
      return "Le slug du produit est obligatoire.";
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

    if (!imageFile) {
      return "Ajoute une image principale.";
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

    let createdProductId = null;
    let uploadedStoragePath = null;

    try {
      const productPayload = {
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
          form.short_description.trim() || null,

        description:
          form.description.trim() || null,

        price: Number(form.price),
        stock: Number.parseInt(form.stock, 10),

        on_demand: form.on_demand,
        is_active: form.is_active,
        is_featured: form.is_featured,

        specifications: [],
      };

      const {
        data: createdProduct,
        error: productError,
      } = await supabase
        .from("products")
        .insert(productPayload)
        .select(`
          id,
          name,
          slug
        `)
        .single();

      if (productError) {
        throw productError;
      }

      createdProductId = createdProduct.id;

      const originalExtension =
        imageFile.name
          .split(".")
          .pop()
          ?.toLowerCase() || "jpg";

      const safeOriginalName =
        sanitizeFileName(imageFile.name);

      const uniqueFileName =
        `${Date.now()}-${safeOriginalName || `image.${originalExtension}`}`;

      uploadedStoragePath =
        `${createdProduct.slug}/${uniqueFileName}`;

      const {
        error: uploadError,
      } = await supabase.storage
        .from("produits")
        .upload(
          uploadedStoragePath,
          imageFile,
          {
            cacheControl: "3600",
            upsert: false,
            contentType: imageFile.type,
          }
        );

      if (uploadError) {
        throw uploadError;
      }

      const {
        data: publicUrlData,
      } = supabase.storage
        .from("produits")
        .getPublicUrl(uploadedStoragePath);

      const publicUrl =
        publicUrlData?.publicUrl;

      if (!publicUrl) {
        throw new Error(
          "Impossible de générer l’URL publique de l’image."
        );
      }

      const {
        error: imageDatabaseError,
      } = await supabase
        .from("product_images")
        .insert({
          product_id: createdProduct.id,
          image_url: publicUrl,
          alt_text: createdProduct.name,
          is_primary: true,
          display_order: 1,
        });

      if (imageDatabaseError) {
        throw imageDatabaseError;
      }

      toast.success(
        "Produit ajouté avec succès.",
        {
          description:
            `${createdProduct.name} est maintenant enregistré.`,
        }
      );

      navigate("/admin", {
        replace: true,
      });
    } catch (error) {
      console.error(
        "Erreur lors de la création du produit :",
        error
      );

      if (uploadedStoragePath) {
        const { error: storageCleanupError } =
          await supabase.storage
            .from("produits")
            .remove([uploadedStoragePath]);

        if (storageCleanupError) {
          console.error(
            "Impossible de supprimer l’image après l’échec :",
            storageCleanupError
          );
        }
      }

      if (createdProductId) {
        const { error: productCleanupError } =
          await supabase
            .from("products")
            .delete()
            .eq("id", createdProductId);

        if (productCleanupError) {
          console.error(
            "Impossible de supprimer le produit incomplet :",
            productCleanupError
          );
        }
      }

      let errorMessage =
        error?.message ||
        "Impossible d’ajouter le produit.";

      if (
        errorMessage
          .toLowerCase()
          .includes("duplicate key")
      ) {
        errorMessage =
          "Un produit possède déjà ce slug, cette référence ou ce SKU.";
      }

      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="min-h-screen bg-secondary/30"
      data-testid="admin-product-new"
    >
      <header className="border-b border-border bg-card">
        <div className="max-w-5xl mx-auto px-5 sm:px-8 h-20 flex items-center justify-between">
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
            className="inline-flex items-center gap-2 h-10 px-5 rounded-full border border-border font-semibold text-sm hover:bg-secondary transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Tableau de bord
          </Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-5 sm:px-8 py-10">
        <div className="mb-9">
          <p className="overline text-primary mb-2">
            Catalogue
          </p>

          <h1 className="font-display font-black text-3xl sm:text-4xl tracking-tight">
            Ajouter un produit
          </h1>

          <p className="text-muted-foreground mt-2">
            Remplis les informations puis enregistre le produit.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-7"
        >
          <section className="rounded-3xl border border-border bg-card p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-7">
              <div className="w-11 h-11 rounded-xl bg-primary/10 text-primary grid place-items-center">
                <PackagePlus className="w-5 h-5" />
              </div>

              <div>
                <h2 className="font-display font-bold text-xl">
                  Informations principales
                </h2>

                <p className="text-sm text-muted-foreground">
                  Nom, catégorie, référence et description.
                </p>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-5">
              <div className="sm:col-span-2">
                <label
                  htmlFor="name"
                  className="block text-sm font-semibold mb-2"
                >
                  Nom du produit *
                </label>

                <input
                  id="name"
                  name="name"
                  type="text"
                  value={form.name}
                  onChange={handleFieldChange}
                  disabled={submitting}
                  placeholder="Exemple : Onduleur ZCS AZZURRO"
                  className="w-full h-12 rounded-xl border border-border bg-background px-4 outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                />
              </div>

              <div>
                <label
                  htmlFor="slug"
                  className="block text-sm font-semibold mb-2"
                >
                  Slug *
                </label>

                <input
                  id="slug"
                  name="slug"
                  type="text"
                  value={form.slug}
                  onChange={handleSlugChange}
                  disabled={submitting}
                  placeholder="onduleur-zcs-azzurro"
                  className="w-full h-12 rounded-xl border border-border bg-background px-4 outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                />

                <p className="text-xs text-muted-foreground mt-2">
                  Adresse : /produits/{form.slug || "nom-du-produit"}
                </p>
              </div>

              <div>
                <label
                  htmlFor="category_id"
                  className="block text-sm font-semibold mb-2"
                >
                  Catégorie *
                </label>

                <select
                  id="category_id"
                  name="category_id"
                  value={form.category_id}
                  onChange={handleFieldChange}
                  disabled={
                    submitting ||
                    loadingCategories
                  }
                  className="w-full h-12 rounded-xl border border-border bg-background px-4 outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                >
                  <option value="">
                    {loadingCategories
                      ? "Chargement…"
                      : "Choisir une catégorie"}
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

                {selectedCategory && (
                  <p className="text-xs text-primary mt-2">
                    Catégorie sélectionnée :{" "}
                    {selectedCategory.name}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="brand"
                  className="block text-sm font-semibold mb-2"
                >
                  Marque
                </label>

                <input
                  id="brand"
                  name="brand"
                  type="text"
                  value={form.brand}
                  onChange={handleFieldChange}
                  disabled={submitting}
                  placeholder="ZCS"
                  className="w-full h-12 rounded-xl border border-border bg-background px-4 outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                />
              </div>

              <div>
                <label
                  htmlFor="manufacturer"
                  className="block text-sm font-semibold mb-2"
                >
                  Fabricant
                </label>

                <input
                  id="manufacturer"
                  name="manufacturer"
                  type="text"
                  value={form.manufacturer}
                  onChange={handleFieldChange}
                  disabled={submitting}
                  placeholder="Zucchetti Centro Sistemi"
                  className="w-full h-12 rounded-xl border border-border bg-background px-4 outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                />
              </div>

              <div>
                <label
                  htmlFor="reference"
                  className="block text-sm font-semibold mb-2"
                >
                  Référence
                </label>

                <input
                  id="reference"
                  name="reference"
                  type="text"
                  value={form.reference}
                  onChange={handleFieldChange}
                  disabled={submitting}
                  placeholder="1PH TLM-V3"
                  className="w-full h-12 rounded-xl border border-border bg-background px-4 outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                />
              </div>

              <div>
                <label
                  htmlFor="sku"
                  className="block text-sm font-semibold mb-2"
                >
                  SKU
                </label>

                <input
                  id="sku"
                  name="sku"
                  type="text"
                  value={form.sku}
                  onChange={handleFieldChange}
                  disabled={submitting}
                  placeholder="1PH-TLM-V3"
                  className="w-full h-12 rounded-xl border border-border bg-background px-4 outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                />
              </div>

              <div className="sm:col-span-2">
                <label
                  htmlFor="short_description"
                  className="block text-sm font-semibold mb-2"
                >
                  Description courte
                </label>

                <textarea
                  id="short_description"
                  name="short_description"
                  value={form.short_description}
                  onChange={handleFieldChange}
                  disabled={submitting}
                  rows={3}
                  placeholder="Résumé affiché dans le catalogue."
                  className="w-full rounded-xl border border-border bg-background px-4 py-3 outline-none resize-y focus:ring-2 focus:ring-primary/30 focus:border-primary"
                />
              </div>

              <div className="sm:col-span-2">
                <label
                  htmlFor="description"
                  className="block text-sm font-semibold mb-2"
                >
                  Description complète
                </label>

                <textarea
                  id="description"
                  name="description"
                  value={form.description}
                  onChange={handleFieldChange}
                  disabled={submitting}
                  rows={6}
                  placeholder="Présentation détaillée du produit."
                  className="w-full rounded-xl border border-border bg-background px-4 py-3 outline-none resize-y focus:ring-2 focus:ring-primary/30 focus:border-primary"
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
                <label
                  htmlFor="price"
                  className="block text-sm font-semibold mb-2"
                >
                  Prix en euros *
                </label>

                <input
                  id="price"
                  name="price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.price}
                  onChange={handleFieldChange}
                  disabled={submitting}
                  placeholder="1299.00"
                  className="w-full h-12 rounded-xl border border-border bg-background px-4 outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                />
              </div>

              <div>
                <label
                  htmlFor="stock"
                  className="block text-sm font-semibold mb-2"
                >
                  Quantité en stock *
                </label>

                <input
                  id="stock"
                  name="stock"
                  type="number"
                  min="0"
                  step="1"
                  value={form.stock}
                  onChange={handleFieldChange}
                  disabled={submitting}
                  className="w-full h-12 rounded-xl border border-border bg-background px-4 outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-3 gap-4 mt-6">
              <label className="flex items-start gap-3 rounded-2xl border border-border p-4 cursor-pointer">
                <input
                  name="on_demand"
                  type="checkbox"
                  checked={form.on_demand}
                  onChange={handleFieldChange}
                  disabled={submitting}
                  className="mt-1"
                />

                <span>
                  <span className="block text-sm font-semibold">
                    Sur demande
                  </span>

                  <span className="block text-xs text-muted-foreground mt-1">
                    Prix ou disponibilité sur demande.
                  </span>
                </span>
              </label>

              <label className="flex items-start gap-3 rounded-2xl border border-border p-4 cursor-pointer">
                <input
                  name="is_active"
                  type="checkbox"
                  checked={form.is_active}
                  onChange={handleFieldChange}
                  disabled={submitting}
                  className="mt-1"
                />

                <span>
                  <span className="block text-sm font-semibold">
                    Produit publié
                  </span>

                  <span className="block text-xs text-muted-foreground mt-1">
                    Visible dans le catalogue.
                  </span>
                </span>
              </label>

              <label className="flex items-start gap-3 rounded-2xl border border-border p-4 cursor-pointer">
                <input
                  name="is_featured"
                  type="checkbox"
                  checked={form.is_featured}
                  onChange={handleFieldChange}
                  disabled={submitting}
                  className="mt-1"
                />

                <span>
                  <span className="block text-sm font-semibold">
                    Produit vedette
                  </span>

                  <span className="block text-xs text-muted-foreground mt-1">
                    Affiché sur la page d’accueil.
                  </span>
                </span>
              </label>
            </div>
          </section>

          <section className="rounded-3xl border border-border bg-card p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-11 h-11 rounded-xl bg-primary/10 text-primary grid place-items-center">
                <ImagePlus className="w-5 h-5" />
              </div>

              <div>
                <h2 className="font-display font-bold text-xl">
                  Image principale
                </h2>

                <p className="text-sm text-muted-foreground">
                  JPG, PNG ou WebP, 5 Mo maximum.
                </p>
              </div>
            </div>

            {!imagePreview ? (
              <label className="min-h-56 rounded-2xl border-2 border-dashed border-border bg-secondary/20 flex flex-col items-center justify-center text-center px-6 cursor-pointer hover:border-primary/60 transition-colors">
                <ImagePlus className="w-10 h-10 text-primary mb-4" />

                <span className="font-semibold">
                  Choisir une image
                </span>

                <span className="text-sm text-muted-foreground mt-1">
                  Clique ici pour sélectionner le fichier.
                </span>

                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={handleImageChange}
                  disabled={submitting}
                  className="hidden"
                />
              </label>
            ) : (
              <div className="relative rounded-2xl border border-border bg-white p-5">
                <button
                  type="button"
                  onClick={removeImage}
                  disabled={submitting}
                  className="absolute top-3 right-3 w-10 h-10 rounded-full border border-border bg-white grid place-items-center hover:bg-secondary disabled:opacity-50"
                  aria-label="Supprimer l’image"
                >
                  <X className="w-4 h-4" />
                </button>

                <img
                  src={imagePreview}
                  alt="Aperçu du produit"
                  className="w-full h-72 object-contain"
                />

                <p className="text-sm text-muted-foreground text-center mt-4">
                  {imageFile?.name}
                </p>
              </div>
            )}
          </section>

          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
            <Link
              to="/admin"
              className="inline-flex items-center justify-center h-12 px-7 rounded-full border border-border bg-card font-semibold hover:bg-secondary transition-colors"
            >
              Annuler
            </Link>

            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center justify-center gap-2 h-12 px-8 rounded-full bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
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