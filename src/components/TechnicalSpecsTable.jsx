import React, {
  useMemo,
} from "react";

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
      const line = rawLine.trim();

      if (!line) {
        descriptionLines.push("");
        return;
      }

      /*
       * Les formats suivants sont reconnus :
       *
       * Puissance : 500 W
       * Poids | 21 kg
       * - Dimensions : 1700 x 1100 mm
       * • Garantie : 10 ans
       */
      const match = line.match(
        /^[-•*]?\s*([^:|]{2,100})\s*(?::|\|)\s*(.+)$/
      );

      if (!match) {
        descriptionLines.push(
          rawLine
        );

        return;
      }

      const label = cleanText(
        match[1]
      );

      const value = cleanText(
        match[2]
      );

      if (!label || !value) {
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
        .replace(/\n{3,}/g, "\n\n")
        .trim(),
  };
}

export default function TechnicalSpecsTable({
  description,
  specifications = [],
}) {
  const rows = useMemo(() => {
    /*
     * Si la colonne specifications de Supabase
     * contient déjà des caractéristiques,
     * elles sont utilisées en priorité.
     */
    if (
      Array.isArray(
        specifications
      ) &&
      specifications.length > 0
    ) {
      return specifications
        .map((specification) => ({
          label: cleanText(
            specification?.label
          ),

          value: cleanText(
            specification?.value
          ),
        }))
        .filter(
          (specification) =>
            specification.label &&
            specification.value
        );
    }

    /*
     * Sinon, les caractéristiques sont
     * extraites automatiquement de la
     * description longue.
     */
    return parseTechnicalSpecifications(
      description
    ).specifications;
  }, [
    description,
    specifications,
  ]);

  if (rows.length === 0) {
    return null;
  }

  return (
    <section className="mt-16">
      <p className="overline text-primary mb-2">
        Caractéristiques
      </p>

      <h2 className="font-display font-bold text-2xl sm:text-3xl mb-8">
        Caractéristiques techniques
      </h2>

      <div className="rounded-2xl border border-border overflow-hidden bg-card">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] text-sm">
            <thead className="bg-secondary/70">
              <tr>
                <th className="w-1/2 px-5 py-4 text-left font-bold">
                  Caractéristique
                </th>

                <th className="px-5 py-4 text-left font-bold">
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
                    className="border-t border-border"
                  >
                    <td className="px-5 py-4 text-muted-foreground align-top">
                      {
                        specification.label
                      }
                    </td>

                    <td className="px-5 py-4 font-medium align-top">
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
      </div>
    </section>
  );
}