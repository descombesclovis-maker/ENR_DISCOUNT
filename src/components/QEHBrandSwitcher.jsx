import React from "react";
import { Link } from "react-router-dom";

const brands = [
  {
    id: "outlet",
    to: "/",
    src: "/images/qeh-outlet-logo.jpg",
    alt: "QEH OUTLET",
    accent: "#ff5a00",
  },
  {
    id: "energies",
    to: "/qeh-energies",
    src: "/images/qeh-energies-logo.png",
    alt: "QEH Énergies",
    accent: "#69b72d",
  },
  {
    id: "partner",
    to: "/qeh-partner",
    src: "/images/qeh-partner-logo-gold.png",
    alt: "QEH PARTNER",
    accent: "#c99532",
  },
];

export default function QEHBrandSwitcher({
  activeBrand,
  onNavigate,
  className = "",
}) {
  const orderedBrands = [...brands].sort((first, second) => {
    if (first.id === activeBrand) return -1;
    if (second.id === activeBrand) return 1;
    return brands.indexOf(first) - brands.indexOf(second);
  });

  return (
    <div
      className={`qeh-brand-switcher ${className}`.trim()}
      data-active-brand={activeBrand}
      aria-label="Changer d’univers QEH"
    >
      {orderedBrands.map((brand, index) => {
        const isActive = brand.id === activeBrand;

        return (
          <React.Fragment key={brand.id}>
            {index > 0 && (
              <span
                className="qeh-brand-switcher__separator"
                aria-hidden="true"
              />
            )}

            <Link
              to={brand.to}
              onClick={onNavigate}
              aria-label={
                isActive
                  ? `${brand.alt}, univers actuellement sélectionné`
                  : `Accéder à ${brand.alt}`
              }
              aria-current={isActive ? "page" : undefined}
              className={`qeh-brand-switcher__brand${
                isActive ? " is-active" : ""
              }`}
              style={{ "--qeh-brand-accent": brand.accent }}
            >
              <img src={brand.src} alt={brand.alt} />

              {isActive && (
                <span className="qeh-brand-switcher__active-label">
                  Univers sélectionné
                </span>
              )}
            </Link>
          </React.Fragment>
        );
      })}
    </div>
  );
}