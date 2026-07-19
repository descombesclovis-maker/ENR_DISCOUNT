import React, { useState } from "react";
import { Link } from "react-router-dom";

import {
  ArrowRight,
  LoaderCircle,
  Minus,
  Plus,
  ShoppingBag,
  Trash2,
} from "lucide-react";

import { toast } from "sonner";

import { useCart } from "../context/CartContext";
import { formatPrice } from "../lib/api";
import { supabase } from "../lib/supabase";

export default function Cart() {
  const {
    items,
    updateQuantity,
    removeItem,
    total,
  } = useCart();

  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    if (items.length === 0) {
      toast.error("Votre panier est vide.");
      return;
    }

    setLoading(true);

    try {
      const checkoutItems = items.map((item) => ({
        product_id:
          item.database_product_id ||
          item.product_id,

        variant_id:
          item.variant_id || null,

        quantity: item.quantity,
      }));

      const { data, error } =
        await supabase.functions.invoke(
          "create-checkout-session",
          {
            body: {
              items: checkoutItems,
              origin_url: window.location.origin,
            },
          }
        );

      if (error) {
        throw error;
      }

      if (!data?.url) {
        throw new Error(
          data?.error ||
            "Stripe n’a retourné aucune adresse de paiement."
        );
      }

      window.location.assign(data.url);
    } catch (error) {
      console.error(
        "Erreur de création du paiement :",
        error
      );

      let message =
        "Impossible de démarrer le paiement.";

      try {
        if (
          error?.context &&
          typeof error.context.json === "function"
        ) {
          const responseBody =
            await error.context.json();

          message =
            responseBody?.error ||
            responseBody?.message ||
            message;
        } else if (error?.message) {
          message = error.message;
        }
      } catch (parsingError) {
        console.error(
          "Impossible de lire la réponse de la fonction :",
          parsingError
        );
      }

      toast.error(message);
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div
        data-testid="cart-empty"
        className="max-w-3xl mx-auto px-5 py-24 text-center"
      >
        <ShoppingBag className="w-12 h-12 mx-auto text-muted-foreground mb-5" />

        <h1 className="font-display font-bold text-2xl mb-3">
          Votre panier est vide
        </h1>

        <p className="text-muted-foreground mb-8">
          Découvrez nos produits d&apos;énergie et de
          chauffage.
        </p>

        <Link
          to="/produits"
          className="inline-flex items-center gap-2 h-12 px-7 rounded-full bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors"
        >
          Voir les produits
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div
      data-testid="cart-page"
      className="max-w-5xl mx-auto px-5 sm:px-8 py-12"
    >
      <h1 className="font-display font-black text-4xl tracking-tight mb-10">
        Votre panier
      </h1>

      <div className="grid lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => {
            const itemId = item.cart_item_id;

            return (
              <div
                key={itemId}
                data-testid={`cart-item-${itemId}`}
                className="flex gap-4 p-4 rounded-2xl border border-border bg-card"
              >
                <div className="w-24 h-24 shrink-0 rounded-xl overflow-hidden bg-white border border-border grid place-items-center">
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-contain p-2"
                    />
                  ) : (
                    <ShoppingBag className="w-8 h-8 text-muted-foreground" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="font-display font-semibold leading-snug">
                    {item.name}
                  </h3>

                  {item.selectedVariant && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {item.selectedVariant.label ||
                        item.selectedVariant.name ||
                        item.selectedVariant.reference}
                    </p>
                  )}

                  <p className="text-sm text-muted-foreground mb-3">
                    {formatPrice(item.price)}
                  </p>

                  <div className="flex items-center gap-3">
                    <div className="flex items-center border border-border rounded-full">
                      <button
                        type="button"
                        onClick={() =>
                          updateQuantity(
                            itemId,
                            item.quantity - 1
                          )
                        }
                        className="w-9 h-9 grid place-items-center hover:text-primary transition-colors"
                        aria-label="Diminuer la quantité"
                      >
                        <Minus className="w-4 h-4" />
                      </button>

                      <span className="w-8 text-center text-sm font-semibold">
                        {item.quantity}
                      </span>

                      <button
                        type="button"
                        onClick={() =>
                          updateQuantity(
                            itemId,
                            item.quantity + 1
                          )
                        }
                        disabled={
                          item.stock > 0 &&
                          item.quantity >= item.stock
                        }
                        className="w-9 h-9 grid place-items-center hover:text-primary transition-colors disabled:opacity-40"
                        aria-label="Augmenter la quantité"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeItem(itemId)}
                      className="text-muted-foreground hover:text-destructive transition-colors"
                      aria-label="Supprimer le produit"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="font-display font-bold text-right whitespace-nowrap">
                  {formatPrice(
                    item.price * item.quantity
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="lg:col-span-1">
          <div className="rounded-2xl border border-border bg-card p-6 sticky top-24">
            <h2 className="font-display font-bold text-lg mb-5">
              Récapitulatif
            </h2>

            <div className="flex justify-between text-sm mb-2">
              <span className="text-muted-foreground">
                Sous-total
              </span>

              <span className="font-semibold">
                {formatPrice(total)}
              </span>
            </div>

            <div className="flex justify-between text-sm mb-5">
              <span className="text-muted-foreground">
                Livraison
              </span>

              <span className="font-semibold">
                À confirmer
              </span>
            </div>

            <div className="border-t border-border pt-4 flex justify-between items-baseline mb-6">
              <span className="font-display font-bold">
                Total produits
              </span>

              <span
                className="font-display font-black text-2xl"
                data-testid="cart-total"
              >
                {formatPrice(total)}
              </span>
            </div>

            <button
              type="button"
              onClick={handleCheckout}
              disabled={loading}
              data-testid="checkout-button"
              className="w-full inline-flex items-center justify-center gap-2 h-12 rounded-full bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors disabled:opacity-60"
            >
              {loading ? (
                <>
                  <LoaderCircle className="w-5 h-5 animate-spin" />
                  Redirection…
                </>
              ) : (
                "Payer maintenant"
              )}
            </button>

            <p className="text-xs text-muted-foreground text-center mt-3">
              Paiement sécurisé par Stripe
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}