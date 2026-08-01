import React, {
  useState,
} from "react";

import {
  Link,
  useLocation,
} from "react-router-dom";

import {
  Heart,
  Menu,
  PackageSearch,
  ShoppingBag,
  X,
} from "lucide-react";

import {
  useCart,
} from "../context/CartContext";

import {
  useWishlist,
} from "../context/WishlistContext";

import CatalogSearchMenu from "./CatalogSearchMenu";

const links = [
  {
    to: "/",
    label: "Accueil",
  },
  {
    to: "/produits",
    label: "Produits",
  },
  {
    to: "/contact",
    label: "Contact",
  },
];

export const Header = () => {
  const {
    count: cartCount,
  } = useCart();

  const {
    count: wishlistCount,
  } = useWishlist();

  const [
    open,
    setOpen,
  ] = useState(false);

  const location =
    useLocation();

  const isLinkActive = (
    path
  ) => {
    if (path === "/") {
      return (
        location.pathname === "/"
      );
    }

    return location.pathname.startsWith(
      path
    );
  };

  const closeMobileMenu =
    () => {
      setOpen(false);
    };

  return (
    <header
      data-testid="site-header"
      className="sticky top-0 z-50 border-b border-[#0b5ca8]/30 bg-[#030a18]/95 text-white shadow-[0_10px_35px_rgba(0,0,0,0.18)] backdrop-blur-xl"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-8 min-h-20 py-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 sm:gap-4 min-w-0">
          <CatalogSearchMenu />

          <Link
            to="/"
            data-testid="logo-link"
            aria-label="Retour à l’accueil QEH OUTLET"
            className="group flex items-center shrink-0"
          >
            <span className="flex items-center overflow-hidden rounded-xl border border-[#0b5ca8]/50 bg-[#020714] shadow-[0_8px_24px_rgba(0,0,0,0.28)] transition-all duration-300 group-hover:border-[#ff5a00]/80 group-hover:shadow-[0_10px_30px_rgba(255,90,0,0.12)]">
              <img
                src="/images/qeh-outlet-logo.jpg"
                alt="QEH OUTLET"
                className="h-11 sm:h-14 w-auto max-w-[150px] sm:max-w-[220px] object-contain"
              />
            </span>
          </Link>
        </div>

        <nav className="hidden lg:flex items-center gap-8">
          {links.map(
            (link) => (
              <Link
                key={link.to}
                to={link.to}
                data-testid={`nav-${link.label.toLowerCase()}`}
                className={`relative py-2 text-sm font-semibold transition-colors ${
                  isLinkActive(
                    link.to
                  )
                    ? "text-[#ff5a00]"
                    : "text-white/75 hover:text-white"
                }`}
              >
                {link.label}

                {isLinkActive(
                  link.to
                ) && (
                  <span className="absolute left-0 right-0 -bottom-1 h-0.5 rounded-full bg-[#ff5a00]" />
                )}
              </Link>
            )
          )}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            to="/suivi-commande"
            data-testid="tracking-link"
            title="Suivre une commande"
            aria-label="Suivre une commande"
            className={`hidden sm:inline-flex items-center justify-center gap-2 h-11 px-4 rounded-full border text-sm font-semibold transition-colors ${
              location.pathname ===
              "/suivi-commande"
                ? "border-[#ff5a00] bg-[#ff5a00] text-white"
                : "border-white/20 bg-white/5 text-white hover:border-[#0b5ca8] hover:bg-[#0b5ca8]/20"
            }`}
          >
            <PackageSearch className="w-5 h-5" />

            <span className="hidden xl:inline">
              Suivi
            </span>
          </Link>

          <Link
            to="/favoris"
            data-testid="wishlist-link"
            title="Mes favoris"
            aria-label="Mes favoris"
            className={`relative w-11 h-11 rounded-full border grid place-items-center transition-colors ${
              location.pathname ===
              "/favoris"
                ? "border-[#ff5a00] bg-[#ff5a00] text-white"
                : "border-white/20 bg-white/5 text-white hover:border-[#0b5ca8] hover:bg-[#0b5ca8]/20"
            }`}
          >
            <Heart className="w-5 h-5" />

            {wishlistCount > 0 && (
              <span
                data-testid="wishlist-count"
                className="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full bg-[#ff5a00] text-white text-[11px] font-bold grid place-items-center"
              >
                {wishlistCount}
              </span>
            )}
          </Link>

          <Link
            to="/panier"
            data-testid="cart-link"
            title="Mon panier"
            aria-label="Mon panier"
            className={`relative w-11 h-11 rounded-full border grid place-items-center transition-colors ${
              location.pathname ===
              "/panier"
                ? "border-[#ff5a00] bg-[#ff5a00] text-white"
                : "border-white/20 bg-white/5 text-white hover:border-[#0b5ca8] hover:bg-[#0b5ca8]/20"
            }`}
          >
            <ShoppingBag className="w-5 h-5" />

            {cartCount > 0 && (
              <span
                data-testid="cart-count"
                className="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full bg-[#ff5a00] text-white text-[11px] font-bold grid place-items-center"
              >
                {cartCount}
              </span>
            )}
          </Link>

          <button
            type="button"
            onClick={() =>
              setOpen(
                (
                  currentValue
                ) =>
                  !currentValue
              )
            }
            data-testid="mobile-menu-toggle"
            aria-label={
              open
                ? "Fermer le menu"
                : "Ouvrir le menu"
            }
            aria-expanded={open}
            className="lg:hidden w-11 h-11 rounded-full border border-white/20 bg-white/5 text-white grid place-items-center hover:border-[#0b5ca8] hover:bg-[#0b5ca8]/20 transition-colors"
          >
            {open ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      {open && (
        <div className="lg:hidden border-t border-white/10 bg-[#030a18] px-5 py-5">
          <nav className="flex flex-col gap-2">
            {links.map(
              (link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={
                    closeMobileMenu
                  }
                  data-testid={`mobile-nav-${link.label.toLowerCase()}`}
                  className={`min-h-11 flex items-center rounded-xl px-4 text-base font-semibold transition-colors ${
                    isLinkActive(
                      link.to
                    )
                      ? "bg-[#ff5a00] text-white"
                      : "text-white/80 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  {link.label}
                </Link>
              )
            )}

            <div className="h-px bg-white/10 my-2" />

            <Link
              to="/suivi-commande"
              onClick={
                closeMobileMenu
              }
              className={`min-h-11 flex items-center gap-3 rounded-xl px-4 text-base font-semibold transition-colors ${
                location.pathname ===
                "/suivi-commande"
                  ? "bg-[#ff5a00] text-white"
                  : "text-white/80 hover:bg-white/10 hover:text-white"
              }`}
            >
              <PackageSearch className="w-5 h-5" />

              Suivi de commande
            </Link>

            <Link
              to="/favoris"
              onClick={
                closeMobileMenu
              }
              className={`min-h-11 flex items-center justify-between gap-3 rounded-xl px-4 text-base font-semibold transition-colors ${
                location.pathname ===
                "/favoris"
                  ? "bg-[#ff5a00] text-white"
                  : "text-white/80 hover:bg-white/10 hover:text-white"
              }`}
            >
              <span className="flex items-center gap-3">
                <Heart className="w-5 h-5" />
                Mes favoris
              </span>

              {wishlistCount > 0 && (
                <span className="min-w-6 h-6 px-2 rounded-full bg-[#ff5a00] text-white text-xs font-bold grid place-items-center">
                  {wishlistCount}
                </span>
              )}
            </Link>

            <Link
              to="/panier"
              onClick={
                closeMobileMenu
              }
              className={`min-h-11 flex items-center justify-between gap-3 rounded-xl px-4 text-base font-semibold transition-colors ${
                location.pathname ===
                "/panier"
                  ? "bg-[#ff5a00] text-white"
                  : "text-white/80 hover:bg-white/10 hover:text-white"
              }`}
            >
              <span className="flex items-center gap-3">
                <ShoppingBag className="w-5 h-5" />
                Mon panier
              </span>

              {cartCount > 0 && (
                <span className="min-w-6 h-6 px-2 rounded-full bg-[#ff5a00] text-white text-xs font-bold grid place-items-center">
                  {cartCount}
                </span>
              )}
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
};