import React, { useEffect, useRef, useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  ChevronDown,
  LogOut,
  ShoppingCart,
  User,
} from "lucide-react";
import { useCustomerAuth } from "../context/CustomerAuthContext";
import { useProfessionalAuth } from "../context/ProfessionalAuthContext";
import { usePartnerCart } from "../context/PartnerCartContext";
import PartnerCatalogSearchMenu from "./PartnerCatalogSearchMenu";
import QEHUniversalHeader from "./QEHUniversalHeader";

const navigation = [
  { to: "/qeh-partner/production", label: "Production" },
  { to: "/qeh-partner/materiel-pro", label: "Matériel Pro" },
  { to: "/qeh-partner/franchise", label: "Franchises" },
];

export default function QEHPartnerLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut } = useCustomerAuth();
  const { isProfessional, professionalAccount } = useProfessionalAuth();
  const { count } = usePartnerCart();
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const accountMenuRef = useRef(null);

  async function handleLogout() {
    await signOut();
    setAccountMenuOpen(false);
    navigate("/qeh-partner/connexion-pro");
  }

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    setAccountMenuOpen(false);
  }, [location.pathname]);

  const accountControl = !isProfessional ? (
    <Link
      to="/qeh-partner/connexion-pro"
      title="Connexion à l’espace professionnel"
      className="inline-flex h-10 min-h-10 w-10 shrink-0 items-center justify-center gap-2 rounded-full bg-[#f2cf79] p-0 font-bold text-[#07101c] shadow-[0_10px_28px_rgba(242,207,121,0.22)] transition hover:bg-[#ffe39a] lg:min-h-11 lg:w-auto lg:px-5"
    >
      <User className="h-5 w-5" />
      <span className="hidden lg:inline">Connexion Pro</span>
    </Link>
  ) : (
    <div ref={accountMenuRef} className="relative">
      <button
        type="button"
        onClick={() => setAccountMenuOpen((current) => !current)}
        title="Compte professionnel"
        className="inline-flex h-10 min-h-10 w-10 shrink-0 items-center justify-center gap-2 rounded-full border border-white/15 bg-white/5 p-0 font-bold hover:border-[#f2cf79] lg:min-h-11 lg:w-auto lg:px-4"
      >
        <User className="h-5 w-5" />
        <span className="hidden max-w-44 truncate lg:inline">
          {professionalAccount?.company_name || "Compte Pro"}
        </span>
        <ChevronDown className={`hidden h-4 w-4 transition lg:block ${accountMenuOpen ? "rotate-180" : ""}`} />
      </button>

      {accountMenuOpen ? (
        <div className="absolute right-0 top-14 z-20 w-[min(18rem,calc(100vw-1.5rem))] overflow-hidden rounded-2xl border border-[#e9d18b]/35 bg-white text-slate-950 shadow-2xl">
          <div className="border-b border-slate-200 px-5 py-4">
            <p className="font-black">Connecté en tant que professionnel</p>
            <p className="truncate text-sm text-slate-500">
              {professionalAccount?.company_name || "Compte professionnel QEH"}
            </p>
          </div>
          <Link to="/qeh-partner/panier-pro" className="flex gap-3 px-5 py-4 hover:bg-[#fff8e8]">
            <ShoppingCart className="h-5 w-5" /> Panier Pro
            {count > 0 ? <strong className="ml-auto">{count}</strong> : null}
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full gap-3 px-5 py-4 text-left text-red-600 hover:bg-red-50"
          >
            <LogOut className="h-5 w-5" /> Déconnexion
          </button>
        </div>
      ) : null}
    </div>
  );

  return (
    <div className="qehp-site">
      <QEHUniversalHeader
        activeBrand="partner"
        menuLabel="le menu QEH PARTNER"
        directLinks={navigation}
        utilityLeft={<PartnerCatalogSearchMenu />}
        utilityRight={accountControl}
      >
        <div className="grid gap-5 lg:grid-cols-[1fr_auto]">
          <div className="hidden lg:block">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-[#f2cf79]">
              Services QEH PARTNER
            </p>
            <p className="mt-1 text-sm text-white/50">
              Recherche Pro, production, panier professionnel et franchise.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 lg:justify-end">
            {isProfessional ? (
              <Link
                to="/qeh-partner/panier-pro"
                title="Mon panier professionnel"
                className="relative grid h-11 w-11 place-items-center rounded-full border border-white/15 bg-white/5 hover:border-[#f2cf79]"
              >
                <ShoppingCart className="h-5 w-5" />
                {count > 0 ? (
                  <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-[#f2cf79] px-1 text-[11px] font-bold text-[#07101c]">
                    {count}
                  </span>
                ) : null}
              </Link>
            ) : (
              <Link
                to="/qeh-partner/connexion-pro"
                className="inline-flex h-11 items-center gap-2 rounded-full border border-[#f2cf79]/35 bg-[#f2cf79]/10 px-4 font-semibold text-[#f7dd9a] transition hover:border-[#f2cf79] hover:bg-[#f2cf79]/15"
              >
                <User className="h-5 w-5" /> Connexion Pro
              </Link>
            )}
          </div>
        </div>
      </QEHUniversalHeader>

      <main>
        <Outlet />
      </main>

      <footer className="qehp-footer">
        <div className="qehp-container qehp-footer__inner">
          <div className="qehp-footer__brand">
            <img src="/images/qeh-partner-logo-gold.png" alt="QEH PARTNER" />
            <p>Production · Matériel · Franchises</p>
          </div>

          <div className="qehp-footer__links">
            <Link to="/qeh-outlet">QEH OUTLET</Link>
            <Link to="/qeh-energies">QEH Énergies</Link>
            <Link to="/contact">Contact</Link>
          </div>
        </div>

        <div className="qehp-footer__legal">
          © {new Date().getFullYear()} QEH PARTNER. Tous droits réservés.
        </div>
      </footer>
    </div>
  );
}
