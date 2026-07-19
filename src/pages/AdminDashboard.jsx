import React, {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  Boxes,
  FolderTree,
  Image,
  LoaderCircle,
  LogOut,
  PackagePlus,
  RefreshCw,
  ShoppingCart,
} from "lucide-react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import { toast } from "sonner";

import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";

export default function AdminDashboard() {
  const navigate = useNavigate();

  const {
    adminProfile,
    user,
    signOut,
  } = useAuth();

  const [statistics, setStatistics] = useState({
    products: 0,
    categories: 0,
    images: 0,
    orders: 0,
  });

  const [loading, setLoading] = useState(true);

  const [loggingOut, setLoggingOut] =
    useState(false);

  const loadStatistics = useCallback(async () => {
    setLoading(true);

    try {
      const [
        productsResult,
        categoriesResult,
        imagesResult,
        ordersResult,
      ] = await Promise.all([
        supabase
          .from("products")
          .select("*", {
            count: "exact",
            head: true,
          }),

        supabase
          .from("categories")
          .select("*", {
            count: "exact",
            head: true,
          }),

        supabase
          .from("product_images")
          .select("*", {
            count: "exact",
            head: true,
          }),

        supabase
          .from("orders")
          .select("*", {
            count: "exact",
            head: true,
          }),
      ]);

      const firstError =
        productsResult.error ||
        categoriesResult.error ||
        imagesResult.error ||
        ordersResult.error;

      if (firstError) {
        throw firstError;
      }

      setStatistics({
        products:
          productsResult.count || 0,

        categories:
          categoriesResult.count || 0,

        images:
          imagesResult.count || 0,

        orders:
          ordersResult.count || 0,
      });
    } catch (error) {
      console.error(
        "Erreur lors du chargement du tableau de bord :",
        error
      );

      toast.error(
        error?.message ||
          "Impossible de charger les statistiques."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    document.title =
      "Tableau de bord | ENR Discount";

    loadStatistics();
  }, [loadStatistics]);

  const handleSignOut = async () => {
    setLoggingOut(true);

    try {
      await signOut();

      toast.success("Déconnexion réussie.");

      navigate("/admin/login", {
        replace: true,
      });
    } catch (error) {
      console.error(
        "Erreur lors de la déconnexion :",
        error
      );

      toast.error(
        error?.message ||
          "Impossible de se déconnecter."
      );
    } finally {
      setLoggingOut(false);
    }
  };

  const statisticCards = [
    {
      label: "Produits",
      value: statistics.products,
      icon: Boxes,
    },
    {
      label: "Catégories",
      value: statistics.categories,
      icon: FolderTree,
    },
    {
      label: "Images",
      value: statistics.images,
      icon: Image,
    },
    {
      label: "Commandes",
      value: statistics.orders,
      icon: ShoppingCart,
    },
  ];

  return (
    <div
      className="min-h-screen bg-secondary/30"
      data-testid="admin-dashboard"
    >
      <header className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 min-h-20 py-4 flex flex-wrap items-center justify-between gap-5">
          <div>
            <p className="font-display font-black text-xl">
              ENR Discount
            </p>

            <p className="text-xs text-muted-foreground">
              Administration
            </p>
          </div>

          <button
            type="button"
            onClick={handleSignOut}
            disabled={loggingOut}
            className="inline-flex items-center gap-2 h-10 px-5 rounded-full border border-border font-semibold text-sm hover:bg-secondary transition-colors disabled:opacity-60"
          >
            {loggingOut ? (
              <LoaderCircle className="w-4 h-4 animate-spin" />
            ) : (
              <LogOut className="w-4 h-4" />
            )}

            Déconnexion
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-5 sm:px-8 py-10">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-5 mb-10">
          <div>
            <p className="overline text-primary mb-2">
              Tableau de bord
            </p>

            <h1 className="font-display font-black text-3xl sm:text-4xl tracking-tight">
              Bonjour{" "}
              {adminProfile?.full_name ||
                user?.email ||
                "Administrateur"}
            </h1>

            <p className="text-muted-foreground mt-2">
              Gère les produits, les catégories
              et les commandes de ton site.
            </p>
          </div>

          <button
            type="button"
            onClick={loadStatistics}
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

        <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-10">
          {statisticCards.map((card) => {
            const Icon = card.icon;

            return (
              <article
                key={card.label}
                className="rounded-2xl border border-border bg-card p-6"
              >
                <div className="w-11 h-11 rounded-xl bg-primary/10 text-primary grid place-items-center mb-5">
                  <Icon className="w-5 h-5" />
                </div>

                <p className="text-sm text-muted-foreground">
                  {card.label}
                </p>

                <p className="font-display font-black text-3xl mt-1">
                  {loading ? "…" : card.value}
                </p>
              </article>
            );
          })}
        </section>

        <section className="rounded-3xl border border-border bg-card p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center gap-5">
            <div className="w-12 h-12 shrink-0 rounded-2xl bg-primary/10 text-primary grid place-items-center">
              <PackagePlus className="w-6 h-6" />
            </div>

            <div className="flex-1">
              <h2 className="font-display font-bold text-2xl">
                Gestion des produits
              </h2>

              <p className="text-muted-foreground mt-2">
                Ajoute, consulte, modifie ou
                supprime les produits du catalogue.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                to="/admin/produits"
                className="inline-flex items-center justify-center h-11 px-6 rounded-full border border-border font-semibold hover:bg-secondary transition-colors"
              >
                Gérer les produits
              </Link>

              <Link
                to="/admin/produits/nouveau"
                className="inline-flex items-center justify-center gap-2 h-11 px-6 rounded-full bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors"
              >
                <PackagePlus className="w-4 h-4" />
                Nouveau produit
              </Link>
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-border bg-card p-6 sm:p-8 mt-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-5">
            <div className="w-12 h-12 shrink-0 rounded-2xl bg-primary/10 text-primary grid place-items-center">
              <FolderTree className="w-6 h-6" />
            </div>

            <div className="flex-1">
              <h2 className="font-display font-bold text-2xl">
                Gestion des catégories
              </h2>

              <p className="text-muted-foreground mt-2">
                Crée, modifie, masque ou supprime
                les catégories du catalogue.
              </p>
            </div>

            <Link
              to="/admin/categories"
              className="inline-flex items-center justify-center h-11 px-6 rounded-full border border-border font-semibold hover:bg-secondary transition-colors"
            >
              Gérer les catégories
            </Link>
          </div>
        </section>

        <section className="rounded-3xl border border-border bg-card p-6 sm:p-8 mt-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-5">
            <div className="w-12 h-12 shrink-0 rounded-2xl bg-primary/10 text-primary grid place-items-center">
              <ShoppingCart className="w-6 h-6" />
            </div>

            <div className="flex-1">
              <h2 className="font-display font-bold text-2xl">
                Gestion des commandes
              </h2>

              <p className="text-muted-foreground mt-2">
                Consulte les paiements et suis la
                préparation et la livraison.
              </p>
            </div>

            <Link
              to="/admin/commandes"
              className="inline-flex items-center justify-center h-11 px-6 rounded-full border border-border font-semibold hover:bg-secondary transition-colors"
            >
              Voir les commandes
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}