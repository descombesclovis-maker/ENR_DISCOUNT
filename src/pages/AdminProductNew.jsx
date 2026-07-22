import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  ImagePlus,
  LoaderCircle,
  PackagePlus,
  Plus,
  Save,
  Trash2,
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
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function sanitizeFileName(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9.]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function createLocalId() {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random()
    .toString(36)
    .slice(2)}`;
}

function createVariant(
  displayOrder = 0
) {
  return {
    local_id: createLocalId(),
    name: "",
    price: "",
    stock: "0",
    reference: "",
    sku: "",
    is_active: true,
    display_order: displayOrder,
    image_file: null,
    image_preview: "",
  };
}

function validateImageFile(file) {
  if (!file) {
    return "Aucun fichier sélectionné.";
  }

  if (
    !file.type.startsWith("image/")
  ) {
    return "Le fichier sélectionné doit être une image.";
  }

  const maximumSize =
    5 * 1024 * 1024;

  if (file.size > maximumSize) {
    return "Chaque image doit peser 5 Mo maximum.";
  }

  return "";
}

async function uploadImage({
  file,
  folder,
}) {
  const safeFileName =
    sanitizeFileName(file.name) ||
    `image-${Date.now()}.jpg`;

  const uniqueFileName =
    `${Date.now()}-${createLocalId()}-${safeFileName}`;

  const storagePath =
    `${folder}/${uniqueFileName}`;

  const {
    error: uploadError,
  } = await supabase.storage
    .from("produits")
    .upload(
      storagePath,
      file,
      {
        cacheControl: "3600",
        upsert: false,
        contentType: file.type,
      }
    );

  if (uploadError) {
    throw uploadError;
  }

  const {
    data: publicUrlData,
  } = supabase.storage
    .from("produits")
    .getPublicUrl(storagePath);

  const publicUrl =
    publicUrlData?.publicUrl;

  if (!publicUrl) {
    throw new Error(
      "Impossible de générer l’URL publique de l’image."
    );
  }

  return {
    storagePath,
    publicUrl,
  };
}

export default function AdminProductNew() {
  const navigate = useNavigate();

  const [
    form,
    setForm,
  ] = useState(initialForm);

  const [
    categories,
    setCategories,
  ] = useState([]);

  const [
    productImages,
    setProductImages,
  ] = useState([]);

  const [
    variants,
    setVariants,
  ] = useState([]);

  const [
    loadingCategories,
    setLoadingCategories,
  ] = useState(true);

  const [
    submitting,
    setSubmitting,
  ] = useState(false);

  const [
    slugManuallyChanged,
    setSlugManuallyChanged,
  ] = useState(false);

  /*
   * Cette référence conserve toutes
   * les URL temporaires créées avec
   * URL.createObjectURL().
   *
   * Elle permet de nettoyer les aperçus
   * lors de la fermeture de la page sans
   * dépendre de productImages ou variants.
   */
  const previewUrlsRef =
    useRef(new Set());

  const createPreviewUrl = (
    file
  ) => {
    const previewUrl =
      URL.createObjectURL(file);

    previewUrlsRef.current.add(
      previewUrl
    );

    return previewUrl;
  };

  const revokePreviewUrl = (
    previewUrl
  ) => {
    if (!previewUrl) {
      return;
    }

    URL.revokeObjectURL(
      previewUrl
    );

    previewUrlsRef.current.delete(
      previewUrl
    );
  };

  useEffect(() => {
    document.title =
      "Ajouter un produit | ENR Discount";

    let componentIsMounted =
      true;

    const loadCategories =
      async () => {
        setLoadingCategories(
          true
        );

        try {
          const {
            data,
            error,
          } = await supabase
            .from("categories")
            .select(`
              id,
              name,
              slug,
              is_active,
              display_order
            `)
            .eq(
              "is_active",
              true
            )
            .order(
              "display_order",
              {
                ascending: true,
              }
            )
            .order("name", {
              ascending: true,
            });

          if (error) {
            throw error;
          }

          if (
            componentIsMounted
          ) {
            setCategories(
              data || []
            );
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
          if (
            componentIsMounted
          ) {
            setLoadingCategories(
              false
            );
          }
        }
      };

    loadCategories();

    return () => {
      componentIsMounted =
        false;
    };
  }, []);

  /*
   * Nettoyage de toutes les URL temporaires
   * uniquement lorsque la page est quittée.
   *
   * Cette version ne dépend pas des états
   * productImages et variants, donc elle
   * supprime l’avertissement ESLint de Vercel.
   */
  useEffect(() => {
    const previewUrls =
      previewUrlsRef.current;

    return () => {
      previewUrls.forEach(
        (previewUrl) => {
          URL.revokeObjectURL(
            previewUrl
          );
        }
      );

      previewUrls.clear();
    };
  }, []);

  const selectedCategory =
    useMemo(
      () =>
        categories.find(
          (category) =>
            category.id ===
            form.category_id
        ) || null,
      [
        categories,
        form.category_id,
      ]
    );

  const variantsStock =
    useMemo(
      () =>
        variants.reduce(
          (
            total,
            variant
          ) =>
            total +
            Math.max(
              0,
              Number.parseInt(
                variant.stock ||
                  "0",
                10
              ) || 0
            ),
          0
        ),
      [variants]
    );

  const activeVariantsCount =
    useMemo(
      () =>
        variants.filter(
          (variant) =>
            variant.is_active
        ).length,
      [variants]
    );

  const handleFieldChange = (
    event
  ) => {
    const {
      name,
      value,
      type,
      checked,
    } = event.target;

    const nextValue =
      type === "checkbox"
        ? checked
        : value;

    setForm(
      (currentForm) => {
        const updatedForm = {
          ...currentForm,
          [name]: nextValue,
        };

        if (
          name === "name" &&
          !slugManuallyChanged
        ) {
          updatedForm.slug =
            createSlug(value);
        }

        return updatedForm;
      }
    );
  };

  const handleSlugChange = (
    event
  ) => {
    setSlugManuallyChanged(
      true
    );

    setForm(
      (currentForm) => ({
        ...currentForm,

        slug: createSlug(
          event.target.value
        ),
      })
    );
  };

  const handleProductImagesChange =
    (event) => {
      const selectedFiles =
        Array.from(
          event.target.files ||
            []
        );

      if (
        selectedFiles.length ===
        0
      ) {
        return;
      }

      const invalidFile =
        selectedFiles.find(
          (file) =>
            validateImageFile(
              file
            )
        );

      if (invalidFile) {
        toast.error(
          validateImageFile(
            invalidFile
          )
        );

        event.target.value =
          "";

        return;
      }

      setProductImages(
        (currentImages) => {
          const newImages =
            selectedFiles.map(
              (
                file,
                index
              ) => ({
                local_id:
                  createLocalId(),

                file,

                preview:
                  createPreviewUrl(
                    file
                  ),

                is_primary:
                  currentImages.length ===
                    0 &&
                  index === 0,
              })
            );

          return [
            ...currentImages,
            ...newImages,
          ];
        }
      );

      event.target.value = "";
    };

  const removeProductImage = (
    imageToRemove
  ) => {
    revokePreviewUrl(
      imageToRemove.preview
    );

    setProductImages(
      (currentImages) => {
        const remainingImages =
          currentImages.filter(
            (image) =>
              image.local_id !==
              imageToRemove.local_id
          );

        const primaryStillExists =
          remainingImages.some(
            (image) =>
              image.is_primary
          );

        if (
          remainingImages.length >
            0 &&
          !primaryStillExists
        ) {
          return remainingImages.map(
            (
              image,
              index
            ) => ({
              ...image,

              is_primary:
                index === 0,
            })
          );
        }

        return remainingImages;
      }
    );
  };

  const setPrimaryImage = (
    localId
  ) => {
    setProductImages(
      (currentImages) =>
        currentImages.map(
          (image) => ({
            ...image,

            is_primary:
              image.local_id ===
              localId,
          })
        )
    );
  };

  const addVariant = () => {
    setVariants(
      (currentVariants) => [
        ...currentVariants,

        createVariant(
          currentVariants.length
        ),
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
            variant.local_id ===
            localId
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
    revokePreviewUrl(
      variantToRemove.image_preview
    );

    setVariants(
      (currentVariants) =>
        currentVariants
          .filter(
            (variant) =>
              variant.local_id !==
              variantToRemove.local_id
          )
          .map(
            (
              variant,
              index
            ) => ({
              ...variant,

              display_order:
                index,
            })
          )
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

        const [
          movedVariant,
        ] =
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
          (
            variant,
            variantIndex
          ) => ({
            ...variant,

            display_order:
              variantIndex,
          })
        );
      }
    );
  };

  const handleVariantImageChange =
    (
      localId,
      event
    ) => {
      const selectedFile =
        event.target.files?.[0];

      if (!selectedFile) {
        return;
      }

      const validationError =
        validateImageFile(
          selectedFile
        );

      if (validationError) {
        toast.error(
          validationError
        );

        event.target.value =
          "";

        return;
      }

      setVariants(
        (currentVariants) =>
          currentVariants.map(
            (variant) => {
              if (
                variant.local_id !==
                localId
              ) {
                return variant;
              }

              revokePreviewUrl(
                variant.image_preview
              );

              return {
                ...variant,

                image_file:
                  selectedFile,

                image_preview:
                  createPreviewUrl(
                    selectedFile
                  ),
              };
            }
          )
      );

      event.target.value = "";
    };

  const removeVariantImage = (
    localId
  ) => {
    setVariants(
      (currentVariants) =>
        currentVariants.map(
          (variant) => {
            if (
              variant.local_id !==
              localId
            ) {
              return variant;
            }

            revokePreviewUrl(
              variant.image_preview
            );

            return {
              ...variant,

              image_file:
                null,

              image_preview:
                "",
            };
          }
        )
    );
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

    if (
      productImages.length ===
      0
    ) {
      return "Ajoute au moins une photo au produit.";
    }

    if (
      !productImages.some(
        (image) =>
          image.is_primary
      )
    ) {
      return "Choisis une photo principale.";
    }

    for (
      let index = 0;
      index <
      variants.length;
      index += 1
    ) {
      const variant =
        variants[index];

      const variantNumber =
        index + 1;

      if (
        !variant.name.trim()
      ) {
        return `Le nom de la variante ${variantNumber} est obligatoire.`;
      }

      if (
        variant.price === "" ||
        Number.isNaN(
          Number(
            variant.price
          )
        ) ||
        Number(
          variant.price
        ) < 0
      ) {
        return `Le prix de la variante « ${variant.name} » doit être supérieur ou égal à zéro.`;
      }

      if (
        variant.stock === "" ||
        Number.isNaN(
          Number(
            variant.stock
          )
        ) ||
        Number(
          variant.stock
        ) < 0 ||
        !Number.isInteger(
          Number(
            variant.stock
          )
        )
      ) {
        return `Le stock de la variante « ${variant.name} » doit être un nombre entier supérieur ou égal à zéro.`;
      }
    }

    const normalizedReferences =
      variants
        .map(
          (variant) =>
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
        .map(
          (variant) =>
            variant.sku
              .trim()
              .toLowerCase()
        )
        .filter(Boolean);

    if (
      new Set(
        normalizedSkus
      ).size !==
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
      toast.error(
        validationError
      );

      return;
    }

    setSubmitting(true);

    let createdProductId =
      null;

    const uploadedStoragePaths =
      [];

    try {
      const calculatedStock =
        variants.length > 0
          ? variantsStock
          : Number.parseInt(
              form.stock,
              10
            );

      const productPayload = {
        category_id:
          form.category_id,

        name:
          form.name.trim(),

        slug:
          createSlug(
            form.slug
          ),

        brand:
          form.brand.trim() ||
          null,

        manufacturer:
          form.manufacturer.trim() ||
          null,

        reference:
          form.reference.trim() ||
          null,

        sku:
          form.sku.trim() ||
          null,

        short_description:
          form.short_description.trim() ||
          null,

        description:
          form.description.trim() ||
          null,

        price:
          Number(form.price),

        stock:
          calculatedStock,

        on_demand:
          form.on_demand,

        is_active:
          form.is_active,

        is_featured:
          form.is_featured,

        specifications: [],
      };

      const {
        data: createdProduct,
        error: productError,
      } = await supabase
        .from("products")
        .insert(
          productPayload
        )
        .select(`
          id,
          name,
          slug
        `)
        .single();

      if (productError) {
        throw productError;
      }

      createdProductId =
        createdProduct.id;

      const productImageRows =
        [];

      for (
        let index = 0;
        index <
        productImages.length;
        index += 1
      ) {
        const image =
          productImages[index];

        const uploadedImage =
          await uploadImage({
            file: image.file,

            folder:
              createdProduct.slug,
          });

        uploadedStoragePaths.push(
          uploadedImage.storagePath
        );

        productImageRows.push({
          product_id:
            createdProduct.id,

          image_url:
            uploadedImage.publicUrl,

          alt_text:
            `${createdProduct.name} - Photo ${index + 1}`,

          is_primary:
            image.is_primary,

          display_order:
            index,
        });
      }

      const {
        error:
          imagesDatabaseError,
      } = await supabase
        .from("product_images")
        .insert(
          productImageRows
        );

      if (
        imagesDatabaseError
      ) {
        throw imagesDatabaseError;
      }

      if (
        variants.length > 0
      ) {
        const variantRows =
          [];

        for (
          const variant of variants
        ) {
          let variantImageUrl =
            null;

          if (
            variant.image_file
          ) {
            const uploadedVariantImage =
              await uploadImage({
                file:
                  variant.image_file,

                folder:
                  `${createdProduct.slug}/variantes`,
              });

            uploadedStoragePaths.push(
              uploadedVariantImage.storagePath
            );

            variantImageUrl =
              uploadedVariantImage.publicUrl;
          }

          variantRows.push({
            product_id:
              createdProduct.id,

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

            image_url:
              variantImageUrl,
          });
        }

        const {
          error: variantsError,
        } = await supabase
          .from(
            "product_variants"
          )
          .insert(
            variantRows
          );

        if (variantsError) {
          throw variantsError;
        }
      }

      toast.success(
        "Produit ajouté avec succès.",
        {
          description:
            `${createdProduct.name} a été enregistré avec ses photos et ses variantes.`,
        }
      );

      navigate(
        "/admin/produits",
        {
          replace: true,
        }
      );
    } catch (error) {
      console.error(
        "Erreur lors de la création du produit :",
        error
      );

      if (
        uploadedStoragePaths.length >
        0
      ) {
        const {
          error:
            storageCleanupError,
        } = await supabase.storage
          .from("produits")
          .remove(
            uploadedStoragePaths
          );

        if (
          storageCleanupError
        ) {
          console.error(
            "Impossible de supprimer les images après l’échec :",
            storageCleanupError
          );
        }
      }

      if (createdProductId) {
        const {
          error:
            productCleanupError,
        } = await supabase
          .from("products")
          .delete()
          .eq(
            "id",
            createdProductId
          );

        if (
          productCleanupError
        ) {
          console.error(
            "Impossible de supprimer le produit incomplet :",
            productCleanupError
          );
        }
      }

      let errorMessage =
        error?.message ||
        "Impossible d’ajouter le produit.";

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

      toast.error(
        errorMessage
      );
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
            className="inline-flex items-center gap-2 h-10 px-5 rounded-full border border-border font-semibold text-sm hover:bg-secondary transition-colors"
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
            Ajouter un produit
          </h1>

          <p className="text-muted-foreground mt-2">
            Ajoute les informations, les photos et les différentes variantes du produit.
          </p>
        </div>

        <form
          onSubmit={
            handleSubmit
          }
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
                <label className="block text-sm font-semibold mb-2">
                  Nom du produit *
                </label>

                <input
                  name="name"
                  value={form.name}
                  onChange={
                    handleFieldChange
                  }
                  disabled={
                    submitting
                  }
                  placeholder="Exemple : Onduleur ZCS AZZURRO"
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
                  disabled={
                    submitting
                  }
                  placeholder="onduleur-zcs-azzurro"
                  className="w-full h-12 rounded-xl border border-border bg-background px-4"
                />

                <p className="text-xs text-muted-foreground mt-2">
                  Adresse : /produits/
                  {form.slug ||
                    "nom-du-produit"}
                </p>
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
                  disabled={
                    submitting ||
                    loadingCategories
                  }
                  className="w-full h-12 rounded-xl border border-border bg-background px-4"
                >
                  <option value="">
                    {loadingCategories
                      ? "Chargement…"
                      : "Choisir une catégorie"}
                  </option>

                  {categories.map(
                    (category) => (
                      <option
                        key={
                          category.id
                        }
                        value={
                          category.id
                        }
                      >
                        {
                          category.name
                        }
                      </option>
                    )
                  )}
                </select>

                {selectedCategory && (
                  <p className="text-xs text-primary mt-2">
                    Catégorie sélectionnée :{" "}
                    {
                      selectedCategory.name
                    }
                  </p>
                )}
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
                  disabled={
                    submitting
                  }
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
                  disabled={
                    submitting
                  }
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
                  disabled={
                    submitting
                  }
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
                  disabled={
                    submitting
                  }
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
                  disabled={
                    submitting
                  }
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
                  disabled={
                    submitting
                  }
                  rows={9}
                  placeholder={
                    "Présentation détaillée du produit.\n\nPuissance : 500 W\nPoids : 21 kg\nGarantie : 25 ans"
                  }
                  className="w-full rounded-xl border border-border bg-background px-4 py-3"
                />

                <p className="text-xs text-muted-foreground mt-2">
                  Les lignes écrites sous la forme « Caractéristique : Valeur » seront automatiquement affichées dans le tableau technique.
                </p>
              </div>
            </div>
          </section>

          <section className="rounded-3xl border border-border bg-card p-6 sm:p-8">
            <h2 className="font-display font-bold text-xl">
              Prix et disponibilité générale
            </h2>

            <p className="text-sm text-muted-foreground mt-2 mb-6">
              Ces valeurs sont utilisées lorsque le produit ne possède aucune variante.
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
                  disabled={
                    submitting
                  }
                  className="w-full h-12 rounded-xl border border-border bg-background px-4"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">
                  Stock général *
                </label>

                <input
                  name="stock"
                  type="number"
                  min="0"
                  step="1"
                  value={
                    variants.length >
                    0
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
                    variants.length >
                      0
                  }
                  className="w-full h-12 rounded-xl border border-border bg-background px-4 disabled:opacity-60"
                />

                {variants.length >
                  0 && (
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
                  disabled={
                    submitting
                  }
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
                  disabled={
                    submitting
                  }
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
                  disabled={
                    submitting
                  }
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
                  Photos du produit
                </h2>

                <p className="text-sm text-muted-foreground mt-2">
                  Sélectionne plusieurs photos et choisis celle qui sera affichée en premier.
                </p>
              </div>

              <label className="inline-flex items-center justify-center gap-2 h-11 px-5 rounded-full bg-primary text-primary-foreground font-semibold cursor-pointer">
                <ImagePlus className="w-4 h-4" />

                Ajouter des photos

                <input
                  type="file"
                  multiple
                  accept="image/png,image/jpeg,image/webp"
                  onChange={
                    handleProductImagesChange
                  }
                  disabled={
                    submitting
                  }
                  className="hidden"
                />
              </label>
            </div>

            {productImages.length ===
            0 ? (
              <label className="min-h-56 rounded-2xl border-2 border-dashed border-border bg-secondary/20 flex flex-col items-center justify-center text-center px-6 cursor-pointer hover:border-primary/60">
                <ImagePlus className="w-10 h-10 text-primary mb-4" />

                <span className="font-semibold">
                  Choisir les photos
                </span>

                <span className="text-sm text-muted-foreground mt-1">
                  Tu peux sélectionner plusieurs fichiers simultanément.
                </span>

                <input
                  type="file"
                  multiple
                  accept="image/png,image/jpeg,image/webp"
                  onChange={
                    handleProductImagesChange
                  }
                  disabled={
                    submitting
                  }
                  className="hidden"
                />
              </label>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {productImages.map(
                  (
                    image,
                    index
                  ) => (
                    <article
                      key={
                        image.local_id
                      }
                      className={`rounded-2xl border p-4 ${
                        image.is_primary
                          ? "border-primary bg-primary/5"
                          : "border-border"
                      }`}
                    >
                      <div className="relative rounded-xl bg-white overflow-hidden">
                        <img
                          src={
                            image.preview
                          }
                          alt={`Aperçu ${index + 1}`}
                          className="w-full h-48 object-contain"
                        />

                        <button
                          type="button"
                          onClick={() =>
                            removeProductImage(
                              image
                            )
                          }
                          disabled={
                            submitting
                          }
                          className="absolute top-2 right-2 w-9 h-9 rounded-full border border-border bg-white grid place-items-center text-destructive"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      <p className="text-xs text-muted-foreground truncate mt-3">
                        {
                          image.file.name
                        }
                      </p>

                      <button
                        type="button"
                        onClick={() =>
                          setPrimaryImage(
                            image.local_id
                          )
                        }
                        disabled={
                          submitting
                        }
                        className={`w-full h-10 rounded-full mt-3 text-sm font-semibold ${
                          image.is_primary
                            ? "bg-primary text-primary-foreground"
                            : "border border-border hover:bg-secondary"
                        }`}
                      >
                        {image.is_primary
                          ? "Photo principale"
                          : "Définir comme principale"}
                      </button>
                    </article>
                  )
                )}
              </div>
            )}
          </section>

          <section className="rounded-3xl border border-border bg-card p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-5 mb-7">
              <div>
                <h2 className="font-display font-bold text-xl">
                  Variantes du produit
                </h2>

                <p className="text-sm text-muted-foreground mt-2">
                  Chaque variante possède son prix, son stock, sa référence, son SKU et éventuellement sa propre photo.
                </p>
              </div>

              <button
                type="button"
                onClick={
                  addVariant
                }
                disabled={
                  submitting
                }
                className="inline-flex items-center justify-center gap-2 h-11 px-5 rounded-full bg-primary text-primary-foreground font-semibold"
              >
                <Plus className="w-4 h-4" />
                Ajouter une variante
              </button>
            </div>

            {variants.length ===
            0 ? (
              <div className="rounded-2xl border border-dashed border-border p-8 text-center">
                <p className="font-semibold">
                  Aucune variante
                </p>

                <p className="text-sm text-muted-foreground mt-2">
                  Le produit utilisera son prix et son stock généraux.
                </p>

                <button
                  type="button"
                  onClick={
                    addVariant
                  }
                  className="inline-flex items-center justify-center gap-2 h-11 px-5 rounded-full border border-border mt-5 font-semibold"
                >
                  <Plus className="w-4 h-4" />
                  Créer la première variante
                </button>
              </div>
            ) : (
              <div className="space-y-5">
                {variants.map(
                  (
                    variant,
                    index
                  ) => (
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
                            className="w-10 h-10 rounded-full border border-border bg-card grid place-items-center disabled:opacity-40"
                          >
                            <ArrowUp className="w-4 h-4" />
                          </button>

                          <button
                            type="button"
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
                            className="w-10 h-10 rounded-full border border-border bg-card grid place-items-center disabled:opacity-40"
                          >
                            <ArrowDown className="w-4 h-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              removeVariant(
                                variant
                              )
                            }
                            disabled={
                              submitting
                            }
                            className="w-10 h-10 rounded-full border border-destructive/30 bg-destructive/10 text-destructive grid place-items-center"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        <div>
                          <label className="block text-sm font-semibold mb-2">
                            Nom *
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
                            className="w-full h-12 rounded-xl border border-border bg-background px-4"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold mb-2">
                            Prix *
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

                      <div className="mt-6">
                        <p className="text-sm font-semibold mb-3">
                          Photo de la variante
                        </p>

                        {variant.image_preview ? (
                          <div className="flex flex-col sm:flex-row sm:items-center gap-5 rounded-2xl border border-border bg-white p-4">
                            <img
                              src={
                                variant.image_preview
                              }
                              alt={`Variante ${variant.name}`}
                              className="w-full sm:w-40 h-40 object-contain"
                            />

                            <div>
                              <p className="text-sm font-semibold">
                                {
                                  variant.image_file
                                    ?.name
                                }
                              </p>

                              <button
                                type="button"
                                onClick={() =>
                                  removeVariantImage(
                                    variant.local_id
                                  )
                                }
                                disabled={
                                  submitting
                                }
                                className="inline-flex items-center gap-2 h-10 px-4 rounded-full border border-destructive/30 text-destructive mt-4"
                              >
                                <Trash2 className="w-4 h-4" />
                                Supprimer la photo
                              </button>
                            </div>
                          </div>
                        ) : (
                          <label className="inline-flex items-center justify-center gap-2 h-11 px-5 rounded-full border border-border bg-card cursor-pointer hover:bg-secondary">
                            <ImagePlus className="w-4 h-4" />

                            Choisir une photo

                            <input
                              type="file"
                              accept="image/png,image/jpeg,image/webp"
                              onChange={(
                                event
                              ) =>
                                handleVariantImageChange(
                                  variant.local_id,
                                  event
                                )
                              }
                              disabled={
                                submitting
                              }
                              className="hidden"
                            />
                          </label>
                        )}
                      </div>
                    </article>
                  )
                )}

                <div className="rounded-2xl border border-border bg-card p-5 flex flex-wrap justify-between gap-6">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Variantes
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
                      {
                        activeVariantsCount
                      }
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

          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
            <Link
              to="/admin/produits"
              className="inline-flex items-center justify-center h-12 px-7 rounded-full border border-border bg-card font-semibold"
            >
              Annuler
            </Link>

            <button
              type="submit"
              disabled={
                submitting
              }
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