import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { motion } from "framer-motion";

import {
  ArrowLeft,
  ImagePlus,
  LoaderCircle,
  PackagePlus,
  Plus,
  Save,
  Trash2,
} from "lucide-react";

import {
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";

import { supabase } from "../lib/supabase";
import { parseTechnicalSpecifications } from "./TechnicalSpecsTable";

const emptyProduct = {
  name: "",
  slug: "",
  brand: "",
  manufacturer: "",
  reference: "",
  sku: "",
  category_id: "",
  short_description: "",
  description: "",
  price: "",
  sale_price: "",
  sale_start: "",
  sale_end: "",
  is_on_sale: false,
  stock: "0",
  product_condition: "new_packaged",
  on_demand: false,
  is_active: true,
  is_featured: false,
  weight_kg: "",
  length_cm: "",
  width_cm: "",
  height_cm: "",
  requires_pallet: false,
};

const emptyVariant = {
  name: "",
  reference: "",
  sku: "",
  price: "",
  stock: "0",
  is_active: true,
};

const emptyCustomOption = {
  name: "",
  description: "",
  price_delta: "",
  is_default_selected: false,
  is_active: true,
};

const PRODUCT_IMAGE_BUCKET = "produits";
const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;
const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
];

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

function sanitizeFileName(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9.]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function validateImageFile(file) {
  if (!file) {
    return "Aucun fichier sélectionné.";
  }

  if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
    return `${file.name} : format non accepté (JPG, PNG, WEBP ou AVIF uniquement).`;
  }

  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    return `${file.name} : l’image dépasse 5 Mo.`;
  }

  return "";
}

function getStoragePathFromPublicUrl(publicUrl) {
  if (!publicUrl) {
    return "";
  }

  const marker = `/storage/v1/object/public/${PRODUCT_IMAGE_BUCKET}/`;
  const markerIndex = publicUrl.indexOf(marker);

  if (markerIndex === -1) {
    return "";
  }

  const encodedPath = publicUrl
    .slice(markerIndex + marker.length)
    .split("?")[0];

  try {
    return decodeURIComponent(encodedPath);
  } catch {
    return encodedPath;
  }
}

async function uploadProductImage({
  file,
  folder,
}) {
  const safeFileName =
    sanitizeFileName(file.name) ||
    `photo-${Date.now()}.jpg`;

  const storagePath = `${folder}/${Date.now()}-${createLocalId()}-${safeFileName}`;

  const { error: uploadError } =
    await supabase.storage
      .from(PRODUCT_IMAGE_BUCKET)
      .upload(storagePath, file, {
        cacheControl: "3600",
        contentType: file.type,
        upsert: false,
      });

  if (uploadError) {
    throw uploadError;
  }

  const { data } = supabase.storage
    .from(PRODUCT_IMAGE_BUCKET)
    .getPublicUrl(storagePath);

  if (!data?.publicUrl) {
    throw new Error(
      "Impossible de générer l’adresse publique de la photo."
    );
  }

  return {
    publicUrl: data.publicUrl,
    storagePath,
  };
}

function slugify(value) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function nullableNumber(value) {
  return value === "" ||
    value === null ||
    value === undefined
    ? null
    : Number(value);
}

function restoreTechnicalDescription(
  description,
  specifications
) {
  const descriptionText = String(
    description || ""
  ).trim();

  if (
    parseTechnicalSpecifications(
      descriptionText
    ).specifications.length > 0
  ) {
    return descriptionText;
  }

  const specificationLines = Array.isArray(specifications)
    ? specifications
        .map((specification) => {
          const label = String(
            specification?.label || ""
          ).trim();
          const value = String(
            specification?.value || ""
          ).trim();

          return label && value
            ? `${label} : ${value}`
            : "";
        })
        .filter(Boolean)
    : [];

  return [
    descriptionText,
    specificationLines.join("\n"),
  ]
    .filter(Boolean)
    .join("\n\n");
}

function toDateInput(value) {
  return value
    ? String(value).slice(0, 16)
    : "";
}

function Field({
  label,
  children,
  className = "",
}) {
  return (
    <label className={className}>
      <span className="mb-2 block text-xs font-black uppercase tracking-[0.12em] text-slate-500">
        {label}
      </span>

      {children}
    </label>
  );
}

function Toggle({
  checked,
  onChange,
  title,
  description,
}) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <span>
        <span className="block font-black text-slate-900">
          {title}
        </span>

        <span className="mt-1 block text-xs text-slate-500">
          {description}
        </span>
      </span>

      <input
        type="checkbox"
        checked={checked}
        onChange={(event) =>
          onChange(event.target.checked)
        }
        className="h-5 w-5 shrink-0 accent-[#ff5a00]"
      />
    </label>
  );
}

