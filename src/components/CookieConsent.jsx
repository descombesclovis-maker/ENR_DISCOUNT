import React, { useEffect, useState } from "react";
import { Cookie, Settings2, ShieldCheck, X } from "lucide-react";
import { Link } from "react-router-dom";

export const COOKIE_CONSENT_KEY = "qeh_cookie_consent_v1";
export const COOKIE_CONSENT_EVENT = "qeh:cookie-consent";

function readConsent() {
  try {
    const value = JSON.parse(localStorage.getItem(COOKIE_CONSENT_KEY) || "null");
    return value?.version === 1 ? value : null;
  } catch {
    return null;
  }
}

function persistConsent(analytics) {
  const value = {
    version: 1,
    essential: true,
    analytics: Boolean(analytics),
    updated_at: new Date().toISOString(),
  };

  localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(value));
  window.dispatchEvent(new CustomEvent(COOKIE_CONSENT_EVENT, { detail: value }));
  return value;
}

export function hasAnalyticsConsent() {
  return readConsent()?.analytics === true;
}

export default function CookieConsent() {
  const [consent, setConsent] = useState(() => readConsent());
  const [open, setOpen] = useState(() => !readConsent());
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [analyticsEnabled, setAnalyticsEnabled] = useState(() => readConsent()?.analytics === true);

  useEffect(() => {
    const handleConsent = (event) => setConsent(event.detail || readConsent());
    window.addEventListener(COOKIE_CONSENT_EVENT, handleConsent);
    return () => window.removeEventListener(COOKIE_CONSENT_EVENT, handleConsent);
  }, []);

  function save(analytics) {
    const next = persistConsent(analytics);
    setConsent(next);
    setAnalyticsEnabled(next.analytics);
    setSettingsOpen(false);
    setOpen(false);
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-4 left-4 z-[2000] grid h-11 w-11 place-items-center rounded-full border border-white/15 bg-[#020711] text-white shadow-2xl transition hover:border-[#55a8ff] hover:text-[#55a8ff]"
        aria-label="Gérer mes préférences de cookies"
        title="Gérer mes cookies"
      >
        <Cookie className="h-5 w-5" />
      </button>
    );
  }

  return (
    <div className="fixed inset-x-0 bottom-0 z-[2100] p-3 sm:p-5" role="dialog" aria-modal="true" aria-labelledby="cookie-title">
      <div className="mx-auto max-w-5xl overflow-hidden rounded-[26px] border border-white/15 bg-[#07101f]/[.98] text-white shadow-[0_30px_100px_rgba(0,0,0,.55)] backdrop-blur-2xl">
        <div className="h-1 bg-gradient-to-r from-[#ff5a00] via-[#82d246] to-[#f2cf79]" />
        <div className="p-5 sm:p-7">
          <div className="flex items-start gap-4">
            <div className="hidden h-12 w-12 shrink-0 place-items-center rounded-2xl bg-white/10 text-[#82d246] sm:grid">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 id="cookie-title" className="font-display text-xl font-black sm:text-2xl">Vos choix, en toute transparence</h2>
                  <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-300">
                    Les fonctions indispensables au site restent actives. Avec votre accord, QEH utilise aussi une mesure d'audience interne pour comprendre les pages consultées et améliorer l'expérience.
                  </p>
                </div>
                {consent ? (
                  <button type="button" onClick={() => setOpen(false)} className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-white/10 text-white/65 hover:text-white" aria-label="Fermer">
                    <X className="h-4 w-4" />
                  </button>
                ) : null}
              </div>

              {settingsOpen ? (
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/[.07] p-4">
                    <div className="flex items-center justify-between gap-3"><strong>Cookies essentiels</strong><span className="rounded-full bg-emerald-400/15 px-3 py-1 text-xs font-black text-emerald-300">Toujours actifs</span></div>
                    <p className="mt-2 text-xs leading-relaxed text-slate-400">Sécurité, connexion, panier et mémorisation de votre choix.</p>
                  </div>
                  <label className="flex cursor-pointer items-start gap-4 rounded-2xl border border-blue-400/20 bg-blue-400/[.07] p-4">
                    <input type="checkbox" checked={analyticsEnabled} onChange={(event) => setAnalyticsEnabled(event.target.checked)} className="mt-1 h-5 w-5 accent-[#55a8ff]" />
                    <span><strong className="block">Mesure d'audience</strong><span className="mt-2 block text-xs leading-relaxed text-slate-400">Statistiques internes de consultation, sans publicité ciblée.</span></span>
                  </label>
                </div>
              ) : null}

              <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
                <button type="button" onClick={() => save(false)} className="inline-flex min-h-12 flex-1 items-center justify-center rounded-full border border-white/25 bg-white/[.04] px-5 text-sm font-black transition hover:bg-white/10">Tout refuser</button>
                <button type="button" onClick={() => setSettingsOpen((current) => !current)} className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-full border border-white/25 bg-white/[.04] px-5 text-sm font-black transition hover:bg-white/10"><Settings2 className="h-4 w-4" />Personnaliser</button>
                {settingsOpen ? (
                  <button type="button" onClick={() => save(analyticsEnabled)} className="inline-flex min-h-12 flex-1 items-center justify-center rounded-full bg-white px-5 text-sm font-black text-[#020711] transition hover:bg-slate-100">Enregistrer mes choix</button>
                ) : (
                  <button type="button" onClick={() => save(true)} className="inline-flex min-h-12 flex-1 items-center justify-center rounded-full border border-white/25 bg-white/[.04] px-5 text-sm font-black transition hover:bg-white/10">Tout accepter</button>
                )}
              </div>

              <p className="mt-4 text-xs leading-relaxed text-slate-400">
                Vous pouvez modifier votre choix à tout moment avec l'icône Cookie. Consultez nos{" "}
                <Link to="/conditions-generales" className="font-bold text-white underline underline-offset-4">Conditions d'utilisation</Link>{" "}
                et notre{" "}
                <Link to="/politique-de-confidentialite" className="font-bold text-white underline underline-offset-4">Politique de confidentialité</Link>.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
