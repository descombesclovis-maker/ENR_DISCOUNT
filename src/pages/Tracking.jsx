import React, { useEffect, useMemo, useState } from "react";
import {
  Check,
  Copy,
  ExternalLink,
  Info,
  LoaderCircle,
  PackageCheck,
  PackageSearch,
  ShieldCheck,
  Truck,
} from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "../lib/supabase";

const trackingServices = {
  mondial: {
    name: "Mondial Relay",
    shortName: "Mondial Relay",
    description: "Point Relais, Locker ou livraison compatible avec votre envoi QEH OUTLET",
    url: "https://www.mondialrelay.fr/suivi-de-colis/",
  },
  chronopost: {
    name: "Chronopost",
    shortName: "Chronopost",
    description: "Livraison express et suivi Chronopost de votre colis QEH OUTLET",
    url: "https://www.chronopost.fr/fr/suivi-colis",
  },
};

const statusSteps = [
  { key: "processing", label: "Pris en charge", icon: PackageCheck },
  { key: "shipped", label: "Expédié", icon: Truck },
  { key: "delivered", label: "Livré", icon: Check },
];

function formatDate(value) {
  if (!value) return "À venir";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "À venir";
  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "long",
    timeStyle: "short",
  }).format(date);
}

function PublicTrackingView({ token }) {
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [tracking, setTracking] = useState(null);

  useEffect(() => {
    let active = true;

    const load = async () => {
      setLoading(true);
      setErrorMessage("");

      try {
        const { data, error } = await supabase.functions.invoke("qeh-order-tracking", {
          body: {
            action: "public_tracking",
            tracking_token: token,
          },
        });

        if (error || data?.error) {
          throw new Error(data?.error || error?.message || "Suivi indisponible.");
        }

        if (active) {
          setTracking(data);
        }
      } catch (error) {
        console.error("Impossible de charger le suivi QEH :", error);

        if (active) {
          setErrorMessage(error?.message || "Impossible de charger le suivi.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    load();

    return () => {
      active = false;
    };
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-[65vh] grid place-items-center bg-slate-50">
        <div className="text-center">
          <LoaderCircle className="w-10 h-10 animate-spin text-[#ff5a00] mx-auto" />
          <p className="mt-4 font-semibold text-slate-600">Chargement de votre livraison…</p>
        </div>
      </div>
    );
  }

  if (errorMessage || !tracking?.order) {
    return (
      <div className="min-h-[65vh] grid place-items-center bg-slate-50 px-5">
        <div className="max-w-xl rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <PackageSearch className="w-12 h-12 text-slate-300 mx-auto" />
          <h1 className="font-display font-black text-2xl text-slate-950 mt-5">Suivi introuvable</h1>
          <p className="mt-3 text-slate-500">
            {errorMessage || "Ce lien de suivi n’est pas valide."}
          </p>
        </div>
      </div>
    );
  }

  const { order, events = [] } = tracking;
  const activeIndex =
    order.fulfillment_status === "delivered"
      ? 2
      : order.fulfillment_status === "shipped"
        ? 1
        : 0;
  const eventByStatus = Object.fromEntries(
    events.map((event) => [event.status, event])
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <section className="relative overflow-hidden bg-[#020714] text-white">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-40 -left-40 w-[420px] h-[420px] rounded-full bg-[#0b5ca8]/20 blur-3xl" />
          <div className="absolute -bottom-52 -right-36 w-[480px] h-[480px] rounded-full bg-[#ff5a00]/12 blur-3xl" />
        </div>

        <div className="relative max-w-6xl mx-auto px-5 sm:px-8 py-14 sm:py-20">
          <p className="text-xs font-black uppercase tracking-[0.24em] text-[#ff5a00]">
            QEH OUTLET · SUIVI DE LIVRAISON
          </p>
          <h1 className="font-display font-black text-4xl sm:text-5xl tracking-tight mt-3">
            Commande #{order.order_number}
          </h1>
          <p className="max-w-2xl text-white/60 leading-relaxed mt-5">
            Retrouvez ici toutes les étapes enregistrées pour votre livraison. Cette page se met à jour lorsque QEH OUTLET fait évoluer le statut de votre colis.
          </p>
        </div>
      </section>

      <main className="max-w-6xl mx-auto px-5 sm:px-8 py-10 sm:py-14">
        <section className="rounded-[32px] border border-slate-200 bg-white p-6 sm:p-8 shadow-[0_20px_55px_rgba(2,7,20,0.07)]">
          <div className="grid md:grid-cols-3 gap-5">
            {statusSteps.map((step, index) => {
              const Icon = step.icon;
              const reached = index <= activeIndex;
              const event = eventByStatus[step.key];

              return (
                <div
                  key={step.key}
                  className={`rounded-3xl border p-5 ${
                    reached
                      ? "border-[#ff5a00]/25 bg-[#ff5a00]/[.04]"
                      : "border-slate-200 bg-slate-50"
                  }`}
                >
                  <div
                    className={`w-11 h-11 rounded-2xl grid place-items-center ${
                      reached
                        ? "bg-[#ff5a00] text-white"
                        : "bg-slate-200 text-slate-400"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <h2 className="font-display font-black text-lg text-slate-950 mt-4">
                    {step.label}
                  </h2>
                  <p className="text-sm text-slate-500 mt-2">
                    {formatDate(event?.occurred_at)}
                  </p>
                  {event?.message && (
                    <p className="text-sm text-slate-600 leading-relaxed mt-3">
                      {event.message}
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          <div className="mt-8 h-3 rounded-full bg-slate-100 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#0b5ca8] to-[#ff5a00] transition-all duration-700"
              style={{ width: `${((activeIndex + 1) / 3) * 100}%` }}
            />
          </div>
        </section>

        <div className="grid lg:grid-cols-[1fr_320px] gap-8 mt-8 items-start">
          <section className="rounded-[32px] border border-slate-200 bg-white p-6 sm:p-8">
            <h2 className="font-display font-black text-2xl text-slate-950">
              Informations de livraison
            </h2>

            <div className="grid sm:grid-cols-2 gap-4 mt-6">
              <div className="rounded-2xl bg-slate-50 border border-slate-200 p-5">
                <p className="text-xs font-black uppercase tracking-[.14em] text-slate-400">
                  Transporteur
                </p>
                <p className="font-black text-slate-950 mt-2">
                  {order.carrier || "En cours d’attribution"}
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 border border-slate-200 p-5">
                <p className="text-xs font-black uppercase tracking-[.14em] text-slate-400">
                  Numéro de suivi
                </p>
                <p className="font-black text-slate-950 mt-2 break-all">
                  {order.tracking_number || "Disponible à l’expédition"}
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 border border-slate-200 p-5 sm:col-span-2">
                <p className="text-xs font-black uppercase tracking-[.14em] text-slate-400">
                  Livraison estimée
                </p>
                <p className="font-black text-slate-950 mt-2">
                  {order.estimated_delivery_date
                    ? new Intl.DateTimeFormat("fr-FR", {
                        dateStyle: "long",
                      }).format(
                        new Date(`${order.estimated_delivery_date}T12:00:00`)
                      )
                    : "Date non encore communiquée"}
                </p>
              </div>
            </div>

            {order.tracking_url && (
              <a
                href={order.tracking_url}
                target="_blank"
                rel="noreferrer"
                className="mt-6 w-full min-h-12 rounded-full bg-[#ff5a00] text-white font-black inline-flex items-center justify-center gap-2 hover:bg-[#e95000] transition-colors"
              >
                Ouvrir le suivi officiel du transporteur
                <ExternalLink className="w-4 h-4" />
              </a>
            )}
          </section>

          <aside className="rounded-3xl border border-[#0b5ca8]/20 bg-[#020714] p-6 text-white">
            <ShieldCheck className="w-7 h-7 text-[#55a8ff]" />
            <h2 className="font-display font-black text-xl mt-5">
              Suivi QEH sécurisé
            </h2>
            <p className="text-sm text-white/60 leading-relaxed mt-3">
              Le lien reçu par e-mail est propre à votre commande. Aucune adresse de livraison ni information de paiement n’est affichée sur cette page.
            </p>
          </aside>
        </div>
      </main>
    </div>
  );
}

export default function Tracking() {
  const token = useMemo(
    () => new URLSearchParams(window.location.search).get("t") || "",
    []
  );
  const [selectedCarrier, setSelectedCarrier] = useState("mondial");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [numberCopied, setNumberCopied] = useState(false);

  useEffect(() => {
    document.title = "Suivi de colis | QEH OUTLET";
  }, []);

  if (token) {
    return <PublicTrackingView token={token} />;
  }

  const cleanedTrackingNumber = trackingNumber.replace(/\s+/g, "").trim();
  const selectedService = trackingServices[selectedCarrier];

  const copyTrackingNumber = async () => {
    if (!cleanedTrackingNumber) {
      toast.error("Saisissez d’abord votre numéro de suivi.");
      return false;
    }

    try {
      await navigator.clipboard.writeText(cleanedTrackingNumber);
      setNumberCopied(true);
      window.setTimeout(() => setNumberCopied(false), 2500);
      return true;
    } catch (error) {
      console.error("Impossible de copier le numéro de suivi :", error);
      return false;
    }
  };

  const handleTracking = async (event) => {
    event.preventDefault();

    if (!cleanedTrackingNumber) {
      return;
    }

    const copied = await copyTrackingNumber();
    window.open(selectedService.url, "_blank", "noopener,noreferrer");

    toast.success(`Suivi ${selectedService.shortName} ouvert.`, {
      description: copied
        ? "Votre numéro de suivi a été copié : collez-le directement chez le transporteur."
        : undefined,
    });
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <section className="relative overflow-hidden bg-[#020714]">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-36 -left-32 w-[380px] h-[380px] rounded-full bg-[#0b5ca8]/20 blur-3xl" />
          <div className="absolute -bottom-44 -right-28 w-[420px] h-[420px] rounded-full bg-[#ff5a00]/15 blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-5 sm:px-8 py-14 sm:py-20">
          <PackageSearch className="w-12 h-12 text-[#55a8ff]" />
          <p className="text-xs font-black uppercase tracking-[0.24em] text-[#ff5a00] mt-7">
            QEH OUTLET · LIVRAISON
          </p>
          <h1 className="font-display font-black text-4xl sm:text-5xl text-white tracking-tight mt-3">
            Suivre un colis QEH OUTLET
          </h1>
          <p className="max-w-2xl text-white/60 leading-relaxed mt-5">
            Suivez ici les colis expédiés par QEH OUTLET avec Mondial Relay ou Chronopost. Pour une commande associée à votre compte, l’espace « Mes commandes » reste le suivi principal.
          </p>

          <Link
            to="/mes-commandes"
            className="mt-7 inline-flex min-h-11 items-center justify-center rounded-full border border-white/15 bg-white/5 px-5 text-sm font-black text-white hover:border-[#ff5a00] hover:bg-white/10 transition-colors"
          >
            Ouvrir Mes commandes
          </Link>
        </div>
      </section>

      <main className="max-w-5xl mx-auto px-5 sm:px-8 py-10 sm:py-14">
        <form
          onSubmit={handleTracking}
          className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm space-y-7"
        >
          <div>
            <p className="text-sm font-bold text-slate-950 mb-3">
              Transporteur utilisé par QEH OUTLET
            </p>

            <div className="grid sm:grid-cols-2 gap-3">
              {Object.entries(trackingServices).map(([key, service]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setSelectedCarrier(key)}
                  className={`rounded-2xl border p-5 text-left transition ${
                    selectedCarrier === key
                      ? "border-[#ff5a00] bg-[#ff5a00]/5 shadow-[0_10px_30px_rgba(255,90,0,0.08)]"
                      : "border-slate-200 hover:border-[#0b5ca8]/35"
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-black text-slate-950">
                      {service.shortName}
                    </p>
                    {selectedCarrier === key && (
                      <span className="grid h-7 w-7 place-items-center rounded-full bg-[#ff5a00] text-white">
                        <Check className="w-4 h-4" />
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                    {service.description}
                  </p>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label
              htmlFor="tracking-number"
              className="block text-sm font-bold text-slate-950 mb-2"
            >
              Numéro de suivi du colis
            </label>

            <div className="flex flex-col sm:flex-row gap-3">
              <input
                id="tracking-number"
                value={trackingNumber}
                onChange={(event) => {
                  setTrackingNumber(event.target.value);
                  setNumberCopied(false);
                }}
                placeholder="Saisissez le numéro reçu dans l’e-mail QEH OUTLET"
                className="flex-1 h-12 rounded-xl border border-slate-300 bg-white px-4 outline-none focus:border-[#0b5ca8]"
              />

              <button
                type="button"
                onClick={copyTrackingNumber}
                disabled={!cleanedTrackingNumber}
                className="inline-flex items-center justify-center gap-2 h-12 px-5 rounded-xl border border-slate-200 bg-slate-50 font-semibold text-sm disabled:opacity-50"
              >
                {numberCopied ? (
                  <Check className="w-4 h-4 text-emerald-600" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
                {numberCopied ? "Copié" : "Copier"}
              </button>
            </div>
          </div>

          <div className="rounded-2xl border border-[#0b5ca8]/20 bg-[#0b5ca8]/5 p-5 flex items-start gap-3">
            <Info className="w-5 h-5 shrink-0 text-[#0b5ca8]" />
            <p className="text-sm text-slate-600 leading-relaxed">
              QEH OUTLET vous redirige vers le suivi officiel de {selectedService.name}. Votre numéro est automatiquement copié pour que vous puissiez le coller immédiatement sur la page du transporteur.
            </p>
          </div>

          <button
            type="submit"
            disabled={!cleanedTrackingNumber}
            className="w-full min-h-12 rounded-full bg-[#ff5a00] text-white font-bold inline-flex items-center justify-center gap-2 hover:bg-[#e95000] disabled:opacity-50"
          >
            Suivre mon colis avec {selectedService.name}
            <ExternalLink className="w-4 h-4" />
          </button>
        </form>
      </main>
    </div>
  );
}