export default function AdminOutletProductForm({
  mode,
}) {
  const isEditing = mode === "edit";
  const { productId } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] =
    useState(emptyProduct);

  const [categories, setCategories] =
    useState([]);

  const [variants, setVariants] =
    useState([]);

  const [
    customOptions,
    setCustomOptions,
  ] = useState([]);

  const [images, setImages] =
    useState([]);

  const [deletedImages, setDeletedImages] =
    useState([]);

  const [loading, setLoading] =
    useState(isEditing);

  const [saving, setSaving] =
    useState(false);

  const [errorMessage, setErrorMessage] =
    useState("");

  const previewUrlsRef = useRef(new Set());

  function createPreviewUrl(file) {
    const previewUrl = URL.createObjectURL(file);
    previewUrlsRef.current.add(previewUrl);
    return previewUrl;
  }

  function revokePreviewUrl(previewUrl) {
    if (
      !previewUrl ||
      !previewUrlsRef.current.has(previewUrl)
    ) {
      return;
    }

    URL.revokeObjectURL(previewUrl);
    previewUrlsRef.current.delete(previewUrl);
  }

  useEffect(() => {
    const previewUrls = previewUrlsRef.current;

    return () => {
      previewUrls.forEach((previewUrl) => {
        URL.revokeObjectURL(previewUrl);
      });
      previewUrls.clear();
    };
  }, []);

  useEffect(() => {
    let active = true;

    async function load() {
      setLoading(true);
      setErrorMessage("");

      const categoriesResult =
        await supabase
          .from("categories")
          .select("id,name")
          .order("name");

      if (!active) {
        return;
      }

      setCategories(
        categoriesResult.data || []
      );

      if (categoriesResult.error) {
        setErrorMessage(
          categoriesResult.error.message
        );
        setLoading(false);
        return;
      }

      if (!isEditing) {
        setLoading(false);
        return;
      }

      const [
        productResult,
        variantsResult,
        imagesResult,
        customOptionsResult,
      ] = await Promise.all([
        supabase
          .from("products")
          .select("*")
          .eq("id", productId)
          .single(),

        supabase
          .from("product_variants")
          .select("*")
          .eq("product_id", productId)
          .order("created_at", {
            ascending: true,
          }),

        supabase
          .from("product_images")
          .select("*")
          .eq("product_id", productId)
          .order("display_order", {
            ascending: true,
          }),

        supabase
          .from("product_custom_options")
          .select("*")
          .eq(
            "product_id",
            productId
          )
          .order("display_order", {
            ascending: true,
          })
          .order("created_at", {
            ascending: true,
          }),
      ]);

      if (!active) {
        return;
      }

      const pageLoadError =
        productResult.error ||
        variantsResult.error ||
        imagesResult.error ||
        customOptionsResult.error;

      if (pageLoadError) {
        setErrorMessage(
          pageLoadError.message
        );
      } else {
        const value = productResult.data;

        setProduct({
          ...emptyProduct,
          ...value,

          category_id:
            value.category_id || "",

          short_description:
            value.short_description || "",

          description:
            restoreTechnicalDescription(
              value.description,
              value.specifications
            ),

          price:
            value.price ?? "",

          sale_price:
            value.sale_price ?? "",

          stock:
            value.stock ?? 0,

          weight_kg:
            value.weight_kg ?? "",

          length_cm:
            value.length_cm ?? "",

          width_cm:
            value.width_cm ?? "",

          height_cm:
            value.height_cm ?? "",

          sale_start:
            toDateInput(value.sale_start),

          sale_end:
            toDateInput(value.sale_end),
        });

        setVariants(
          variantsResult.data || []
        );

        setCustomOptions(
          (customOptionsResult.data || []).map(
            (option) => ({
              ...option,

              description:
                option.description || "",

              price_delta:
                option.price_delta ?? "",
            })
          )
        );

        setImages(
          (imagesResult.data || []).map(
            (image) => ({
              ...image,

              file: null,

              preview_url:
                image.image_url || "",

              image_url:
                image.image_url || "",

              alt_text:
                image.alt_text || "",
            })
          )
        );

        setDeletedImages([]);
      }

      setLoading(false);
    }

    load();

    return () => {
      active = false;
    };
  }, [isEditing, productId]);

  const totalVariantStock = useMemo(
    () =>
      variants.reduce(
        (total, variant) =>
          total +
          Number(variant.stock || 0),
        0
      ),
    [variants]
  );

  function changeProduct(name, value) {
    setProduct((current) => ({
      ...current,
      [name]: value,
    }));
  }

  function changeName(value) {
    setProduct((current) => ({
      ...current,
      name: value,

      slug:
        !isEditing ||
        current.slug ===
          slugify(current.name)
          ? slugify(value)
          : current.slug,
    }));
  }

  function addVariant() {
    setVariants((current) => [
      ...current,

      {
        ...emptyVariant,
        local_id: createLocalId(),
      },
    ]);
  }

  function updateVariant(
    index,
    name,
    value
  ) {
    setVariants((current) =>
      current.map(
        (variant, variantIndex) =>
          variantIndex === index
            ? {
                ...variant,
                [name]: value,
              }
            : variant
      )
    );
  }

  function removeVariant(index) {
    setVariants((current) =>
      current.filter(
        (_, variantIndex) =>
          variantIndex !== index
      )
    );
  }

  function addCustomOption() {
    setCustomOptions((current) => [
      ...current,
      {
        ...emptyCustomOption,
        local_id: createLocalId(),
      },
    ]);
  }

  function updateCustomOption(
    index,
    name,
    value
  ) {
    setCustomOptions((current) =>
      current.map(
        (option, optionIndex) =>
          optionIndex === index
            ? {
                ...option,
                [name]: value,
              }
            : option
      )
    );
  }

  function removeCustomOption(index) {
    setCustomOptions((current) =>
      current.filter(
        (_, optionIndex) =>
          optionIndex !== index
      )
    );
  }

  function handleImageSelection(event) {
    const selectedFiles = Array.from(
      event.target.files || []
    );

    if (!selectedFiles.length) {
      return;
    }

    const validationErrors = [];
    const selectedImages = [];

    selectedFiles.forEach((file) => {
      const validationError =
        validateImageFile(file);

      if (validationError) {
        validationErrors.push(validationError);
        return;
      }

      selectedImages.push({
        local_id: createLocalId(),
        file,
        preview_url: createPreviewUrl(file),
        image_url: "",
        alt_text: "",
        is_primary: false,
      });
    });

    if (selectedImages.length) {
      setImages((current) => {
        const hasPrimaryImage = current.some(
          (image) => image.is_primary
        );

        return [
          ...current,
          ...selectedImages.map((image, index) => ({
            ...image,
            is_primary:
              !hasPrimaryImage && index === 0,
          })),
        ];
      });
    }

    if (validationErrors.length) {
      setErrorMessage(validationErrors.join(" "));
    } else {
      setErrorMessage("");
    }

    event.target.value = "";
  }

  function updateImage(
    index,
    name,
    value
  ) {
    setImages((current) =>
      current.map(
        (image, imageIndex) => {
          if (
            name === "is_primary" &&
            value
          ) {
            return {
              ...image,
              is_primary:
                imageIndex === index,
            };
          }

          return imageIndex === index
            ? {
                ...image,
                [name]: value,
              }
            : image;
        }
      )
    );
  }

  function removeImage(index) {
    const imageToRemove = images[index];

    if (!imageToRemove) {
      return;
    }

    revokePreviewUrl(imageToRemove.preview_url);

    if (imageToRemove.id) {
      setDeletedImages((current) => [
        ...current,
        imageToRemove,
      ]);
    }

    setImages((current) => {
      const next = current.filter(
        (_, imageIndex) =>
          imageIndex !== index
      );

      if (
        next.length &&
        !next.some(
          (image) => image.is_primary
        )
      ) {
        next[0].is_primary = true;
      }

      return next;
    });
  }

  async function saveProduct(event) {
    event.preventDefault();

    setSaving(true);
    setErrorMessage("");

    const payload = {
      name:
        product.name.trim(),

      slug:
        (
          product.slug ||
          slugify(product.name)
        ).trim(),

      brand:
        product.brand?.trim() || null,

      manufacturer:
        product.manufacturer?.trim() ||
        null,

      reference:
        product.reference?.trim() ||
        null,

      sku:
        product.sku?.trim() || null,

      category_id:
        product.category_id || null,

      short_description:
        product.short_description?.trim() ||
        null,

      description:
        product.description?.trim() ||
        null,

      specifications: [],

      price:
        Number(product.price || 0),

      sale_price:
        nullableNumber(
          product.sale_price
        ),

      sale_start:
        product.sale_start || null,

      sale_end:
        product.sale_end || null,

      is_on_sale:
        Boolean(product.is_on_sale),

      stock:
        Math.max(
          0,
          Number(product.stock || 0)
        ),

      product_condition:
        product.product_condition ||
        "new_packaged",

      on_demand:
        Boolean(product.on_demand),

      is_active:
        Boolean(product.is_active),

      is_featured:
        Boolean(product.is_featured),

      weight_kg:
        nullableNumber(
          product.weight_kg
        ),

      length_cm:
        nullableNumber(
          product.length_cm
        ),

      width_cm:
        nullableNumber(
          product.width_cm
        ),

      height_cm:
        nullableNumber(
          product.height_cm
        ),

      requires_pallet:
        Boolean(
          product.requires_pallet
        ),
    };

    const uploadedStoragePaths = [];
    let createdProductId = null;
    let uploadedImagesCommitted = false;

    try {
      const validCustomOptions =
        customOptions.filter(
          (option) =>
            option.name?.trim()
        );

      if (
        validCustomOptions.some(
          (option) =>
            !Number.isFinite(
              Number(option.price_delta)
            ) ||
            Number(option.price_delta) < 0
        )
      ) {
        throw new Error(
          "Chaque option doit avoir un supplément de prix valide, positif ou nul."
        );
      }

      const productResult = isEditing
        ? await supabase
            .from("products")
            .update(payload)
            .eq("id", productId)
            .select("id")
            .single()
        : await supabase
            .from("products")
            .insert(payload)
            .select("id")
            .single();

      if (productResult.error) {
        throw productResult.error;
      }

      const savedProductId =
        productResult.data.id;

      if (!isEditing) {
        createdProductId = savedProductId;
      }

      const validVariants =
        variants.filter((variant) =>
          variant.name?.trim()
        );

      const validImages =
        images.filter(
          (image) =>
            image.file ||
            image.image_url?.trim()
        );

      const preparedImages = [];

      for (
        let index = 0;
        index < validImages.length;
        index += 1
      ) {
        const image = validImages[index];
        let imageUrl =
          image.image_url?.trim() || "";

        if (image.file) {
          const uploadedImage =
            await uploadProductImage({
              file: image.file,
              folder: `${payload.slug}/${savedProductId}`,
            });

          uploadedStoragePaths.push(
            uploadedImage.storagePath
          );
          imageUrl = uploadedImage.publicUrl;
        }

        preparedImages.push({
          ...image,
          image_url: imageUrl,
          display_order: index,
        });
      }

      const deleteVariants =
        await supabase
          .from("product_variants")
          .delete()
          .eq(
            "product_id",
            savedProductId
          );

      if (deleteVariants.error) {
        throw deleteVariants.error;
      }

      if (validVariants.length) {
        const variantsResult =
          await supabase
            .from("product_variants")
            .insert(
              validVariants.map(
                (variant) => ({
                  product_id:
                    savedProductId,

                  name:
                    variant.name.trim(),

                  reference:
                    variant.reference?.trim() ||
                    null,

                  sku:
                    variant.sku?.trim() ||
                    null,

                  price:
                    nullableNumber(
                      variant.price
                    ),

                  stock:
                    Math.max(
                      0,
                      Number(
                        variant.stock || 0
                      )
                    ),

                  is_active:
                    variant.is_active !==
                    false,
                })
              )
            );

        if (variantsResult.error) {
          throw variantsResult.error;
        }
      }

      const deleteCustomOptionsResult =
        await supabase
          .from("product_custom_options")
          .delete()
          .eq(
            "product_id",
            savedProductId
          );

      if (deleteCustomOptionsResult.error) {
        throw deleteCustomOptionsResult.error;
      }

      if (validCustomOptions.length) {
        const customOptionsResult =
          await supabase
            .from("product_custom_options")
            .insert(
              validCustomOptions.map(
                (option, index) => ({
                  product_id:
                    savedProductId,

                  name:
                    option.name.trim(),

                  description:
                    option.description?.trim() ||
                    null,

                  price_delta: Number(
                    option.price_delta || 0
                  ),

                  is_default_selected:
                    Boolean(
                      option.is_default_selected
                    ),

                  is_active: Boolean(
                    option.is_active
                  ),

                  display_order: index,
                })
              )
            );

        if (customOptionsResult.error) {
          throw customOptionsResult.error;
        }
      }

      const resetPrimaryImages =
        await supabase
          .from("product_images")
          .update({ is_primary: false })
          .eq(
            "product_id",
            savedProductId
          );

      if (resetPrimaryImages.error) {
        throw resetPrimaryImages.error;
      }

      const hasPrimaryImage =
        preparedImages.some(
          (image) => image.is_primary
        );

      for (
        let index = 0;
        index < preparedImages.length;
        index += 1
      ) {
        const image = preparedImages[index];
        const imagePayload = {
          product_id: savedProductId,
          image_url: image.image_url,
          alt_text:
            image.alt_text?.trim() ||
            product.name.trim(),
          is_primary:
            Boolean(image.is_primary) ||
            (!hasPrimaryImage && index === 0),
          display_order: index,
        };

        if (image.id) {
          const imageUpdateResult =
            await supabase
              .from("product_images")
              .update(imagePayload)
              .eq("id", image.id)
              .eq(
                "product_id",
                savedProductId
              )
              .select("id")
              .maybeSingle();

          if (imageUpdateResult.error) {
            throw imageUpdateResult.error;
          }

          if (!imageUpdateResult.data) {
            throw new Error(
              "La photo n’a pas pu être modifiée. Vérifiez les autorisations administrateur."
            );
          }
        } else {
          const imageInsertResult =
            await supabase
              .from("product_images")
              .insert(imagePayload)
              .select("id")
              .single();

          if (imageInsertResult.error) {
            throw imageInsertResult.error;
          }
        }
      }

      uploadedImagesCommitted = true;

      const deletedImageIds =
        deletedImages
          .map((image) => image.id)
          .filter(Boolean);

      if (deletedImageIds.length) {
        const deleteImagesResult =
          await supabase
            .from("product_images")
            .delete()
            .in("id", deletedImageIds)
            .select("id");

        if (deleteImagesResult.error) {
          throw deleteImagesResult.error;
        }

        if (
          (deleteImagesResult.data || []).length !==
          deletedImageIds.length
        ) {
          throw new Error(
            "Certaines photos n’ont pas pu être supprimées. Vérifiez les autorisations administrateur."
          );
        }
      }

      const obsoleteStoragePaths =
        deletedImages
          .map((image) =>
            getStoragePathFromPublicUrl(
              image.image_url
            )
          )
          .filter(Boolean);

      if (obsoleteStoragePaths.length) {
        const { error: storageDeleteError } =
          await supabase.storage
            .from(PRODUCT_IMAGE_BUCKET)
            .remove(obsoleteStoragePaths);

        if (storageDeleteError) {
          console.warn(
            "Certaines anciennes photos n’ont pas pu être supprimées du stockage :",
            storageDeleteError
          );
        }
      }

      previewUrlsRef.current.forEach(
        (previewUrl) => {
          URL.revokeObjectURL(previewUrl);
        }
      );
      previewUrlsRef.current.clear();

      navigate(
        "/admin/produits",
        {
          replace: true,
        }
      );
    } catch (error) {
      console.error(
        "Erreur lors de l’enregistrement du produit :",
        error
      );

      if (
        uploadedStoragePaths.length &&
        !uploadedImagesCommitted
      ) {
        const { error: cleanupError } =
          await supabase.storage
            .from(PRODUCT_IMAGE_BUCKET)
            .remove(uploadedStoragePaths);

        if (cleanupError) {
          console.error(
            "Impossible de nettoyer les photos après l’échec :",
            cleanupError
          );
        }
      }

      if (createdProductId) {
        const { error: cleanupProductError } =
          await supabase
            .from("products")
            .delete()
            .eq("id", createdProductId);

        if (cleanupProductError) {
          console.error(
            "Impossible de supprimer le produit incomplet :",
            cleanupProductError
          );
        }
      }

      const message =
        error?.message ||
        "Impossible d’enregistrer le produit.";

      setErrorMessage(
        message.toLowerCase().includes(
          "row-level security"
        )
          ? "Accès refusé par les règles de sécurité Supabase. Exécutez le correctif RLS QEH OUTLET, puis réessayez."
          : message
      );
    } finally {
      setSaving(false);
    }
  }

  const inputClass =
    "min-h-12 w-full rounded-xl border border-slate-200 bg-white px-4 font-semibold text-slate-900 outline-none transition focus:border-[#ff5a00] focus:ring-4 focus:ring-[#ff5a00]/10";

  if (loading) {
    return (
      <div className="grid min-h-[70vh] place-items-center">
        <LoaderCircle className="h-9 w-9 animate-spin text-[#ff5a00]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 sm:p-6 xl:p-8">
      <form
        onSubmit={saveProduct}
        className="mx-auto max-w-[1450px]"
      >
        <motion.header
          initial={{
            opacity: 0,
            y: 15,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          className="relative overflow-hidden rounded-[30px] bg-[#050b16] p-6 text-white sm:p-8"
        >
          <div className="absolute -right-20 -top-28 h-72 w-72 rounded-full bg-[#ff5a00]/25 blur-3xl" />

          <div className="relative flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
            <div>
              <Link
                to="/admin/produits"
                className="inline-flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-white"
              >
                <ArrowLeft className="h-4 w-4" />
                Retour aux produits
              </Link>

              <p className="mt-6 text-xs font-black uppercase tracking-[0.2em] text-[#ff7a2f]">
                QEH OUTLET
              </p>

              <h1 className="mt-2 font-display text-3xl font-black sm:text-4xl">
                {isEditing
                  ? "Modifier le produit"
                  : "Ajouter un produit"}
              </h1>

              <p className="mt-3 text-slate-300">
                Identité, prix, stock,
                transport, images et
                variantes depuis un seul
                écran.
              </p>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#ff5a00] px-7 font-black text-white shadow-[0_12px_35px_rgba(255,90,0,.28)] disabled:opacity-60"
            >
              {saving ? (
                <LoaderCircle className="h-5 w-5 animate-spin" />
              ) : (
                <Save className="h-5 w-5" />
              )}

              {saving
                ? "Enregistrement…"
                : "Enregistrer le produit"}
            </button>
          </div>
        </motion.header>

        {errorMessage ? (
          <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-4 font-bold text-red-700">
            {errorMessage}
          </div>
        ) : null}

        <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1.35fr)_minmax(330px,.65fr)]">
          <div className="space-y-5">
            <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
              <h2 className="font-display text-xl font-black">
                Identité du produit
              </h2>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <Field
                  label="Nom du produit"
                  className="sm:col-span-2"
                >
                  <input
                    required
                    value={product.name}
                    onChange={(event) =>
                      changeName(
                        event.target.value
                      )
                    }
                    className={inputClass}
                  />
                </Field>

                <Field label="Slug">
                  <input
                    required
                    value={product.slug}
                    onChange={(event) =>
                      changeProduct(
                        "slug",
                        event.target.value
                      )
                    }
                    className={inputClass}
                  />
                </Field>

                <Field label="Catégorie">
                  <select
                    value={
                      product.category_id
                    }
                    onChange={(event) =>
                      changeProduct(
                        "category_id",
                        event.target.value
                      )
                    }
                    className={inputClass}
                  >
                    <option value="">
                      Sans catégorie
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
                </Field>

                <Field label="Marque">
                  <input
                    value={
                      product.brand || ""
                    }
                    onChange={(event) =>
                      changeProduct(
                        "brand",
                        event.target.value
                      )
                    }
                    className={inputClass}
                  />
                </Field>

                <Field label="Fabricant">
                  <input
                    value={
                      product.manufacturer ||
                      ""
                    }
                    onChange={(event) =>
                      changeProduct(
                        "manufacturer",
                        event.target.value
                      )
                    }
                    className={inputClass}
                  />
                </Field>

                <Field label="Référence">
                  <input
                    value={
                      product.reference || ""
                    }
                    onChange={(event) =>
                      changeProduct(
                        "reference",
                        event.target.value
                      )
                    }
                    className={inputClass}
                  />
                </Field>

                <Field label="SKU">
                  <input
                    value={
                      product.sku || ""
                    }
                    onChange={(event) =>
                      changeProduct(
                        "sku",
                        event.target.value
                      )
                    }
                    className={inputClass}
                  />
                </Field>

                <Field
                  label="Description courte"
                  className="sm:col-span-2"
                >
                  <textarea
                    rows="3"
                    value={
                      product.short_description ||
                      ""
                    }
                    onChange={(event) =>
                      changeProduct(
                        "short_description",
                        event.target.value
                      )
                    }
                    placeholder="Petit texte commercial affiché à côté du produit."
                    className={`${inputClass} py-3`}
                  />
                </Field>

                <Field
                  label="Description technique"
                  className="sm:col-span-2"
                >
                  <textarea
                    rows="9"
                    value={
                      product.description ||
                      ""
                    }
                    onChange={(event) =>
                      changeProduct(
                        "description",
                        event.target.value
                      )
                    }
                    placeholder={
                      "Puissance : 500 W\nPoids : 21 kg\nGarantie : 25 ans"
                    }
                    className={`${inputClass} py-3`}
                  />

                  <span className="mt-2 block text-xs font-semibold text-slate-500">
                    Écrivez une caractéristique par ligne sous la forme « Caractéristique : valeur ». Elles seront automatiquement affichées dans le tableau technique.
                  </span>
                </Field>
              </div>
            </section>

            <section className="rounded-3xl border border-[#0b5ca8]/20 bg-gradient-to-br from-white via-white to-blue-50/50 p-5 shadow-sm sm:p-7">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-3">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-[#020714] text-[#65b9ff]">
                    <PackagePlus className="h-5 w-5" />
                  </span>

                  <div>
                    <h2 className="font-display text-xl font-black">
                      Options privées
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                      Ces options apparaissent uniquement sous ce produit et ajoutent un supplément au prix.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={addCustomOption}
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#0b5ca8] px-4 font-black text-white"
                >
                  <Plus className="h-4 w-4" />
                  Ajouter une option
                </button>
              </div>

              <div className="mt-5 space-y-4">
                {customOptions.map(
                  (option, index) => (
                    <div
                      key={
                        option.id ||
                        option.local_id ||
                        index
                      }
                      className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
                    >
                      <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_180px_auto] lg:items-end">
                        <Field label="Nom de l’option">
                          <input
                            required
                            maxLength="120"
                            placeholder="Ex. Borne de recharge"
                            value={option.name || ""}
                            onChange={(event) =>
                              updateCustomOption(
                                index,
                                "name",
                                event.target.value
                              )
                            }
                            className={inputClass}
                          />
                        </Field>

                        <Field label="Supplément de prix">
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            required
                            placeholder="0,00"
                            value={
                              option.price_delta ?? ""
                            }
                            onChange={(event) =>
                              updateCustomOption(
                                index,
                                "price_delta",
                                event.target.value
                              )
                            }
                            className={inputClass}
                          />
                        </Field>

                        <button
                          type="button"
                          onClick={() =>
                            removeCustomOption(index)
                          }
                          className="grid h-12 w-12 place-items-center rounded-xl border border-red-200 bg-red-50 text-red-600 transition hover:bg-red-600 hover:text-white"
                          aria-label="Supprimer l’option"
                          title="Supprimer l’option"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>

                      <Field
                        label="Petit texte explicatif"
                        className="mt-3 block"
                      >
                        <input
                          maxLength="300"
                          placeholder="Ex. Rechargez votre véhicule directement sous le carport."
                          value={
                            option.description || ""
                          }
                          onChange={(event) =>
                            updateCustomOption(
                              index,
                              "description",
                              event.target.value
                            )
                          }
                          className={inputClass}
                        />
                      </Field>

                      <div className="mt-4 grid gap-3 sm:grid-cols-2">
                        <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm font-bold text-slate-700">
                          <input
                            type="checkbox"
                            checked={Boolean(
                              option.is_default_selected
                            )}
                            onChange={(event) =>
                              updateCustomOption(
                                index,
                                "is_default_selected",
                                event.target.checked
                              )
                            }
                            className="h-4 w-4 accent-[#ff5a00]"
                          />

                          Cochée par défaut
                        </label>

                        <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm font-bold text-slate-700">
                          <input
                            type="checkbox"
                            checked={
                              option.is_active !== false
                            }
                            onChange={(event) =>
                              updateCustomOption(
                                index,
                                "is_active",
                                event.target.checked
                              )
                            }
                            className="h-4 w-4 accent-[#0b5ca8]"
                          />

                          Option visible
                        </label>
                      </div>
                    </div>
                  )
                )}

                {!customOptions.length ? (
                  <div className="rounded-2xl border border-dashed border-[#0b5ca8]/30 bg-white/70 p-8 text-center">
                    <PackagePlus className="mx-auto h-7 w-7 text-[#0b5ca8]/45" />

                    <p className="mt-3 text-sm font-bold text-slate-600">
                      Aucune option privée pour ce produit.
                    </p>
                  </div>
                ) : null}
              </div>
            </section>

            <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="font-display text-xl font-black">
                    Variantes
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    {variants.length} variante(s),{" "}
                    {totalVariantStock} unité(s).
                  </p>
                </div>

                <button
                  type="button"
                  onClick={addVariant}
                  className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#050b16] px-4 font-black text-white"
                >
                  <Plus className="h-4 w-4" />
                  Ajouter
                </button>
              </div>

              <div className="mt-5 space-y-4">
                {variants.map(
                  (variant, index) => (
                    <div
                      key={
                        variant.id ||
                        variant.local_id ||
                        index
                      }
                      className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                    >
                      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-6">
                        <input
                          required
                          placeholder="Nom"
                          value={
                            variant.name || ""
                          }
                          onChange={(event) =>
                            updateVariant(
                              index,
                              "name",
                              event.target.value
                            )
                          }
                          className={`${inputClass} xl:col-span-2`}
                        />

                        <input
                          placeholder="Référence"
                          value={
                            variant.reference ||
                            ""
                          }
                          onChange={(event) =>
                            updateVariant(
                              index,
                              "reference",
                              event.target.value
                            )
                          }
                          className={inputClass}
                        />

                        <input
                          placeholder="SKU"
                          value={
                            variant.sku || ""
                          }
                          onChange={(event) =>
                            updateVariant(
                              index,
                              "sku",
                              event.target.value
                            )
                          }
                          className={inputClass}
                        />

                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          placeholder="Prix"
                          value={
                            variant.price ?? ""
                          }
                          onChange={(event) =>
                            updateVariant(
                              index,
                              "price",
                              event.target.value
                            )
                          }
                          className={inputClass}
                        />

                        <input
                          type="number"
                          min="0"
                          placeholder="Stock"
                          value={
                            variant.stock ?? 0
                          }
                          onChange={(event) =>
                            updateVariant(
                              index,
                              "stock",
                              event.target.value
                            )
                          }
                          className={inputClass}
                        />
                      </div>

                      <div className="mt-3 flex items-center justify-between">
                        <label className="flex items-center gap-2 text-sm font-bold">
                          <input
                            type="checkbox"
                            checked={
                              variant.is_active !==
                              false
                            }
                            onChange={(event) =>
                              updateVariant(
                                index,
                                "is_active",
                                event.target.checked
                              )
                            }
                            className="accent-[#ff5a00]"
                          />

                          Variante active
                        </label>

                        <button
                          type="button"
                          onClick={() =>
                            removeVariant(index)
                          }
                          className="inline-flex items-center gap-2 text-sm font-black text-red-500"
                        >
                          <Trash2 className="h-4 w-4" />
                          Supprimer
                        </button>
                      </div>
                    </div>
                  )
                )}

                {!variants.length ? (
                  <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">
                    Aucune variante. Le prix et
                    le stock généraux seront
                    utilisés.
                  </div>
                ) : null}
              </div>
            </section>

            <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="font-display text-xl font-black">
                    Images
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Importez directement les photos
                    depuis votre ordinateur ou votre téléphone.
                  </p>
                </div>

                <span className="shrink-0 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-black text-slate-600">
                  {images.length}{" "}
                  {images.length > 1
                    ? "photos"
                    : "photo"}
                </span>
              </div>

              <label className="mt-5 flex min-h-36 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#ff5a00]/35 bg-orange-50/40 px-5 py-6 text-center transition hover:border-[#ff5a00] hover:bg-orange-50">
                <input
                  type="file"
                  multiple
                  accept={ACCEPTED_IMAGE_TYPES.join(",")}
                  onChange={handleImageSelection}
                  className="sr-only"
                />

                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-[#ff5a00] text-white shadow-[0_10px_24px_rgba(255,90,0,.24)]">
                  <ImagePlus className="h-5 w-5" />
                </span>

                <span className="mt-3 font-black text-slate-950">
                  Choisir une ou plusieurs photos
                </span>

                <span className="mt-1 text-xs font-semibold text-slate-500">
                  JPG, PNG, WEBP ou AVIF · 5 Mo maximum par photo
                </span>
              </label>

              <div className="mt-5 space-y-3">
                {images.map(
                  (image, index) => (
                    <div
                      key={
                        image.id ||
                        image.local_id ||
                        index
                      }
                      className="grid gap-3 rounded-2xl border border-slate-200 p-4 sm:grid-cols-[90px_1fr_auto]"
                    >
                      <div className="grid h-[76px] place-items-center overflow-hidden rounded-xl bg-slate-100">
                        {image.preview_url ||
                        image.image_url ? (
                          <img
                            src={
                              image.preview_url ||
                              image.image_url
                            }
                            alt={
                              image.alt_text ||
                              `Aperçu ${index + 1}`
                            }
                            className="h-full w-full object-contain"
                          />
                        ) : (
                          <ImagePlus className="text-slate-300" />
                        )}
                      </div>

                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-xs font-black text-slate-900">
                            Photo {index + 1}
                          </span>

                          <span className={`rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-[.08em] ${
                            image.file
                              ? "bg-orange-100 text-orange-700"
                              : "bg-emerald-50 text-emerald-700"
                          }`}>
                            {image.file
                              ? "Prête à importer"
                              : "Enregistrée"}
                          </span>
                        </div>

                        <input
                          placeholder="Texte alternatif (facultatif)"
                          value={
                            image.alt_text ||
                            ""
                          }
                          onChange={(event) =>
                            updateImage(
                              index,
                              "alt_text",
                              event.target.value
                            )
                          }
                          className={inputClass}
                        />

                        <label className="flex items-center gap-2 text-xs font-bold">
                          <input
                            type="radio"
                            name="primary-image"
                            checked={Boolean(
                              image.is_primary
                            )}
                            onChange={() =>
                              updateImage(
                                index,
                                "is_primary",
                                true
                              )
                            }
                            className="accent-[#ff5a00]"
                          />

                          Image principale
                        </label>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          removeImage(index)
                        }
                        aria-label={`Supprimer la photo ${index + 1}`}
                        className="grid h-10 w-10 place-items-center rounded-xl text-red-500 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  )
                )}

                {!images.length ? (
                  <p className="rounded-2xl bg-slate-50 px-4 py-3 text-center text-sm font-semibold text-slate-500">
                    Aucune photo sélectionnée pour le moment.
                  </p>
                ) : null}
              </div>
            </section>
          </div>

          <aside className="space-y-5">
            <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <h2 className="font-display text-xl font-black">
                Prix et disponibilité
              </h2>

              <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
                <Field label="Prix TTC">
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={product.price}
                    onChange={(event) =>
                      changeProduct(
                        "price",
                        event.target.value
                      )
                    }
                    className={inputClass}
                  />
                </Field>

                <Field label="Stock général">
                  <input
                    type="number"
                    min="0"
                    value={product.stock}
                    onChange={(event) =>
                      changeProduct(
                        "stock",
                        event.target.value
                      )
                    }
                    className={inputClass}
                  />
                </Field>

                <Field label="Prix promotionnel">
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={
                      product.sale_price ?? ""
                    }
                    onChange={(event) =>
                      changeProduct(
                        "sale_price",
                        event.target.value
                      )
                    }
                    className={inputClass}
                  />
                </Field>

                <Field label="Début promotion">
                  <input
                    type="datetime-local"
                    value={
                      product.sale_start || ""
                    }
                    onChange={(event) =>
                      changeProduct(
                        "sale_start",
                        event.target.value
                      )
                    }
                    className={inputClass}
                  />
                </Field>

                <Field label="Fin promotion">
                  <input
                    type="datetime-local"
                    value={
                      product.sale_end || ""
                    }
                    onChange={(event) =>
                      changeProduct(
                        "sale_end",
                        event.target.value
                      )
                    }
                    className={inputClass}
                  />
                </Field>

                <Field label="État">
                  <select
                    value={
                      product.product_condition ||
                      "new_packaged"
                    }
                    onChange={(event) =>
                      changeProduct(
                        "product_condition",
                        event.target.value
                      )
                    }
                    className={inputClass}
                  >
                    <option value="new_packaged">
                      Neuf emballé
                    </option>

                    <option value="new_unpackaged">
                      Neuf déballé
                    </option>

                    <option value="reconditioned">
                      Reconditionné
                    </option>

                    <option value="used">
                      Occasion
                    </option>
                  </select>
                </Field>
              </div>
            </section>

            <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <h2 className="font-display text-xl font-black">
                Transport
              </h2>

              <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
                <Field label="Poids (kg)">
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={
                      product.weight_kg ?? ""
                    }
                    onChange={(event) =>
                      changeProduct(
                        "weight_kg",
                        event.target.value
                      )
                    }
                    className={inputClass}
                  />
                </Field>

                <Field label="Longueur (cm)">
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    value={
                      product.length_cm ?? ""
                    }
                    onChange={(event) =>
                      changeProduct(
                        "length_cm",
                        event.target.value
                      )
                    }
                    className={inputClass}
                  />
                </Field>

                <Field label="Largeur (cm)">
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    value={
                      product.width_cm ?? ""
                    }
                    onChange={(event) =>
                      changeProduct(
                        "width_cm",
                        event.target.value
                      )
                    }
                    className={inputClass}
                  />
                </Field>

                <Field label="Hauteur (cm)">
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    value={
                      product.height_cm ?? ""
                    }
                    onChange={(event) =>
                      changeProduct(
                        "height_cm",
                        event.target.value
                      )
                    }
                    className={inputClass}
                  />
                </Field>
              </div>
            </section>

            <section className="space-y-3 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <Toggle
                checked={Boolean(
                  product.is_active
                )}
                onChange={(value) =>
                  changeProduct(
                    "is_active",
                    value
                  )
                }
                title="Produit visible"
                description="Affiché sur QEH OUTLET."
              />

              <Toggle
                checked={Boolean(
                  product.is_featured
                )}
                onChange={(value) =>
                  changeProduct(
                    "is_featured",
                    value
                  )
                }
                title="Produit vedette"
                description="Mis en avant sur l’accueil."
              />

              <Toggle
                checked={Boolean(
                  product.on_demand
                )}
                onChange={(value) =>
                  changeProduct(
                    "on_demand",
                    value
                  )
                }
                title="Sur demande"
                description="Prix ou délai à confirmer."
              />

              <Toggle
                checked={Boolean(
                  product.is_on_sale
                )}
                onChange={(value) =>
                  changeProduct(
                    "is_on_sale",
                    value
                  )
                }
                title="Promotion active"
                description="Utilise le prix promotionnel."
              />

              <Toggle
                checked={Boolean(
                  product.requires_pallet
                )}
                onChange={(value) =>
                  changeProduct(
                    "requires_pallet",
                    value
                  )
                }
                title="Transport palette"
                description="Force le calcul fret/palette."
              />
            </section>
          </aside>
        </div>
      </form>
    </div>
  );
}
