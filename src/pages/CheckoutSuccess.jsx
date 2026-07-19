import React from "react";
import {
  Link,
  useSearchParams,
} from "react-router-dom";

import {
  CheckCircle2,
  ShoppingBag,
} from "lucide-react";

export default function CheckoutSuccess() {
  const [searchParams] = useSearchParams();

  const sessionId =
    searchParams.get("session_id");

  return (
    <div
      data-testid="checkout-success-page"
      className="max-w-lg mx-auto px-5 py-24 text-center"
    >
      <CheckCircle2 className="w-16 h-16 mx-auto text-primary mb-6" />

      <h1 className="font-display font-black text-3xl mb-3">
        Paiement transmis
      </h1>

      <p className="text-muted-foreground mb-4">
        Stripe a reçu votre paiement. La commande
        est en cours de confirmation.
      </p>

      {sessionId && (
        <p className="text-xs text-muted-foreground mb-8 break-all">
          Référence de session disponible.
        </p>
      )}

      <div className="flex flex-col sm:flex-row justify-center gap-3">
        <Link
          to="/produits"
          className="inline-flex items-center justify-center gap-2 h-12 px-7 rounded-full bg-primary text-primary-foreground font-semibold hover:bg-primary/90"
        >
          <ShoppingBag className="w-4 h-4" />
          Continuer mes achats
        </Link>

        <Link
          to="/contact"
          className="inline-flex items-center justify-center h-12 px-7 rounded-full border border-border font-semibold hover:bg-secondary"
        >
          Nous contacter
        </Link>
      </div>
    </div>
  );
}