import React, { useEffect, useState } from "react";
import {
  Link,
  NavLink,
  Outlet,
  useLocation,
} from "react-router-dom";
import { ArrowRight, Menu, X } from "lucide-react";

const navigation = [
  {
    to: "/qeh-energies/carte-solaire",
    label: "Carte solaire",
  },
  {
    to: "/qeh-energies/comment-ca-marche",
    label: "Comment ça marche ?",
  },
  {
    to: "/qeh-energies/participer",
    label: "Participer",
  },
];

export default function QEHEnergiesLayout() {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setMenuOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-[#f4f8fb] text-slate-950">
      <header className="sticky top-0 z-[1000] border-b border-[#17649e]/35 bg-[#020711]/95 text-white shadow-[0_12px_40px_rgba(2,7,17,0.24)] backdrop-blur-xl">
        <div className="mx-auto flex min-h-[76px] max-w-7xl items-center justify-between gap-4 px-3 py-3 sm:px-8">
          <div className="flex min-w-0 items-center gap-1.5 sm:gap-2">
            <Link
              to="/qeh-energies/carte-solaire"
              aria-label="QEH Énergies, univers sélectionné"
              aria-current="page"
              className="flex h-11 w-[92px] shrink-0 items-center justify-center overflow-hidden rounded-xl border border-[#69b72d] bg-[#020711] p-1 shadow-[0_8px_24px_rgba(105,183,45,0.18)] transition hover:-translate-y-0.5 sm:h-14 sm:w-[150px]"
            >
              <img
                src="/images/qeh-energies-logo.png"
                alt="QEH Énergies"
                className="h-full w-full object-contain"
              />
            </Link>

            <span className="block h-7 w-px shrink-0 bg-white/20 sm:h-9" />

            <Link
              to="/"
              aria-label="Accéder à QEH OUTLET"
              className="flex h-9 w-[55px] shrink-0 items-center justify-center overflow-hidden rounded-xl border border-[#ff5a00]/35 bg-[#020711] p-1 opacity-75 transition hover:-translate-y-0.5 hover:border-[#ff5a00] hover:opacity-100 sm:h-11 sm:w-[88px]"
            >
              <img
                src="/images/qeh-outlet-logo.jpg"
                alt="QEH OUTLET"
                className="h-full w-full object-contain"
              />
            </Link>

            <span className="block h-7 w-px shrink-0 bg-white/20 sm:h-9" />

            <Link
              to="/qeh-partner"
              aria-label="Accéder à QEH PARTNER"
              className="flex h-9 w-[55px] shrink-0 items-center justify-center overflow-hidden rounded-xl border border-[#c99532]/35 bg-[#020711] p-1 opacity-75 transition hover:-translate-y-0.5 hover:border-[#f2cf79] hover:opacity-100 sm:h-11 sm:w-[88px]"
            >
              <img
                src="/images/qeh-partner-logo-gold.png"
                alt="QEH PARTNER"
                className="h-full w-full object-contain"
              />
            </Link>
          </div>

          <nav
            className="hidden items-center gap-7 text-sm font-bold lg:flex"
            aria-label="Navigation QEH Énergies"
          >
            {navigation.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `relative py-3 transition ${
                    isActive
                      ? "text-[#82d246] after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:rounded-full after:bg-[#82d246]"
                      : "text-slate-300 hover:text-white"
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <Link
              to="/qeh-energies/participer"
              className="hidden min-h-11 items-center justify-center gap-2 rounded-full bg-[#69b72d] px-5 text-sm font-black text-[#020711] transition hover:bg-[#82d246] sm:inline-flex"
            >
              Participer
              <ArrowRight className="h-4 w-4" />
            </Link>

            <button
              type="button"
              onClick={() => setMenuOpen((current) => !current)}
              className="grid h-11 w-11 place-items-center rounded-xl border border-white/15 bg-white/5 text-white transition hover:border-[#69b72d] lg:hidden"
              aria-expanded={menuOpen}
              aria-label={menuOpen ? "Fermer le menu" : "Ouvrir le menu"}
            >
              {menuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {menuOpen ? (
          <nav
            className="border-t border-white/10 bg-[#020711] px-5 py-5 lg:hidden"
            aria-label="Navigation mobile QEH Énergies"
          >
            <div className="mx-auto flex max-w-7xl flex-col gap-2">
              {navigation.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `rounded-xl px-4 py-3 font-bold transition ${
                      isActive
                        ? "bg-[#69b72d] text-[#020711]"
                        : "bg-white/5 text-slate-200 hover:bg-white/10"
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </div>
          </nav>
        ) : null}
      </header>

      <main>
        <Outlet />
      </main>

      <footer className="border-t border-[#17649e]/30 bg-[#020711] text-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-5 py-8 sm:px-8 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <img
              src="/images/qeh-energies-logo.png"
              alt="QEH Énergies"
              className="h-12 w-auto object-contain"
            />
            <div>
              <p className="font-black">Énergie solaire locale</p>
              <p className="text-sm text-slate-400">Dans un rayon de 2 kilomètres</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm font-bold text-slate-300">
            {navigation.map((item) => (
              <Link key={item.to} to={item.to} className="hover:text-[#82d246]">
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}