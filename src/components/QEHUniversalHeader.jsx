import React, { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import QEHBrandSwitcher from "./QEHBrandSwitcher";

const themes = {
  outlet: {
    border: "border-[#ff5a00]/30",
    button: "hover:border-[#ff5a00] hover:bg-[#ff5a00]/15",
  },
  energies: {
    border: "border-[#82d246]/30",
    button: "hover:border-[#82d246] hover:bg-[#69b72d]/15",
  },
  partner: {
    border: "border-[#f2cf79]/30",
    button: "hover:border-[#f2cf79] hover:bg-[#c99532]/15",
  },
};

const directLinkThemes = {
  outlet: {
    active: "text-[#ff7a32] after:bg-[#ff5a00]",
    hover: "hover:text-[#ff9a63]",
  },
  energies: {
    active: "text-[#82d246] after:bg-[#82d246]",
    hover: "hover:text-[#a2e475]",
  },
  partner: {
    active: "text-[#f2cf79] after:bg-[#f2cf79]",
    hover: "hover:text-[#ffe7a9]",
  },
};

export default function QEHUniversalHeader({
  activeBrand,
  menuLabel,
  directLinks = [],
  utilityLeft = null,
  utilityRight = null,
  children,
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const theme = themes[activeBrand] || themes.outlet;
  const linkTheme = directLinkThemes[activeBrand] || directLinkThemes.outlet;
  const hasUtilities = Boolean(utilityLeft || utilityRight);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname, location.search]);

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape") setMenuOpen(false);
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, []);

  return (
    <header
      data-active-brand={activeBrand}
      className={`sticky top-0 z-[1000] border-b ${theme.border} bg-[#020711]/95 text-white shadow-[0_12px_40px_rgba(2,7,17,0.3)] backdrop-blur-xl`}
    >
      <div
        className={`mx-auto grid max-w-7xl items-center gap-x-3 px-3 py-2 sm:px-8 ${
          hasUtilities
            ? "min-h-[126px] grid-cols-[1fr_auto] grid-rows-[auto_auto] gap-y-2 lg:min-h-[82px] lg:grid-cols-[1fr_auto_1fr] lg:grid-rows-1"
            : "min-h-[82px] grid-cols-[48px_minmax(0,1fr)_48px] sm:grid-cols-[56px_minmax(0,1fr)_56px]"
        }`}
      >
        {hasUtilities ? (
          <div className="col-start-1 row-start-2 flex min-w-0 items-center justify-self-start lg:col-start-1 lg:row-start-1">
            {utilityLeft}
          </div>
        ) : (
          <span aria-hidden="true" />
        )}

        <QEHBrandSwitcher
          activeBrand={activeBrand}
          className={
            hasUtilities
              ? "col-span-2 col-start-1 row-start-1 mx-auto lg:col-span-1 lg:col-start-2"
              : "mx-auto"
          }
        />

        <div
          className={`flex min-w-0 items-center justify-self-end gap-2 ${
            hasUtilities
              ? "col-start-2 row-start-2 lg:col-start-3 lg:row-start-1"
              : ""
          }`}
        >
          {utilityRight}

          <button
            type="button"
            onClick={() => setMenuOpen((current) => !current)}
            aria-expanded={menuOpen}
            aria-label={menuOpen ? `Fermer ${menuLabel}` : `Ouvrir ${menuLabel}`}
            className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-white/15 bg-white/5 text-white transition sm:h-12 sm:w-12 ${theme.button}`}
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {directLinks.length > 0 ? (
        <nav
          className="border-t border-white/[0.06] bg-black/10"
          aria-label={`Accès directs ${menuLabel}`}
        >
          <div className="mx-auto flex max-w-7xl items-center justify-center gap-1 overflow-x-auto px-3 sm:gap-7 sm:px-8">
            {directLinks.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `relative flex min-h-11 shrink-0 items-center justify-center px-3 text-xs font-extrabold transition after:absolute after:inset-x-3 after:bottom-0 after:h-0.5 after:origin-center after:rounded-full after:transition-transform sm:px-4 sm:text-sm ${
                    isActive
                      ? `${linkTheme.active} after:scale-x-100`
                      : `text-white/65 after:scale-x-0 ${linkTheme.hover}`
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </div>
        </nav>
      ) : null}

      {menuOpen ? (
        <div className="absolute inset-x-0 top-full border-t border-white/10 bg-[#020711]/[0.99] shadow-[0_28px_70px_rgba(0,0,0,0.48)] backdrop-blur-2xl">
          <div className="mx-auto max-h-[calc(100vh-92px)] max-w-7xl overflow-y-auto px-5 py-6 sm:px-8">
            {children}
          </div>
        </div>
      ) : null}
    </header>
  );
}
