import React, {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  LoaderCircle,
  RefreshCw,
  ShoppingCart,
} from "lucide-react";

import { Link } from "react-router-dom";
import { toast } from "sonner";

import { supabase } from "../lib/supabase";
import { formatPrice } from "../lib/api";

const paymentLabels = {
  pending: "En attente",
  paid: "Payée",
  failed: "Échouée",
  expired: "Expirée",
  refunded: "Remboursée",
};

const fulfillmentLabels = {
  pending: "À traiter",
  processing: "En préparation",
  shipped: "Expédiée",
  delivered: "Livrée",
  cancelled: "Annulée",
};

const fulfillmentOptions = [
  {
    value: "pending",
    label: "À traiter",
  },
  {
    value: "processing",
    label: "En préparation",
  },
  {
    value: "shipped",
    label: "Expédiée",
  },
  {
    value: "delivered",
    label: "Livrée",
  },
  {
    value: "cancelled",
    label: "Annulée",
  },
];

function formatDate(value) {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function getPaymentClasses(status) {
  switch (status) {
    case "paid":
      return "bg-primary/10 text-primary";

    case "failed":
    case "expired":
      return "bg-destructive/10 text-destructive";

    case "refunded":
      return "bg-amber-100 text-amber-700";

    default:
      return "bg-secondary text-muted-foreground";
  }
}

function getFulfillmentClasses(status) {
  switch (status) {
    case "processing":
      return "bg-blue-100 text-blue-700";

    case "shipped":
      return "bg-violet-100 text-violet-700";

    case "delivered":
      return "bg-primary/10 text-primary";

    case "cancelled":
      return "bg-destructive/10 text-destructive";

    default:
      return "bg-secondary text-muted-foreground";
  }
}

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const [expandedOrderId, setExpandedOrderId] =
    useState(null);

  const [updatingOrderId, setUpdatingOrderId] =
    useState(null);

  const loadOrders = useCallback(async () => {
    setLoading(true);

    try {
      const { data, error } = await supabase
        .from("orders")
        .select(`
          id,
          order_number,
          customer_email,
          customer_name,
          customer_phone,

          shipping_name,
          shipping_line1,
          shipping_line2,
          shipping_postal_code,
          shipping_city,
          shipping_country,

          currency,
          subtotal,
          shipping_amount,
          total,

          payment_status,
          fulfillment_status,

          stripe_checkout_session_id,
          stripe_payment_intent_id,

          paid_at,
          created_at,
          updated_at,

          order_items (
            id,
            product_id,
            variant_id,
            product_name,
            variant_name,
            reference,
            sku,
            unit_price,
            quantity,
            line_total,
            created_at
          )
        `)
        .order("created_at", {
          ascending: false,
        });

      if (error) {
        throw error;
      }

      const normalizedOrders = (data || []).map(
        (order) => ({
          ...order,

          order_items: Array.isArray(
            order.order_items
          )
            ? [...order.order_items].sort(
                (firstItem, secondItem) =>
                  new Date(
                    firstItem.created_at || 0
                  ).getTime() -
                  new Date(
                    secondItem.created_at || 0
                  ).getTime()
              )
            : [],
        })
      );

      setOrders(normalizedOrders);
    } catch (error) {
      console.error(
        "Erreur lors du chargement des commandes :",
        error
      );

      toast.error(
        error?.message ||
          "Impossible de charger les commandes."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    document.title =
      "Commandes | ENR Discount";

    loadOrders();
  }, [loadOrders]);

  const handleFulfillmentChange = async (
    orderId,
    fulfillmentStatus
  ) => {
    setUpdatingOrderId(orderId);

    try {
      const { error } = await supabase
        .from("orders")
        .update({
          fulfillment_status:
            fulfillmentStatus,
        })
        .eq("id", orderId);

      if (error) {
        throw error;
      }

      setOrders((currentOrders) =>
        currentOrders.map((order) =>
          order.id === orderId
            ? {
                ...order,
                fulfillment_status:
                  fulfillmentStatus,
              }
            : order
        )
      );

      toast.success(
        "Statut de la commande mis à jour."
      );
    } catch (error) {
      console.error(
        "Erreur lors de la mise à jour de la commande :",
        error
      );

      toast.error(
        error?.message ||
          "Impossible de modifier le statut."
      );
    } finally {
      setUpdatingOrderId(null);
    }
  };

  return (
    <div
      className="min-h-screen bg-secondary/30"
      data-testid="admin-orders"
    >
      <header className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 min-h-20 py-4 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="font-display font-black text-xl">
              ENR Discount
            </p>

            <p className="text-xs text-muted-foreground">
              Administration
            </p>
          </div>

          <Link
            to="/admin"
            className="inline-flex items-center gap-2 h-10 px-5 rounded-full border border-border font-semibold text-sm hover:bg-secondary transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Tableau de bord
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-5 sm:px-8 py-10">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-5 mb-9">
          <div>
            <p className="overline text-primary mb-2">
              Ventes
            </p>

            <h1 className="font-display font-black text-3xl sm:text-4xl tracking-tight">
              Gestion des commandes
            </h1>

            <p className="text-muted-foreground mt-2">
              Consulte les paiements et suis la
              préparation des commandes.
            </p>
          </div>

          <button
            type="button"
            onClick={loadOrders}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 h-11 px-5 rounded-full border border-border bg-card font-semibold text-sm hover:bg-secondary transition-colors disabled:opacity-60"
          >
            <RefreshCw
              className={`w-4 h-4 ${
                loading ? "animate-spin" : ""
              }`}
            />

            Actualiser
          </button>
        </div>

        {loading ? (
          <div className="rounded-3xl border border-border bg-card py-20 text-center">
            <LoaderCircle className="w-10 h-10 animate-spin text-primary mx-auto mb-4" />

            <p className="font-semibold">
              Chargement des commandes…
            </p>
          </div>
        ) : orders.length === 0 ? (
          <div className="rounded-3xl border border-border bg-card py-20 px-6 text-center">
            <ShoppingCart className="w-12 h-12 text-muted-foreground mx-auto mb-4" />

            <h2 className="font-display font-bold text-2xl">
              Aucune commande
            </h2>

            <p className="text-muted-foreground mt-2">
              Les commandes Stripe apparaîtront ici.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const isExpanded =
                expandedOrderId === order.id;

              const orderItems =
                order.order_items || [];

              const articleCount =
                orderItems.reduce(
                  (sum, item) =>
                    sum +
                    Number(item.quantity || 0),
                  0
                );

              return (
                <article
                  key={order.id}
                  className="rounded-3xl border border-border bg-card overflow-hidden"
                >
                  <div className="p-5 sm:p-6">
                    <div className="flex flex-col xl:flex-row xl:items-center gap-5">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-3">
                          <h2 className="font-display font-bold text-lg">
                            {order.order_number}
                          </h2>

                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getPaymentClasses(
                              order.payment_status
                            )}`}
                          >
                            {paymentLabels[
                              order.payment_status
                            ] ||
                              order.payment_status}
                          </span>

                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getFulfillmentClasses(
                              order.fulfillment_status
                            )}`}
                          >
                            {fulfillmentLabels[
                              order.fulfillment_status
                            ] ||
                              order.fulfillment_status}
                          </span>
                        </div>

                        <p className="text-sm text-muted-foreground mt-2">
                          {formatDate(
                            order.created_at
                          )}
                        </p>

                        <p className="font-semibold mt-2">
                          {order.customer_name ||
                            order.customer_email ||
                            "Client non renseigné"}
                        </p>

                        {order.customer_email && (
                          <p className="text-sm text-muted-foreground">
                            {order.customer_email}
                          </p>
                        )}
                      </div>

                      <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wide">
                          Articles
                        </p>

                        <p className="font-display font-bold text-lg mt-1">
                          {articleCount}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wide">
                          Total
                        </p>

                        <p className="font-display font-black text-xl mt-1">
                          {formatPrice(order.total)}
                        </p>
                      </div>

                      <div className="min-w-[190px]">
                        <label
                          htmlFor={`fulfillment-${order.id}`}
                          className="block text-xs font-semibold text-muted-foreground mb-2"
                        >
                          Traitement
                        </label>

                        <select
                          id={`fulfillment-${order.id}`}
                          value={
                            order.fulfillment_status
                          }
                          onChange={(event) =>
                            handleFulfillmentChange(
                              order.id,
                              event.target.value
                            )
                          }
                          disabled={
                            updatingOrderId ===
                            order.id
                          }
                          className="w-full h-11 rounded-xl border border-border bg-background px-3 text-sm font-semibold disabled:opacity-60"
                        >
                          {fulfillmentOptions.map(
                            (option) => (
                              <option
                                key={option.value}
                                value={option.value}
                              >
                                {option.label}
                              </option>
                            )
                          )}
                        </select>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          setExpandedOrderId(
                            isExpanded
                              ? null
                              : order.id
                          )
                        }
                        className="inline-flex items-center justify-center gap-2 h-11 px-5 rounded-full border border-border font-semibold text-sm hover:bg-secondary transition-colors"
                      >
                        {isExpanded ? (
                          <>
                            Masquer
                            <ChevronUp className="w-4 h-4" />
                          </>
                        ) : (
                          <>
                            Détails
                            <ChevronDown className="w-4 h-4" />
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="border-t border-border bg-secondary/20 p-5 sm:p-6">
                      <div className="grid lg:grid-cols-2 gap-7">
                        <section>
                          <h3 className="font-display font-bold text-lg mb-4">
                            Produits commandés
                          </h3>

                          <div className="space-y-3">
                            {orderItems.length === 0 ? (
                              <div className="rounded-2xl border border-border bg-card p-4">
                                <p className="text-sm text-muted-foreground">
                                  Aucun article enregistré.
                                </p>
                              </div>
                            ) : (
                              orderItems.map((item) => (
                                <div
                                  key={item.id}
                                  className="rounded-2xl border border-border bg-card p-4"
                                >
                                  <div className="flex justify-between gap-4">
                                    <div>
                                      <p className="font-semibold">
                                        {
                                          item.product_name
                                        }
                                      </p>

                                      {item.variant_name && (
                                        <p className="text-sm text-muted-foreground mt-1">
                                          {
                                            item.variant_name
                                          }
                                        </p>
                                      )}

                                      {item.reference && (
                                        <p className="text-xs text-muted-foreground mt-1">
                                          Réf.{" "}
                                          {
                                            item.reference
                                          }
                                        </p>
                                      )}

                                      {item.sku && (
                                        <p className="text-xs text-muted-foreground mt-1">
                                          SKU : {item.sku}
                                        </p>
                                      )}
                                    </div>

                                    <p className="font-display font-bold whitespace-nowrap">
                                      {formatPrice(
                                        item.line_total
                                      )}
                                    </p>
                                  </div>

                                  <p className="text-sm text-muted-foreground mt-3">
                                    {item.quantity} ×{" "}
                                    {formatPrice(
                                      item.unit_price
                                    )}
                                  </p>
                                </div>
                              ))
                            )}
                          </div>
                        </section>

                        <section>
                          <h3 className="font-display font-bold text-lg mb-4">
                            Client et livraison
                          </h3>

                          <div className="rounded-2xl border border-border bg-card p-5 space-y-3 text-sm">
                            <p>
                              <span className="font-semibold">
                                Client :
                              </span>{" "}
                              {order.customer_name ||
                                "Non renseigné"}
                            </p>

                            <p>
                              <span className="font-semibold">
                                E-mail :
                              </span>{" "}
                              {order.customer_email ||
                                "Non renseigné"}
                            </p>

                            <p>
                              <span className="font-semibold">
                                Téléphone :
                              </span>{" "}
                              {order.customer_phone ||
                                "Non renseigné"}
                            </p>

                            <div className="border-t border-border pt-3">
                              <p className="font-semibold mb-2">
                                Adresse de livraison
                              </p>

                              {order.shipping_name && (
                                <p>
                                  {order.shipping_name}
                                </p>
                              )}

                              {order.shipping_line1 && (
                                <p>
                                  {
                                    order.shipping_line1
                                  }
                                </p>
                              )}

                              {order.shipping_line2 && (
                                <p>
                                  {
                                    order.shipping_line2
                                  }
                                </p>
                              )}

                              {(order.shipping_postal_code ||
                                order.shipping_city) && (
                                <p>
                                  {
                                    order.shipping_postal_code
                                  }{" "}
                                  {order.shipping_city}
                                </p>
                              )}

                              {order.shipping_country && (
                                <p>
                                  {
                                    order.shipping_country
                                  }
                                </p>
                              )}

                              {!order.shipping_line1 &&
                                !order.shipping_city && (
                                  <p className="text-muted-foreground">
                                    Adresse non renseignée.
                                  </p>
                                )}
                            </div>

                            <div className="border-t border-border pt-3 space-y-2">
                              <p>
                                <span className="font-semibold">
                                  Paiement :
                                </span>{" "}
                                {paymentLabels[
                                  order.payment_status
                                ] ||
                                  order.payment_status}
                              </p>

                              <p>
                                <span className="font-semibold">
                                  Traitement :
                                </span>{" "}
                                {fulfillmentLabels[
                                  order
                                    .fulfillment_status
                                ] ||
                                  order
                                    .fulfillment_status}
                              </p>

                              <p>
                                <span className="font-semibold">
                                  Payée le :
                                </span>{" "}
                                {formatDate(
                                  order.paid_at
                                )}
                              </p>
                            </div>
                          </div>
                        </section>
                      </div>

                      <div className="mt-6 rounded-2xl border border-border bg-card p-5">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">
                            Sous-total
                          </span>

                          <span className="font-semibold">
                            {formatPrice(
                              order.subtotal
                            )}
                          </span>
                        </div>

                        <div className="flex justify-between text-sm mt-2">
                          <span className="text-muted-foreground">
                            Livraison
                          </span>

                          <span className="font-semibold">
                            {formatPrice(
                              order.shipping_amount
                            )}
                          </span>
                        </div>

                        <div className="border-t border-border mt-4 pt-4 flex justify-between">
                          <span className="font-display font-bold">
                            Total
                          </span>

                          <span className="font-display font-black text-xl">
                            {formatPrice(
                              order.total
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}