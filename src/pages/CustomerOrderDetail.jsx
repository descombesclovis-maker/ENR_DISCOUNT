import React, {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  Link,
  Navigate,
  useParams,
} from "react-router-dom";

import {
  ArrowLeft,
  Calendar,
  CreditCard,
  LoaderCircle,
  MapPin,
  Package,
  Receipt,
  Truck,
  Star,
  ShieldCheck,
  Clock3,
  RotateCcw,
  Download,
  PackageCheck,
} from "lucide-react";

import { supabase } from "../lib/supabase";

import {
  useCustomerAuth,
} from "../context/CustomerAuthContext";

function formatPrice(value) {
  return new Intl.NumberFormat(
    "fr-FR",
    {
      style: "currency",
      currency: "EUR",
    }
  ).format(
    Number(value || 0)
  );
}

function formatDate(value) {
  if (!value) {
    return "Non renseignée";
  }

  return new Intl.DateTimeFormat(
    "fr-FR",
    {
      dateStyle: "long",
      timeStyle: "short",
    }
  ).format(
    new Date(value)
  );
}

function getPaymentStatus(status) {
  const statuses = {
    paid: {
      label: "Payée",
      className:
        "bg-emerald-100 text-emerald-700",
    },

    pending: {
      label: "En attente",
      className:
        "bg-amber-100 text-amber-700",
    },

    failed: {
      label: "Échec",
      className:
        "bg-red-100 text-red-700",
    },

    expired: {
      label: "Expirée",
      className:
        "bg-slate-100 text-slate-600",
    },
  };

  return (
    statuses[status] || {
      label:
        status ||
        "Non renseigné",

      className:
        "bg-slate-100 text-slate-600",
    }
  );
}

function getFulfillmentStatus(status) {
  const statuses = {
    pending: "Préparation",
    processing: "En préparation",
    shipped: "Expédiée",
    delivered: "Livrée",
    cancelled: "Annulée",
  };

  return (
    statuses[status] ||
    status ||
    "Non renseigné"
  );
}

