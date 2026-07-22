import React, {
  useState,
} from "react";

import {
  Check,
  Copy,
  ExternalLink,
  PackageSearch,
} from "lucide-react";

import { toast } from "sonner";

const trackingServices = {
  colissimo: {
    name: "Colissimo / La Poste",

    url:
      "https://www.laposte.fr/outils/suivre-vos-envois",
  },

  chronopost: {
    name: "Chronopost",

    url:
      "https://www.chronopost.fr/fr/suivi-colis",
  },
};

export default function Tracking() {
  const [
    selectedCarrier,
    setSelectedCarrier,
  ] = useState("colissimo");

  const [
    trackingNumber,
    setTrackingNumber,
  ] = useState("");

  const [
    numberCopied,
    setNumberCopied,
  ] = useState(false);

  const cleanedTrackingNumber =
    trackingNumber
      .replace(/\s+/g, "")
      .trim();

  const selectedService =
    trackingServices[
      selectedCarrier
    ];

  const copyTrackingNumber =
    async () => {
      if (!cleanedTrackingNumber) {
        toast.error(
          "Saisis d’abord ton numéro de suivi."
        );

        return false;
      }

      try {
        await navigator.clipboard.writeText(
          cleanedTrackingNumber
        );

        setNumberCopied(true);

        window.setTimeout(() => {
          setNumberCopied(false);
        }, 2500);

        return true;
      } catch (error) {
        console.error(
          "Impossible de copier le numéro de suivi :",
          error
        );

        return false;
      }
    };

  const handleTracking = async (
    event
  ) => {
    event.preventDefault();

    if (!cleanedTrackingNumber) {
      toast.error(
        "Saisis ton numéro de suivi."
      );

      return;
    }

    const copied =
      await copyTrackingNumber();

    window.open(
      selectedService.url,
      "_blank",
      "noopener,noreferrer"
    );

    if (copied) {
      toast.success(
        "La page de suivi officielle est ouverte.",
        {
          description:
            "Ton numéro a été copié. Colle-le dans le champ de suivi.",
        }
      );
    } else {
      toast.success(
        "La page de suivi officielle est ouverte.",
        {
          description:
            "Saisis ton numéro dans le champ de suivi du transporteur.",
        }
      );
    }
  };

  return (
    <div
      data-testid="tracking-page"
      className="max-w-4xl mx-auto px-5 sm:px-8 py-12 sm:py-16"
    >
      <div className="rounded-3xl border border-border bg-card overflow-hidden">
        <div className="p-6 sm:p-10 border-b border-border">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary grid place-items-center mb-6">
            <PackageSearch className="w-7 h-7" />
          </div>

          <p className="overline text-primary mb-2">
            Livraison
          </p>

          <h1 className="font-display font-black text-3xl sm:text-4xl tracking-tight">
            Suivre une commande
          </h1>

          <p className="text-muted-foreground leading-relaxed mt-4">
            Choisis ton transporteur
            puis saisis le numéro de
            suivi reçu dans ton e-mail
            d’expédition.
          </p>
        </div>

        <form
          onSubmit={handleTracking}
          className="p-6 sm:p-10 space-y-7"
        >
          <div>
            <p className="block text-sm font-semibold mb-3">
              Choisir le transporteur
            </p>

            <div className="grid sm:grid-cols-2 gap-4">
              <label
                className={`cursor-pointer rounded-2xl border p-5 transition-colors ${
                  selectedCarrier ===
                  "colissimo"
                    ? "border-primary bg-primary/5"
                    : "border-border hover:bg-secondary/50"
                }`}
              >
                <input
                  type="radio"
                  name="carrier"
                  value="colissimo"
                  checked={
                    selectedCarrier ===
                    "colissimo"
                  }
                  onChange={(event) =>
                    setSelectedCarrier(
                      event.target.value
                    )
                  }
                  className="sr-only"
                />

                <span className="flex items-start justify-between gap-4">
                  <span>
                    <span className="block font-display font-bold text-lg">
                      Colissimo
                    </span>

                    <span className="block text-sm text-muted-foreground mt-1">
                      Suivi La Poste
                    </span>
                  </span>

                  <span
                    className={`w-5 h-5 rounded-full border-2 grid place-items-center ${
                      selectedCarrier ===
                      "colissimo"
                        ? "border-primary bg-primary"
                        : "border-border"
                    }`}
                  >
                    {selectedCarrier ===
                      "colissimo" && (
                      <Check className="w-3 h-3 text-primary-foreground" />
                    )}
                  </span>
                </span>
              </label>

              <label
                className={`cursor-pointer rounded-2xl border p-5 transition-colors ${
                  selectedCarrier ===
                  "chronopost"
                    ? "border-primary bg-primary/5"
                    : "border-border hover:bg-secondary/50"
                }`}
              >
                <input
                  type="radio"
                  name="carrier"
                  value="chronopost"
                  checked={
                    selectedCarrier ===
                    "chronopost"
                  }
                  onChange={(event) =>
                    setSelectedCarrier(
                      event.target.value
                    )
                  }
                  className="sr-only"
                />

                <span className="flex items-start justify-between gap-4">
                  <span>
                    <span className="block font-display font-bold text-lg">
                      Chronopost
                    </span>

                    <span className="block text-sm text-muted-foreground mt-1">
                      Livraison express
                    </span>
                  </span>

                  <span
                    className={`w-5 h-5 rounded-full border-2 grid place-items-center ${
                      selectedCarrier ===
                      "chronopost"
                        ? "border-primary bg-primary"
                        : "border-border"
                    }`}
                  >
                    {selectedCarrier ===
                      "chronopost" && (
                      <Check className="w-3 h-3 text-primary-foreground" />
                    )}
                  </span>
                </span>
              </label>
            </div>
          </div>

          <div>
            <label
              htmlFor="tracking-number"
              className="block text-sm font-semibold mb-2"
            >
              Numéro de suivi
            </label>

            <div className="flex flex-col sm:flex-row gap-3">
              <input
                id="tracking-number"
                type="text"
                value={trackingNumber}
                onChange={(event) => {
                  setTrackingNumber(
                    event.target.value
                  );

                  setNumberCopied(
                    false
                  );
                }}
                placeholder="Exemple : 6A12345678901"
                autoComplete="off"
                className="flex-1 h-12 rounded-xl border border-border bg-background px-4 outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
              />

              <button
                type="button"
                onClick={
                  copyTrackingNumber
                }
                disabled={
                  !cleanedTrackingNumber
                }
                className="inline-flex items-center justify-center gap-2 h-12 px-5 rounded-xl border border-border bg-background font-semibold text-sm hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {numberCopied ? (
                  <>
                    <Check className="w-4 h-4 text-primary" />
                    Copié
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Copier
                  </>
                )}
              </button>
            </div>

            <p className="text-xs text-muted-foreground mt-2">
              Les espaces seront
              automatiquement retirés.
            </p>
          </div>

          <button
            type="submit"
            disabled={
              !cleanedTrackingNumber
            }
            className="w-full h-12 rounded-full bg-primary text-primary-foreground font-semibold inline-flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Suivre avec{" "}
            {selectedService.name}

            <ExternalLink className="w-4 h-4" />
          </button>

          <div className="rounded-2xl bg-secondary/50 p-4">
            <p className="text-sm text-muted-foreground leading-relaxed">
              Le bouton copie ton numéro
              de suivi et ouvre le site
              officiel du transporteur
              dans un nouvel onglet. Il
              suffit ensuite de coller le
              numéro dans le champ prévu.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}