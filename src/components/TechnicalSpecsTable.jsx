import React, {
  useMemo,
} from "react";

import {
  Settings2,
} from "lucide-react";

function cleanText(value) {
  return String(value || "")
    .replace(/^[-•*]\s*/, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function parseTechnicalSpecifications(
  description
) {
  const specifications = [];
  const descriptionLines = [];

  String(description || "")
    .split(/\r?\n/)
    .forEach((rawLine) => {
      const line =
        rawLine.trim();

      if (!line) {
        descriptionLines.push("");
        return;
      }

      /*
       * Formats reconnus :
       *
       * Puissance : 500 W
       * Poids | 21 kg
       * - Dimensions : 1700 x 1100 mm
       * • Garantie : 10 ans
       */
      const match =
        line.match(
          /^[-•*]?\s*([^:|]{2,100})\s*(?::|\|)\s*(.+)$/
        );

      if (!match) {
        descriptionLines.push(
          rawLine
        );

        return;
      }

      const label =
        cleanText(
          match[1]
        );

      const value =
        cleanText(
          match[2]
        );

      if (
        !label ||
        !value
      ) {
        descriptionLines.push(
          rawLine
        );

        return;
      }

      specifications.push({
        label,
        value,
      });
    });

  return {
    specifications,

    descriptionText:
      descriptionLines
        .join("\n")
        .replace(
          /\n{3,}/g,
          "\n\n"
        )
        .trim(),
  };
}

export default function TechnicalSpecsTable({
  description,
  specifications = [],
}) {
  const rows =
    useMemo(() => {
      /*
       * Les caractéristiques enregistrées
       * dans Supabase sont prioritaires.
       */
      if (
        Array.isArray(
          specifications
        ) &&
        specifications.length >
          0
      ) {
        return specifications
          .map(
            (
              specification
            ) => ({
              label:
                cleanText(
                  specification?.label
                ),

              value:
                cleanText(
                  specification?.value
                ),
            })
          )
          .filter(
            (
              specification
            ) =>
              specification.label &&
              specification.value
          );
      }

      /*
       * Sinon, les caractéristiques sont
       * extraites de la description longue.
       */
      return parseTechnicalSpecifications(
        description
      ).specifications;
    }, [
      description,
      specifications,
    ]);

  if (
    rows.length === 0
  ) {
    return null;
  }

  return (
    <section className="overflow-hidden rounded-3xl border border-[#0b5ca8]/20 bg-white shadow-[0_20px_55px_rgba(2,7,20,0.08)]">
      <header className="relative overflow-hidden bg-[#020714] px-6 py-7 sm:px-8 sm:py-8">
        <div className="absolute -top-20 -right-16 w-56 h-56 rounded-full bg-[#0b5ca8]/25 blur-3xl pointer-events-none" />

        <div className="absolute -bottom-24 -left-16 w-56 h-56 rounded-full bg-[#ff5a00]/15 blur-3xl pointer-events-none" />

        <div className="relative flex items-start gap-4">
          <div className="w-12 h-12 shrink-0 rounded-2xl border border-[#0b5ca8]/50 bg-[#0b5ca8]/15 text-[#55a8ff] grid place-items-center">
            <Settings2 className="w-6 h-6" />
          </div>

          <div>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-[#ff5a00]">
              Informations produit
            </p>

            <h2 className="font-display font-black text-2xl sm:text-3xl text-white tracking-tight mt-2">
              Caractéristiques techniques
            </h2>

            <p className="text-sm text-white/55 mt-2">
              Retrouvez les principales données techniques de ce produit.
            </p>
          </div>
        </div>
      </header>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[560px] text-sm">
          <thead>
            <tr className="bg-[#0b5ca8] text-white">
              <th className="w-1/2 px-6 py-4 text-left text-xs font-black uppercase tracking-[0.14em]">
                Caractéristique
              </th>

              <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-[0.14em]">
                Valeur
              </th>
            </tr>
          </thead>

          <tbody>
            {rows.map(
              (
                specification,
                index
              ) => (
                <tr
                  key={`${specification.label}-${index}`}
                  className={`border-t border-slate-200 transition-colors hover:bg-[#0b5ca8]/5 ${
                    index % 2 ===
                    0
                      ? "bg-white"
                      : "bg-slate-50/70"
                  }`}
                >
                  <td className="w-1/2 px-6 py-5 align-top">
                    <span className="flex items-start gap-3 font-bold text-slate-700">
                      <span className="w-2 h-2 shrink-0 rounded-full bg-[#ff5a00] mt-1.5" />

                      {
                        specification.label
                      }
                    </span>
                  </td>

                  <td className="px-6 py-5 font-semibold text-slate-950 align-top">
                    {
                      specification.value
                    }
                  </td>
                </tr>
              )
            )}
          </tbody>
        </table>
      </div>

      <footer className="border-t border-slate-200 bg-slate-50 px-6 py-4">
        <p className="text-xs text-slate-500">
          Les caractéristiques affichées correspondent aux informations enregistrées pour ce produit.
        </p>
      </footer>
    </section>
  );
}