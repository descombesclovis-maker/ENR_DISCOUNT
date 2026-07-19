import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { ShoppingBag, Menu, X, Zap } from "lucide-react";
import { useCart } from "../context/CartContext";

const links = [
  { to: "/", label: "Accueil" },
  { to: "/produits", label: "Produits" },
  { to: "/contact", label: "Contact" },
];

export const Header = () => {
  const { count } = useCart();
  const [open, setOpen] = useState(false);
  const location = useLocation();

  return (
    <header
      data-testid="site-header"
      className="sticky top-0 z-50 backdrop-blur-xl bg-background/80 border-b border-border/60"
    >
      <div className="max-w-7xl mx-auto px-5 sm:px-8 h-16 sm:h-20 flex items-center justify-between">
        <Link to="/" data-testid="logo-link" className="flex items-center gap-2 group">
          <span className="w-9 h-9 rounded-lg bg-primary text-primary-foreground grid place-items-center">
            <Zap className="w-5 h-5" strokeWidth={2.4} />
          </span>
          <span className="font-display font-extrabold text-lg sm:text-xl tracking-tight leading-none">
            ENR <span className="text-primary">discount</span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-9">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              data-testid={`nav-${l.label.toLowerCase()}`}
              className={`text-sm font-medium transition-colors hover:text-primary ${
                location.pathname === l.to ? "text-primary" : "text-foreground/70"
              }`}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Link
            to="/panier"
            data-testid="cart-link"
            className="relative w-11 h-11 rounded-full border border-border grid place-items-center hover:bg-secondary transition-colors"
          >
            <ShoppingBag className="w-5 h-5" />
            {count > 0 && (
              <span
                data-testid="cart-count"
                className="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full bg-primary text-primary-foreground text-[11px] font-bold grid place-items-center"
              >
                {count}
              </span>
            )}
          </Link>
          <button
            className="md:hidden w-11 h-11 rounded-full border border-border grid place-items-center"
            onClick={() => setOpen(!open)}
            data-testid="mobile-menu-toggle"
          >
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden border-t border-border px-5 py-4 flex flex-col gap-4 bg-background">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              onClick={() => setOpen(false)}
              className="text-base font-medium"
              data-testid={`mobile-nav-${l.label.toLowerCase()}`}
            >
              {l.label}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
};
