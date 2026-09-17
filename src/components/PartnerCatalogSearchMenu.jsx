import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  AlertCircle,
  LoaderCircle,
  Lock,
  PackageSearch,
  Search,
  ShieldCheck,
  X,
} from "lucide-react";
import { supabase } from "../lib/supabase";
import { useProfessionalAuth } from "../context/ProfessionalAuthContext";

function normalizeSearchText(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function money(value) {
  return Number(value || 0).toLocaleString("fr-FR", {
    style: "currency",
    currency: "EUR",
  });
}

export default function PartnerCatalogSearchMenu() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isProfessional } = useProfessionalAuth();
  const menuRef = useRef(null);
  const searchInputRef = useRef(null);

  const [open, setOpen] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const professionalDestination = "/qeh-partner/materiel-pro";

  const redirectToProfessionalLogin = () => {
    setOpen(false);
    navigate("/qeh-partner/connexion-pro", {
      state: { from: professionalDestination },
    });
  };

  useEffect(() => {
    setOpen(false);
    setSearchText("");
  }, [location.pathname, location.search]);

  useEffect(() => {
    if (!open || !isProfessional || loaded) return;

    let active = true;

    async function loadProfessionalCatalog() {
      setLoading(true);
      setErrorMessage("");

      const { data, error } = await supabase
        .from("qeh_partner_products")
        .select("id, name, reference, description, category, price_excluding_tax, stock, image_url, is_active")
        .eq("is_active", true)
        .order("name", { ascending: true });

      if (!active) return;

      if (error) {
        setProducts([]);
        setErrorMessage(error.message || "Impossible de charger le catalogue professionnel.");
      } else {
        setProducts(data || []);
        setLoaded(true);
      }

      setLoading(false);
    }

    loadProfessionalCatalog();
    return () => {
      active = false;
    };
  }, [open, isProfessional, loaded]);

  useEffect(() => {
    if (!open) return undefined;

    const onOutsideClick = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    const onEscape = (event) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", onOutsideClick);
    document.addEventListener("keydown", onEscape);

    if (isProfessional) {
      window.setTimeout(() => searchInputRef.current?.focus(), 100);
    }

    return () => {
      document.removeEventListener("mousedown", onOutsideClick);
      document.removeEventListener("keydown", onEscape);
    };
  }, [open, isProfessional]);

  const filteredProducts = useMemo(() => {
    const needle = normalizeSearchText(searchText);
    if (!needle) return products.slice(0, 8);

    return products
      .filter((product) =>
        normalizeSearchText([
          product.name,
          product.reference,
          product.category,
          product.description,
        ].filter(Boolean).join(" ")).includes(needle)
      )
      .slice(0, 12);
  }, [products, searchText]);

  return (
    <div ref={menuRef} className="relative shrink-0">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-label={open ? "Fermer la recherche professionnelle" : "Ouvrir la recherche professionnelle"}
        aria-expanded={open}
        title="Rechercher dans le catalogue professionnel"
        className={`grid h-10 w-10 place-items-center rounded-full border transition-all duration-200 sm:h-11 sm:w-11 ${
          open
            ? "border-[#f2cf79] bg-[#f2cf79] text-[#07101c] shadow-[0_10px_30px_rgba(242,207,121,0.24)]"
            : "border-white/20 bg-white/5 text-white hover:border-[#f2cf79] hover:bg-[#f2cf79]/15"
        }`}
      >
        {open ? <X className="h-5 w-5" /> : <Search className="h-5 w-5" />}
      </button>

      {open ? (
        <div className="absolute left-0 top-[calc(100%+14px)] z-[70] max-h-[calc(100vh-110px)] w-[min(94vw,760px)] overflow-hidden rounded-3xl border border-[#f2cf79]/35 bg-white text-slate-900 shadow-[0_28px_90px_rgba(2,7,20,0.42)]">
          <div className="relative overflow-hidden border-b border-white/10 bg-[#020714] p-4 sm:p-5">
            <div className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-[#f2cf79]/20 blur-3xl" />

            <div className="relative mb-4">
              <p className="text-[11px] font-black uppercase tracking-[0.22em] text-[#f2cf79]">
                QEH PARTNER
              </p>
              <h2 className="mt-1 font-display text-xl font-black text-white sm:text-2xl">
                Catalogue professionnel
              </h2>
              <p className="mt-1 text-xs text-white/50 sm:text-sm">
                {isProfessional
                  ? "Recherchez un produit, une catégorie ou une référence."
                  : "Le catalogue et les tarifs sont réservés aux professionnels validés."}
              </p>
            </div>

            <div className="relative">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#f2cf79]" />
              <input
                ref={searchInputRef}
                type="search"
                value={searchText}
                onChange={(event) => {
                  if (isProfessional) setSearchText(event.target.value);
                }}
                onClick={() => {
                  if (!isProfessional) redirectToProfessionalLogin();
                }}
                onFocus={() => {
                  if (!isProfessional) redirectToProfessionalLogin();
                }}
                readOnly={!isProfessional}
                placeholder={isProfessional ? "Rechercher un produit ou une référence…" : "Connectez-vous pour rechercher…"}
                autoComplete="off"
                aria-label={isProfessional ? "Rechercher dans le catalogue professionnel" : "Se connecter pour rechercher dans le catalogue professionnel"}
                className={`h-12 w-full rounded-2xl border border-white/15 bg-white/10 pl-12 pr-12 text-white outline-none placeholder:text-white/40 focus:border-[#f2cf79] focus:ring-2 focus:ring-[#f2cf79]/25 ${
                  !isProfessional ? "cursor-pointer" : ""
                }`}
              />
              {searchText && isProfessional ? (
                <button
                  type="button"
                  onClick={() => setSearchText("")}
                  aria-label="Effacer la recherche"
                  className="absolute right-3 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full text-white/60 hover:bg-white/10 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              ) : null}
            </div>
          </div>

          <div className="max-h-[calc(100vh-255px)] overflow-y-auto bg-slate-50 p-3 sm:p-4">
            {!isProfessional ? (
              <div>
                <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4 sm:gap-3">
                  {[0, 1, 2, 3].map((item) => (
                    <Link
                      key={item}
                      to="/qeh-partner/connexion-pro"
                      state={{ from: professionalDestination }}
                      onClick={() => setOpen(false)}
                      aria-label="Se connecter pour voir ce produit professionnel"
                      className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-2 shadow-sm transition hover:-translate-y-1 hover:border-[#d2ad4e] hover:shadow-lg"
                    >
                      <div className="relative aspect-square overflow-hidden rounded-xl bg-gradient-to-br from-slate-100 to-slate-200">
                        <div className="absolute inset-0 bg-[linear-gradient(135deg,transparent_0%,rgba(242,207,121,.18)_48%,transparent_100%)] blur-sm" />
                        <div className="absolute inset-0 grid place-items-center backdrop-blur-md">
                          <span className="grid h-11 w-11 place-items-center rounded-full border border-[#c99532]/25 bg-white/80 text-[#9a6d1b] shadow-lg transition group-hover:scale-105 group-hover:bg-[#fff7dd]">
                            <Lock className="h-5 w-5" />
                          </span>
                        </div>
                      </div>
                      <div className="space-y-2 p-2 pb-1">
                        <div className="h-2.5 w-2/3 rounded-full bg-slate-200" />
                        <div className="h-3 w-full rounded-full bg-slate-300" />
                        <div className="h-3 w-3/4 rounded-full bg-slate-200" />
                      </div>
                    </Link>
                  ))}
                </div>

                <div className="mt-4 rounded-2xl border border-[#d7b85e]/30 bg-[#fff9e8] p-4 text-center">
                  <ShieldCheck className="mx-auto h-7 w-7 text-[#9a6d1b]" />
                  <p className="mt-2 font-black text-slate-900">Catalogue professionnel verrouillé</p>
                  <p className="mx-auto mt-1 max-w-md text-xs leading-relaxed text-slate-600 sm:text-sm">
                    Connectez-vous avec un compte Pro QEH validé pour afficher les produits, stocks, références et tarifs HT.
                  </p>
                  <Link
                    to="/qeh-partner/connexion-pro"
                    state={{ from: professionalDestination }}
                    onClick={() => setOpen(false)}
                    className="mt-4 inline-flex min-h-10 items-center justify-center gap-2 rounded-full bg-[#f2cf79] px-5 text-sm font-black text-[#07101c] transition hover:-translate-y-0.5 hover:brightness-105"
                  >
                    <Lock className="h-4 w-4" /> Connexion Pro
                  </Link>
                </div>
              </div>
            ) : loading ? (
              <div className="py-14 text-center">
                <LoaderCircle className="mx-auto mb-4 h-9 w-9 animate-spin text-[#b98b2d]" />
                <p className="font-semibold">Chargement du catalogue Pro…</p>
              </div>
            ) : errorMessage ? (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-10 text-center">
                <AlertCircle className="mx-auto mb-4 h-9 w-9 text-red-600" />
                <p className="font-black">Impossible de charger le catalogue professionnel</p>
                <p className="mt-2 text-sm text-slate-600">{errorMessage}</p>
                <button
                  type="button"
                  onClick={() => {
                    setLoaded(false);
                    setErrorMessage("");
                  }}
                  className="mt-5 rounded-full bg-[#f2cf79] px-5 py-2 text-sm font-black text-[#07101c]"
                >
                  Réessayer
                </button>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="py-14 text-center">
                <PackageSearch className="mx-auto mb-4 h-10 w-10 text-slate-400" />
                <p className="font-black">Aucun produit trouvé</p>
                <p className="mt-2 text-sm text-slate-500">Essayez un autre nom, une catégorie ou une référence.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-4">
                {filteredProducts.map((product) => (
                  <Link
                    key={product.id}
                    to="/qeh-partner/materiel-pro"
                    className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:border-[#d2ad4e] hover:shadow-lg"
                  >
                    <div className="aspect-square overflow-hidden bg-white p-2">
                      {product.image_url ? (
                        <img src={product.image_url} alt={product.name} className="h-full w-full object-contain transition duration-300 group-hover:scale-105" />
                      ) : (
                        <div className="grid h-full place-items-center rounded-xl bg-slate-100">
                          <PackageSearch className="h-8 w-8 text-slate-300" />
                        </div>
                      )}
                    </div>
                    <div className="border-t border-slate-100 p-3">
                      <p className="truncate text-[9px] font-black uppercase tracking-[.1em] text-[#9a6d1b] sm:text-[10px]">
                        {product.category || "QEH PARTNER"}
                      </p>
                      <h3 className="mt-1 line-clamp-2 text-xs font-black leading-snug sm:text-sm">{product.name}</h3>
                      <p className="mt-1 truncate text-[10px] text-slate-400">Réf. {product.reference || "sur demande"}</p>
                      <p className="mt-2 text-sm font-black text-[#8b651d] sm:text-base">{money(product.price_excluding_tax)} HT</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
