import React, {
  useEffect,
  useState,
} from "react";

import {
  Check,
  Copy,
  ExternalLink,
  Info,
  PackageCheck,
  PackageSearch,
  ShieldCheck,
  Truck,
} from "lucide-react";

import { toast } from "sonner";

const trackingServices = {
  colissimo: {
    name: "Colissimo / La Poste",
    shortName: "Colissimo",
    description: "Livraison standard avec suivi La Poste",
    url:
      "https://www.laposte.fr/outils/suivre-vos-envois",
  },

  chronopost: {
    name: "Chronopost",
    shortName: "Chronopost",
    description: "Livraison express et suivi Chronopost",
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

  useEffect(() => {
    document.title =
      "Suivi de commande | QEH OUTLET";
  }, []);

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
      if (
        !cleanedTrackingNumber
      ) {
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

  const handleTracking =
    async (event) => {
      event.preventDefault();

      if (
        !cleanedTrackingNumber
      ) {
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
      className="min-h-screen bg-slate-50"
    >
      <section className="relative overflow-hidden bg-[#020714]">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-40 -left-40 w-[420px] h-[420px] rounded-full bg-[#0b5ca8]/20 blur-3xl" />

          <div className="absolute -bottom-52 -right-36 w-[480px] h-[480px] rounded-full bg-[#ff5a00]/12 blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-5 sm:px-8 py-14 sm:py-20">
          <div className="max-w-3xl">
            <div className="w-16 h-16 rounded-3xl border border-[#0b5ca8]/50 bg-[#0b5ca8]/15 text-[#55a8ff] grid place-items-center shadow-[0_20px_55px_rgba(0,0,0,0.35)]">
              <PackageSearch className="w-8 h-8" />
            </div>

            <p className="text-xs font-black uppercase tracking-[0.24em] text-[#ff5a00] mt-7">
              QEH OUTLET
            </p>

            <h1 className="font-display font-black text-4xl sm:text-5xl text-white tracking-tight mt-3">
              Suivre une commande
            </h1>

            <p className="max-w-2xl text-white/60 leading-relaxed mt-5">
              Choisis ton transporteur, saisis ton numéro de suivi
              puis accède directement au service officiel Colissimo
              ou Chronopost.
            </p>
          </div>
        </div>
      </section>

      <main className="max-w-6xl mx-auto px-5 sm:px-8 py-10 sm:py-14">
        <div className="grid lg:grid-cols-[1fr_320px] gap-8 items-start">
          <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_20px_55px_rgba(2,7,20,0.08)]">
            <div className="border-b border-slate-200 px-6 sm:px-8 py-6">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-[#0b5ca8]">
                Informations de suivi
              </p>

              <h2 className="font-display font-black text-2xl text-slate-950 mt-2">
                Retrouver votre colis
              </h2>
            </div>

            <form
              onSubmit={
                handleTracking
              }
              className="p-6 sm:p-8 space-y-8"
            >
              <div>
                <p className="block text-sm font-bold text-slate-950 mb-3">
                  Choisir le transporteur
                </p>

                <div className="grid sm:grid-cols-2 gap-4">
                  <label
                    className={`cursor-pointer rounded-2xl border p-5 transition-all ${
                      selectedCarrier ===
                      "colissimo"
                        ? "border-[#0b5ca8] bg-[#0b5ca8]/5 shadow-[0_10px_30px_rgba(11,92,168,0.10)]"
                        : "border-slate-200 bg-white hover:border-[#0b5ca8]/40 hover:bg-slate-50"
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
                      onChange={(
                        event
                      ) =>
                        setSelectedCarrier(
                          event.target.value
                        )
                      }
                      className="sr-only"
                    />

                    <span className="flex items-start justify-between gap-4">
                      <span className="flex items-start gap-3">
                        <span
                          className={`w-11 h-11 rounded-2xl grid place-items-center ${
                            selectedCarrier ===
                            "colissimo"
                              ? "bg-[#0b5ca8] text-white"
                              : "bg-slate-100 text-slate-500"
                          }`}
                        >
                          <PackageCheck className="w-5 h-5" />
                        </span>

                        <span>
                          <span className="block font-display font-bold text-lg text-slate-950">
                            Colissimo
                          </span>

                          <span className="block text-sm text-slate-500 mt-1 leading-relaxed">
                            Suivi La Poste
                          </span>
                        </span>
                      </span>

                      <span
                        className={`w-6 h-6 shrink-0 rounded-full border-2 grid place-items-center ${
                          selectedCarrier ===
                          "colissimo"
                            ? "border-[#0b5ca8] bg-[#0b5ca8]"
                            : "border-slate-300"
                        }`}
                      >
                        {selectedCarrier ===
                          "colissimo" && (
                          <Check className="w-3.5 h-3.5 text-white" />
                        )}
                      </span>
                    </span>
                  </label>

                  <label
                    className={`cursor-pointer rounded-2xl border p-5 transition-all ${
                      selectedCarrier ===
                      "chronopost"
                        ? "border-[#ff5a00] bg-[#ff5a00]/5 shadow-[0_10px_30px_rgba(255,90,0,0.10)]"
                        : "border-slate-200 bg-white hover:border-[#ff5a00]/40 hover:bg-slate-50"
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
                      onChange={(
                        event
                      ) =>
                        setSelectedCarrier(
                          event.target.value
                        )
                      }
                      className="sr-only"
                    />

                    <span className="flex items-start justify-between gap-4">
                      <span className="flex items-start gap-3">
                        <span
                          className={`w-11 h-11 rounded-2xl grid place-items-center ${
                            selectedCarrier ===
                            "chronopost"
                              ? "bg-[#ff5a00] text-white"
                              : "bg-slate-100 text-slate-500"
                          }`}
                        >
                          <Truck className="w-5 h-5" />
                        </span>

                        <span>
                          <span className="block font-display font-bold text-lg text-slate-950">
                            Chronopost
                          </span>

                          <span className="block text-sm text-slate-500 mt-1 leading-relaxed">
                            Livraison express
                          </span>
                        </span>
                      </span>

                      <span
                        className={`w-6 h-6 shrink-0 rounded-full border-2 grid place-items-center ${
                          selectedCarrier ===
                          "chronopost"
                            ? "border-[#ff5a00] bg-[#ff5a00]"
                            : "border-slate-300"
                        }`}
                      >
                        {selectedCarrier ===
                          "chronopost" && (
                          <Check className="w-3.5 h-3.5 text-white" />
                        )}
                      </span>
                    </span>
                  </label>
                </div>
              </div>

              <div>
                <label
                  htmlFor="tracking-number"
                  className="block text-sm font-bold text-slate-950 mb-2"
                >
                  Numéro de suivi
                </label>

                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    id="tracking-number"
                    type="text"
                    value={
                      trackingNumber
                    }
                    onChange={(
                      event
                    ) => {
                      setTrackingNumber(
                        event.target.value
                      );

                      setNumberCopied(
                        false
                      );
                    }}
                    placeholder="Exemple : 6A12345678901"
                    autoComplete="off"
                    className="flex-1 h-12 rounded-xl border border-slate-300 bg-white px-4 text-slate-950 outline-none focus:ring-2 focus:ring-[#0b5ca8]/20 focus:border-[#0b5ca8]"
                  />

                  <button
                    type="button"
                    onClick={
                      copyTrackingNumber
                    }
                    disabled={
                      !cleanedTrackingNumber
                    }
                    className="inline-flex items-center justify-center gap-2 h-12 px-5 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 font-semibold text-sm hover:border-[#0b5ca8]/40 hover:bg-[#0b5ca8]/5 hover:text-[#0b5ca8] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {numberCopied ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-600" />
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

                <p className="text-xs text-slate-500 mt-2">
                  Les espaces seront automatiquement retirés.
                </p>
              </div>

              <div className="rounded-2xl border border-[#0b5ca8]/20 bg-[#0b5ca8]/5 p-5">
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 shrink-0 text-[#0b5ca8]" />

                  <div>
                    <p className="text-sm font-bold text-slate-950">
                      Transporteur sélectionné
                    </p>

                    <p className="text-sm text-slate-600 mt-1">
                      {selectedService.name}
                    </p>

                    <p className="text-xs text-slate-500 mt-1">
                      {selectedService.description}
                    </p>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={
                  !cleanedTrackingNumber
                }
                className="w-full min-h-12 rounded-full bg-[#ff5a00] text-white font-bold inline-flex items-center justify-center gap-2 hover:bg-[#e95000] transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_12px_35px_rgba(255,90,0,0.22)]"
              >
                Suivre avec{" "}
                {
                  selectedService.name
                }

                <ExternalLink className="w-4 h-4" />
              </button>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <p className="text-sm text-slate-600 leading-relaxed">
                  Le bouton copie votre numéro de suivi puis ouvre le
                  site officiel du transporteur dans un nouvel onglet.
                  Il suffit ensuite de coller le numéro dans le champ
                  prévu.
                </p>
              </div>
            </form>
          </section>

          <aside className="lg:sticky lg:top-28 space-y-4">
            <div className="rounded-3xl border border-[#0b5ca8]/20 bg-[#020714] p-6 text-white shadow-[0_20px_55px_rgba(2,7,20,0.18)]">
              <div className="w-12 h-12 rounded-2xl bg-[#0b5ca8]/20 text-[#55a8ff] grid place-items-center">
                <ShieldCheck className="w-6 h-6" />
              </div>

              <h2 className="font-display font-black text-xl mt-5">
                Suivi officiel
              </h2>

              <p className="text-sm text-white/60 leading-relaxed mt-3">
                QEH OUTLET vous redirige uniquement vers les sites
                officiels de La Poste et Chronopost.
              </p>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6">
              <h2 className="font-display font-black text-lg text-slate-950">
                Où trouver le numéro ?
              </h2>

              <div className="space-y-4 mt-5">
                <div className="flex items-start gap-3">
                  <span className="w-7 h-7 shrink-0 rounded-full bg-[#0b5ca8] text-white text-xs font-black grid place-items-center">
                    1
                  </span>

                  <p className="text-sm text-slate-600 leading-relaxed">
                    Ouvre l’e-mail d’expédition reçu après la
                    préparation de ta commande.
                  </p>
                </div>

                <div className="flex items-start gap-3">
                  <span className="w-7 h-7 shrink-0 rounded-full bg-[#0b5ca8] text-white text-xs font-black grid place-items-center">
                    2
                  </span>

                  <p className="text-sm text-slate-600 leading-relaxed">
                    Copie le numéro indiqué dans la partie « suivi »
                    ou « numéro de colis ».
                  </p>
                </div>

                <div className="flex items-start gap-3">
                  <span className="w-7 h-7 shrink-0 rounded-full bg-[#ff5a00] text-white text-xs font-black grid place-items-center">
                    3
                  </span>

                  <p className="text-sm text-slate-600 leading-relaxed">
                    Colle-le ici puis ouvre le service officiel du
                    transporteur.
                  </p>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}