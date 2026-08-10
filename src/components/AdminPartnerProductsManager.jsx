import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { motion } from "framer-motion";

import {
  Boxes,
  LoaderCircle,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  X,
} from "lucide-react";

import { supabase } from "../lib/supabase";

const emptyProduct = {
  name: "",
  reference: "",
  description: "",
  price_excluding_tax: "",
  vat_rate: 20,
  stock: 0,
  minimum_quantity: 1,
  image_url: "",
  is_active: true,
};

export default function AdminPartnerProductsManager() {
  const [products, setProducts] =
    useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] =
    useState(true);
  const [saving, setSaving] =
    useState(false);
  const [errorMessage, setErrorMessage] =
    useState("");
  const [formOpen, setFormOpen] =
    useState(false);
  const [editing, setEditing] =
    useState(null);
  const [form, setForm] =
    useState(emptyProduct);

  const loadProducts = useCallback(async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from("qeh_partner_products")
      .select("*")
      .order("created_at", {
        ascending: false,
      });

    if (error) {
      setErrorMessage(error.message);
      setProducts([]);
    } else {
      setErrorMessage("");
      setProducts(data || []);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const filtered = useMemo(() => {
    const value = search
      .trim()
      .toLocaleLowerCase("fr-FR");

    if (!value) {
      return products;
    }

    return products.filter((product) =>
      [
        product.name,
        product.reference,
        product.description,
      ]
        .filter(Boolean)
        .join(" ")
        .toLocaleLowerCase("fr-FR")
        .includes(value)
    );
  }, [products, search]);

  function openForm(product = null) {
    setEditing(product);

    setForm(
      product
        ? {
            name: product.name || "",
            reference:
              product.reference || "",
            description:
              product.description || "",
            price_excluding_tax:
              product.price_excluding_tax ??
              "",
            vat_rate:
              product.vat_rate ?? 20,
            stock:
              product.stock ?? 0,
            minimum_quantity:
              product.minimum_quantity ?? 1,
            image_url:
              product.image_url || "",
            is_active:
              product.is_active !== false,
          }
        : emptyProduct
    );

    setFormOpen(true);
  }

  function closeForm() {
    setEditing(null);
    setForm(emptyProduct);
    setFormOpen(false);
  }

  async function saveProduct(event) {
    event.preventDefault();

    setSaving(true);
    setErrorMessage("");

    const values = {
      name: form.name.trim(),
      reference: form.reference.trim(),
      description:
        form.description.trim(),
      price_excluding_tax: Number(
        form.price_excluding_tax
      ),
      vat_rate: Number(form.vat_rate),
      stock: Number(form.stock),
      minimum_quantity: Math.max(
        1,
        Number(form.minimum_quantity)
      ),
      image_url:
        form.image_url.trim() || null,
      is_active: Boolean(form.is_active),
      updated_at: new Date().toISOString(),
    };

    const operation = editing
      ? supabase
          .from("qeh_partner_products")
          .update(values)
          .eq("id", editing.id)
      : supabase
          .from("qeh_partner_products")
          .insert(values);

    const { error } = await operation;

    if (error) {
      setErrorMessage(error.message);
    } else {
      closeForm();
      await loadProducts();
    }

    setSaving(false);
  }

  async function deleteProduct(product) {
    const confirmed = window.confirm(
      `Supprimer « ${product.name} » du catalogue professionnel ?`
    );

    if (!confirmed) {
      return;
    }

    const { error } = await supabase
      .from("qeh_partner_products")
      .delete()
      .eq("id", product.id);

    if (error) {
      setErrorMessage(error.message);
    } else {
      loadProducts();
    }
  }

  return (
    <div className="min-h-screen p-4 sm:p-6 xl:p-8">
      <div className="mx-auto max-w-[1450px]">
        <header className="relative overflow-hidden rounded-[28px] bg-[#050b16] p-6 text-white sm:p-8">
          <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-[#c99532]/25 blur-3xl" />

          <div className="relative flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-[#e8bd5c]">
                QEH Partner
              </p>

              <h1 className="mt-3 font-display text-3xl font-black sm:text-4xl">
                Matériel professionnel
              </h1>

              <p className="mt-3 max-w-2xl text-slate-300">
                Catalogue de gros indépendant de
                QEH OUTLET : prix HT, stock et
                quantités minimales.
              </p>
            </div>

            <button
              type="button"
              onClick={() => openForm()}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#b98222] to-[#f0ca70] px-6 font-black text-[#020711]"
            >
              <Plus className="h-5 w-5" />

              Ajouter un produit Pro
            </button>
          </div>
        </header>

        <section className="mt-5 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_14px_45px_rgba(2,7,17,0.06)]">
          <div className="flex flex-col gap-3 border-b border-slate-200 p-4 sm:flex-row sm:p-5">
            <label className="relative flex-1">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />

              <input
                type="search"
                value={search}
                onChange={(event) =>
                  setSearch(
                    event.target.value
                  )
                }
                placeholder="Rechercher un produit ou une référence…"
                className="min-h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-12 pr-4 font-semibold outline-none"
              />
            </label>

            <button
              type="button"
              onClick={loadProducts}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 font-black"
            >
              <RefreshCw className="h-4 w-4" />

              Actualiser
            </button>
          </div>

          {errorMessage ? (
            <div className="m-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-700">
              {errorMessage}
            </div>
          ) : null}

          {loading ? (
            <div className="grid min-h-[340px] place-items-center">
              <LoaderCircle className="h-8 w-8 animate-spin text-[#c99532]" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="grid min-h-[340px] place-items-center text-slate-500">
              Aucun produit professionnel.
            </div>
          ) : (
            <div className="grid gap-4 p-4 sm:p-5 md:grid-cols-2 xl:grid-cols-3">
              {filtered.map((product) => {
                const ttc =
                  Number(
                    product.price_excluding_tax ||
                      0
                  ) *
                  (1 +
                    Number(
                      product.vat_rate || 20
                    ) /
                      100);

                return (
                  <article
                    key={product.id}
                    className="overflow-hidden rounded-3xl border border-slate-200 transition hover:-translate-y-1 hover:shadow-xl"
                  >
                    {product.image_url ? (
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="h-44 w-full bg-slate-100 object-contain p-4"
                      />
                    ) : (
                      <div className="grid h-44 place-items-center bg-gradient-to-br from-[#050b16] to-[#13233c] text-[#e8bd5c]">
                        <Boxes className="h-14 w-14" />
                      </div>
                    )}

                    <div className="p-5">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-xs font-black uppercase tracking-wider text-[#a87316]">
                            {product.reference ||
                              "Sans référence"}
                          </p>

                          <h2 className="mt-2 font-display text-xl font-black">
                            {product.name}
                          </h2>
                        </div>

                        <span
                          className={`rounded-full px-3 py-1 text-xs font-black ${
                            product.is_active
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-slate-100 text-slate-500"
                          }`}
                        >
                          {product.is_active
                            ? "En ligne"
                            : "Masqué"}
                        </span>
                      </div>

                      <p className="mt-3 line-clamp-2 text-sm text-slate-500">
                        {product.description ||
                          "Aucune description."}
                      </p>

                      <div className="mt-5 grid grid-cols-3 gap-2 text-center">
                        <div className="rounded-xl bg-slate-50 p-2">
                          <p className="text-[10px] font-bold text-slate-400">
                            PRIX HT
                          </p>

                          <p className="font-black">
                            {Number(
                              product.price_excluding_tax ||
                                0
                            ).toLocaleString(
                              "fr-FR",
                              {
                                minimumFractionDigits: 2,
                              }
                            )}{" "}
                            €
                          </p>
                        </div>

                        <div className="rounded-xl bg-slate-50 p-2">
                          <p className="text-[10px] font-bold text-slate-400">
                            PRIX TTC
                          </p>

                          <p className="font-black">
                            {ttc.toLocaleString(
                              "fr-FR",
                              {
                                minimumFractionDigits: 2,
                              }
                            )}{" "}
                            €
                          </p>
                        </div>

                        <div className="rounded-xl bg-slate-50 p-2">
                          <p className="text-[10px] font-bold text-slate-400">
                            STOCK
                          </p>

                          <p className="font-black">
                            {product.stock || 0}
                          </p>
                        </div>
                      </div>

                      <div className="mt-5 flex gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            openForm(product)
                          }
                          className="inline-flex min-h-10 flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 font-black"
                        >
                          <Pencil className="h-4 w-4" />

                          Modifier
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            deleteProduct(
                              product
                            )
                          }
                          className="grid h-10 w-10 place-items-center rounded-xl border border-red-100 text-red-500"
                          aria-label="Supprimer le produit"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>

      {formOpen ? (
        <div className="fixed inset-0 z-[100] grid place-items-center overflow-y-auto bg-[#020711]/70 p-4 backdrop-blur-sm">
          <motion.form
            initial={{
              opacity: 0,
              y: 20,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            onSubmit={saveProduct}
            className="my-6 w-full max-w-3xl rounded-3xl bg-white p-5 shadow-2xl sm:p-7"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-[#a87316]">
                  QEH Partner
                </p>

                <h2 className="mt-2 font-display text-2xl font-black">
                  {editing
                    ? "Modifier le produit Pro"
                    : "Nouveau produit Pro"}
                </h2>
              </div>

              <button
                type="button"
                onClick={closeForm}
                className="grid h-10 w-10 place-items-center rounded-xl bg-slate-100"
                aria-label="Fermer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {[
                [
                  "name",
                  "Nom",
                  "text",
                ],
                [
                  "reference",
                  "Référence",
                  "text",
                ],
                [
                  "price_excluding_tax",
                  "Prix HT",
                  "number",
                ],
                [
                  "vat_rate",
                  "TVA (%)",
                  "number",
                ],
                [
                  "stock",
                  "Stock",
                  "number",
                ],
                [
                  "minimum_quantity",
                  "Quantité minimale",
                  "number",
                ],
                [
                  "image_url",
                  "URL de l’image",
                  "url",
                ],
              ].map(
                ([name, label, type]) => (
                  <label
                    key={name}
                    className={
                      name === "image_url"
                        ? "sm:col-span-2"
                        : ""
                    }
                  >
                    <span className="mb-2 block text-sm font-black text-slate-700">
                      {label}
                    </span>

                    <input
                      type={type}
                      step={
                        type === "number"
                          ? "any"
                          : undefined
                      }
                      required={[
                        "name",
                        "reference",
                        "price_excluding_tax",
                      ].includes(name)}
                      value={form[name]}
                      onChange={(event) =>
                        setForm(
                          (current) => ({
                            ...current,
                            [name]:
                              event.target
                                .value,
                          })
                        )
                      }
                      className="min-h-12 w-full rounded-xl border border-slate-200 px-4 outline-none focus:border-[#c99532] focus:ring-4 focus:ring-[#c99532]/10"
                    />
                  </label>
                )
              )}
            </div>

            <label className="mt-4 block">
              <span className="mb-2 block text-sm font-black text-slate-700">
                Description
              </span>

              <textarea
                rows="4"
                value={form.description}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    description:
                      event.target.value,
                  }))
                }
                className="w-full rounded-xl border border-slate-200 p-4 outline-none focus:border-[#c99532]"
              />
            </label>

            <label className="mt-4 flex items-center gap-3 rounded-2xl bg-slate-50 p-4 font-bold">
              <input
                type="checkbox"
                checked={form.is_active}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    is_active:
                      event.target.checked,
                  }))
                }
                className="h-5 w-5 accent-[#c99532]"
              />

              Publier dans le catalogue Matériel Pro
            </label>

            <button
              type="submit"
              disabled={saving}
              className="mt-6 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#b98222] to-[#f0ca70] px-6 font-black text-[#020711] disabled:opacity-60"
            >
              {saving ? (
                <LoaderCircle className="h-5 w-5 animate-spin" />
              ) : (
                <Boxes className="h-5 w-5" />
              )}

              {saving
                ? "Enregistrement…"
                : "Enregistrer le produit"}
            </button>
          </motion.form>
        </div>
      ) : null}
    </div>
  );
}