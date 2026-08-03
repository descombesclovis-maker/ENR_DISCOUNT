import React, {
  useEffect,
  useState,
} from "react";

import {
  Link,
} from "react-router-dom";

import {
  PackageSearch,
  ShoppingBag,
  ArrowRight,
  Calendar,
  CreditCard,
  Truck,
} from "lucide-react";

import { supabase } from "../lib/supabase";

import {
  useCustomerAuth,
} from "../context/CustomerAuthContext";

export default function CustomerOrders() {

  const {
    user,
  } = useCustomerAuth();

  const [
    orders,
    setOrders,
  ] = useState([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  useEffect(() => {

    if (!user) {
      setLoading(false);
      return;
    }

    loadOrders();

  }, [user]);

  async function loadOrders() {

    setLoading(true);

    const {
      data,
      error,
    } = await supabase
      .from("orders")
      .select(`
        *,
        order_items (*)
      `)
      .eq(
        "customer_id",
        user.id
      )
      .order(
        "created_at",
        {
          ascending: false,
        }
      );

    if (error) {

      console.error(error);

    } else {

      setOrders(
        data || []
      );

    }

    setLoading(false);

  }

  return (

    <div className="min-h-screen bg-slate-50">

      <section className="relative overflow-hidden bg-[#020714]">

        <div className="absolute inset-0">

          <div className="absolute -left-40 -top-40 w-[420px] h-[420px] rounded-full bg-[#0b5ca8]/25 blur-3xl"/>

          <div className="absolute -right-32 bottom-0 w-[420px] h-[420px] rounded-full bg-[#ff5a00]/20 blur-3xl"/>

        </div>

        <div className="relative max-w-7xl mx-auto px-6 py-16">

          <p className="uppercase tracking-[0.30em] text-xs font-black text-[#ff5a00]">

            Espace client

          </p>

          <h1 className="mt-4 text-5xl font-black text-white">

            Mes commandes

          </h1>

          <p className="mt-5 text-lg text-white/70 max-w-2xl">

            Retrouvez toutes vos commandes,
            leur état de préparation,
            leur suivi de livraison
            et vos prochaines factures.

          </p>

        </div>

      </section>

      <div className="max-w-7xl mx-auto px-6 py-12">

        <div className="rounded-[34px] bg-white border border-slate-200 shadow-sm overflow-hidden">

          <div className="p-10 border-b border-slate-200 flex items-center gap-5">

            <div className="w-16 h-16 rounded-3xl bg-[#0b5ca8]/10 flex items-center justify-center">

              <PackageSearch className="w-8 h-8 text-[#0b5ca8]" />

            </div>

            <div>

              <h2 className="text-3xl font-black">

                Historique des commandes

              </h2>

              <p className="text-slate-500 mt-2">

                Toutes vos commandes apparaîtront ici automatiquement.

              </p>

            </div>

          </div>
          <div className="py-10 px-8">

            {loading ? (

              <div className="text-center py-20">
                Chargement des commandes...
              </div>

            ) : orders.length === 0 ? (

              <div className="text-center py-20">

                <div className="mx-auto w-24 h-24 rounded-full bg-[#ff5a00]/10 flex items-center justify-center">
                  <ShoppingBag className="w-12 h-12 text-[#ff5a00]" />
                </div>

                <h2 className="text-3xl font-black mt-8">
                  Aucune commande
                </h2>

                <p className="text-slate-500 mt-4">
                  Vous n'avez encore passé aucune commande.
                </p>

              </div>

            ) : (

              <div className="space-y-6">

                {orders.map((order) => (

                  <div
                    key={order.id}
                    className="rounded-3xl border border-slate-200 bg-white p-6"
                  >

                    <div className="flex items-center justify-between">

                      <div>

                        <p className="text-sm text-slate-500">
                          Commande Qeh Outlet
                        </p>

                        <h2 className="font-black text-xl">
                            <div className="text-xs uppercase tracking-widest text-[#ff5a00] font-bold mb-1">
  QEH OUTLET
</div>
                         #{order.order_number}
                        </h2>

                      </div>
<span
  className={`px-4 py-2 rounded-full font-bold ${
    order.payment_status === "paid"
      ? "bg-green-100 text-green-700"
      : order.payment_status === "pending"
      ? "bg-yellow-100 text-yellow-700"
      : "bg-red-100 text-red-700"
  }`}
>
  {order.payment_status === "paid"
    ? "Payée"
    : order.payment_status === "pending"
    ? "En attente"
    : "Échec"}
</span>
                    </div>

                   <div className="grid md:grid-cols-3 gap-6 mt-8">

  <div>

    <div className="flex items-center gap-2 text-slate-500">
      <Calendar className="w-5 h-5" />
      Date
    </div>

    <div className="font-bold mt-2">
      {new Date(order.created_at).toLocaleDateString("fr-FR")}
    </div>

  </div>

  <div>

    <div className="flex items-center gap-2 text-slate-500">
      <CreditCard className="w-5 h-5" />
      Montant
    </div>

    <div className="font-bold mt-2">
      {Number(order.total).toFixed(2)} €
    </div>

  </div>

  <div>

    <div className="flex items-center gap-2 text-slate-500">
      <Truck className="w-5 h-5" />
      Livraison
    </div>

    <div className="font-bold mt-2">
   {order.fulfillment_status === "pending"
  ? "Préparation"
  : order.fulfillment_status === "processing"
  ? "En préparation"
  : order.fulfillment_status === "shipped"
  ? "Expédiée"
  : order.fulfillment_status === "delivered"
  ? "Livrée"
  : order.fulfillment_status}
    </div>

  </div>

</div>

{order.order_items?.length > 0 && (

  <div className="mt-8 border-t border-slate-200 pt-6">

    <h3 className="font-black text-lg mb-4">
      Produits commandés
    </h3>

    <div className="space-y-3">

      {order.order_items.map((item) => (

        <div
          key={item.id}
          className="flex items-center justify-between rounded-2xl bg-slate-50 p-4"
        >

          <div>

            <div className="font-bold">
              {item.product_name}
            </div>

            <div className="text-sm text-slate-500">
              Quantité : {item.quantity}
            </div>

          </div>

          <div className="font-black text-[#ff5a00]">
            {Number(item.line_total).toFixed(2)} €
          </div>

        </div>

      ))}

    </div>

  </div>

)}
<div className="mt-8 flex justify-end">

  <button
    className="inline-flex items-center gap-3 h-12 px-6 rounded-xl border border-[#0b5ca8] text-[#0b5ca8] hover:bg-[#0b5ca8] hover:text-white transition-all font-bold"
  >

    Voir la commande

    <ArrowRight className="w-5 h-5" />

  </button>

</div>
                  </div>

                ))}

              </div>

            )}

            <Link
              to="/produits"
              className="inline-flex items-center gap-3 mt-14 h-14 px-8 rounded-2xl bg-[#ff5a00] hover:bg-[#ff6f22] text-white font-black transition-all"
            >
              Découvrir nos produits
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
                  </div>

      </div>

    </div>

  );

}