export default function CustomerOrderDetail() {
  const {
    id,
  } = useParams();

  const {
    user,
    loading: authLoading,
  } = useCustomerAuth();

  const [
    order,
    setOrder,
  ] = useState(null);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    errorMessage,
    setErrorMessage,
  ] = useState("");

  const loadOrder =
    useCallback(
      async () => {
        if (
          !user ||
          !id
        ) {
          return;
        }

        setLoading(true);
        setErrorMessage("");

        try {
          const {
            data,
            error,
          } = await supabase
            .from("orders")
            .select(`
              *,
              order_items (*)
            `)
            .eq("id", id)
            .eq("customer_id", user.id)
            .maybeSingle();

          if (error) {
            throw error;
          }

          if (!data) {
            throw new Error(
              "Cette commande est introuvable."
            );
          }

          setOrder(data);

        } catch (error) {

          console.error(error);

          setErrorMessage(
            error?.message ||
            "Impossible de charger cette commande."
          );

        } finally {

          setLoading(false);

        }

      },
      [
        id,
        user,
      ]
    );

  useEffect(() => {

    document.title =
      "Détail de commande | QEH OUTLET";

  }, []);

  useEffect(() => {

    loadOrder();

  }, [loadOrder]);

  if (authLoading) {

    return (

      <div className="min-h-[70vh] grid place-items-center">

        <LoaderCircle className="w-10 h-10 animate-spin text-[#0b5ca8]" />

      </div>

    );

  }

  if (!user) {

    return <Navigate to="/connexion" replace />;

  }

  if (loading) {

    return (

      <div className="min-h-[70vh] grid place-items-center">

        <LoaderCircle className="w-10 h-10 animate-spin text-[#0b5ca8]" />

      </div>

    );

  }
    if (
    errorMessage ||
    !order
  ) {

    return (

      <div className="max-w-3xl mx-auto px-5 py-20 text-center">

        <Package className="w-14 h-14 mx-auto text-slate-300" />

        <h1 className="font-display font-black text-3xl mt-6">

          Commande introuvable

        </h1>

        <p className="text-slate-500 mt-3">

          {errorMessage}

        </p>

        <Link
          to="/mes-commandes"
          className="inline-flex items-center gap-2 h-12 px-6 mt-8 rounded-xl bg-[#ff5a00] text-white font-bold"
        >

          <ArrowLeft className="w-5 h-5" />

          Retour aux commandes

        </Link>

      </div>

    );

  }

  const paymentStatus =
    getPaymentStatus(
      order.payment_status
    );

  const progress = {

    pending: 25,

    processing: 50,

    shipped: 75,

    delivered: 100,

  }[
    order.fulfillment_status
  ] || 0;

  return (

    <div className="min-h-screen bg-slate-50">

      <section className="bg-[#020714] text-white">

        <div className="max-w-7xl mx-auto px-5 sm:px-8 py-14">

          <Link
            to="/mes-commandes"
            className="inline-flex items-center gap-2 text-white/70 hover:text-white"
          >

            <ArrowLeft className="w-5 h-5" />

            Mes commandes

          </Link>

          <p className="text-xs font-black uppercase tracking-[0.25em] text-[#ff5a00] mt-8">

            Commande QEH OUTLET

          </p>

          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mt-3">

            <div>

              <h1 className="font-display font-black text-5xl">

                #{order.order_number}

              </h1>

              <p className="text-white/60 mt-4">

                Retrouvez toutes les informations concernant votre commande.

              </p>

            </div>

            <span
              className={`inline-flex px-5 py-2 rounded-full font-black ${paymentStatus.className}`}
            >

              {paymentStatus.label}

            </span>

          </div>

        </div>

      </section>

      <main className="max-w-7xl mx-auto px-5 sm:px-8 py-12">

        <section className="grid lg:grid-cols-4 gap-6">

          <div className="rounded-3xl bg-white border border-slate-200 p-6">

            <Calendar className="w-8 h-8 text-[#0b5ca8]" />

            <p className="text-sm text-slate-500 mt-5">

              Date

            </p>

            <p className="font-black mt-2">

              {formatDate(order.created_at)}

            </p>

          </div>

          <div className="rounded-3xl bg-white border border-slate-200 p-6">

            <CreditCard className="w-8 h-8 text-[#0b5ca8]" />

            <p className="text-sm text-slate-500 mt-5">

              Montant

            </p>

            <p className="font-black text-xl mt-2">

              {formatPrice(order.total)}

            </p>

          </div>

          <div className="rounded-3xl bg-white border border-slate-200 p-6">

            <Truck className="w-8 h-8 text-[#ff5a00]" />

            <p className="text-sm text-slate-500 mt-5">

              Livraison

            </p>

            <p className="font-black mt-2">

              {getFulfillmentStatus(
                order.fulfillment_status
              )}

            </p>

          </div>

          <div className="rounded-3xl bg-white border border-slate-200 p-6">

            <Receipt className="w-8 h-8 text-[#ff5a00]" />

            <p className="text-sm text-slate-500 mt-5">

              Facture

            </p>

            <p className="font-black mt-2">

              Disponible après paiement

            </p>

          </div>

        </section>
                <section className="rounded-[32px] border border-slate-200 bg-white p-8 mt-8">

          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">

            <div>

              <h2 className="font-display font-black text-3xl">

                Produits commandés

              </h2>

              <p className="text-slate-500 mt-2">

                {order.order_items?.length || 0} produit(s)

              </p>

            </div>

            <button className="h-12 px-6 rounded-xl bg-[#ff5a00] hover:bg-[#ff6f22] text-white font-black transition-all">

              Racheter cette commande

            </button>

          </div>

          <div className="space-y-5 mt-8">

            {(order.order_items || []).map((item) => (

              <article
                key={item.id}
                className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 rounded-3xl border border-slate-200 bg-slate-50 p-6"
              >

                <div className="flex items-center gap-5">

                  <div className="w-24 h-24 rounded-2xl overflow-hidden border border-slate-200 bg-white flex-shrink-0">

                    <img
                      src={
                        item.product_image ||
                        item.image ||
                        "/placeholder-product.webp"
                      }
                      alt={item.product_name}
                      className="w-full h-full object-cover"
                    />

                  </div>

                  <div>

                    <h3 className="font-black text-lg">

                      {item.product_name}

                    </h3>

                    <div className="flex items-center gap-1 mt-2">

                      {[1,2,3,4,5].map((star)=>(

                        <Star
                          key={star}
                          className="w-4 h-4 fill-[#ffb400] text-[#ffb400]"
                        />

                      ))}

                    </div>

                    {item.variant_name && (

                      <p className="text-sm text-slate-500 mt-2">

                        Variante : {item.variant_name}

                      </p>

                    )}

                    {item.sku && (

                      <p className="text-sm text-slate-500">

                        SKU : {item.sku}

                      </p>

                    )}

                    <p className="text-sm text-slate-500">

                      Quantité : {item.quantity}

                    </p>

                    <button className="mt-3 text-[#0b5ca8] hover:text-[#ff5a00] font-bold transition-colors">

                      Donner un avis

                    </button>

                  </div>

                </div>

                <div className="text-right">

                  <div className="text-sm text-slate-500">

                    Prix unitaire

                  </div>

                  <div className="font-bold mt-1">

                    {formatPrice(item.unit_price)}

                  </div>

                  <div className="text-[#ff5a00] text-2xl font-black mt-3">

                    {formatPrice(item.line_total)}

                  </div>

                </div>

              </article>

            ))}

          </div>

        </section>

        <div className="grid lg:grid-cols-2 gap-8 mt-8">

          <section className="rounded-[32px] border border-slate-200 bg-white p-8">

            <MapPin className="w-8 h-8 text-[#0b5ca8]" />

            <h2 className="font-display font-black text-2xl mt-5">

              Adresse de livraison

            </h2>

            <div className="text-slate-600 leading-relaxed mt-6">

              <p className="font-bold text-slate-950">

                {order.shipping_name ||
                  order.customer_name ||
                  "Non renseigné"}

              </p>

              <p>{order.shipping_line1}</p>

              {order.shipping_line2 && (

                <p>{order.shipping_line2}</p>

              )}

              <p>

                {order.shipping_postal_code} {order.shipping_city}

              </p>

              <p>{order.shipping_country}</p>

            </div>

          </section>

          <section className="rounded-[32px] bg-[#020714] text-white p-8">

            <Truck className="w-8 h-8 text-[#55a8ff]" />

            <h2 className="font-display font-black text-2xl mt-5">

              Suivi de livraison

            </h2>

            <p className="text-white/60 mt-4">

              {getFulfillmentStatus(order.fulfillment_status)}

            </p>

            <div className="mt-8">

              <div className="h-3 rounded-full bg-white/10 overflow-hidden">

                <div
                  className="h-full bg-[#ff5a00] transition-all duration-700"
                  style={{
                    width: `${progress}%`,
                  }}
                />

              </div>

            </div>

            {order.tracking_number && (

              <div className="mt-8 rounded-2xl bg-white/5 p-5">

                <p className="text-white/60 text-sm">

                  Numéro de suivi

                </p>

                <p className="font-black mt-2">

                  {order.tracking_number}

                </p>

              </div>

            )}

          </section>

        </div>
                <section className="rounded-[32px] border border-slate-200 bg-white p-8 mt-8">

          <h2 className="font-display font-black text-2xl mb-8">

            Actions

          </h2>

          <div className="flex flex-wrap gap-4">

            <button
              className="h-12 px-6 rounded-xl bg-[#ff5a00] hover:bg-[#ff6f22] text-white font-bold flex items-center gap-3 transition-all"
            >

              <RotateCcw className="w-5 h-5" />

              Racheter cette commande

            </button>

            <button
              onClick={() =>
                window.open(
                  `/api/invoices/${order.id}`,
                  "_blank"
                )
              }
              className="h-12 px-6 rounded-xl border border-[#0b5ca8] text-[#0b5ca8] hover:bg-[#0b5ca8] hover:text-white font-bold flex items-center gap-3 transition-all"
            >

              <Download className="w-5 h-5" />

              Télécharger la facture

            </button>

            <button
              onClick={() => {

                if (order.tracking_url) {

                  window.open(
                    order.tracking_url,
                    "_blank"
                  );

                }

              }}
              className="h-12 px-6 rounded-xl border border-slate-300 hover:border-[#ff5a00] hover:text-[#ff5a00] font-bold flex items-center gap-3 transition-all"
            >

              <Truck className="w-5 h-5" />

              Suivre le colis

            </button>

            <button
              className="h-12 px-6 rounded-xl border border-slate-300 hover:border-[#ff5a00] hover:text-[#ff5a00] font-bold flex items-center gap-3 transition-all"
            >

              <PackageCheck className="w-5 h-5" />

              Contacter le SAV

            </button>

          </div>

        </section>

        <section className="mt-10 rounded-[32px] bg-[#020714] text-white p-10">

          <h2 className="font-display font-black text-3xl">

            Besoin d'aide ?

          </h2>

          <p className="text-white/70 mt-4 max-w-2xl">

            Notre équipe QEH OUTLET est disponible pour répondre à toutes vos questions concernant cette commande.

          </p>

          <div className="flex flex-wrap gap-4 mt-8">

            <button className="h-12 px-6 rounded-xl bg-[#ff5a00] hover:bg-[#ff6f22] font-bold transition-all">

              Contacter le SAV

            </button>

            <button className="h-12 px-6 rounded-xl border border-white/20 hover:border-white transition-all">

              Centre d'aide

            </button>

          </div>

        </section>

      </main>

    </div>

  );

}