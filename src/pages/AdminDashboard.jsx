import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BarChart3,
  Bell,
  Boxes,
  Building2,
  ChevronRight,
  CircleDollarSign,
  Factory,
  FileText,
  Eye,
  Handshake,
  LayoutDashboard,
  LoaderCircle,
  MapPinned,
  PackageOpen,
  Search,
  Settings,
  ShoppingBag,
  ShoppingCart,
  Sparkles,
  Sun,
  TrendingDown,
  TrendingUp,
  UserRound,
  UsersRound,
  X,
  Zap,
} from "lucide-react";
import { supabase } from "../lib/supabase";

const universeConfiguration = [
  {
    id: "outlet",
    eyebrow: "Commerce grand public",
    name: "QEH OUTLET",
    description:
      "Pilotez le catalogue, les stocks, les clients et toutes les commandes de la boutique.",
    accent: "#ff5a00",
    accentSoft: "rgba(255, 90, 0, 0.12)",
    accentBorder: "rgba(255, 90, 0, 0.28)",
    gradient:
      "linear-gradient(135deg, rgba(255,90,0,0.17), rgba(2,7,17,0.96) 48%, rgba(23,100,158,0.18))",
    icon: ShoppingBag,
    primaryAction: {
      label: "Gérer QEH OUTLET",
      to: "/admin/produits",
    },
    statistics: [
      {
        key: "outletProducts",
        label: "Produits",
        icon: PackageOpen,
      },
      {
        key: "outletCustomers",
        label: "Clients",
        icon: UsersRound,
      },
      {
        key: "outletOrders",
        label: "Commandes",
        icon: ShoppingCart,
      },
    ],
    actions: [
      {
        label: "Produits et variantes",
        description: "Catalogue, prix, stock et références",
        to: "/admin/produits",
        icon: Boxes,
      },
      {
        label: "Clients QEH OUTLET",
        description: "Comptes et historique des achats",
        to: "/admin/clients",
        icon: UserRound,
      },
      {
        label: "Commandes",
        description: "Paiements, préparation et livraison",
        to: "/admin/commandes",
        icon: ShoppingCart,
      },
    ],
  },
  {
    id: "energies",
    eyebrow: "Énergie solaire locale",
    name: "QEH ÉNERGIES",
    description:
      "Suivez les demandes d’électricité locale, les producteurs et les zones de la carte solaire.",
    accent: "#69b72d",
    secondaryAccent: "#17649e",
    accentSoft: "rgba(105, 183, 45, 0.12)",
    accentBorder: "rgba(105, 183, 45, 0.28)",
    gradient:
      "linear-gradient(135deg, rgba(105,183,45,0.18), rgba(2,7,17,0.96) 48%, rgba(23,100,158,0.26))",
    icon: Sun,
    primaryAction: {
      label: "Gérer QEH ÉNERGIES",
      to: "/admin/energies/demandes",
    },
    statistics: [
      {
        key: "energyRequests",
        label: "Demandes",
        icon: FileText,
      },
      {
        key: "energyProducers",
        label: "Producteurs",
        icon: Factory,
      },
      {
        key: "solarZones",
        label: "Zones solaires",
        icon: MapPinned,
      },
    ],
    actions: [
      {
        label: "Demandes d’électricité locale",
        description: "Consommateurs à contacter et dossiers",
        to: "/admin/energies/demandes",
        icon: Zap,
      },
      {
        label: "Producteurs solaires",
        description: "Installations et disponibilité locale",
        to: "/admin/energies/producteurs",
        icon: Sun,
      },
      {
        label: "Carte solaire",
        description: "Ajouter et modifier les zones de 2 km",
        to: "/admin/energies/carte",
        icon: MapPinned,
      },
    ],
  },
  {
    id: "partner",
    eyebrow: "Réseau professionnel",
    name: "QEH PARTNER",
    description:
      "Développez le réseau, les franchises et le catalogue professionnel totalement indépendant.",
    accent: "#c99532",
    secondaryAccent: "#f2cf79",
    accentSoft: "rgba(201, 149, 50, 0.12)",
    accentBorder: "rgba(242, 207, 121, 0.3)",
    gradient:
      "linear-gradient(135deg, rgba(201,149,50,0.22), rgba(2,7,17,0.97) 50%, rgba(242,207,121,0.12))",
    icon: Handshake,
    primaryAction: {
      label: "Gérer QEH PARTNER",
      to: "/admin/partner/franchises",
    },
    statistics: [
      {
        key: "partnerFranchises",
        label: "Franchises",
        icon: Building2,
      },
      {
        key: "partnerProducers",
        label: "Production",
        icon: Factory,
      },
      {
        key: "partnerProducts",
        label: "Produits Pro",
        icon: Boxes,
      },
    ],
    actions: [
      {
        label: "Demandes de franchise",
        description: "Candidatures, budgets et secteurs",
        to: "/admin/partner/franchises",
        icon: Building2,
      },
      {
        label: "Demandes de production",
        description: "Projets d’autoconsommation collective",
        to: "/admin/partner/production",
        icon: Factory,
      },
      {
        label: "Matériel professionnel",
        description: "Catalogue, stock et commandes en gros",
        to: "/admin/partner/produits",
        icon: PackageOpen,
      },
    ],
  },
];

