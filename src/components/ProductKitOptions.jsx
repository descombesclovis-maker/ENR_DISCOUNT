import React,
{
  useMemo,
} from "react";

import {
  Check,
  LockKeyhole,
  PackagePlus,
  Sparkles,
} from "lucide-react";

import {
  formatPrice,
} from "../lib/api";

export default function ProductKitOptions({
  options,
  selectedOptionIds,
  onToggle,
  baseProductPrice,
}) {
  const selectedOptions =
    useMemo(
      () =>
        options.filter(
          (option) =>
            selectedOptionIds.includes(
              option.id
            )
        ),
      [
        options,
        selectedOptionIds,
      ]
    );

  const optionsTotal =
    useMemo(
      () =>
        selectedOptions.reduce(
          (total, option) =>
            total +
            Number(
              option.effectivePrice ||
                0
            ) *
              Number(
                option.quantity || 1
              ),
          0
        ),
      [selectedOptions]
    );

  if (!options.length) {
    return null;
  }

  return (
    <section
      aria-labelledby="product-kit-title"
      className="mt-7 overflow-hidden rounded-3xl border border-[#0b5ca8]/20 bg-gradient-to-br from-[#f3f8ff] via-white to-orange-50/50"
    >
      <div className="border-b border-slate-200/80 p-5 sm:p-6">
        <div className="flex items-start gap-4">
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[#020714] text-[#65b9ff] shadow-[0_10px_28px_rgba(2,7,20,.18)]">
            <PackagePlus className="h-6 w-6" />
          </span>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2
                id="product-kit-title"
                className="font-display text-xl font-black text-slate-950"
              >
                Composez votre kit
              </h2>

              <span className="inline-flex items-center gap-1 rounded-full bg-[#ff5a00]/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-[.1em] text-[#d94d00]">
                <Sparkles className="h-3 w-3" />
                Sur mesure
              </span>
            </div>

            <p className="mt-1 text-sm leading-relaxed text-slate-500">
              Sélectionnez les produits complémentaires à ajouter avec ce produit.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-3 p-4 sm:p-5">
        {options.map(
          (option) => {
            const selected =
              selectedOptionIds.includes(
                option.id
              );

            const disabled =
              option.isRequired ||
              !option.available;

            return (
              <button
                key={option.id}
                type="button"
                onClick={() =>
                  onToggle(option.id)
                }
                disabled={disabled}
                aria-pressed={selected}
                className={`group flex w-full items-center gap-4 rounded-2xl border p-3 text-left transition-all sm:p-4 ${
                  selected
                    ? "border-[#0b5ca8] bg-white shadow-[0_12px_34px_rgba(11,92,168,.12)]"
                    : "border-slate-200 bg-white/70 hover:border-[#0b5ca8]/45 hover:bg-white"
                } ${
                  !option.available
                    ? "cursor-not-allowed opacity-55"
                    : ""
                }`}
              >
                <span className="grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-xl border border-slate-200 bg-white sm:h-20 sm:w-20">
                  <img
                    src={option.image}
                    alt=""
                    className="h-full w-full object-contain p-2"
                    loading="lazy"
                    onError={(
                      event
                    ) => {
                      event.currentTarget.onerror =
                        null;

                      event.currentTarget.src =
                        "/images/product-placeholder.png";
                    }}
                  />
                </span>

                <span className="min-w-0 flex-1">
                  <span className="block font-display text-sm font-black leading-snug text-slate-950 sm:text-base">
                    {option.product.name}
                  </span>

                  <span className="mt-1 block text-xs font-semibold text-slate-500">
                    Quantité par kit :{" "}
                    {option.quantity}
                  </span>

                  <span
                    className={`mt-1.5 block text-xs font-bold ${
                      option.available
                        ? "text-emerald-600"
                        : "text-red-600"
                    }`}
                  >
                    {option.available
                      ? option.product
                          .on_demand
                        ? "Disponible sur demande"
                        : "Disponible"
                      : "Indisponible"}
                  </span>
                </span>

                <span className="shrink-0 text-right">
                  <span className="block font-display text-base font-black text-slate-950 sm:text-lg">
                    +{" "}
                    {formatPrice(
                      option.effectivePrice *
                        option.quantity
                    )}
                  </span>

                  {option.isRequired ? (
                    <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-black uppercase tracking-[.08em] text-slate-600">
                      <LockKeyhole className="h-3 w-3" />
                      Obligatoire
                    </span>
                  ) : (
                    <span
                      className={`ml-auto mt-2 grid h-7 w-7 place-items-center rounded-full border transition-colors ${
                        selected
                          ? "border-[#0b5ca8] bg-[#0b5ca8] text-white"
                          : "border-slate-300 bg-white text-transparent group-hover:border-[#0b5ca8]"
                      }`}
                    >
                      <Check className="h-4 w-4" />
                    </span>
                  )}
                </span>
              </button>
            );
          }
        )}
      </div>

      <div className="flex flex-col gap-3 border-t border-slate-200 bg-[#020714] px-5 py-5 text-white sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[.16em] text-white/45">
            Votre sélection
          </p>

          <p className="mt-1 text-sm font-semibold text-white/70">
            {selectedOptions.length}{" "}
            {selectedOptions.length > 1
              ? "options ajoutées"
              : "option ajoutée"}
          </p>
        </div>

        <div className="text-left sm:text-right">
          <p className="text-xs font-bold text-[#65b9ff]">
            Produit + options
          </p>

          <p className="font-display text-2xl font-black">
            {formatPrice(
              Number(
                baseProductPrice || 0
              ) + optionsTotal
            )}
          </p>
        </div>
      </div>
    </section>
  );
}
