import React, { useEffect, useState } from "react";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { LogOut, Menu, ShoppingCart, User, X } from "lucide-react";
import { useCustomerAuth } from "../context/CustomerAuthContext";
import { useProfessionalAuth } from "../context/ProfessionalAuthContext";
import { usePartnerCart } from "../context/PartnerCartContext";

const navigation = [
  { to: "/qeh-partner", label: "Accueil", end: true },
  { to: "/qeh-partner/production", label: "Production" },
  { to: "/qeh-partner/materiel-pro", label: "Matériel Pro" },
  { to: "/qeh-partner/franchise", label: "Franchises" },
];

export default function QEHPartnerLayout() {
  const [menuOpen, setMenuOpen] = useState(false);
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
    setMenuOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [location.pathname]);

  return (
    <div className="qehp-site">
      <header className="qehp-header">
        <div className="qehp-header__glow" aria-hidden="true" />

        <div className="qehp-container qehp-header__inner">
          {/* LES TROIS LOGOS QEH */}
          <div className="flex min-w-0 items-center gap-1.5 sm:gap-2">
            {/* 1. QEH PARTNER : univers actuellement sélectionné */}
            <Link
              to="/qeh-partner"
              aria-label="QEH PARTNER, univers sélectionné"
              aria-current="page"
              className="flex h-11 w-[92px] shrink-0 items-center justify-center overflow-hidden rounded-xl border border-[#c99532] bg-[#020711] p-1 shadow-[0_8px_24px_rgba(201,149,50,0.18)] transition hover:-translate-y-0.5 sm:h-14 sm:w-[150px]"
            >
              <img
                src="/images/qeh-partner-logo-gold.png"
                alt="QEH PARTNER"
                className="h-full w-full object-contain"
              />
            </Link>

            <span className="block h-7 w-px shrink-0 bg-white/20 sm:h-9" />

            {/* 2. QEH OUTLET */}
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

            {/* 3. QEH ÉNERGIES */}
            <Link
              to="/qeh-energies"
              aria-label="Accéder à QEH Énergies"
              className="flex h-9 w-[55px] shrink-0 items-center justify-center overflow-hidden rounded-xl border border-[#69b72d]/35 bg-[#020711] p-1 opacity-75 transition hover:-translate-y-0.5 hover:border-[#82d246] hover:opacity-100 sm:h-11 sm:w-[88px]"
            >
              <img
                src="/images/qeh-energies-logo.png"
                alt="QEH Énergies"
                className="h-full w-full object-contain"
              />
            </Link>
          </div>

          <nav className="qehp-nav" aria-label="Navigation QEH PARTNER">
            {navigation.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `qehp-nav__link${isActive ? " is-active" : ""}`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="qehp-header__actions">
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
                    <strong>{professionalAccount?.company_name}</strong>
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

            <button
              type="button"
              className="qehp-menu-button"
              onClick={() => setMenuOpen((current) => !current)}
              aria-expanded={menuOpen}
              aria-label={menuOpen ? "Fermer le menu" : "Ouvrir le menu"}
            >
              {menuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>

        {menuOpen && (
          <nav className="qehp-mobile-nav" aria-label="Navigation mobile">
            {navigation.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `qehp-mobile-nav__link${isActive ? " is-active" : ""}`
                }
              >
                {item.label}
              </NavLink>
            ))}

            {isProfessional ? (
              <>
                <Link to="/qeh-partner/panier-pro" className="qehp-mobile-nav__network">
                  <ShoppingCart /> Panier professionnel ({count})
                </Link>
                <button type="button" onClick={handleLogout} className="qehp-mobile-nav__network">
                  <LogOut /> Déconnexion professionnelle
                </button>
              </>
            ) : (
              <Link to="/qeh-partner/connexion-pro" className="qehp-mobile-nav__network">
                <User /> Connexion professionnelle
              </Link>
            )}

            <Link to="/" className="qehp-mobile-nav__network">
              Accéder à QEH OUTLET
            </Link>
            <Link to="/qeh-energies" className="qehp-mobile-nav__network">
              Accéder à QEH Énergies
            </Link>
          </nav>
        )}
      </header>

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
            <Link to="/">QEH OUTLET</Link>
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