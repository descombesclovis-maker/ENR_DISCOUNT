import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Building2,
  ChevronRight,
  LoaderCircle,
  PackageCheck,
  RefreshCw,
  Search,
  ShoppingCart,
  X,
} from "lucide-react";

import { supabase } from "../lib/supabase";

const statuses = {
  pending: {
    label: "À traiter",
    style: "bg-amber-50 text-amber-700",
  },
  confirmed: {
    label: "Confirmée",
    style: "bg-blue-50 text-blue-700",
  },
  preparing: {
    label: "Préparation",
    style: "bg-violet-50 text-violet-700",
  },
  shipped: {
    label: "Expédiée",
    style: "bg-cyan-50 text-cyan-700",
  },
  completed: {
    label: "Terminée",
    style: "bg-emerald-50 text-emerald-700",
  },
  cancelled: {
    label: "Annulée",
    style: "bg-red-50 text-red-700",
  },
};

function money(value, currency = "EUR") {
  return Number(value || 0).toLocaleString(
    "fr-FR",
    {
      style: "currency",
      currency: String(
        currency || "EUR"
      ).toUpperCase(),
    }
  );
}

export default function AdminPartnerCommandes() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] =
    useState(true);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] =
    useState("all");
  const [selected, setSelected] =
    useState(null);
  const [errorMessage, setErrorMessage] =
    useState("");
  const [updating, setUpdating] =
    useState(false);

  const loadOrders = useCallback(async () => {
    setLoading(true);
    setErrorMessage("");

    const { data, error } = await supabase
      .from("qeh_partner_orders")
      .select(
        "*, qeh_partner_order_items(*)"
      )
      .order("created_at", {
        ascending: false,
      });

    if (error) {
      setOrders([]);
      setErrorMessage(error.message);
    } else {
      setOrders(data || []);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const filtered = useMemo(() => {
    const value = query
      .trim()
      .toLocaleLowerCase("fr-FR");

    return orders.filter((order) => {
      const statusMatch =
        statusFilter === "all" ||
        order.status === statusFilter;

      const searchable = [
        order.order_number,
        order.company_name,
        order.customer_name,
        order.customer_email,
      ]
        .filter(Boolean)
        .join(" ")
        .toLocaleLowerCase("fr-FR");

      const textMatch =
        !value || searchable.includes(value);

      return statusMatch && textMatch;
    });
  }, [
    orders,
    query,
    statusFilter,
  ]);

  async function updateStatus(nextStatus) {
    if (!selected) {
      return;
    }

    setUpdating(true);
    setErrorMessage("");

    const { error } = await supabase
      .from("qeh_partner_orders")
      .update({
        status: nextStatus,
        updated_at:
          new Date().toISOString(),
      })
      .eq("id", selected.id);

    if (error) {
      setErrorMessage(error.message);
    } else {
      const updated = {
        ...selected,
        status: nextStatus,
      };

      setSelected(updated);

      setOrders((current) =>
        current.map((order) =>
          order.id === updated.id
            ? updated
            : order
        )
      );
    }

    setUpdating(false);
  }

  return (
    <div className="min-h-screen p-4 sm:p-6 xl:p-8">
      <div className="mx-auto max-w-[1450px]">
        <header className="relative overflow-hidden rounded-[28px] bg-[#050b16] p-6 text-white sm:p-8">
          <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[#c99532]/25 blur-3xl" />

          <div className="relative">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-[#e8bd5c]">
              QEH Partner
            </p>

            <h1 className="mt-3 font-display text-3xl font-black sm:text-4xl">
              Commandes professionnelles
            </h1>

            <p className="mt-3 max-w-2xl text-slate-300">
              Suivi indépendant des commandes
              de gros, de la validation à
              l’expédition.
            </p>
          </div>
        </header>

        <section className="mt-5 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_14px_45px_rgba(2,7,17,0.06)]">
          <div className="grid gap-3 border-b border-slate-200 p-4 sm:p-5 md:grid-cols-[1fr_210px_auto]">
            <label className="relative">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />

              <input
                type="search"
                value={query}
                onChange={(event) =>
                  setQuery(event.target.value)
                }
                placeholder="N° de commande, société, client…"
                className="min-h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-12 pr-4 font-semibold outline-none"
              />
            </label>

            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(
                  event.target.value
                )
              }
              className="min-h-12 rounded-xl border border-slate-200 bg-white px-4 font-bold"
            >
              <option value="all">
                Tous les statuts
              </option>

              {Object.entries(statuses).map(
                ([value, config]) => (
                  <option
                    key={value}
                    value={value}
                  >
                    {config.label}
                  </option>
                )
              )}
            </select>

            <button
              type="button"
              onClick={loadOrders}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 font-black"
            >
              <RefreshCw className="h-4 w-4" />

              Actualiser
            </button>
          </div>

          {errorMessage ? (
            <div className="m-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-700">
              {errorMessage}
            </div>
          ) : null}

          {loading ? (
            <div className="grid min-h-[360px] place-items-center">
              <LoaderCircle className="h-8 w-8 animate-spin text-[#c99532]" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="grid min-h-[360px] place-items-center text-center text-slate-500">
              <div>
                <ShoppingCart className="mx-auto mb-3 h-10 w-10 text-slate-300" />

                Aucune commande
                professionnelle.
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[850px] text-left">
                <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
                  <tr>
                    <th className="px-5 py-4">
                      Commande
                    </th>

                    <th className="px-5 py-4">
                      Société / client
                    </th>

                    <th className="px-5 py-4">
                      Date
                    </th>

                    <th className="px-5 py-4">
                      Total
                    </th>

                    <th className="px-5 py-4">
                      Statut
                    </th>

                    <th className="px-5 py-4" />
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {filtered.map((order) => {
                    const config =
                      statuses[order.status] ||
                      statuses.pending;

                    return (
                      <tr
                        key={order.id}
                        className="hover:bg-slate-50"
                      >
                        <td className="px-5 py-4">
                          <p className="font-black">
                            {order.order_number}
                          </p>

                          <p className="text-xs font-semibold text-slate-400">
                            {order
                              .qeh_partner_order_items
                              ?.length ||
                              0}{" "}
                            référence(s)
                          </p>
                        </td>

                        <td className="px-5 py-4">
                          <p className="font-bold">
                            {order.company_name ||
                              order.customer_name ||
                              "Client professionnel"}
                          </p>

                          <p className="text-sm text-slate-500">
                            {order.customer_email}
                          </p>
                        </td>

                        <td className="px-5 py-4 text-sm font-semibold text-slate-600">
                          {new Date(
                            order.created_at
                          ).toLocaleDateString(
                            "fr-FR"
                          )}
                        </td>

                        <td className="px-5 py-4 font-black">
                          {money(
                            order.total_including_tax,
                            order.currency
                          )}
                        </td>

                        <td className="px-5 py-4">
                          <span
                            className={`rounded-full px-3 py-1.5 text-xs font-black ${config.style}`}
                          >
                            {config.label}
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          <button
                            type="button"
                            onClick={() =>
                              setSelected(
                                order
                              )
                            }
                            className="grid h-10 w-10 place-items-center rounded-xl border border-slate-200"
                            aria-label="Voir la commande"
                          >
                            <ChevronRight className="h-5 w-5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>

      {selected ? (
        <div
          className="fixed inset-0 z-[100] flex justify-end bg-[#020711]/55 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (
              event.currentTarget ===
              event.target
            ) {
              setSelected(null);
            }
          }}
        >
          <aside className="h-full w-full max-w-xl overflow-y-auto bg-white p-5 shadow-2xl sm:p-7">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-[#a87316]">
                  Commande Pro
                </p>

                <h2 className="mt-2 font-display text-2xl font-black">
                  {selected.order_number}
                </h2>
              </div>

              <button
                type="button"
                onClick={() =>
                  setSelected(null)
                }
                className="grid h-10 w-10 place-items-center rounded-xl bg-slate-100"
                aria-label="Fermer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-6 rounded-3xl bg-[#050b16] p-5 text-white">
              <div className="flex items-center gap-3">
                <Building2 className="h-6 w-6 text-[#e8bd5c]" />

                <div>
                  <p className="font-black">
                    {selected.company_name ||
                      selected.customer_name}
                  </p>

                  <p className="text-sm text-slate-400">
                    {selected.customer_email}
                    {" · "}
                    {selected.customer_phone ||
                      "Téléphone absent"}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <p className="mb-3 text-xs font-black uppercase tracking-wider text-slate-400">
                Changer le statut
              </p>

              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {Object.entries(
                  statuses
                ).map(
                  ([value, config]) => (
                    <button
                      key={value}
                      type="button"
                      disabled={updating}
                      onClick={() =>
                        updateStatus(value)
                      }
                      className={`min-h-10 rounded-xl px-3 text-xs font-black ${
                        selected.status ===
                        value
                          ? `${config.style} ring-2 ring-current`
                          : "border border-slate-200 text-slate-600"
                      }`}
                    >
                      {config.label}
                    </button>
                  )
                )}
              </div>
            </div>

            <div className="mt-7">
              <p className="mb-3 text-xs font-black uppercase tracking-wider text-slate-400">
                Produits
              </p>

              <div className="space-y-3">
                {(
                  selected.qeh_partner_order_items ||
                  []
                ).map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 p-4"
                  >
                    <div>
                      <p className="font-black">
                        {item.product_name}
                      </p>

                      <p className="text-sm text-slate-500">
                        {item.reference ||
                          "Sans référence"}
                        {" · "}
                        {item.quantity} unité(s)
                      </p>
                    </div>

                    <p className="font-black">
                      {money(
                        item.line_total_including_tax,
                        selected.currency
                      )}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-7 rounded-3xl bg-slate-50 p-5">
              <div className="flex justify-between text-sm font-bold text-slate-500">
                <span>Total HT</span>

                <span>
                  {money(
                    selected.total_excluding_tax,
                    selected.currency
                  )}
                </span>
              </div>

              <div className="mt-2 flex justify-between text-sm font-bold text-slate-500">
                <span>TVA</span>

                <span>
                  {money(
                    selected.tax_amount,
                    selected.currency
                  )}
                </span>
              </div>

              <div className="mt-4 flex justify-between border-t border-slate-200 pt-4 text-xl font-black">
                <span>Total TTC</span>

                <span>
                  {money(
                    selected.total_including_tax,
                    selected.currency
                  )}
                </span>
              </div>
            </div>

            <div className="mt-6 rounded-2xl border border-slate-200 p-4 text-sm text-slate-600">
              <p className="font-black text-slate-900">
                Livraison
              </p>

              <p className="mt-2 whitespace-pre-line">
                {selected.shipping_address ||
                  "Adresse non renseignée"}
              </p>

              <p>
                {selected.shipping_postal_code}{" "}
                {selected.shipping_city}
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                updateStatus("shipped")
              }
              disabled={updating}
              className="mt-6 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#b98222] to-[#f0ca70] font-black text-[#020711] disabled:opacity-60"
            >
              {updating ? (
                <LoaderCircle className="h-5 w-5 animate-spin" />
              ) : (
                <PackageCheck className="h-5 w-5" />
              )}

              Marquer comme expédiée
            </button>
          </aside>
        </div>
      ) : null}
    </div>
  );
}