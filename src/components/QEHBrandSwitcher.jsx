import React from "react";
import { Link } from "react-router-dom";

const brands = [
  {
    id: "outlet",
    to: "/",
    src: "/images/qeh-outlet-logo.jpg",
    alt: "QEH OUTLET",
    activeBorder: "border-[#ff5a00]",
    activeShadow: "shadow-[0_0_26px_rgba(255,90,0,0.28)]",
  },
  {
    id: "energies",
    to: "/qeh-energies",
    src: "/images/qeh-energies-logo.png",
    alt: "QEH Énergies",
    activeBorder: "border-[#82d246]",
    activeShadow: "shadow-[0_0_30px_rgba(130,210,70,0.3)]",
    featured: true,
  },
  {
    id: "partner",
    to: "/qeh-partner",
    src: "/images/qeh-partner-logo-gold.png",
    alt: "QEH PARTNER",
    activeBorder: "border-[#f2cf79]",
    activeShadow: "shadow-[0_0_26px_rgba(242,207,121,0.28)]",
  },
];

export default function QEHBrandSwitcher({
  activeBrand,
  onNavigate,
  className = "",
}) {
  return (
    <nav
      className={`flex min-w-0 items-center justify-center gap-1 lg:gap-3 ${className}`.trim()}
      aria-label="Changer d’univers QEH"
    >
      {brands.map((brand) => {
        const isActive = brand.id === activeBrand;

        return (
          <Link
            key={brand.id}
            to={brand.to}
            onClick={onNavigate}
            aria-label={
              isActive
                ? `${brand.alt}, univers actuellement sélectionné`
                : `Accéder à ${brand.alt}`
            }
            aria-current={isActive ? "page" : undefined}
            title={brand.alt}
            className={`group relative flex shrink-0 items-center justify-center overflow-hidden rounded-lg bg-[#020711] p-0.5 transition duration-300 hover:-translate-y-0.5 hover:opacity-100 lg:rounded-2xl lg:p-1 ${
              brand.featured
                ? "h-9 w-[54px] lg:h-16 lg:w-[150px]"
                : "h-8 w-[42px] lg:h-[52px] lg:w-[116px]"
            } ${
              isActive
                ? `border-2 opacity-100 ${brand.activeBorder} ${brand.activeShadow}`
                : "border border-white/15 opacity-70 hover:border-white/40"
            }`}
          >
            <img
              src={brand.src}
              alt={brand.alt}
              className="h-full w-full object-contain transition duration-300 group-hover:scale-[1.03]"
            />

            {isActive ? (
              <span
                className={`absolute inset-x-3 bottom-0 h-0.5 rounded-full ${
                  brand.id === "outlet"
                    ? "bg-[#ff5a00]"
                    : brand.id === "energies"
                      ? "bg-[#82d246]"
                      : "bg-[#f2cf79]"
                }`}
                aria-hidden="true"
              />
            ) : null}
          </Link>
        );
      })}
    </nav>
  );
}
