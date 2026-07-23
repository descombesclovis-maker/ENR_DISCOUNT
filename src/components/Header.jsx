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

  const [open, setOpen] =
    useState(false);

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

  return (
    <header
      data-testid="site-header"
      className="sticky top-0 z-50 backdrop-blur-xl bg-background/80 border-b border-border/60"
    >
      <div className="max-w-7xl mx-auto px-5 sm:px-8 h-16 sm:h-20 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <CatalogSearchMenu />

          <Link
            to="/"
            data-testid="logo-link"
            aria-label="Retour à l’accueil EcoConfortHabitat.fr"
            className="group shrink-0 flex items-center"
          >
            <span className="whitespace-nowrap font-display font-black text-[15px] sm:text-xl tracking-[-0.045em] leading-none">
              <span className="text-foreground transition-colors group-hover:text-primary">
                EcoConfort
              </span>

              <span className="text-primary">
                Habitat
              </span>

              <span className="text-primary/70 text-[0.72em] tracking-[-0.02em]">
                .fr
              </span>
            </span>
          </Link>
        </div>

        <nav className="hidden lg:flex items-center gap-9">
          {links.map(
            (link) => (
              <Link
                key={link.to}
                to={link.to}
                data-testid={`nav-${link.label.toLowerCase()}`}
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  isLinkActive(
                    link.to
                  )
                    ? "text-primary"
                    : "text-foreground/70"
                }`}
              >
                {link.label}
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
            className={`hidden sm:inline-flex items-center justify-center gap-2 h-11 px-4 rounded-full border transition-colors ${
              location.pathname ===
              "/suivi-commande"
                ? "border-primary bg-primary/10 text-primary"
                : "border-border hover:bg-secondary"
            }`}
          >
            <PackageSearch className="w-5 h-5" />

            <span className="hidden xl:inline text-sm font-semibold">
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
                ? "border-primary bg-primary/10 text-primary"
                : "border-border hover:bg-secondary"
            }`}
          >
            <Heart className="w-5 h-5" />

            {wishlistCount > 0 && (
              <span
                data-testid="wishlist-count"
                className="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full bg-primary text-primary-foreground text-[11px] font-bold grid place-items-center"
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
                ? "border-primary bg-primary/10 text-primary"
                : "border-border hover:bg-secondary"
            }`}
          >
            <ShoppingBag className="w-5 h-5" />

            {cartCount > 0 && (
              <span
                data-testid="cart-count"
                className="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full bg-primary text-primary-foreground text-[11px] font-bold grid place-items-center"
              >
                {cartCount}
              </span>
            )}
          </Link>

          <button
            type="button"
            className="lg:hidden w-11 h-11 rounded-full border border-border grid place-items-center hover:bg-secondary transition-colors"
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
        <div className="lg:hidden border-t border-border px-5 py-4 bg-background">
          <nav className="flex flex-col gap-2">
            {links.map(
              (link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() =>
                    setOpen(false)
                  }
                  className={`min-h-11 flex items-center rounded-xl px-4 text-base font-medium transition-colors ${
                    isLinkActive(
                      link.to
                    )
                      ? "bg-primary/10 text-primary"
                      : "hover:bg-secondary"
                  }`}
                  data-testid={`mobile-nav-${link.label.toLowerCase()}`}
                >
                  {link.label}
                </Link>
              )
            )}

            <div className="h-px bg-border my-2" />

            <Link
              to="/suivi-commande"
              onClick={() =>
                setOpen(false)
              }
              className={`min-h-11 flex items-center gap-3 rounded-xl px-4 text-base font-medium transition-colors ${
                location.pathname ===
                "/suivi-commande"
                  ? "bg-primary/10 text-primary"
                  : "hover:bg-secondary"
              }`}
            >
              <PackageSearch className="w-5 h-5" />

              Suivi de commande
            </Link>

            <Link
              to="/favoris"
              onClick={() =>
                setOpen(false)
              }
              className={`min-h-11 flex items-center justify-between gap-3 rounded-xl px-4 text-base font-medium transition-colors ${
                location.pathname ===
                "/favoris"
                  ? "bg-primary/10 text-primary"
                  : "hover:bg-secondary"
              }`}
            >
              <span className="flex items-center gap-3">
                <Heart className="w-5 h-5" />

                Mes favoris
              </span>

              {wishlistCount > 0 && (
                <span className="min-w-6 h-6 px-2 rounded-full bg-primary text-primary-foreground text-xs font-bold grid place-items-center">
                  {wishlistCount}
                </span>
              )}
            </Link>

            <Link
              to="/panier"
              onClick={() =>
                setOpen(false)
              }
              className={`min-h-11 flex items-center justify-between gap-3 rounded-xl px-4 text-base font-medium transition-colors ${
                location.pathname ===
                "/panier"
                  ? "bg-primary/10 text-primary"
                  : "hover:bg-secondary"
              }`}
            >
              <span className="flex items-center gap-3">
                <ShoppingBag className="w-5 h-5" />

                Mon panier
              </span>

              {cartCount > 0 && (
                <span className="min-w-6 h-6 px-2 rounded-full bg-primary text-primary-foreground text-xs font-bold grid place-items-center">
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