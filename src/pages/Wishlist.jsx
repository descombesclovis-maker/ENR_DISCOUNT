import React, {
  useEffect,
} from "react";

import {
  ArrowRight,
  Heart,
  Trash2,
} from "lucide-react";

import {
  Link,
} from "react-router-dom";

import {
  useWishlist,
} from "../context/WishlistContext";

export default function Wishlist() {
  const {
    items,
    removeFavorite,
    clearFavorites,
  } = useWishlist();

  useEffect(() => {
    document.title =
      "Mes favoris | QEH OUTLET";
  }, []);

  if (items.length === 0) {
    return (
      <div
        data-testid="wishlist-empty"
        className="min-h-[70vh] bg-white"
      >
        <section className="relative overflow-hidden bg-[#020714]">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute -top-36 -left-28 w-96 h-96 rounded-full bg-[#0b5ca8]/20 blur-3xl" />

            <div className="absolute -bottom-40 -right-24 w-[420px] h-[420px] rounded-full bg-[#ff5a00]/15 blur-3xl" />
          </div>

          <div className="relative max-w-4xl mx-auto px-5 sm:px-8 py-20 sm:py-28 text-center">
            <div className="w-20 h-20 mx-auto rounded-3xl border border-[#0b5ca8]/50 bg-[#0b5ca8]/15 text-[#55a8ff] grid place-items-center shadow-[0_20px_55px_rgba(0,0,0,0.35)]">
              <Heart className="w-9 h-9" />
            </div>

            <p className="text-xs font-black uppercase tracking-[0.24em] text-[#ff5a00] mt-7">
              QEH OUTLET
            </p>

            <h1 className="font-display font-black text-3xl sm:text-5xl text-white tracking-tight mt-3">
              Aucun produit favori
            </h1>

            <p className="max-w-xl mx-auto text-white/60 leading-relaxed mt-5">
              Enregistrez les produits qui vous intéressent pour les
              retrouver facilement plus tard.
            </p>

            <Link
              to="/produits"
              className="inline-flex items-center justify-center gap-2 min-h-12 px-8 mt-8 rounded-full bg-[#ff5a00] text-white font-bold hover:bg-[#e95000] transition-colors shadow-[0_12px_35px_rgba(255,90,0,0.25)]"
            >
              Découvrir les produits

              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div
      data-testid="wishlist-page"
      className="min-h-screen bg-slate-50"
    >
      <section className="relative overflow-hidden bg-[#020714]">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-40 -left-40 w-[420px] h-[420px] rounded-full bg-[#0b5ca8]/20 blur-3xl" />

          <div className="absolute -bottom-52 -right-36 w-[480px] h-[480px] rounded-full bg-[#ff5a00]/10 blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-5 sm:px-8 py-12 sm:py-16">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.24em] text-[#ff5a00] mb-3">
                QEH OUTLET
              </p>

              <h1 className="font-display font-black text-4xl sm:text-5xl text-white tracking-tight">
                Mes favoris
              </h1>

              <p className="text-white/60 mt-3">
                {items.length}{" "}
                {items.length > 1
                  ? "produits enregistrés"
                  : "produit enregistré"}
              </p>
            </div>

            <button
              type="button"
              onClick={
                clearFavorites
              }
              className="inline-flex items-center justify-center gap-2 min-h-11 px-5 rounded-full border border-red-400/40 bg-red-500/10 text-red-200 font-semibold text-sm hover:bg-red-500 hover:text-white transition-colors"
            >
              <Trash2 className="w-4 h-4" />

              Tout supprimer
            </button>
          </div>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-5 sm:px-8 py-10 sm:py-14">
        <div className="grid grid-cols-2 gap-2.5 sm:gap-6 lg:grid-cols-3">
          {items.map(
            (product) => (
              <article
                key={product.id}
                className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white transition-all duration-300 hover:-translate-y-1.5 hover:border-[#0b5ca8]/50 hover:shadow-[0_22px_55px_rgba(2,7,20,0.13)] sm:rounded-3xl"
              >
                <Link
                  to={`/produits/${product.slug}`}
                  className="flex flex-col flex-1"
                >
                  <div className="relative grid aspect-square place-items-center overflow-hidden bg-white p-2.5 sm:p-6">
                    <img
                      src={
                        product.image ||
                        "/images/product-placeholder.png"
                      }
                      alt={product.name}
                      className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                      onError={(
                        event
                      ) => {
                        event.currentTarget.onerror =
                          null;

                        event.currentTarget.src =
                          "/images/product-placeholder.png";
                      }}
                    />

                    <span className="absolute left-2 top-2 inline-flex min-h-6 items-center gap-1 rounded-full border border-[#0b5ca8]/20 bg-[#0b5ca8]/10 px-2 text-[8px] font-bold text-[#0b5ca8] sm:left-4 sm:top-4 sm:min-h-8 sm:gap-2 sm:px-3 sm:text-xs">
                      <Heart className="w-3.5 h-3.5 fill-current" />
                      Favori
                    </span>
                  </div>

                  <div className="flex flex-1 flex-col border-t border-slate-100 p-3 sm:p-6">
                    <h2 className="line-clamp-3 font-display text-xs font-bold leading-snug text-slate-950 transition-colors group-hover:text-[#0b5ca8] sm:text-lg">
                      {product.name}
                    </h2>

                    {product.brand && (
                      <p className="mt-1 line-clamp-1 text-[10px] text-slate-500 sm:mt-2 sm:text-sm">
                        {product.brand}
                      </p>
                    )}

                    {product.reference && (
                      <p className="mt-2 hidden text-xs text-slate-400 sm:block">
                        Réf. {product.reference}
                      </p>
                    )}

                    <div className="mt-auto pt-3 sm:pt-5">
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#0b5ca8] transition-colors group-hover:text-[#ff5a00] sm:gap-2 sm:text-sm">
                        Voir le produit

                        <ArrowRight className="w-4 h-4" />
                      </span>
                    </div>
                  </div>
                </Link>

                <div className="px-3 pb-3 sm:px-6 sm:pb-6">
                  <button
                    type="button"
                    onClick={() =>
                      removeFavorite(
                        product.id
                      )
                    }
                    className="inline-flex min-h-9 w-full items-center justify-center gap-1 rounded-full border border-red-200 bg-red-50 px-2 text-[10px] font-semibold text-red-600 transition-colors hover:bg-red-600 hover:text-white sm:min-h-11 sm:gap-2 sm:text-sm"
                  >
                    <Trash2 className="w-4 h-4" />

                    <span className="sm:hidden">Retirer</span>
                    <span className="hidden sm:inline">Retirer des favoris</span>
                  </button>
                </div>
              </article>
            )
          )}
        </div>

        <div className="mt-10 text-center">
          <Link
            to="/produits"
            className="inline-flex items-center justify-center gap-2 min-h-12 px-8 rounded-full bg-[#020714] text-white font-bold hover:bg-[#0b5ca8] transition-colors"
          >
            Continuer mes achats

            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </main>
    </div>
  );
}
