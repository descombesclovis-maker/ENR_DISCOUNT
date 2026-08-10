import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import { motion } from "framer-motion";

import {
  ArrowLeft,
  ImagePlus,
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

import { supabase } from "../lib/supabase";

const emptyProduct = {
  name: "",
  slug: "",
  brand: "",
  manufacturer: "",
  reference: "",
  sku: "",
  category_id: "",
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

  const [images, setImages] =
    useState([]);

  const [loading, setLoading] =
    useState(isEditing);

  const [saving, setSaving] =
    useState(false);

  const [errorMessage, setErrorMessage] =
    useState("");

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

      if (!isEditing) {
        setLoading(false);
        return;
      }

      const [
        productResult,
        variantsResult,
        imagesResult,
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
      ]);

      if (!active) {
        return;
      }

      if (productResult.error) {
        setErrorMessage(
          productResult.error.message
        );
      } else {
        const value = productResult.data;

        setProduct({
          ...emptyProduct,
          ...value,

          category_id:
            value.category_id || "",

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

        setImages(
          (imagesResult.data || []).map(
            (image) => ({
              ...image,

              image_url:
                image.image_url || "",

              alt_text:
                image.alt_text || "",
            })
          )
        );
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
        local_id: crypto.randomUUID(),
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

  function addImage() {
    setImages((current) => [
      ...current,

      {
        local_id: crypto.randomUUID(),
        image_url: "",
        alt_text: "",
        is_primary:
          current.length === 0,
      },
    ]);
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

      description:
        product.description?.trim() ||
        null,

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
      setErrorMessage(
        productResult.error.message
      );

      setSaving(false);
      return;
    }

    const savedProductId =
      productResult.data.id;

    const validVariants =
      variants.filter((variant) =>
        variant.name?.trim()
      );

    const validImages =
      images.filter((image) =>
        image.image_url?.trim()
      );

    const deleteVariants =
      await supabase
        .from("product_variants")
        .delete()
        .eq(
          "product_id",
          savedProductId
        );

    if (deleteVariants.error) {
      setErrorMessage(
        deleteVariants.error.message
      );

      setSaving(false);
      return;
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
        setErrorMessage(
          variantsResult.error.message
        );

        setSaving(false);
        return;
      }
    }

    const deleteImages =
      await supabase
        .from("product_images")
        .delete()
        .eq(
          "product_id",
          savedProductId
        );

    if (deleteImages.error) {
      setErrorMessage(
        deleteImages.error.message
      );

      setSaving(false);
      return;
    }

    if (validImages.length) {
      const imagesResult =
        await supabase
          .from("product_images")
          .insert(
            validImages.map(
              (image, index) => ({
                product_id:
                  savedProductId,

                image_url:
                  image.image_url.trim(),

                alt_text:
                  image.alt_text?.trim() ||
                  product.name.trim(),

                is_primary:
                  Boolean(
                    image.is_primary
                  ) ||
                  (
                    index === 0 &&
                    !validImages.some(
                      (item) =>
                        item.is_primary
                    )
                  ),

                display_order: index,
              })
            )
          );

      if (imagesResult.error) {
        setErrorMessage(
          imagesResult.error.message
        );

        setSaving(false);
        return;
      }
    }

    navigate(
      "/admin/produits",
      {
        replace: true,
      }
    );
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
                  label="Description"
                  className="sm:col-span-2"
                >
                  <textarea
                    rows="7"
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
                    className={`${inputClass} py-3`}
                  />
                </Field>
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
                    Ajoutez les URL des photos
                    du produit.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={addImage}
                  className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-slate-200 px-4 font-black"
                >
                  <ImagePlus className="h-4 w-4" />
                  Ajouter
                </button>
              </div>

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
                        {image.image_url ? (
                          <img
                            src={image.image_url}
                            alt=""
                            className="h-full w-full object-contain"
                          />
                        ) : (
                          <ImagePlus className="text-slate-300" />
                        )}
                      </div>

                      <div className="space-y-2">
                        <input
                          placeholder="URL de l’image"
                          value={
                            image.image_url ||
                            ""
                          }
                          onChange={(event) =>
                            updateImage(
                              index,
                              "image_url",
                              event.target.value
                            )
                          }
                          className={inputClass}
                        />

                        <input
                          placeholder="Texte alternatif"
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
                        className="grid h-10 w-10 place-items-center rounded-xl text-red-500 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  )
                )}
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