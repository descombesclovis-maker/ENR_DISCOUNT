import React, { useCallback, useEffect, useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  LoaderCircle,
  Mail,
  PackageCheck,
  RefreshCw,
  ShoppingCart,
  Truck,
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
  processing: "Pris en charge",
  shipped: "Expédiée",
  delivered: "Livrée",
  cancelled: "Annulée",
};

const carrierOptions = [
  "Colissimo / La Poste",
  "Chronopost",
  "Mondial Relay",
  "Transporteur spécialisé",
  "Autre",
];

function formatDate(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function fulfillmentClass(status) {
  if (status === "processing") return "bg-blue-100 text-blue-700";
  if (status === "shipped") return "bg-violet-100 text-violet-700";
  if (status === "delivered") return "bg-emerald-100 text-emerald-700";
  if (status === "cancelled") return "bg-red-100 text-red-700";
  return "bg-slate-100 text-slate-600";
}

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [sendingKey, setSendingKey] = useState("");
  const [drafts, setDrafts] = useState({});

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
          paid_at,
          created_at,
          updated_at,
          tracking_number,
          carrier,
          shipping_carrier_name,
          tracking_url,
          estimated_delivery_date,
          processing_at,
          shipped_at,
          delivered_at,
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
        .order("created_at", { ascending: false });

      if (error) throw error;
      const normalized = (data || []).map((order) => ({
        ...order,
        order_items: Array.isArray(order.order_items)
          ? [...order.order_items].sort(
              (a, b) => new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime()
            )
          : [],
      }));
      setOrders(normalized);
      setDrafts((current) => {
        const next = { ...current };
        normalized.forEach((order) => {
          next[order.id] = {
            carrier: next[order.id]?.carrier ?? order.shipping_carrier_name ?? order.carrier ?? "",
            tracking_number: next[order.id]?.tracking_number ?? order.tracking_number ?? "",
            estimated_delivery_date:
              next[order.id]?.estimated_delivery_date ?? order.estimated_delivery_date ?? "",
          };
        });
        return next;
      });
    } catch (error) {
      console.error("Erreur lors du chargement des commandes :", error);
      toast.error(error?.message || "Impossible de charger les commandes.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    document.title = "Commandes | QEH OUTLET";
    loadOrders();
  }, [loadOrders]);

  const updateDraft = (orderId, field, value) => {
    setDrafts((current) => ({
      ...current,
      [orderId]: { ...(current[orderId] || {}), [field]: value },
    }));
  };

  const notifyDelivery = async (order, status) => {
    const key = `${order.id}:${status}`;
    const draft = drafts[order.id] || {};
    if (!order.customer_email) {
      toast.error("Cette commande n’a pas d’adresse e-mail client.");
      return;
    }
    if (status === "shipped" && (!draft.carrier || !draft.tracking_number)) {
      toast.error("Renseigne le transporteur et le numéro de suivi avant d’expédier.");
      return;
    }

    setSendingKey(key);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.access_token) throw new Error("Session administrateur expirée.");

      const { data, error } = await supabase.functions.invoke("qeh-order-tracking", {
        body: {
          action: "admin_update",
          order_id: order.id,
          status,
          carrier: draft.carrier || null,
          tracking_number: draft.tracking_number || null,
          estimated_delivery_date: draft.estimated_delivery_date || null,
        },
        headers: { Authorization: `Bearer ${session.access_token}` },
      });

      if (error || data?.error) throw new Error(data?.error || error?.message || "Échec de la notification.");

      setOrders((current) =>
        current.map((item) =>
          item.id === order.id
            ? {
                ...item,
                ...data.order,
              }
            : item
        )
      );

      const labels = {
        processing: "Le client a été informé : colis pris en charge.",
        shipped: "Le client a été informé : commande expédiée.",
        delivered: "Le client a été informé : commande livrée.",
      };
      toast.success(labels[status] || "Le client a été informé.", {
        description: "Un e-mail avec le bouton de suivi QEH OUTLET a été envoyé.",
      });
    } catch (error) {
      console.error("Notification de livraison impossible :", error);
      toast.error(error?.message || "Impossible d’informer le client.");
      await loadOrders();
    } finally {
      setSendingKey("");
    }
  };

  return (
    <div className="min-h-screen bg-secondary/30" data-testid="admin-orders">
      <header className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 min-h-20 py-4 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="font-display font-black text-xl">QEH OUTLET</p>
            <p className="text-xs text-muted-foreground">Administration · commandes et livraison</p>
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
            <p className="overline text-primary mb-2">Ventes</p>
            <h1 className="font-display font-black text-3xl sm:text-4xl tracking-tight">Gestion des commandes</h1>
            <p className="text-muted-foreground mt-2 max-w-2xl">
              Enregistre le transporteur et le numéro de suivi, puis informe le client à chaque étape. Le client reçoit un e-mail avec un bouton qui ouvre son suivi directement sur QEH OUTLET.
            </p>
          </div>
          <button
            type="button"
            onClick={loadOrders}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 h-11 px-5 rounded-full border border-border bg-card font-semibold text-sm hover:bg-secondary transition-colors disabled:opacity-60"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            Actualiser
          </button>
        </div>

        {loading ? (
          <div className="rounded-3xl border border-border bg-card py-20 text-center">
            <LoaderCircle className="w-10 h-10 animate-spin text-primary mx-auto mb-4" />
            <p className="font-semibold">Chargement des commandes…</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="rounded-3xl border border-border bg-card py-20 px-6 text-center">
            <ShoppingCart className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="font-display font-bold text-2xl">Aucune commande</h2>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const isExpanded = expandedOrderId === order.id;
              const items = order.order_items || [];
              const articleCount = items.reduce((sum, item) => sum + Number(item.quantity || 0), 0);
              const draft = drafts[order.id] || {};
              return (
                <article key={order.id} className="rounded-3xl border border-border bg-card overflow-hidden">
                  <div className="p-5 sm:p-6">
                    <div className="flex flex-col xl:flex-row xl:items-center gap-5">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-3">
                          <h2 className="font-display font-bold text-lg">{order.order_number}</h2>
                          <span className="inline-flex rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                            {paymentLabels[order.payment_status] || order.payment_status}
                          </span>
                          <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${fulfillmentClass(order.fulfillment_status)}`}>
                            {fulfillmentLabels[order.fulfillment_status] || order.fulfillment_status}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-2">{formatDate(order.created_at)}</p>
                        <p className="font-semibold mt-2">{order.customer_name || order.customer_email || "Client non renseigné"}</p>
                        {order.customer_email && <p className="text-sm text-muted-foreground">{order.customer_email}</p>}
                      </div>

                      <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wide">Articles</p>
                        <p className="font-display font-bold text-lg mt-1">{articleCount}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wide">Total</p>
                        <p className="font-display font-black text-xl mt-1">{formatPrice(order.total)}</p>
                      </div>

                      <button
                        type="button"
                        onClick={() => setExpandedOrderId(isExpanded ? null : order.id)}
                        className="inline-flex items-center justify-center gap-2 h-11 px-5 rounded-full border border-border font-semibold text-sm hover:bg-secondary transition-colors"
                      >
                        {isExpanded ? <><span>Masquer</span><ChevronUp className="w-4 h-4" /></> : <><span>Gérer la livraison</span><ChevronDown className="w-4 h-4" /></>}
                      </button>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="border-t border-border bg-secondary/20 p-5 sm:p-6 space-y-6">
                      <div className="grid lg:grid-cols-2 gap-6">
                        <section className="rounded-2xl border border-border bg-card p-5">
                          <h3 className="font-display font-bold text-lg">Client et livraison</h3>
                          <div className="mt-4 space-y-2 text-sm">
                            <p><strong>Client :</strong> {order.customer_name || "Non renseigné"}</p>
                            <p><strong>E-mail :</strong> {order.customer_email || "Non renseigné"}</p>
                            <p><strong>Téléphone :</strong> {order.customer_phone || "Non renseigné"}</p>
                            <div className="pt-3 mt-3 border-t border-border text-muted-foreground">
                              <p>{order.shipping_name}</p>
                              <p>{order.shipping_line1}</p>
                              {order.shipping_line2 && <p>{order.shipping_line2}</p>}
                              <p>{order.shipping_postal_code} {order.shipping_city}</p>
                              <p>{order.shipping_country}</p>
                            </div>
                          </div>
                        </section>

                        <section className="rounded-2xl border border-border bg-card p-5">
                          <h3 className="font-display font-bold text-lg">Produits commandés</h3>
                          <div className="mt-4 space-y-3">
                            {items.map((item) => (
                              <div key={item.id} className="rounded-xl border border-border bg-secondary/20 p-3 text-sm">
                                <div className="flex justify-between gap-4">
                                  <div>
                                    <p className="font-semibold">{item.product_name}</p>
                                    {item.variant_name && <p className="text-muted-foreground">{item.variant_name}</p>}
                                  </div>
                                  <p className="font-bold whitespace-nowrap">{formatPrice(item.line_total)}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </section>
                      </div>

                      <section className="rounded-3xl border border-[#0b5ca8]/20 bg-[#020714] p-5 sm:p-6 text-white">
                        <div className="flex items-start gap-4">
                          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[#0b5ca8]/20 text-[#55a8ff]">
                            <Truck className="w-6 h-6" />
                          </div>
                          <div>
                            <h3 className="font-display font-black text-xl">Suivi et notifications client</h3>
                            <p className="mt-1 text-sm text-white/55">
                              Chaque bouton met à jour le suivi QEH OUTLET et envoie automatiquement un e-mail au client.
                            </p>
                          </div>
                        </div>

                        <div className="grid md:grid-cols-3 gap-3 mt-6">
                          <label className="text-xs font-bold text-white/65">
                            Transporteur
                            <select
                              value={draft.carrier || ""}
                              onChange={(e) => updateDraft(order.id, "carrier", e.target.value)}
                              className="mt-2 w-full h-11 rounded-xl border border-white/15 bg-white/10 px-3 text-sm text-white outline-none"
                            >
                              <option value="" className="text-black">Choisir</option>
                              {carrierOptions.map((carrier) => <option key={carrier} value={carrier} className="text-black">{carrier}</option>)}
                            </select>
                          </label>
                          <label className="text-xs font-bold text-white/65">
                            Numéro de suivi
                            <input
                              value={draft.tracking_number || ""}
                              onChange={(e) => updateDraft(order.id, "tracking_number", e.target.value)}
                              placeholder="Ex. 6A12345678901"
                              className="mt-2 w-full h-11 rounded-xl border border-white/15 bg-white/10 px-3 text-sm text-white placeholder:text-white/25 outline-none"
                            />
                          </label>
                          <label className="text-xs font-bold text-white/65">
                            Livraison estimée
                            <input
                              type="date"
                              value={draft.estimated_delivery_date || ""}
                              onChange={(e) => updateDraft(order.id, "estimated_delivery_date", e.target.value)}
                              className="mt-2 w-full h-11 rounded-xl border border-white/15 bg-white/10 px-3 text-sm text-white outline-none"
                            />
                          </label>
                        </div>

                        <div className="grid md:grid-cols-3 gap-3 mt-5">
                          <button
                            type="button"
                            onClick={() => notifyDelivery(order, "processing")}
                            disabled={Boolean(sendingKey)}
                            className="min-h-12 rounded-xl border border-[#55a8ff]/35 bg-[#0b5ca8]/20 px-4 font-black text-sm hover:bg-[#0b5ca8]/35 disabled:opacity-50"
                          >
                            <PackageCheck className="w-4 h-4 inline mr-2" />
                            Colis pris en charge
                          </button>
                          <button
                            type="button"
                            onClick={() => notifyDelivery(order, "shipped")}
                            disabled={Boolean(sendingKey)}
                            className="min-h-12 rounded-xl bg-[#ff5a00] px-4 font-black text-sm hover:bg-[#e95000] disabled:opacity-50"
                          >
                            <Truck className="w-4 h-4 inline mr-2" />
                            Expédié + envoyer le suivi
                          </button>
                          <button
                            type="button"
                            onClick={() => notifyDelivery(order, "delivered")}
                            disabled={Boolean(sendingKey)}
                            className="min-h-12 rounded-xl bg-emerald-500 px-4 font-black text-sm text-white hover:bg-emerald-600 disabled:opacity-50"
                          >
                            <CheckCircle2 className="w-4 h-4 inline mr-2" />
                            Colis arrivé
                          </button>
                        </div>

                        <div className="mt-5 grid sm:grid-cols-3 gap-3 text-xs text-white/55">
                          <p>Pris en charge : <strong className="text-white/80">{formatDate(order.processing_at)}</strong></p>
                          <p>Expédié : <strong className="text-white/80">{formatDate(order.shipped_at)}</strong></p>
                          <p>Livré : <strong className="text-white/80">{formatDate(order.delivered_at)}</strong></p>
                        </div>

                        <div className="mt-5 flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[.04] p-4 text-sm text-white/60">
                          <Mail className="w-5 h-5 shrink-0 text-[#ff7a32]" />
                          <p>
                            L’e-mail contient un bouton <strong className="text-white">« Suivre ma livraison »</strong>. Il ouvre une page QEH OUTLET dédiée, sans demander au client de recopier son numéro de colis.
                          </p>
                        </div>
                      </section>
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
