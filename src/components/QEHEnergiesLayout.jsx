import React, { useEffect } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import QEHUniversalHeader from "./QEHUniversalHeader";

const navigation = [
  { to: "/qeh-energies/carte-solaire", label: "Carte solaire" },
  { to: "/qeh-energies/comment-ca-marche", label: "Comment ça marche ?" },
  { to: "/qeh-energies/participer", label: "Demandes locales" },
];

export default function QEHEnergiesLayout() {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-[#f4f8fb] text-slate-950">
      <QEHUniversalHeader
        activeBrand="energies"
        menuLabel="le menu QEH Énergies"
        directLinks={navigation}
      >
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-[#82d246]">
              QEH Énergies
            </p>
            <p className="mt-1 text-sm text-white/55">
              Découvrez l’énergie locale et rejoignez le projet.
            </p>
          </div>

          <Link
            to="/qeh-energies/participer"
            className="inline-flex min-h-11 items-center gap-2 rounded-full bg-[#69b72d] px-5 font-black text-[#020711] transition hover:bg-[#82d246]"
          >
            Participer au projet <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </QEHUniversalHeader>

      <main>
        <Outlet />
      </main>

      <footer className="border-t border-[#17649e]/30 bg-[#020711] text-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-5 py-8 sm:px-8 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <img src="/images/qeh-energies-logo.png" alt="QEH Énergies" className="h-12 w-auto object-contain" />
            <div>
              <p className="font-black">Énergie solaire locale</p>
              <p className="text-sm text-slate-400">Dans le rayon défini par QEH Énergies</p>
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
