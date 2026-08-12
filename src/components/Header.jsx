import React, { useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ChevronDown,
  Heart,
  LogOut,
  PackageSearch,
  ShoppingBag,
  User,
} from "lucide-react";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import { useCustomerAuth } from "../context/CustomerAuthContext";
import CatalogSearchMenu from "./CatalogSearchMenu";
import QEHUniversalHeader from "./QEHUniversalHeader";

const links = [
  { to: "/produits", label: "Produits" },
  { to: "/suivi-commande", label: "Suivi de commande" },
  { to: "/contact", label: "Contact" },
];

export const Header = () => {
  const navigate = useNavigate();
  const { count: cartCount } = useCart();
  const { count: wishlistCount } = useWishlist();
  const { isAuthenticated, profile, user, signOut } = useCustomerAuth();
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const accountMenuRef = useRef(null);

  const handleLogout = async () => {
    try {
      await signOut();
      setAccountMenuOpen(false);
      navigate("/");
    } catch (error) {
      console.error("Erreur lors de la déconnexion client :", error);
    }
  };

  const customerDisplayName =
    [
      profile?.first_name?.trim() || user?.user_metadata?.first_name?.trim(),
      profile?.last_name?.trim() || user?.user_metadata?.last_name?.trim(),
    ]
      .filter(Boolean)
      .join(" ") ||
    user?.email ||
    "Client";

  const accountControl = !isAuthenticated ? (
    <Link
      to="/connexion"
      title="Connexion à l’espace particulier"
      className="inline-flex min-h-11 shrink-0 items-center gap-2 rounded-full bg-[#ff5a00] px-3 font-bold text-white shadow-[0_10px_28px_rgba(255,90,0,0.24)] transition hover:bg-[#ff6d1a] sm:px-5"
    >
      <User className="h-5 w-5" />
      <span className="hidden sm:inline">Connexion particulier</span>
    </Link>
  ) : (
    <div ref={accountMenuRef} className="relative">
      <button
        type="button"
        onClick={() => setAccountMenuOpen((current) => !current)}
        title="Compte particulier"
        className="inline-flex min-h-11 shrink-0 items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 font-bold hover:border-[#ff5a00] sm:px-4"
      >
        <User className="h-5 w-5" />
        <span className="hidden max-w-44 truncate sm:inline">{customerDisplayName}</span>
        <ChevronDown className={`hidden h-4 w-4 transition sm:block ${accountMenuOpen ? "rotate-180" : ""}`} />
      </button>

      {accountMenuOpen ? (
        <div className="absolute right-0 top-14 z-20 w-[min(18rem,calc(100vw-1.5rem))] overflow-hidden rounded-2xl border border-slate-200 bg-white text-slate-950 shadow-2xl">
          <div className="border-b border-slate-200 px-5 py-4">
            <p className="font-black">Connecté en tant que particulier</p>
            <p className="truncate text-sm text-slate-500">{user?.email}</p>
          </div>
          <Link to="/mon-compte" className="flex gap-3 px-5 py-4 hover:bg-slate-100">
            <User className="h-5 w-5" /> Mon compte
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
    <QEHUniversalHeader
      activeBrand="outlet"
      menuLabel="le menu QEH OUTLET"
      directLinks={links}
      utilityLeft={<CatalogSearchMenu />}
      utilityRight={accountControl}
    >
      <div className="grid gap-5 lg:grid-cols-[1fr_auto]">
        <div className="hidden lg:block">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-[#ff7a32]">
            Services QEH OUTLET
          </p>
          <p className="mt-1 text-sm text-white/50">
            Recherche, suivi, panier et espace particulier.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 lg:justify-end">
          <Link
            to="/suivi-commande"
            title="Suivre une commande"
            className="inline-flex h-11 items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 font-semibold hover:border-[#0b5ca8]"
          >
            <PackageSearch className="h-5 w-5" />
            <span className="hidden sm:inline">Suivi</span>
          </Link>

          <Link
            to="/favoris"
            title="Mes favoris"
            className="relative grid h-11 w-11 place-items-center rounded-full border border-white/15 bg-white/5 hover:border-[#ff5a00]"
          >
            <Heart className="h-5 w-5" />
            {wishlistCount > 0 ? (
              <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-[#ff5a00] px-1 text-[11px] font-bold">
                {wishlistCount}
              </span>
            ) : null}
          </Link>

          <Link
            to="/panier"
            title="Mon panier"
            className="relative grid h-11 w-11 place-items-center rounded-full border border-white/15 bg-white/5 hover:border-[#ff5a00]"
          >
            <ShoppingBag className="h-5 w-5" />
            {cartCount > 0 ? (
              <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-[#ff5a00] px-1 text-[11px] font-bold">
                {cartCount}
              </span>
            ) : null}
          </Link>

        </div>
      </div>
    </QEHUniversalHeader>
  );
};

export default Header;
