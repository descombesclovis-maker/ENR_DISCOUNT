import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { motion } from "framer-motion";

import {
  Building2,
  ChevronRight,
  LoaderCircle,
  Mail,
  MapPin,
  Phone,
  RefreshCw,
  Search,
  ShoppingBag,
  UserRoundCheck,
  UsersRound,
} from "lucide-react";

import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase";

function money(value) {
  return Number(value || 0).toLocaleString(
    "fr-FR",
    {
      style: "currency",
      currency: "EUR",
    }
  );
}

function getCustomerName(customer) {
  return (
    [
      customer.first_name,
      customer.last_name,
    ]
      .filter(Boolean)
      .join(" ") ||
    customer.company ||
    "Client sans nom"
  );
}

function getCustomerStats(customer) {
  const orders = Array.isArray(
    customer.orders
  )
    ? customer.orders
    : [];

  return {
    ordersCount: orders.length,

    totalSpent: orders.reduce(
      (total, order) =>
        total +
        Number(order.total || 0),
      0
    ),
  };
}

export default function AdminCustomers() {
  const [customers, setCustomers] =
    useState([]);

  const [searchValue, setSearchValue] =
    useState("");

  const [customerType, setCustomerType] =
    useState("all");

  const [loading, setLoading] =
    useState(true);

  const [
    errorMessage,
    setErrorMessage,
  ] = useState("");

  const loadCustomers =
    useCallback(async () => {
      setLoading(true);
      setErrorMessage("");

      /*
       * Les clients et les commandes sont
       * chargés séparément car aucune relation
       * SQL n’existe entre customer_profiles
       * et orders dans Supabase.
       */
      const [
        customersResult,
        ordersResult,
      ] = await Promise.all([
        supabase
          .from("customer_profiles")
          .select("*")
          .order("created_at", {
            ascending: false,
          }),

        supabase
          .from("orders")
          .select(`
            id,
            customer_id,
            customer_email,
            total,
            status,
            payment_status,
            created_at
          `)
          .order("created_at", {
            ascending: false,
          }),
      ]);

      if (customersResult.error) {
        console.error(
          "Erreur chargement clients :",
          customersResult.error
        );

        setErrorMessage(
          customersResult.error.message
        );

        setCustomers([]);
        setLoading(false);
        return;
      }

      const orders = ordersResult.error
        ? []
        : ordersResult.data || [];

      if (ordersResult.error) {
        console.error(
          "Erreur chargement commandes :",
          ordersResult.error
        );
      }

      const customersWithOrders = (
        customersResult.data || []
      ).map((customer) => {
        const customerEmail = String(
          customer.email || ""
        )
          .trim()
          .toLowerCase();

        const customerOrders =
          orders.filter((order) => {
            const sameId =
              order.customer_id &&
              String(order.customer_id) ===
                String(customer.id);

            const sameEmail =
              customerEmail &&
              String(
                order.customer_email || ""
              )
                .trim()
                .toLowerCase() ===
                customerEmail;

            return sameId || sameEmail;
          });

        return {
          ...customer,
          orders: customerOrders,
        };
      });

      setCustomers(customersWithOrders);
      setLoading(false);
    }, []);

  useEffect(() => {
    loadCustomers();
  }, [loadCustomers]);

  const filteredCustomers =
    useMemo(() => {
      const query = searchValue
        .trim()
        .toLocaleLowerCase("fr-FR");

      return customers.filter(
        (customer) => {
          const isCompany = Boolean(
            customer.company
          );

          const matchesType =
            customerType === "all" ||
            (
              customerType ===
                "company" &&
              isCompany
            ) ||
            (
              customerType ===
                "individual" &&
              !isCompany
            );

          const searchable = [
            customer.first_name,
            customer.last_name,
            customer.email,
            customer.phone,
            customer.company,
            customer.city,
            customer.postal_code,
          ]
            .filter(Boolean)
            .join(" ")
            .toLocaleLowerCase("fr-FR");

          return (
            matchesType &&
            (
              !query ||
              searchable.includes(query)
            )
          );
        }
      );
    }, [
      customerType,
      customers,
      searchValue,
    ]);

  const totalRevenue = customers.reduce(
    (total, customer) =>
      total +
      getCustomerStats(customer)
        .totalSpent,
    0
  );

  const totalOrders = customers.reduce(
    (total, customer) =>
      total +
      getCustomerStats(customer)
        .ordersCount,
    0
  );

  return (
    <div className="min-h-screen p-4 sm:p-6 xl:p-8">
      <div className="mx-auto max-w-[1450px]">
        <motion.header
          initial={{
            opacity: 0,
            y: 16,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          className="relative overflow-hidden rounded-[30px] bg-[#050b16] p-6 text-white sm:p-8"
        >
          <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[#ff5a00]/25 blur-3xl" />

          <div className="relative">
            <div className="flex items-center gap-2 text-[#ff7a2f]">
              <UsersRound className="h-5 w-5" />

              <p className="text-xs font-black uppercase tracking-[0.2em]">
                QEH OUTLET
              </p>
            </div>

            <h1 className="mt-3 font-display text-3xl font-black sm:text-4xl">
              Clients de la boutique
            </h1>

            <p className="mt-3 max-w-2xl text-slate-300">
              Retrouvez les coordonnées,
              commandes et dépenses de chaque
              client QEH OUTLET.
            </p>
          </div>

          <div className="relative mt-7 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-4">
              <p className="text-xs font-bold text-slate-400">
                Clients
              </p>

              <p className="mt-1 text-2xl font-black">
                {customers.length}
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-4">
              <p className="text-xs font-bold text-slate-400">
                Commandes associées
              </p>

              <p className="mt-1 text-2xl font-black text-[#ff7a2f]">
                {totalOrders}
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-4">
              <p className="text-xs font-bold text-slate-400">
                Chiffre d’affaires clients
              </p>

              <p className="mt-1 text-2xl font-black">
                {money(totalRevenue)}
              </p>
            </div>
          </div>
        </motion.header>

        <section className="mt-5 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_14px_45px_rgba(2,7,17,0.06)]">
          <div className="flex flex-col gap-3 border-b border-slate-200 p-4 sm:flex-row sm:p-5">
            <label className="relative flex-1">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />

              <input
                type="search"
                value={searchValue}
                onChange={(event) =>
                  setSearchValue(
                    event.target.value
                  )
                }
                placeholder="Rechercher un nom, e-mail, téléphone, société ou ville…"
                className="min-h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-12 pr-4 font-semibold outline-none focus:border-[#ff5a00] focus:bg-white focus:ring-4 focus:ring-[#ff5a00]/10"
              />
            </label>

            <select
              value={customerType}
              onChange={(event) =>
                setCustomerType(
                  event.target.value
                )
              }
              className="min-h-12 rounded-xl border border-slate-200 bg-white px-4 font-bold outline-none"
            >
              <option value="all">
                Tous les clients
              </option>

              <option value="individual">
                Particuliers
              </option>

              <option value="company">
                Professionnels
              </option>
            </select>

            <button
              type="button"
              onClick={loadCustomers}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 font-black"
            >
              <RefreshCw className="h-4 w-4" />
              Actualiser
            </button>
          </div>

          {errorMessage ? (
            <div className="m-5 rounded-2xl border border-red-200 bg-red-50 p-4 font-bold text-red-700">
              {errorMessage}
            </div>
          ) : null}

          {loading ? (
            <div className="grid min-h-[380px] place-items-center">
              <LoaderCircle className="h-9 w-9 animate-spin text-[#ff5a00]" />
            </div>
          ) : filteredCustomers.length ===
            0 ? (
            <div className="grid min-h-[340px] place-items-center p-6 text-center">
              <div>
                <UserRoundCheck className="mx-auto h-12 w-12 text-slate-300" />

                <p className="mt-4 font-black">
                  Aucun client trouvé
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  Modifiez votre recherche ou
                  actualisez la liste.
                </p>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {filteredCustomers.map(
                (customer, index) => {
                  /*
                   * Ces statistiques sont
                   * calculées à l’intérieur de
                   * la boucle. La variable
                   * customer existe donc ici.
                   */
                  const stats =
                    getCustomerStats(customer);

                  const customerName =
                    getCustomerName(customer);

                  return (
                    <motion.article
                      key={customer.id}
                      initial={{
                        opacity: 0,
                        y: 8,
                      }}
                      animate={{
                        opacity: 1,
                        y: 0,
                      }}
                      transition={{
                        delay: Math.min(
                          index * 0.025,
                          0.2
                        ),
                      }}
                      className="grid gap-5 p-4 transition hover:bg-orange-50/40 sm:p-5 xl:grid-cols-[minmax(250px,1.3fr)_minmax(260px,1.15fr)_135px_160px_48px] xl:items-center"
                    >
                      <div className="flex min-w-0 items-center gap-4">
                        <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[#050b16] font-black text-white">
                          {String(
                            customer.first_name ||
                              customer.company ||
                              "C"
                          )
                            .charAt(0)
                            .toUpperCase()}
                        </div>

                        <div className="min-w-0">
                          <h2 className="truncate font-black text-slate-950">
                            {customerName}
                          </h2>

                          <p className="mt-1 flex items-center gap-2 truncate text-xs font-semibold text-slate-500">
                            {customer.company ? (
                              <Building2 className="h-3.5 w-3.5" />
                            ) : (
                              <UserRoundCheck className="h-3.5 w-3.5" />
                            )}

                            {customer.company ||
                              "Particulier"}
                          </p>
                        </div>
                      </div>

                      <div className="min-w-0 space-y-1.5">
                        <p className="flex items-center gap-2 truncate text-sm font-semibold text-slate-700">
                          <Mail className="h-4 w-4 shrink-0 text-[#ff5a00]" />

                          {customer.email ||
                            "E-mail non renseigné"}
                        </p>

                        <p className="flex items-center gap-2 truncate text-xs text-slate-500">
                          <Phone className="h-4 w-4 shrink-0" />

                          {customer.phone ||
                            "Téléphone non renseigné"}
                        </p>

                        <p className="flex items-center gap-2 truncate text-xs text-slate-500">
                          <MapPin className="h-4 w-4 shrink-0" />

                          {[
                            customer.postal_code,
                            customer.city,
                          ]
                            .filter(Boolean)
                            .join(" ") ||
                            "Ville non renseignée"}
                        </p>
                      </div>

                      <div>
                        <p className="flex items-center gap-2 text-xs font-bold text-slate-400">
                          <ShoppingBag className="h-4 w-4" />
                          Commandes
                        </p>

                        <p className="mt-1 text-2xl font-black">
                          {stats.ordersCount}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs font-bold text-slate-400">
                          Total dépensé
                        </p>

                        <p className="mt-1 text-xl font-black text-[#ff5a00]">
                          {money(
                            stats.totalSpent
                          )}
                        </p>
                      </div>

                      <Link
                        to={`/admin/clients/${customer.id}`}
                        className="grid h-11 w-11 place-items-center rounded-xl bg-[#050b16] text-white transition hover:bg-[#ff5a00]"
                        aria-label={`Voir ${customerName}`}
                      >
                        <ChevronRight className="h-5 w-5" />
                      </Link>
                    </motion.article>
                  );
                }
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}