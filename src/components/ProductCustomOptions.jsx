import React, {
  useEffect,
  useState,
} from "react";

import {
  animate,
  motion,
} from "framer-motion";

import {
  Check,
  SlidersHorizontal,
} from "lucide-react";

import {
  formatPrice,
} from "../lib/api";

export function AnimatedPriceDelta({
  amount,
}) {
  const [displayedAmount, setDisplayedAmount] =
    useState(0);

  useEffect(() => {
    const animation = animate(
      0,
      Math.abs(Number(amount || 0)),
      {
        duration: 0.62,
        ease: "easeOut",
        onUpdate: (latestValue) =>
          setDisplayedAmount(latestValue),
      }
    );

    return () => {
      animation.stop();
    };
  }, [amount]);

  const isAddition =
    Number(amount) >= 0;

  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 22,
        scale: 0.78,
      }}
      animate={{
        opacity: [0, 1, 1, 0],
        y: [22, -20, -12, 2],
        scale: [0.78, 1.08, 1, 0.72],
      }}
      transition={{
        duration: 0.86,
        times: [0, 0.18, 0.72, 1],
        ease: "easeOut",
      }}
      className={`pointer-events-none absolute bottom-full right-0 z-20 mb-1 whitespace-nowrap font-display text-xl font-black drop-shadow-[0_5px_14px_rgba(0,0,0,.5)] sm:text-2xl ${
        isAddition
          ? "text-emerald-400"
          : "text-[#ff8a4b]"
      }`}
    >
      {isAddition ? "+" : "−"}{" "}
      {formatPrice(displayedAmount)}
    </motion.div>
  );
}

export default function ProductCustomOptions({
  options,
  selectedOptionIds,
  onToggle,
}) {
  if (!options.length) {
    return null;
  }

  return (
    <section
      aria-labelledby="custom-options-title"
      className="mt-6 rounded-2xl border border-slate-200 bg-slate-50/80 p-4 sm:p-5"
    >
      <div className="flex items-center gap-3">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#0b5ca8]/10 text-[#0b5ca8]">
          <SlidersHorizontal className="h-4 w-4" />
        </span>

        <div>
          <h2
            id="custom-options-title"
            className="font-display text-base font-black text-slate-950"
          >
            Options disponibles
          </h2>

          <p className="text-xs text-slate-500">
            Personnalisez simplement votre installation.
          </p>
        </div>
      </div>

      <div className="mt-4 space-y-2.5">
        {options.map((option) => {
          const selected =
            selectedOptionIds.includes(
              option.id
            );

          return (
            <label
              key={option.id}
              className={`group flex cursor-pointer items-center gap-3 rounded-xl border px-3.5 py-3 transition-all ${
                selected
                  ? "border-[#0b5ca8] bg-white shadow-[0_8px_22px_rgba(11,92,168,.09)]"
                  : "border-slate-200 bg-white/70 hover:border-[#0b5ca8]/40 hover:bg-white"
              }`}
            >
              <input
                type="checkbox"
                checked={selected}
                onChange={() =>
                  onToggle(option)
                }
                className="sr-only"
              />

              <span
                className={`grid h-6 w-6 shrink-0 place-items-center rounded-md border transition-colors ${
                  selected
                    ? "border-[#0b5ca8] bg-[#0b5ca8] text-white"
                    : "border-slate-300 bg-white text-transparent"
                }`}
              >
                <Check className="h-4 w-4" />
              </span>

              <span className="min-w-0 flex-1">
                <span className="block text-sm font-black text-slate-900">
                  {option.name}
                </span>

                {option.description ? (
                  <span className="mt-0.5 block text-xs leading-relaxed text-slate-500">
                    {option.description}
                  </span>
                ) : null}
              </span>

              <span className="shrink-0 font-display text-sm font-black text-[#ff5a00]">
                + {formatPrice(
                  option.priceDelta
                )}
              </span>
            </label>
          );
        })}
      </div>
    </section>
  );
}
