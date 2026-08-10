import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { motion } from "framer-motion";

import {
  Factory,
  LoaderCircle,
  MapPin,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Sun,
  Trash2,
  X,
} from "lucide-react";

import { supabase } from "../lib/supabase";

const emptyProducer = {
  public_name: "",
  city: "",
  latitude: "",
  longitude: "",
  installed_power_kwc: "",
  available_surplus_kwh: "",
  is_active: true,
};

export default function AdminEnergiesProducteurs() {
  const [producers, setProducers] =
    useState([]);

  const [searchValue, setSearchValue] =
    useState("");

  const [isLoading, setIsLoading] =
    useState(true);

  const [isSaving, setIsSaving] =
    useState(false);

  const [errorMessage, setErrorMessage] =
    useState("");

  const [
    editingProducer,
    setEditingProducer,
  ] = useState(null);

  const [form, setForm] =
    useState(emptyProducer);

  const [formOpen, setFormOpen] =
    useState(false);

  const loadProducers =
    useCallback(async () => {
      setIsLoading(true);
      setErrorMessage("");

      const { data, error } =
        await supabase
          .from("solar_producers")
          .select("*")
          .order("created_at", {
            ascending: false,
          });

      if (error) {
        setErrorMessage(error.message);
        setProducers([]);
      } else {
        setProducers(data || []);
      }

      setIsLoading(false);
    }, []);

  useEffect(() => {
    loadProducers();
  }, [loadProducers]);

  const filteredProducers = useMemo(() => {
    const query = searchValue
      .trim()
      .toLocaleLowerCase("fr-FR");

    if (!query) {
      return producers;
    }

    return producers.filter((producer) =>
      [
        producer.public_name,
        producer.city,
      ]
        .filter(Boolean)
        .join(" ")
        .toLocaleLowerCase("fr-FR")
        .includes(query)
    );
  }, [producers, searchValue]);

  function openForm(producer = null) {
    setEditingProducer(producer);
    setFormOpen(true);

    setForm(
      producer
        ? {
            public_name:
              producer.public_name || "",
            city: producer.city || "",
            latitude:
              producer.latitude ?? "",
            longitude:
              producer.longitude ?? "",
            installed_power_kwc:
              producer.installed_power_kwc ??
              "",
            available_surplus_kwh:
              producer.available_surplus_kwh ??
              "",
            is_active:
              producer.is_active !== false,
          }
        : emptyProducer
    );
  }

  function closeForm() {
    setEditingProducer(null);
    setForm(emptyProducer);
    setFormOpen(false);
  }

  async function saveProducer(event) {
    event.preventDefault();

    setIsSaving(true);
    setErrorMessage("");

    const values = {
      public_name:
        form.public_name.trim(),

      city: form.city.trim(),

      latitude: Number(form.latitude),

      longitude: Number(form.longitude),

      installed_power_kwc:
        form.installed_power_kwc
          ? Number(
              form.installed_power_kwc
            )
          : null,

      available_surplus_kwh:
        form.available_surplus_kwh
          ? Number(
              form.available_surplus_kwh
            )
          : null,

      is_active: Boolean(form.is_active),
    };

    const request = editingProducer
      ? supabase
          .from("solar_producers")
          .update(values)
          .eq("id", editingProducer.id)
      : supabase
          .from("solar_producers")
          .insert(values);

    const { error } = await request;

    if (error) {
      setErrorMessage(error.message);
    } else {
      closeForm();
      await loadProducers();
    }

    setIsSaving(false);
  }

  async function toggleProducer(producer) {
    const { error } = await supabase
      .from("solar_producers")
      .update({
        is_active: !producer.is_active,
      })
      .eq("id", producer.id);

    if (error) {
      setErrorMessage(error.message);
    } else {
      loadProducers();
    }
  }

  async function deleteProducer(producer) {
    const confirmed = window.confirm(
      `Supprimer « ${producer.public_name} » ?`
    );

    if (!confirmed) {
      return;
    }

    const { error } = await supabase
      .from("solar_producers")
      .delete()
      .eq("id", producer.id);

    if (error) {
      setErrorMessage(error.message);
    } else {
      loadProducers();
    }
  }

  return (
    <div className="min-h-screen p-4 sm:p-6 xl:p-8">
      <div className="mx-auto max-w-[1450px]">
        <header className="relative overflow-hidden rounded-[28px] bg-[#050b16] p-6 text-white sm:p-8">
          <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[#69b72d]/25 blur-3xl" />

          <div className="relative flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="flex items-center gap-2 text-[#82d246]">
                <Factory className="h-5 w-5" />

                <p className="text-xs font-black uppercase tracking-[0.2em]">
                  QEH Énergies
                </p>
              </div>

              <h1 className="mt-3 font-display text-3xl font-black sm:text-4xl">
                Producteurs solaires
              </h1>

              <p className="mt-3 max-w-2xl text-slate-300">
                Gérez les installations
                référencées et leurs capacités
                de production disponibles.
              </p>
            </div>

            <button
              type="button"
              onClick={() => openForm()}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#69b72d] px-6 font-black text-[#020711] hover:bg-[#82d246]"
            >
              <Plus className="h-5 w-5" />

              Ajouter un producteur
            </button>
          </div>
        </header>

        <section className="mt-5 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_14px_45px_rgba(2,7,17,0.06)]">
          <div className="flex flex-col gap-3 border-b border-slate-200 p-4 sm:flex-row sm:p-5">
            <label className="relative flex-1">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />

              <input
                type="search"
                value={searchValue}
                onChange={(event) =>
                  setSearchValue(
                    event.target.value
                  )
                }
                placeholder="Rechercher un producteur ou une ville…"
                className="min-h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-12 pr-4 font-semibold outline-none"
              />
            </label>

            <button
              type="button"
              onClick={loadProducers}
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

          {isLoading ? (
            <div className="grid min-h-[340px] place-items-center text-slate-500">
              <LoaderCircle className="h-8 w-8 animate-spin" />
            </div>
          ) : filteredProducers.length ===
            0 ? (
            <div className="grid min-h-[340px] place-items-center px-6 text-center text-slate-500">
              Aucun producteur enregistré.
            </div>
          ) : (
            <div className="grid gap-4 p-4 sm:grid-cols-2 sm:p-5 xl:grid-cols-3">
              {filteredProducers.map(
                (producer) => (
                  <article
                    key={producer.id}
                    className="rounded-3xl border border-slate-200 p-5 transition hover:-translate-y-1 hover:shadow-lg"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#69b72d]/12 text-[#4f9720]">
                        <Sun className="h-6 w-6" />
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          toggleProducer(
                            producer
                          )
                        }
                        className={`rounded-full px-3 py-1.5 text-xs font-black ${
                          producer.is_active
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {producer.is_active
                          ? "Actif"
                          : "Masqué"}
                      </button>
                    </div>

                    <h2 className="mt-5 font-display text-xl font-black">
                      {producer.public_name ||
                        "Producteur solaire"}
                    </h2>

                    <p className="mt-2 flex items-center gap-2 text-sm font-semibold text-slate-500">
                      <MapPin className="h-4 w-4" />

                      {producer.city ||
                        "Ville non renseignée"}
                    </p>

                    <div className="mt-5 grid grid-cols-2 gap-3">
                      <div className="rounded-2xl bg-slate-50 p-3">
                        <p className="text-xs font-bold text-slate-400">
                          Puissance
                        </p>

                        <p className="mt-1 font-black">
                          {producer.installed_power_kwc ||
                            "—"}{" "}
                          kWc
                        </p>
                      </div>

                      <div className="rounded-2xl bg-slate-50 p-3">
                        <p className="text-xs font-bold text-slate-400">
                          Surplus
                        </p>

                        <p className="mt-1 font-black">
                          {producer.available_surplus_kwh ||
                            "—"}{" "}
                          kWh
                        </p>
                      </div>
                    </div>

                    <div className="mt-5 flex gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          openForm(producer)
                        }
                        className="inline-flex min-h-10 flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 font-black hover:bg-slate-50"
                      >
                        <Pencil className="h-4 w-4" />

                        Modifier
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          deleteProducer(
                            producer
                          )
                        }
                        className="grid h-10 w-10 place-items-center rounded-xl border border-red-100 text-red-500 hover:bg-red-50"
                        aria-label="Supprimer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </article>
                )
              )}
            </div>
          )}
        </section>
      </div>

      {formOpen ? (
        <div className="fixed inset-0 z-[100] grid place-items-center overflow-y-auto bg-[#020711]/65 p-4 backdrop-blur-sm">
          <motion.form
            initial={{
              opacity: 0,
              y: 20,
              scale: 0.98,
            }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
            }}
            onSubmit={saveProducer}
            className="my-6 w-full max-w-2xl rounded-3xl bg-white p-5 shadow-2xl sm:p-7"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-[#4f9720]">
                  QEH Énergies
                </p>

                <h2 className="mt-2 font-display text-2xl font-black">
                  {editingProducer
                    ? "Modifier le producteur"
                    : "Ajouter un producteur"}
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
                  "public_name",
                  "Nom public",
                  "text",
                ],
                [
                  "city",
                  "Ville",
                  "text",
                ],
                [
                  "latitude",
                  "Latitude",
                  "number",
                ],
                [
                  "longitude",
                  "Longitude",
                  "number",
                ],
                [
                  "installed_power_kwc",
                  "Puissance (kWc)",
                  "number",
                ],
                [
                  "available_surplus_kwh",
                  "Surplus annuel (kWh)",
                  "number",
                ],
              ].map(
                ([name, label, type]) => (
                  <label key={name}>
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
                        "public_name",
                        "city",
                        "latitude",
                        "longitude",
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
                      className="min-h-12 w-full rounded-xl border border-slate-200 px-4 outline-none focus:border-[#69b72d] focus:ring-4 focus:ring-[#69b72d]/10"
                    />
                  </label>
                )
              )}
            </div>

            <label className="mt-5 flex items-center gap-3 rounded-2xl bg-slate-50 p-4 font-bold text-slate-700">
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
                className="h-5 w-5 accent-[#69b72d]"
              />

              Afficher ce producteur sur le
              réseau QEH Énergies
            </label>

            <button
              type="submit"
              disabled={isSaving}
              className="mt-6 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-[#69b72d] px-6 font-black text-[#020711] hover:bg-[#82d246] disabled:opacity-60"
            >
              {isSaving ? (
                <LoaderCircle className="h-5 w-5 animate-spin" />
              ) : (
                <Sun className="h-5 w-5" />
              )}

              {isSaving
                ? "Enregistrement…"
                : "Enregistrer le producteur"}
            </button>
          </motion.form>
        </div>
      ) : null}
    </div>
  );
}