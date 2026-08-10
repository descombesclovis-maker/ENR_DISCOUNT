import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Bell, Building2, LoaderCircle, Save, Send, Settings, ShoppingBag, Sun } from "lucide-react";
import { supabase } from "../lib/supabase";

const sections = [
  { id: "general", label: "Général", icon: Settings, color: "#17649e" },
  { id: "outlet", label: "QEH OUTLET", icon: ShoppingBag, color: "#ff5a00" },
  { id: "energies", label: "QEH Énergies", icon: Sun, color: "#69b72d" },
  { id: "partner", label: "QEH Partner", icon: Building2, color: "#c99532" },
  { id: "notifications", label: "Notifications", icon: Bell, color: "#7c3aed" },
];

const defaults = {
  general: { company_name: "QEH", contact_email: "", contact_phone: "", address: "", maintenance_mode: false },
  outlet: { free_shipping_threshold: 100, low_stock_threshold: 3, allow_preorders: true, manual_quote_message: "Vous serez recontacté par e-mail pour prendre connaissance du prix de livraison de ce produit." },
  energies: { default_radius_km: 2, public_producers_enabled: true, consumer_requests_enabled: true, contact_email: "" },
  partner: { wholesale_minimum_order: 0, producer_forms_enabled: true, franchise_forms_enabled: true, professional_catalog_enabled: true },
  notifications: {
    telegram_enabled: true,
    notify_login: true,
    notify_new_customer: true,
    notify_paid_order: true,
    notify_message: true,
    notify_solar_request: true,
    notify_partner_request: true,
  },
};

