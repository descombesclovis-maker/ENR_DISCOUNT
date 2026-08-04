import React, {
  useEffect,
  useState,
} from "react";

import {
  Link,
} from "react-router-dom";

import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  CreditCard,
  LoaderCircle,
  Minus,
  PackageCheck,
  Plus,
  ShieldCheck,
  ShoppingBag,
  Trash2,
  Truck,
} from "lucide-react";

import { toast } from "sonner";

import {
  useCart,
} from "../context/CartContext";

import {
  formatPrice,
} from "../lib/api";

import {
  supabase,
} from "../lib/supabase";

export default function Cart() {
const {
  items,
  updateQuantity,
  removeItem,
  total,
  savings,
} = useCart();

  const [
    loading,
    setLoading,
  ] = useState(false);

  useEffect(() => {
    document.title =
      "Mon panier | QEH OUTLET";
  }, []);

  const handleCheckout =
    async () => {
      if (
        items.length === 0
      ) {
        toast.error(
          "Votre panier est vide."
        );

        return;
      }

      setLoading(true);

      try {
        const checkoutItems =
          items.map(
            (item) => ({
              product_id:
                item.database_product_id ||
                item.product_id,

              variant_id:
                item.variant_id ||
                null,

              quantity:
                item.quantity,
            })
          );

        const {
          data,
          error,
        } =
          await supabase.functions.invoke(
            "create-checkout-session",
            {
              body: {
                items:
                  checkoutItems,

                origin_url:
                  window.location.origin,
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

        window.location.assign(
          data.url
        );
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
            typeof error.context
              .json ===
              "function"
          ) {
            const responseBody =
              await error.context.json();

            message =
              responseBody?.error ||
              responseBody?.message ||
              message;
          } else if (
            error?.message
          ) {
            message =
              error.message;
          }
        } catch (
          parsingError
        ) {
          console.error(
            "Impossible de lire la réponse de la fonction :",
            parsingError
          );
        }

        toast.error(message);
        setLoading(false);
      }
    };

  if (
    items.length === 0
  ) {
    return (
      <div
        data-testid="cart-empty"
        className="min-h-[70vh] bg-white"
      >
        <section className="relative overflow-hidden bg-[#020714]">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute -top-32 -left-28 w-80 h-80 rounded-full bg-[#0b5ca8]/20 blur-3xl" />

            <div className="absolute -bottom-36 -right-24 w-96 h-96 rounded-full bg-[#ff5a00]/15 blur-3xl" />
          </div>

          <div className="relative max-w-4xl mx-auto px-5 sm:px-8 py-20 sm:py-28 text-center">
            <div className="w-20 h-20 mx-auto rounded-3xl border border-[#0b5ca8]/50 bg-[#0b5ca8]/15 text-[#55a8ff] grid place-items-center shadow-[0_20px_55px_rgba(0,0,0,0.35)]">
              <ShoppingBag className="w-9 h-9" />
            </div>

            <p className="text-xs font-black uppercase tracking-[0.24em] text-[#ff5a00] mt-7">
              QEH OUTLET
            </p>

            <h1 className="font-display font-black text-3xl sm:text-5xl text-white tracking-tight mt-3">
              Votre panier est vide
            </h1>

            <p className="max-w-xl mx-auto text-white/60 leading-relaxed mt-5">
              Parcourez notre catalogue et découvrez nos équipements
              professionnels à prix outlet.
            </p>

            <Link
              to="/produits"
              className="inline-flex items-center justify-center gap-2 min-h-12 px-8 mt-8 rounded-full bg-[#ff5a00] text-white font-bold hover:bg-[#e95000] transition-colors shadow-[0_12px_35px_rgba(255,90,0,0.25)]"
            >
              Voir les produits

              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div
      data-testid="cart-page"
      className="min-h-screen bg-slate-50"
    >
      <section className="relative overflow-hidden bg-[#020714]">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-40 -left-40 w-[420px] h-[420px] rounded-full bg-[#0b5ca8]/20 blur-3xl" />

          <div className="absolute -bottom-52 -right-36 w-[480px] h-[480px] rounded-full bg-[#ff5a00]/10 blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-5 sm:px-8 py-12 sm:py-16">
          <Link
            to="/produits"
            className="inline-flex items-center gap-2 text-sm font-semibold text-white/60 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Continuer mes achats
          </Link>

          <div className="mt-8 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.24em] text-[#ff5a00] mb-3">
                QEH OUTLET
              </p>

              <h1 className="font-display font-black text-4xl sm:text-5xl text-white tracking-tight">
                Votre panier
              </h1>

              <p className="text-white/60 mt-3">
                {items.length}{" "}
                {items.length > 1
                  ? "articles sélectionnés"
                  : "article sélectionné"}
              </p>
            </div>

            <div className="inline-flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-5 py-4">
              <ShieldCheck className="w-6 h-6 text-[#55a8ff]" />

              <div>
                <p className="text-sm font-bold text-white">
                  Paiement sécurisé
                </p>

                <p className="text-xs text-white/50 mt-1">
                  Transaction protégée par Stripe
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-5 sm:px-8 py-10 sm:py-14">
        <div className="grid xl:grid-cols-[1fr_390px] gap-8 lg:gap-10 items-start">
          <section className="space-y-4">
            {items.map(
              (item) => {
                const itemId =
                  item.cart_item_id;
console.log(item);
                return (
                  <article
                    key={itemId}
                    data-testid={`cart-item-${itemId}`}
                    className="group rounded-3xl border border-slate-200 bg-white p-4 sm:p-5 shadow-sm hover:border-[#0b5ca8]/40 hover:shadow-[0_16px_45px_rgba(2,7,20,0.08)] transition-all"
                  >
                    <div className="flex flex-col sm:flex-row gap-5">
                      <Link
                        to={
                          item.slug
                            ? `/produits/${item.slug}`
                            : "/produits"
                        }
                        className="w-full sm:w-36 h-48 sm:h-36 shrink-0 rounded-2xl overflow-hidden border border-slate-200 bg-white grid place-items-center"
                      >
                        {item.image ? (
                          <img
                            src={
                              item.image
                            }
                            alt={
                              item.name
                            }
                            className="w-full h-full object-contain p-3 group-hover:scale-105 transition-transform duration-300"
                            onError={(
                              event
                            ) => {
                              event.currentTarget.onerror =
                                null;

                              event.currentTarget.src =
                                "/images/product-placeholder.png";
                            }}
                          />
                        ) : (
                          <ShoppingBag className="w-9 h-9 text-slate-300" />
                        )}
                      </Link>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <Link
                              to={
                                item.slug
                                  ? `/produits/${item.slug}`
                                  : "/produits"
                              }
                              className="font-display font-bold text-lg text-slate-950 hover:text-[#0b5ca8] transition-colors"
                            >
                              {item.name}
                            </Link>

                            {item.brand && (
                              <p className="text-sm text-slate-500 mt-1">
                                {item.brand}
                              </p>
                            )}

                            {item.selectedVariant && (
                              <div className="inline-flex items-center min-h-8 px-3 mt-3 rounded-full border border-[#0b5ca8]/20 bg-[#0b5ca8]/5 text-[#0b5ca8] text-xs font-bold">
                                {item.selectedVariant
                                  .label ||
                                  item.selectedVariant
                                    .name ||
                                  item.selectedVariant
                                    .reference}
                              </div>
                            )}
                          </div>

                          <button
                            type="button"
                            onClick={() =>
                              removeItem(
                                itemId
                              )
                            }
                            className="w-10 h-10 shrink-0 rounded-full border border-red-200 bg-red-50 text-red-600 grid place-items-center hover:bg-red-600 hover:text-white transition-colors"
                            aria-label="Supprimer le produit"
                            title="Supprimer le produit"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="mt-5 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-5">
                          <div>
                           {item.is_on_sale &&
item.sale_price ? (

  <div>

    <p className="text-sm text-slate-400 line-through">

      {formatPrice(item.price)}

    </p>

    <p className="font-display font-black text-xl text-[#ff5a00]">

      {formatPrice(item.sale_price)}

    </p>

  </div>

) : (

  <p className="font-display font-black text-xl text-slate-950">

    {formatPrice(item.price)}

  </p>

)} 
                          </div>

                          <div className="flex flex-wrap items-center justify-between sm:justify-end gap-4">
                            <div className="flex items-center h-11 rounded-full border border-slate-200 bg-slate-50">
                              <button
                                type="button"
                                onClick={() =>
                                  updateQuantity(
                                    itemId,
                                    item.quantity -
                                      1
                                  )
                                }
                                disabled={
                                  item.quantity <=
                                  1
                                }
                                className="w-11 h-11 grid place-items-center text-slate-600 hover:text-[#ff5a00] disabled:opacity-30 transition-colors"
                                aria-label="Diminuer la quantité"
                              >
                                <Minus className="w-4 h-4" />
                              </button>

                              <span className="w-10 text-center text-sm font-black text-slate-950">
                                {item.quantity}
                              </span>

                              <button
                                type="button"
                                onClick={() =>
                                  updateQuantity(
                                    itemId,
                                    item.quantity +
                                      1
                                  )
                                }
                                disabled={
                                  item.stock > 0 &&
                                  item.quantity >=
                                    item.stock
                                }
                                className="w-11 h-11 grid place-items-center text-slate-600 hover:text-[#0b5ca8] disabled:opacity-30 transition-colors"
                                aria-label="Augmenter la quantité"
                              >
                                <Plus className="w-4 h-4" />
                              </button>
                            </div>

                            <div className="text-right min-w-[120px]">
                              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                                Total
                              </p>

                              <p className="font-display font-bold">
  {formatPrice(
    (item.is_on_sale && item.sale_price
      ? item.sale_price
      : item.price) * item.quantity
  )}
</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </article>
                );
              }
            )}

            <div className="grid sm:grid-cols-3 gap-4 pt-4">
              <div className="rounded-2xl border border-slate-200 bg-white p-4 flex items-start gap-3">
                <PackageCheck className="w-5 h-5 shrink-0 text-[#0b5ca8]" />

                <div>
                  <p className="text-sm font-bold text-slate-950">
                    Produits contrôlés
                  </p>

                  <p className="text-xs text-slate-500 mt-1">
                    État clairement indiqué
                  </p>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-4 flex items-start gap-3">
                <Truck className="w-5 h-5 shrink-0 text-[#0b5ca8]" />

                <div>
                  <p className="text-sm font-bold text-slate-950">
                    Livraison suivie
                  </p>

                  <p className="text-xs text-slate-500 mt-1">
                    Suivi après expédition
                  </p>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-4 flex items-start gap-3">
                <CreditCard className="w-5 h-5 shrink-0 text-[#0b5ca8]" />

                <div>
                  <p className="text-sm font-bold text-slate-950">
                    Paiement sécurisé
                  </p>

                  <p className="text-xs text-slate-500 mt-1">
                    Protégé par Stripe
                  </p>
                </div>
              </div>
            </div>
          </section>

          <aside className="xl:sticky xl:top-28">
            <div className="overflow-hidden rounded-3xl border border-[#0b5ca8]/25 bg-white shadow-[0_20px_55px_rgba(2,7,20,0.10)]">
              <div className="bg-[#020714] px-6 py-6">
                <p className="text-xs font-black uppercase tracking-[0.22em] text-[#ff5a00]">
                  Votre commande
                </p>

                <h2 className="font-display font-black text-2xl text-white mt-2">
                  Récapitulatif
                </h2>
              </div>

              <div className="p-6">
                <div className="space-y-4">
                  <div className="flex justify-between gap-4 text-sm">
                    <span className="text-slate-500">
                      Sous-total
                    </span>

                    <span className="font-bold text-slate-950">
                      {formatPrice(
                        total
                      )}
                    </span>
                  </div>

                  <div className="flex justify-between gap-4 text-sm">
                    <span className="text-slate-500">
                      Livraison
                    </span>

                    <span className="font-bold text-slate-950">
                      À confirmer
                    </span>
                  </div>

                  <div className="flex justify-between gap-4 text-sm">
                    <span className="text-slate-500">
                      Nombre d’articles
                    </span>

                    <span className="font-bold text-slate-950">
                      {items.reduce(
                        (
                          quantityTotal,
                          item
                        ) =>
                          quantityTotal +
                          item.quantity,
                        0
                      )}
                    </span>
                  </div>
                </div>
{savings > 0 && (

<div className="flex justify-between gap-4 text-sm">

<span className="text-green-600 font-bold">

Économies

</span>

<span className="font-black text-green-600">

- {formatPrice(savings)}

</span>

</div>

)}
                <div className="h-px bg-slate-200 my-6" />

                <div className="flex items-end justify-between gap-4">
                  <div>
                    <p className="text-sm font-bold text-slate-950">
                      Total produits
                    </p>

                    <p className="text-xs text-slate-500 mt-1">
                      Hors frais de livraison
                    </p>
                  </div>

                  <span
                    className="font-display font-black text-3xl text-[#ff5a00]"
                    data-testid="cart-total"
                  >
                    {formatPrice(
                      total
                    )}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={
                    handleCheckout
                  }
                  disabled={
                    loading
                  }
                  data-testid="checkout-button"
                  className="w-full inline-flex items-center justify-center gap-2 min-h-12 mt-7 rounded-full bg-[#ff5a00] text-white font-bold hover:bg-[#e95000] transition-colors disabled:opacity-60 shadow-[0_12px_35px_rgba(255,90,0,0.22)]"
                >
                  {loading ? (
                    <>
                      <LoaderCircle className="w-5 h-5 animate-spin" />
                      Redirection…
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-5 h-5" />
                      Payer maintenant
                    </>
                  )}
                </button>

                <div className="flex items-center justify-center gap-2 mt-4 text-xs text-slate-500">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  Paiement sécurisé par Stripe
                </div>

                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 mt-6">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600" />

                    <p className="text-xs leading-relaxed text-emerald-800">
                      Après le paiement, votre commande sera enregistrée
                      automatiquement et vous recevrez les informations
                      nécessaires à son suivi.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}