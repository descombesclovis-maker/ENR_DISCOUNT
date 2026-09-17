import React, { useEffect } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { LogIn, LogOut, ShoppingCart, User } from "lucide-react";
import { useCustomerAuth } from "../context/CustomerAuthContext";
import { useProfessionalAuth } from "../context/ProfessionalAuthContext";
import { usePartnerCart } from "../context/PartnerCartContext";
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

  async function handleLogout() {
    await signOut();
    navigate("/qeh-partner/connexion-pro");
  }

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [location.pathname]);

  return (
    <div className="qehp-site">
      <QEHUniversalHeader
        activeBrand="partner"
        menuLabel="le menu QEH PARTNER"
        directLinks={navigation}
        utilityRight={
          !isProfessional ? (
            <Link
              to="/qeh-partner/connexion-pro"
              className="inline-flex h-10 items-center justify-center gap-1.5 rounded-xl border border-[#f2cf79]/45 bg-[#f2cf79]/10 px-2.5 text-[11px] font-black text-[#f7dd9a] shadow-[0_8px_24px_rgba(242,207,121,.08)] transition hover:-translate-y-0.5 hover:border-[#f2cf79] hover:bg-[#f2cf79]/20 hover:text-[#fff1bd] sm:px-3 sm:text-xs lg:h-12 lg:px-4"
              aria-label="Connexion professionnelle QEH PARTNER"
            >
              <LogIn className="h-4 w-4 shrink-0" />
              <span>Connexion</span>
            </Link>
          ) : null
        }
      >
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-[#f2cf79]">
              Espace professionnel QEH PARTNER
            </p>
            <p className="mt-1 text-sm text-white/55">
              Compte, panier professionnel et accès sécurisé.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {isProfessional ? (
              <>
                <Link
                  to="/qeh-partner/panier-pro"
                  className="qehp-pro-account qehp-pro-account--cart"
                  aria-label={`Panier professionnel, ${count} article(s)`}
                >
                  <ShoppingCart />
                  <span>{count}</span>
                </Link>

                <div className="qehp-pro-account qehp-pro-account--identity">
                  <User />
                  <span>
                    <small>Connecté en tant que professionnel</small>
                    <strong>{professionalAccount?.company_name || "Compte professionnel"}</strong>
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="qehp-pro-account qehp-pro-account--logout"
                  aria-label="Déconnexion professionnelle"
                >
                  <LogOut />
                </button>
              </>
            ) : (
              <Link to="/qeh-partner/connexion-pro" className="qehp-pro-login-link">
                <User /> Connexion Pro
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