export default function AdminSettingsPremium() {
  const [active, setActive] = useState("general");
  const [values, setValues] = useState(defaults);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testingTelegram, setTestingTelegram] = useState(false);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const loadSettings = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase.from("qeh_admin_settings").select("setting_key, value");
    if (error) setErrorMessage(error.message);
    else {
      const loaded = { ...defaults };
      (data || []).forEach((row) => { if (loaded[row.setting_key]) loaded[row.setting_key] = { ...loaded[row.setting_key], ...(row.value || {}) }; });
      setValues(loaded);
      setErrorMessage("");
    }
    setLoading(false);
  }, []);

  useEffect(() => { loadSettings(); }, [loadSettings]);

  const fields = useMemo(() => ({
    general: [
      ["company_name", "Nom de la société", "text"], ["contact_email", "E-mail principal", "email"],
      ["contact_phone", "Téléphone", "tel"], ["address", "Adresse du siège", "text"],
      ["maintenance_mode", "Mode maintenance", "toggle"],
    ],
    outlet: [
      ["free_shipping_threshold", "Livraison offerte à partir de (€)", "number"], ["low_stock_threshold", "Seuil de stock faible", "number"],
      ["allow_preorders", "Autoriser les précommandes", "toggle"], ["manual_quote_message", "Message livraison sur devis", "textarea"],
    ],
    energies: [
      ["default_radius_km", "Rayon par défaut (km)", "number"], ["contact_email", "E-mail QEH Énergies", "email"],
      ["public_producers_enabled", "Afficher les producteurs publics", "toggle"], ["consumer_requests_enabled", "Accepter les demandes consommateurs", "toggle"],
    ],
    partner: [
      ["wholesale_minimum_order", "Minimum de commande HT (€)", "number"], ["professional_catalog_enabled", "Catalogue Matériel Pro actif", "toggle"],
      ["producer_forms_enabled", "Formulaire Production actif", "toggle"], ["franchise_forms_enabled", "Formulaire Franchise actif", "toggle"],
    ],
    notifications: [
      ["telegram_enabled", "Activer Telegram", "toggle"], ["notify_login", "Alerte à la connexion", "toggle"],
      ["notify_new_customer", "Alerte nouveau client", "toggle"], ["notify_paid_order", "Alerte paiement reçu", "toggle"],
      ["notify_message", "Alerte nouveau message", "toggle"], ["notify_solar_request", "Alerte demande Énergies / producteur", "toggle"],
      ["notify_partner_request", "Alerte demande Partner", "toggle"],
    ],
  }), []);

  function setField(name, value) { setValues((current) => ({ ...current, [active]: { ...current[active], [name]: value } })); }

  async function saveSettings(event) {
    event.preventDefault(); setSaving(true); setMessage(""); setErrorMessage("");
    const rows = Object.entries(values).map(([setting_key, value]) => ({ setting_key, value, updated_at: new Date().toISOString() }));
    const { error } = await supabase.from("qeh_admin_settings").upsert(rows, { onConflict: "setting_key" });
    if (error) setErrorMessage(error.message); else {
      const radiusMeters = Math.max(100, Number(values.energies.default_radius_km || 2) * 1000);
      const { error: radiusError } = await supabase
        .from("solar_map_zones")
        .update({ radius_meters: radiusMeters, updated_at: new Date().toISOString() })
        .neq("radius_meters", radiusMeters);
      if (radiusError) {
        setErrorMessage(`Paramètres enregistrés, mais le rayon des zones n’a pas été actualisé : ${radiusError.message}`);
      } else {
        setMessage("Paramètres enregistrés et appliqués au site.");
      }
    }
    setSaving(false);
  }

  async function testTelegram() {
    setTestingTelegram(true);
    setMessage("");
    setErrorMessage("");
    const { error } = await supabase.rpc("test_qeh_telegram_notification");
    if (error) setErrorMessage(error.message);
    else setMessage("Notification de test programmée. Vérifiez votre groupe Telegram.");
    setTestingTelegram(false);
  }

  const activeConfig = sections.find((section) => section.id === active);

  return (
    <div className="min-h-screen p-4 sm:p-6 xl:p-8"><div className="mx-auto max-w-[1350px]">
      <header className="relative overflow-hidden rounded-[28px] bg-[#050b16] p-6 text-white sm:p-8"><div className="absolute right-0 top-0 h-full w-1/2 bg-gradient-to-l from-[#17649e]/20 via-[#69b72d]/10 to-transparent" /><div className="relative"><p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Console centrale QEH</p><h1 className="mt-3 font-display text-3xl font-black sm:text-4xl">Paramètres</h1><p className="mt-3 max-w-2xl text-slate-300">Pilotez les réglages communs et les options propres à chacun des trois univers.</p></div></header>
      <div className="mt-5 grid gap-5 lg:grid-cols-[280px_1fr]">
        <nav className="h-fit rounded-3xl border border-slate-200 bg-white p-3 shadow-sm">{sections.map((section) => { const Icon = section.icon; const selected = active === section.id; return <button key={section.id} type="button" onClick={() => { setActive(section.id); setMessage(""); }} className={`mb-1 flex min-h-12 w-full items-center gap-3 rounded-2xl px-4 text-left font-black transition ${selected ? "bg-slate-950 text-white shadow-lg" : "text-slate-600 hover:bg-slate-50"}`}><Icon className="h-5 w-5" style={{ color: selected ? section.color : undefined }} /><span>{section.label}</span></button>; })}</nav>
        <form onSubmit={saveSettings} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_14px_45px_rgba(2,7,17,0.06)] sm:p-7">
          <div className="flex items-center gap-4 border-b border-slate-200 pb-5"><div className="grid h-12 w-12 place-items-center rounded-2xl" style={{ color: activeConfig.color, backgroundColor: activeConfig.color + "18" }}>{React.createElement(activeConfig.icon, { className: "h-6 w-6" })}</div><div><p className="text-xs font-black uppercase tracking-wider text-slate-400">Configuration</p><h2 className="font-display text-2xl font-black">{activeConfig.label}</h2></div></div>
          {loading ? <div className="grid min-h-[360px] place-items-center"><LoaderCircle className="h-8 w-8 animate-spin" /></div> : <div className="mt-6 grid gap-5 sm:grid-cols-2">{fields[active].map(([name, label, type]) => {
            const value = values[active][name];
            if (type === "toggle") return <label key={name} className="flex min-h-20 items-center justify-between gap-4 rounded-2xl border border-slate-200 p-4"><span className="font-black text-slate-700">{label}</span><button type="button" role="switch" aria-checked={Boolean(value)} onClick={() => setField(name, !value)} className={`relative h-7 w-12 rounded-full transition ${value ? "bg-emerald-500" : "bg-slate-300"}`}><span className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition ${value ? "left-6" : "left-1"}`} /></button></label>;
            if (type === "textarea") return <label key={name} className="sm:col-span-2"><span className="mb-2 block text-sm font-black text-slate-700">{label}</span><textarea rows="4" value={value} onChange={(event) => setField(name, event.target.value)} className="w-full rounded-2xl border border-slate-200 p-4 outline-none focus:ring-4 focus:ring-slate-100" /></label>;
            return <label key={name}><span className="mb-2 block text-sm font-black text-slate-700">{label}</span><input type={type} step={type === "number" ? "any" : undefined} value={value} onChange={(event) => setField(name, type === "number" ? Number(event.target.value) : event.target.value)} className="min-h-12 w-full rounded-xl border border-slate-200 px-4 outline-none focus:ring-4 focus:ring-slate-100" /></label>;
          })}</div>}
          {errorMessage ? <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-700">{errorMessage}</div> : null}{message ? <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-bold text-emerald-700">{message}</div> : null}
          <div className="mt-7 flex flex-col gap-3 sm:flex-row"><button type="submit" disabled={loading || saving} className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-[#050b16] px-6 font-black text-white hover:bg-[#13233c] disabled:opacity-50 sm:w-auto"><Save className="h-5 w-5" />{saving ? "Enregistrement…" : "Enregistrer tous les paramètres"}</button>{active === "notifications" ? <button type="button" onClick={testTelegram} disabled={testingTelegram || !values.notifications.telegram_enabled} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-violet-200 bg-violet-50 px-6 font-black text-violet-700 disabled:opacity-50">{testingTelegram ? <LoaderCircle className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}{testingTelegram ? "Envoi…" : "Tester Telegram"}</button> : null}</div>
        </form>
      </div>
    </div></div>
  );
}