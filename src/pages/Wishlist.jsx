import React from "react";

import {
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

  return (
    <div className="max-w-7xl mx-auto px-5 sm:px-8 py-12">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-5 mb-10">
        <div>
          <p className="overline text-primary mb-2">
            Mes produits
          </p>

          <h1 className="font-display font-black text-4xl sm:text-5xl tracking-tight">
            Mes favoris
          </h1>

          <p className="text-muted-foreground mt-3">
            Retrouve ici tous les produits que tu as enregistrés.
          </p>
        </div>

        {items.length > 0 && (
          <button
            type="button"
            onClick={clearFavorites}
            className="inline-flex items-center justify-center gap-2 h-11 px-5 rounded-full border border-border bg-card font-semibold text-sm hover:bg-secondary transition-colors"
          >
            <Trash2 className="w-4 h-4" />

            Tout supprimer
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <div className="rounded-3xl border border-border bg-card px-6 py-16 text-center">
          <Heart className="w-12 h-12 mx-auto text-muted-foreground mb-5" />

          <h2 className="font-display font-bold text-2xl">
            Aucun produit favori
          </h2>

          <p className="text-muted-foreground mt-3">
            Clique sur le cœur présent sur une fiche produit pour l’ajouter à tes favoris.
          </p>

          <Link
            to="/produits"
            className="inline-flex items-center justify-center h-11 px-6 mt-6 rounded-full bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors"
          >
            Voir les produits
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((product) => (
            <article
              key={product.id}
              className="rounded-2xl border border-border bg-card overflow-hidden hover:-translate-y-1 hover:shadow-lg transition-all duration-200"
            >
              <Link
                to={`/produits/${product.slug}`}
                className="block"
              >
                <div className="aspect-square bg-white p-6 grid place-items-center">
                  <img
                    src={
                      product.image ||
                      "/images/product-placeholder.png"
                    }
                    alt={product.name}
                    className="w-full h-full object-contain"
                    loading="lazy"
                    onError={(event) => {
                      event.currentTarget.onerror =
                        null;

                      event.currentTarget.src =
                        "/images/product-placeholder.png";
                    }}
                  />
                </div>

                <div className="p-5 border-t border-border">
                  <h2 className="font-display font-bold text-lg leading-snug">
                    {product.name}
                  </h2>

                  {product.brand && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {product.brand}
                    </p>
                  )}

                  {product.reference && (
                    <p className="text-xs text-muted-foreground mt-2">
                      Réf. {product.reference}
                    </p>
                  )}
                </div>
              </Link>

              <div className="px-5 pb-5">
                <button
                  type="button"
                  onClick={() =>
                    removeFavorite(
                      product.id
                    )
                  }
                  className="w-full h-11 rounded-full border border-destructive/30 bg-destructive/5 text-destructive font-semibold hover:bg-destructive/10 transition-colors"
                >
                  Retirer des favoris
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}