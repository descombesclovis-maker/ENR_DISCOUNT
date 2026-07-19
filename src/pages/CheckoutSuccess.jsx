import React, {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  CheckCircle2,
  LoaderCircle,
  PackageCheck,
  RefreshCw,
  XCircle,
} from "lucide-react";

import {
  Link,
  useSearchParams,
} from "react-router-dom";

import { supabase } from "../lib/supabase";
import { useCart } from "../context/CartContext";
import { formatPrice } from "../lib/api";

const MAX_ATTEMPTS = 30;
const POLLING_DELAY = 2000;

export default function CheckoutSuccess() {
  const [searchParams] =
    useSearchParams();

  const sessionId =
    searchParams.get("session_id");

  const {
    clearCart,
  } = useCart();

  const [status, setStatus] =
    useState("checking");

  const [order, setOrder] =
    useState(null);

  const [errorMessage, setErrorMessage] =
    useState("");

  const attemptRef =
    useRef(0);

  const timerRef =
    useRef(null);

  const cartClearedRef =
    useRef(false);

  useEffect(() => {
    document.title =
      "Confirmation de commande | ENR Discount";

    return () => {
      if (timerRef.current) {
        clearTimeout(
          timerRef.current
        );
      }
    };
  }, []);

  useEffect(() => {
    if (!sessionId) {
      setStatus("error");

      setErrorMessage(
        "L’identifiant de paiement est absent."
      );

      return;
    }

    let cancelled = false;

    async function checkPayment() {
      if (cancelled) {
        return;
      }

      attemptRef.current += 1;

      try {
        const {
          data,
          error,
        } = await supabase.functions.invoke(
          "checkout-status",
          {
            body: {
              session_id: sessionId,
            },
          }
        );

        if (error) {
          let message =
            error.message ||
            "Impossible de vérifier le paiement.";

          if (
            error.context &&
            typeof error.context.json ===
              "function"
          ) {
            try {
              const errorBody =
                await error.context.json();

              message =
                errorBody?.error ||
                message;
            } catch {
              // La réponse ne contient pas de JSON.
            }
          }

          throw new Error(message);
        }

        if (cancelled) {
          return;
        }

        setOrder(data || null);

        if (
          data?.payment_status === "paid"
        ) {
          /*
           * Le panier est vidé une seule fois,
           * après confirmation du webhook.
           */

          if (
            !cartClearedRef.current
          ) {
            cartClearedRef.current = true;

            clearCart();

            localStorage.removeItem(
              "enr_cart"
            );
          }

          setStatus("paid");

          return;
        }

        if (
          data?.payment_status === "failed" ||
          data?.payment_status === "expired"
        ) {
          setStatus(
            data.payment_status
          );

          return;
        }

        if (
          attemptRef.current >=
          MAX_ATTEMPTS
        ) {
          setStatus("pending");

          return;
        }

        timerRef.current =
          setTimeout(
            checkPayment,
            POLLING_DELAY
          );
      } catch (error) {
        console.error(
          "Erreur de vérification du paiement :",
          error
        );

        if (
          attemptRef.current <
          MAX_ATTEMPTS
        ) {
          timerRef.current =
            setTimeout(
              checkPayment,
              POLLING_DELAY
            );

          return;
        }

        setErrorMessage(
          error?.message ||
            "Impossible de confirmer le paiement."
        );

        setStatus("error");
      }
    }

    checkPayment();

    return () => {
      cancelled = true;

      if (timerRef.current) {
        clearTimeout(
          timerRef.current
        );
      }
    };
  }, [
    sessionId,
    clearCart,
  ]);

  if (status === "checking") {
    return (
      <section className="max-w-3xl mx-auto px-5 sm:px-8 py-24 text-center">
        <LoaderCircle className="w-14 h-14 animate-spin text-primary mx-auto mb-6" />

        <h1 className="font-display font-black text-3xl sm:text-4xl">
          Confirmation du paiement
        </h1>

        <p className="text-muted-foreground mt-4">
          Nous attendons la confirmation sécurisée de Stripe.
        </p>

        <p className="text-sm text-muted-foreground mt-2">
          Cette opération peut prendre quelques secondes.
        </p>
      </section>
    );
  }

  if (status === "paid") {
    return (
      <section className="max-w-3xl mx-auto px-5 sm:px-8 py-20">
        <div className="rounded-3xl border border-border bg-card p-7 sm:p-10 text-center">
          <CheckCircle2 className="w-16 h-16 text-primary mx-auto mb-6" />

          <p className="overline text-primary mb-2">
            Paiement confirmé
          </p>

          <h1 className="font-display font-black text-3xl sm:text-4xl">
            Merci pour votre commande
          </h1>

          <p className="text-muted-foreground mt-4">
            Votre paiement a été accepté et votre commande est maintenant en préparation.
          </p>

          {order?.order_number && (
            <div className="rounded-2xl bg-secondary/50 mt-7 p-5">
              <p className="text-sm text-muted-foreground">
                Numéro de commande
              </p>

              <p className="font-display font-bold text-xl mt-1">
                {order.order_number}
              </p>

              {order?.total !== undefined && (
                <p className="font-semibold mt-3">
                  Total :{" "}
                  {formatPrice(
                    order.total
                  )}
                </p>
              )}
            </div>
          )}

          <div className="flex flex-col sm:flex-row justify-center gap-3 mt-8">
            <Link
              to="/produits"
              className="inline-flex items-center justify-center h-12 px-7 rounded-full bg-primary text-primary-foreground font-semibold"
            >
              Continuer mes achats
            </Link>

            <Link
              to="/"
              className="inline-flex items-center justify-center h-12 px-7 rounded-full border border-border font-semibold hover:bg-secondary"
            >
              Retour à l’accueil
            </Link>
          </div>
        </div>
      </section>
    );
  }

  if (
    status === "failed" ||
    status === "expired"
  ) {
    return (
      <section className="max-w-3xl mx-auto px-5 sm:px-8 py-20">
        <div className="rounded-3xl border border-border bg-card p-7 sm:p-10 text-center">
          <XCircle className="w-16 h-16 text-destructive mx-auto mb-6" />

          <h1 className="font-display font-black text-3xl">
            Paiement non confirmé
          </h1>

          <p className="text-muted-foreground mt-4">
            Le paiement a échoué ou la session a expiré. Votre panier a été conservé.
          </p>

          <Link
            to="/panier"
            className="inline-flex items-center justify-center h-12 px-7 rounded-full bg-primary text-primary-foreground font-semibold mt-8"
          >
            Retourner au panier
          </Link>
        </div>
      </section>
    );
  }

  if (status === "pending") {
    return (
      <section className="max-w-3xl mx-auto px-5 sm:px-8 py-20">
        <div className="rounded-3xl border border-border bg-card p-7 sm:p-10 text-center">
          <PackageCheck className="w-16 h-16 text-primary mx-auto mb-6" />

          <h1 className="font-display font-black text-3xl">
            Paiement en cours de confirmation
          </h1>

          <p className="text-muted-foreground mt-4">
            Stripe a reçu votre paiement, mais notre serveur attend encore la confirmation finale.
          </p>

          <button
            type="button"
            onClick={() =>
              window.location.reload()
            }
            className="inline-flex items-center justify-center gap-2 h-12 px-7 rounded-full bg-primary text-primary-foreground font-semibold mt-8"
          >
            <RefreshCw className="w-4 h-4" />
            Vérifier à nouveau
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="max-w-3xl mx-auto px-5 sm:px-8 py-20">
      <div className="rounded-3xl border border-border bg-card p-7 sm:p-10 text-center">
        <XCircle className="w-16 h-16 text-destructive mx-auto mb-6" />

        <h1 className="font-display font-black text-3xl">
          Impossible de confirmer la commande
        </h1>

        <p className="text-muted-foreground mt-4">
          {errorMessage ||
            "Une erreur est survenue."}
        </p>

        <Link
          to="/panier"
          className="inline-flex items-center justify-center h-12 px-7 rounded-full bg-primary text-primary-foreground font-semibold mt-8"
        >
          Retourner au panier
        </Link>
      </div>
    </section>
  );
}