const searchableItems = universeConfiguration.flatMap((universe) =>
  universe.actions.map((action) => ({
    ...action,
    universe: universe.name,
    accent: universe.accent,
  }))
);

const initialCounts = {
  outletProducts: null,
  outletCustomers: null,
  outletOrders: null,
  energyRequests: null,
  energyProducers: null,
  solarZones: 5,
  partnerFranchises: null,
  partnerProducers: null,
  partnerProducts: null,
};

const initialAnalytics = {
  revenueThisMonth: null,
  revenueTrend: null,
  paidOrdersThisMonth: null,
  averageOrderValue: null,
  topProductName: null,
  topProductQuantity: null,
  monthlyViews: null,
  uniqueVisitors: null,
  visibilityConnected: false,
  revenueSeries: [],
};

async function getTableCount(tableName) {
  const { count, error } = await supabase
    .from(tableName)
    .select("*", { count: "exact", head: true });

  if (error) {
    console.warn(`Compteur indisponible pour ${tableName}:`, error.message);
    return null;
  }

  return count ?? 0;
}

function monthKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function formatMoney(value) {
  if (value === null || value === undefined) return "—";

  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(Number(value));
}

async function loadBusinessAnalytics() {
  const now = new Date();
  const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const previousMonthStart = new Date(
    now.getFullYear(),
    now.getMonth() - 1,
    1
  );
  const sixMonthsStart = new Date(now.getFullYear(), now.getMonth() - 5, 1);

  const { data: paidOrders, error: ordersError } = await supabase
    .from("orders")
    .select("id, total, paid_at")
    .eq("payment_status", "paid")
    .gte("paid_at", sixMonthsStart.toISOString())
    .order("paid_at", { ascending: true });

  const safeOrders = ordersError ? [] : paidOrders || [];
  const currentOrders = safeOrders.filter(
    (order) => new Date(order.paid_at) >= currentMonthStart
  );
  const previousOrders = safeOrders.filter((order) => {
    const paidAt = new Date(order.paid_at);
    return paidAt >= previousMonthStart && paidAt < currentMonthStart;
  });

  const currentRevenue = currentOrders.reduce(
    (sum, order) => sum + Number(order.total || 0),
    0
  );
  const previousRevenue = previousOrders.reduce(
    (sum, order) => sum + Number(order.total || 0),
    0
  );
  const revenueTrend =
    previousRevenue > 0
      ? ((currentRevenue - previousRevenue) / previousRevenue) * 100
      : currentRevenue > 0
        ? 100
        : 0;

  const monthDefinitions = Array.from({ length: 6 }, (_, index) => {
    const date = new Date(now.getFullYear(), now.getMonth() - 5 + index, 1);
    return {
      key: monthKey(date),
      label: new Intl.DateTimeFormat("fr-FR", { month: "short" })
        .format(date)
        .replace(".", ""),
      value: 0,
    };
  });

  for (const order of safeOrders) {
    const definition = monthDefinitions.find(
      (item) => item.key === monthKey(new Date(order.paid_at))
    );
    if (definition) definition.value += Number(order.total || 0);
  }

  let topProductName = null;
  let topProductQuantity = null;
  const currentOrderIds = currentOrders.map((order) => order.id);

  if (currentOrderIds.length > 0) {
    const { data: orderItems, error: itemsError } = await supabase
      .from("order_items")
      .select("product_name, variant_name, quantity")
      .in("order_id", currentOrderIds);

    if (!itemsError && orderItems?.length) {
      const productTotals = new Map();

      for (const item of orderItems) {
        const name = [item.product_name, item.variant_name]
          .filter(Boolean)
          .join(" — ");
        productTotals.set(
          name,
          (productTotals.get(name) || 0) + Number(item.quantity || 0)
        );
      }

      const topProduct = [...productTotals.entries()].sort(
        (first, second) => second[1] - first[1]
      )[0];

      if (topProduct) {
        [topProductName, topProductQuantity] = topProduct;
      }
    }
  }

  const { data: pageViews, error: viewsError } = await supabase
    .from("site_page_views")
    .select("visitor_id, created_at")
    .gte("created_at", currentMonthStart.toISOString())
    .limit(10000);

  return {
    revenueThisMonth: ordersError ? null : currentRevenue,
    revenueTrend: ordersError ? null : revenueTrend,
    paidOrdersThisMonth: ordersError ? null : currentOrders.length,
    averageOrderValue:
      ordersError || currentOrders.length === 0
        ? ordersError
          ? null
          : 0
        : currentRevenue / currentOrders.length,
    topProductName,
    topProductQuantity,
    monthlyViews: viewsError ? null : pageViews?.length || 0,
    uniqueVisitors: viewsError
      ? null
      : new Set((pageViews || []).map((view) => view.visitor_id)).size,
    visibilityConnected: !viewsError,
    revenueSeries: ordersError ? [] : monthDefinitions,
  };
}

function CountValue({ value, isLoading }) {
  if (isLoading) {
    return <LoaderCircle className="h-5 w-5 animate-spin opacity-60" />;
  }

  if (value === null || value === undefined) {
    return <span className="text-slate-500">—</span>;
  }

  return Number(value).toLocaleString("fr-FR");
}

function AnalyticsCard({
  icon: Icon,
  label,
  value,
  detail,
  color,
  isLoading,
}) {
  return (
    <article className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_14px_45px_rgba(2,7,17,0.06)]">
      <span
        className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full opacity-10 blur-2xl"
        style={{ backgroundColor: color }}
      />
      <div className="relative flex items-start justify-between gap-4">
        <div
          className="grid h-11 w-11 place-items-center rounded-2xl"
          style={{ color, backgroundColor: `${color}16` }}
        >
          <Icon className="h-5 w-5" />
        </div>
        <BarChart3 className="h-4 w-4 text-slate-300" />
      </div>
      <p className="relative mt-5 text-xs font-black uppercase tracking-[0.14em] text-slate-400">
        {label}
      </p>
      <div className="relative mt-2 min-h-10 font-display text-3xl font-black text-[#020711]">
        {isLoading ? (
          <LoaderCircle className="h-6 w-6 animate-spin text-slate-400" />
        ) : (
          value
        )}
      </div>
      <p className="relative mt-2 min-h-5 text-xs font-semibold text-slate-500">
        {detail}
      </p>
    </article>
  );
}

function UniverseSection({ universe, counts, isLoading, index }) {
  const UniverseIcon = universe.icon;

  return (
    <motion.section
      initial={{ opacity: 0, y: 28 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, delay: 0.08 + index * 0.1 }}
      className="group relative overflow-hidden rounded-[30px] border bg-[#050b16] text-white shadow-[0_24px_80px_rgba(2,7,17,0.16)]"
      style={{
        borderColor: universe.accentBorder,
        backgroundImage: universe.gradient,
      }}
    >
      <div
        className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full opacity-20 blur-3xl transition duration-700 group-hover:scale-125 group-hover:opacity-30"
        style={{ backgroundColor: universe.accent }}
      />

      <div className="relative grid gap-6 p-5 sm:p-7 xl:grid-cols-[0.78fr_1.22fr] xl:p-8">
        <div className="flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-4">
              <div
                className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl border"
                style={{
                  color: universe.accent,
                  backgroundColor: universe.accentSoft,
                  borderColor: universe.accentBorder,
                }}
              >
                <UniverseIcon className="h-7 w-7" />
              </div>

              <div>
                <p
                  className="text-[11px] font-black uppercase tracking-[0.2em]"
                  style={{ color: universe.accent }}
                >
                  {universe.eyebrow}
                </p>
                <h2 className="mt-1 font-display text-2xl font-black sm:text-3xl">
                  {universe.name}
                </h2>
              </div>
            </div>

            <p className="mt-5 max-w-xl text-sm leading-relaxed text-slate-300 sm:text-base">
              {universe.description}
            </p>
          </div>

          <Link
            to={universe.primaryAction.to}
            className="mt-6 inline-flex min-h-12 w-fit items-center justify-center gap-2 rounded-full px-6 font-black text-[#020711] shadow-lg transition hover:-translate-y-0.5 hover:brightness-110"
            style={{
              backgroundColor:
                universe.secondaryAccent || universe.accent,
            }}
          >
            {universe.primaryAction.label}
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>

        <div>
          <div className="grid gap-3 sm:grid-cols-3">
            {universe.statistics.map((statistic) => {
              const StatisticIcon = statistic.icon;

              return (
                <div
                  key={statistic.key}
                  className="rounded-2xl border border-white/10 bg-white/[0.06] p-4 backdrop-blur-md transition hover:bg-white/[0.09]"
                >
                  <div className="flex items-center justify-between gap-3">
                    <StatisticIcon
                      className="h-5 w-5"
                      style={{ color: universe.accent }}
                    />
                    <span
                      className="h-1.5 w-1.5 rounded-full shadow-[0_0_12px_currentColor]"
                      style={{ color: universe.accent, backgroundColor: universe.accent }}
                    />
                  </div>
                  <div className="mt-5 font-display text-3xl font-black">
                    <CountValue
                      value={counts[statistic.key]}
                      isLoading={isLoading}
                    />
                  </div>
                  <p className="mt-1 text-xs font-bold uppercase tracking-[0.12em] text-slate-400">
                    {statistic.label}
                  </p>
                </div>
              );
            })}
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-3">
            {universe.actions.map((action) => {
              const ActionIcon = action.icon;

              return (
                <Link
                  key={action.label}
                  to={action.to}
                  className="group/action flex min-h-[128px] flex-col justify-between rounded-2xl border border-white/10 bg-black/20 p-4 transition hover:-translate-y-1 hover:border-white/25 hover:bg-black/30"
                >
                  <div className="flex items-start justify-between gap-3">
                    <ActionIcon
                      className="h-6 w-6"
                      style={{ color: universe.accent }}
                    />
                    <ChevronRight className="h-4 w-4 text-slate-500 transition group-hover/action:translate-x-1 group-hover/action:text-white" />
                  </div>
                  <div className="mt-4">
                    <h3 className="text-sm font-black text-white">
                      {action.label}
                    </h3>
                    <p className="mt-1 text-xs leading-relaxed text-slate-400">
                      {action.description}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </motion.section>
  );
}

export default function AdminDashboard() {
  const [counts, setCounts] = useState(initialCounts);
  const [isLoading, setIsLoading] = useState(true);
  const [analytics, setAnalytics] = useState(initialAnalytics);
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(true);
  const [searchValue, setSearchValue] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);

  useEffect(() => {
    document.title = "Administration centrale | QEH";

    let isMounted = true;

    async function loadDashboardCounts() {
      const [
        outletProducts,
        outletCustomers,
        outletOrders,
        energyRequests,
        energyProducers,
        partnerFranchises,
        partnerProducers,
        partnerProducts,
      ] = await Promise.all([
        getTableCount("products"),
        getTableCount("customers"),
        getTableCount("orders"),
        getTableCount("solar_consumer_requests"),
        getTableCount("solar_producers"),
        getTableCount("qeh_partner_franchise_applications"),
        getTableCount("qeh_partner_producer_applications"),
        getTableCount("qeh_partner_products"),
      ]);

      if (!isMounted) return;

      setCounts({
        outletProducts,
        outletCustomers,
        outletOrders,
        energyRequests,
        energyProducers,
        solarZones: 5,
        partnerFranchises,
        partnerProducers,
        partnerProducts,
      });
      setIsLoading(false);
    }

    async function loadAnalytics() {
      const result = await loadBusinessAnalytics();

      if (!isMounted) return;

      setAnalytics(result);
      setIsLoadingAnalytics(false);
    }

    loadDashboardCounts();
    loadAnalytics();

    return () => {
      isMounted = false;
    };
  }, []);

  const searchResults = useMemo(() => {
    const query = searchValue.trim().toLocaleLowerCase("fr-FR");

    if (!query) return [];

    return searchableItems.filter((item) =>
      [item.label, item.description, item.universe]
        .join(" ")
        .toLocaleLowerCase("fr-FR")
        .includes(query)
    );
  }, [searchValue]);

  const totalActivity = useMemo(
    () =>
      [
        counts.outletOrders,
        counts.energyRequests,
        counts.partnerFranchises,
        counts.partnerProducers,
      ].reduce(
        (sum, value) => sum + (typeof value === "number" ? value : 0),
        0
      ),
    [counts]
  );

  const formattedDate = new Intl.DateTimeFormat("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date());

  return (
    <div className="min-h-screen bg-[#f2f5f9] text-[#020711]">
      <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/90 shadow-[0_8px_30px_rgba(2,7,17,0.06)] backdrop-blur-xl">
        <div className="mx-auto flex min-h-[82px] max-w-[1600px] items-center gap-4 px-4 sm:px-6 lg:px-8">
          <Link to="/admin" className="flex shrink-0 items-center gap-3">
            <div className="relative flex h-12 w-[92px] items-center justify-center overflow-hidden rounded-xl bg-[#020711] shadow-lg">
              <span className="absolute inset-x-3 top-2 h-px bg-gradient-to-r from-[#17649e] via-white to-[#69b72d]" />
              <span className="font-display text-2xl font-black tracking-[0.08em] text-white">
                QEH
              </span>
              <span className="absolute inset-x-3 bottom-2 h-px bg-gradient-to-r from-[#ff5a00] via-[#c99532] to-[#69b72d]" />
            </div>
            <div className="hidden sm:block">
              <p className="font-display text-base font-black">Administration</p>
              <p className="text-xs font-semibold text-slate-500">Console centrale</p>
            </div>
          </Link>

          <div className="relative mx-auto w-full max-w-2xl">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              value={searchValue}
              onChange={(event) => setSearchValue(event.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setTimeout(() => setSearchFocused(false), 160)}
              placeholder="Rechercher clients, consommateurs, produits, producteurs…"
              className="min-h-12 w-full rounded-2xl border border-slate-200 bg-slate-100/80 pl-12 pr-11 text-sm font-semibold outline-none transition focus:border-[#17649e] focus:bg-white focus:ring-4 focus:ring-[#17649e]/10"
            />

            {searchValue ? (
              <button
                type="button"
                onClick={() => setSearchValue("")}
                className="absolute right-3 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-lg text-slate-400 hover:bg-slate-200 hover:text-slate-700"
                aria-label="Effacer la recherche"
              >
                <X className="h-4 w-4" />
              </button>
            ) : null}

            {searchFocused && searchValue ? (
              <div className="absolute inset-x-0 top-[calc(100%+10px)] overflow-hidden rounded-2xl border border-slate-200 bg-white p-2 shadow-[0_22px_70px_rgba(2,7,17,0.18)]">
                {searchResults.length > 0 ? (
                  searchResults.map((result) => {
                    const ResultIcon = result.icon;

                    return (
                      <Link
                        key={`${result.universe}-${result.label}`}
                        to={result.to}
                        className="flex items-center gap-3 rounded-xl p-3 transition hover:bg-slate-100"
                      >
                        <div
                          className="grid h-10 w-10 shrink-0 place-items-center rounded-xl"
                          style={{
                            color: result.accent,
                            backgroundColor: `${result.accent}18`,
                          }}
                        >
                          <ResultIcon className="h-5 w-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-black">
                            {result.label}
                          </p>
                          <p className="truncate text-xs text-slate-500">
                            {result.universe} · {result.description}
                          </p>
                        </div>
                        <ChevronRight className="h-4 w-4 text-slate-400" />
                      </Link>
                    );
                  })
                ) : (
                  <div className="p-5 text-center text-sm font-semibold text-slate-500">
                    Aucun accès correspondant à cette recherche.
                  </div>
                )}
              </div>
            ) : null}
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              className="relative grid h-11 w-11 place-items-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:border-slate-300 hover:bg-slate-50"
              aria-label="Notifications"
            >
              <Bell className="h-5 w-5" />
              {totalActivity > 0 ? (
                <span className="absolute -right-1 -top-1 grid min-h-5 min-w-5 place-items-center rounded-full bg-[#ff5a00] px-1 text-[10px] font-black text-white">
                  {Math.min(totalActivity, 99)}
                </span>
              ) : null}
            </button>

            <Link
              to="/admin/parametres"
              className="grid h-11 w-11 place-items-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:border-slate-300 hover:bg-slate-50"
              aria-label="Paramètres"
            >
              <Settings className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1600px] px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="relative mb-8 overflow-hidden rounded-[30px] border border-slate-200 bg-white p-6 shadow-[0_20px_60px_rgba(2,7,17,0.07)] sm:p-8"
        >
          <div className="pointer-events-none absolute -right-16 -top-20 h-72 w-72 rounded-full bg-gradient-to-br from-[#17649e]/10 via-[#69b72d]/10 to-[#c99532]/10 blur-3xl" />

          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="flex items-center gap-2 text-[#17649e]">
                <LayoutDashboard className="h-5 w-5" />
                <p className="text-xs font-black uppercase tracking-[0.2em]">
                  Vue d’ensemble
                </p>
              </div>
              <h1 className="mt-3 font-display text-3xl font-black sm:text-4xl">
                Les trois univers QEH, réunis.
              </h1>
              <p className="mt-3 max-w-3xl leading-relaxed text-slate-600">
                Retrouvez chaque activité dans son espace, avec ses propres clients, demandes, produits et commandes.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-400">
                  Aujourd’hui
                </p>
                <p className="mt-1 text-sm font-black capitalize text-slate-800">
                  {formattedDate}
                </p>
              </div>
              <div className="rounded-2xl border border-[#69b72d]/20 bg-[#69b72d]/[0.08] px-4 py-3">
                <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#4f9720]">
                  Système
                </p>
                <div className="mt-1 flex items-center gap-2 text-sm font-black text-slate-800">
                  <span className="h-2 w-2 rounded-full bg-[#69b72d] shadow-[0_0_10px_#69b72d]" />
                  Opérationnel
                </div>
              </div>
            </div>
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.08 }}
          className="mb-8"
        >
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="flex items-center gap-2 text-[#17649e]">
                <BarChart3 className="h-5 w-5" />
                <p className="text-xs font-black uppercase tracking-[0.2em]">
                  Statistiques générales
                </p>
              </div>
              <h2 className="mt-2 font-display text-2xl font-black sm:text-3xl">
                Visibilité et performances commerciales
              </h2>
            </div>
            <p className="text-sm font-semibold text-slate-500">
              Données du mois en cours
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
            <AnalyticsCard
              icon={Eye}
              label="Pages vues"
              value={
                analytics.monthlyViews === null
                  ? "À connecter"
                  : analytics.monthlyViews.toLocaleString("fr-FR")
              }
              detail={
                analytics.visibilityConnected
                  ? "Depuis le début du mois"
                  : "Activez le compteur de visibilité"
              }
              color="#17649e"
              isLoading={isLoadingAnalytics}
            />

            <AnalyticsCard
              icon={UsersRound}
              label="Visiteurs uniques"
              value={
                analytics.uniqueVisitors === null
                  ? "—"
                  : analytics.uniqueVisitors.toLocaleString("fr-FR")
              }
              detail="Appareils uniques estimés"
              color="#69b72d"
              isLoading={isLoadingAnalytics}
            />

            <AnalyticsCard
              icon={CircleDollarSign}
              label="CA du mois"
              value={formatMoney(analytics.revenueThisMonth)}
              detail={
                analytics.revenueTrend === null ? (
                  "Évolution indisponible"
                ) : (
                  <span
                    className={`inline-flex items-center gap-1 ${
                      analytics.revenueTrend >= 0
                        ? "text-emerald-600"
                        : "text-red-600"
                    }`}
                  >
                    {analytics.revenueTrend >= 0 ? (
                      <TrendingUp className="h-3.5 w-3.5" />
                    ) : (
                      <TrendingDown className="h-3.5 w-3.5" />
                    )}
                    {Math.abs(analytics.revenueTrend).toLocaleString("fr-FR", {
                      maximumFractionDigits: 1,
                    })}
                    % par rapport au mois précédent
                  </span>
                )
              }
              color="#ff5a00"
              isLoading={isLoadingAnalytics}
            />

            <AnalyticsCard
              icon={ShoppingCart}
              label="Commandes payées"
              value={
                analytics.paidOrdersThisMonth === null
                  ? "—"
                  : analytics.paidOrdersThisMonth.toLocaleString("fr-FR")
              }
              detail="Paiements confirmés ce mois"
              color="#c99532"
              isLoading={isLoadingAnalytics}
            />

            <AnalyticsCard
              icon={ShoppingBag}
              label="Panier moyen"
              value={formatMoney(analytics.averageOrderValue)}
              detail="Moyenne des commandes payées"
              color="#7c3aed"
              isLoading={isLoadingAnalytics}
            />

            <AnalyticsCard
              icon={Sparkles}
              label="Produit le plus vendu"
              value={analytics.topProductName || "Aucune vente"}
              detail={
                analytics.topProductQuantity
                  ? `${analytics.topProductQuantity} unité${
                      analytics.topProductQuantity > 1 ? "s" : ""
                    } vendue${analytics.topProductQuantity > 1 ? "s" : ""}`
                  : "Sur les commandes payées du mois"
              }
              color="#0f766e"
              isLoading={isLoadingAnalytics}
            />
          </div>

          <div className="mt-4 grid gap-4 lg:grid-cols-[1.4fr_0.6fr]">
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_14px_45px_rgba(2,7,17,0.06)] sm:p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-400">
                    Évolution du chiffre d’affaires
                  </p>
                  <h3 className="mt-2 font-display text-xl font-black">
                    Les six derniers mois
                  </h3>
                </div>
                <div className="grid h-11 w-11 place-items-center rounded-2xl bg-[#ff5a00]/10 text-[#ff5a00]">
                  <TrendingUp className="h-5 w-5" />
                </div>
              </div>

              <div className="mt-7 flex h-48 items-end gap-3 sm:gap-5">
                {analytics.revenueSeries.length > 0 ? (
                  analytics.revenueSeries.map((month) => {
                    const maximum = Math.max(
                      ...analytics.revenueSeries.map((item) => item.value),
                      1
                    );
                    const height = Math.max(6, (month.value / maximum) * 100);

                    return (
                      <div
                        key={month.key}
                        className="flex h-full min-w-0 flex-1 flex-col justify-end"
                      >
                        <p className="mb-2 truncate text-center text-[10px] font-black text-slate-500 sm:text-xs">
                          {formatMoney(month.value)}
                        </p>
                        <div className="relative flex-1 overflow-hidden rounded-xl bg-slate-100">
                          <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: `${height}%` }}
                            transition={{ duration: 0.7, delay: 0.2 }}
                            className="absolute inset-x-0 bottom-0 rounded-xl bg-gradient-to-t from-[#ff5a00] to-[#ff9c66] shadow-[0_0_24px_rgba(255,90,0,0.22)]"
                          />
                        </div>
                        <p className="mt-2 text-center text-xs font-black uppercase text-slate-400">
                          {month.label}
                        </p>
                      </div>
                    );
                  })
                ) : (
                  <div className="grid h-full w-full place-items-center rounded-2xl bg-slate-50 text-sm font-semibold text-slate-500">
                    Données commerciales indisponibles
                  </div>
                )}
              </div>
            </article>

            <article className="relative overflow-hidden rounded-3xl border border-[#17649e]/20 bg-[#020711] p-6 text-white shadow-[0_18px_55px_rgba(2,7,17,0.16)]">
              <div className="pointer-events-none absolute -right-14 -top-14 h-44 w-44 rounded-full bg-[#17649e]/30 blur-3xl" />
              <div className="relative grid h-12 w-12 place-items-center rounded-2xl bg-[#17649e]/20 text-[#64b5ec]">
                <Eye className="h-6 w-6" />
              </div>
              <h3 className="relative mt-5 font-display text-2xl font-black">
                Visibilité du site
              </h3>
              <p className="relative mt-3 text-sm leading-relaxed text-slate-300">
                {analytics.visibilityConnected
                  ? "Le suivi anonyme est actif. Les visites administrateur ne sont pas comptabilisées."
                  : "Installez le compteur QEH pour commencer à mesurer les pages vues et les visiteurs uniques."}
              </p>
              <div className="relative mt-6 flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-4">
                <span
                  className={`h-2.5 w-2.5 rounded-full ${
                    analytics.visibilityConnected
                      ? "bg-[#69b72d] shadow-[0_0_12px_#69b72d]"
                      : "bg-amber-400 shadow-[0_0_12px_#fbbf24]"
                  }`}
                />
                <span className="text-sm font-black">
                  {analytics.visibilityConnected
                    ? "Statistiques connectées"
                    : "Connexion requise"}
                </span>
              </div>
            </article>
          </div>
        </motion.section>

        <div className="space-y-6">
          {universeConfiguration.map((universe, index) => (
            <UniverseSection
              key={universe.id}
              universe={universe}
              counts={counts}
              isLoading={isLoading}
              index={index}
            />
          ))}
        </div>

        <section className="mt-8 grid gap-4 md:grid-cols-3">
          {[
            {
              icon: CircleDollarSign,
              title: "Activités séparées",
              text: "Chaque univers conserve sa comptabilité, ses commandes et ses clients.",
            },
            {
              icon: ShoppingCart,
              title: "Paniers indépendants",
              text: "QEH OUTLET et QEH PARTNER ne partagent aucun panier ni catalogue.",
            },
            {
              icon: Sparkles,
              title: "Une console centrale",
              text: "Un seul accès sécurisé pour superviser les trois marques QEH.",
            },
          ].map((item) => {
            const Icon = item.icon;

            return (
              <article
                key={item.title}
                className="flex items-start gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[#020711] text-white">
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="font-black">{item.title}</h2>
                  <p className="mt-1 text-sm leading-relaxed text-slate-500">
                    {item.text}
                  </p>
                </div>
              </article>
            );
          })}
        </section>
      </main>
    </div>
  );
}