import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Building2,
  CalendarDays,
  LoaderCircle,
  Mail,
  MapPin,
  PackageCheck,
  Phone,
  Save,
  ShoppingBag,
  UserRound,
} from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { supabase } from "../lib/supabase";

function money(value, currency = "EUR") {
  return Number(value || 0).toLocaleString("fr-FR", {
    style: "currency",
    currency: String(currency || "EUR").toUpperCase(),
  });
}

function date(value) {
  return value ? new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value)) : "Date inconnue";
}

export default function AdminCustomerDetail() {
  const { id } = useParams();
  const [customer, setCustomer] = useState(null);
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    let active = true;
    async function loadCustomer() {
      setLoading(true);
      const { data, error } = await supabase
        .from("customer_profiles")
        .select(`
          *,
          orders (
            id,
            order_number,
            total,
            currency,
            status,
            payment_status,
            fulfillment_status,
            paid_at,
            created_at
          )
        `)
        .eq("id", id)
        .single();
      if (!active) return;
      if (error) setErrorMessage(error.message);
      else {
        setCustomer(data);
        setForm({
          first_name: data.first_name || "",
          last_name: data.last_name || "",
          email: data.email || "",
          phone: data.phone || "",
          company: data.company || "",
          address: data.address || "",
          postal_code: data.postal_code || "",
          city: data.city || "",
        });
      }
      setLoading(false);
    }
    loadCustomer();
    return () => { active = false; };
  }, [id]);

  const orders = useMemo(
    () => [...(customer?.orders || [])].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)),
    [customer]
  );
  const totalSpent = orders.reduce((total, order) => total + Number(order.total || 0), 0);
  const paidOrders = orders.filter((order) => order.payment_status === "paid").length;

  function change(name, value) {
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function saveCustomer(event) {
    event.preventDefault();
    setSaving(true);
    setErrorMessage("");
    setSuccessMessage("");
    const { data, error } = await supabase
      .from("customer_profiles")
      .update({
        first_name: form.first_name.trim() || null,
        last_name: form.last_name.trim() || null,
        email: form.email.trim().toLowerCase() || null,
        phone: form.phone.trim() || null,
        company: form.company.trim() || null,
        address: form.address.trim() || null,
        postal_code: form.postal_code.trim() || null,
        city: form.city.trim() || null,
      })
      .eq("id", id)
      .select("*")
      .single();
    if (error) setErrorMessage(error.message);
    else {
      setCustomer((current) => ({ ...current, ...data }));
      setSuccessMessage("Les informations du client ont été enregistrées.");
    }
    setSaving(false);
  }

  const inputClass = "min-h-12 w-full rounded-xl border border-slate-200 bg-white px-4 font-semibold outline-none focus:border-[#ff5a00] focus:ring-4 focus:ring-[#ff5a00]/10";

  if (loading) return <div className="grid min-h-[70vh] place-items-center"><LoaderCircle className="h-9 w-9 animate-spin text-[#ff5a00]" /></div>;
  if (!customer) return <div className="p-8"><div className="rounded-3xl border border-red-200 bg-red-50 p-6 font-bold text-red-700">{errorMessage || "Client introuvable."}</div></div>;

  const customerName = [customer.first_name, customer.last_name].filter(Boolean).join(" ") || customer.company || "Client sans nom";

  return (
    <div className="min-h-screen p-4 sm:p-6 xl:p-8">
      <div className="mx-auto max-w-[1450px]">
        <motion.header initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="relative overflow-hidden rounded-[30px] bg-[#050b16] p-6 text-white sm:p-8"><div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[#ff5a00]/25 blur-3xl" /><div className="relative"><Link to="/admin/clients" className="inline-flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-white"><ArrowLeft className="h-4 w-4" />Retour aux clients</Link><div className="mt-6 flex flex-col gap-5 sm:flex-row sm:items-center"><div className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-[#ff5a00] text-2xl font-black">{customerName.charAt(0).toUpperCase()}</div><div><p className="text-xs font-black uppercase tracking-[.2em] text-[#ff7a2f]">Fiche client QEH OUTLET</p><h1 className="mt-2 font-display text-3xl font-black sm:text-4xl">{customerName}</h1><p className="mt-2 text-slate-300">Client depuis le {new Date(customer.created_at).toLocaleDateString("fr-FR")}</p></div></div></div><div className="relative mt-7 grid gap-3 sm:grid-cols-3"><div className="rounded-2xl border border-white/10 bg-white/[.06] p-4"><p className="text-xs font-bold text-slate-400">Commandes</p><p className="mt-1 text-2xl font-black">{orders.length}</p></div><div className="rounded-2xl border border-white/10 bg-white/[.06] p-4"><p className="text-xs font-bold text-slate-400">Payées</p><p className="mt-1 text-2xl font-black text-[#ff7a2f]">{paidOrders}</p></div><div className="rounded-2xl border border-white/10 bg-white/[.06] p-4"><p className="text-xs font-bold text-slate-400">Total dépensé</p><p className="mt-1 text-2xl font-black">{money(totalSpent)}</p></div></div></motion.header>

        {errorMessage ? <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-4 font-bold text-red-700">{errorMessage}</div> : null}
        {successMessage ? <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 font-bold text-emerald-700">{successMessage}</div> : null}

        <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(360px,.72fr)_minmax(0,1.28fr)]">
          <form onSubmit={saveCustomer} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7"><div className="flex items-center justify-between gap-4"><div><p className="text-xs font-black uppercase tracking-[.15em] text-[#ff5a00]">Coordonnées</p><h2 className="mt-2 font-display text-2xl font-black">Informations client</h2></div><UserRound className="h-7 w-7 text-slate-300" /></div><div className="mt-6 grid gap-4 sm:grid-cols-2">{[["first_name","Prénom"],["last_name","Nom"],["email","E-mail"],["phone","Téléphone"],["company","Société"],["postal_code","Code postal"],["address","Adresse"],["city","Ville"]].map(([name,label]) => <label key={name} className={name === "address" ? "sm:col-span-2" : ""}><span className="mb-2 block text-xs font-black uppercase tracking-[.1em] text-slate-500">{label}</span><input type={name === "email" ? "email" : "text"} value={form[name] || ""} onChange={(event) => change(name, event.target.value)} className={inputClass} /></label>)}</div><div className="mt-5 grid gap-3 text-sm"><a href={`mailto:${customer.email || ""}`} className="flex items-center gap-3 rounded-2xl bg-slate-50 p-4 font-bold"><Mail className="h-5 w-5 text-[#ff5a00]" />{customer.email || "Sans e-mail"}</a><a href={`tel:${customer.phone || ""}`} className="flex items-center gap-3 rounded-2xl bg-slate-50 p-4 font-bold"><Phone className="h-5 w-5 text-[#ff5a00]" />{customer.phone || "Sans téléphone"}</a><div className="flex items-start gap-3 rounded-2xl bg-slate-50 p-4 font-bold"><MapPin className="mt-0.5 h-5 w-5 shrink-0 text-[#ff5a00]" />{[customer.address, customer.postal_code, customer.city].filter(Boolean).join(", ") || "Adresse non renseignée"}</div>{customer.company ? <div className="flex items-center gap-3 rounded-2xl bg-slate-50 p-4 font-bold"><Building2 className="h-5 w-5 text-[#ff5a00]" />{customer.company}</div> : null}</div><button type="submit" disabled={saving} className="mt-6 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-[#ff5a00] px-6 font-black text-white disabled:opacity-60">{saving ? <LoaderCircle className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}{saving ? "Enregistrement…" : "Enregistrer les modifications"}</button></form>

          <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm"><div className="border-b border-slate-200 p-5 sm:p-7"><div className="flex items-center gap-3"><ShoppingBag className="h-6 w-6 text-[#ff5a00]" /><div><h2 className="font-display text-2xl font-black">Historique des commandes</h2><p className="mt-1 text-sm text-slate-500">Toutes les commandes associées à ce client.</p></div></div></div>{orders.length === 0 ? <div className="grid min-h-[360px] place-items-center p-6 text-center"><div><PackageCheck className="mx-auto h-12 w-12 text-slate-300" /><p className="mt-4 font-black">Aucune commande</p><p className="mt-1 text-sm text-slate-500">Ce client n’a pas encore passé de commande.</p></div></div> : <div className="divide-y divide-slate-100">{orders.map((order) => <article key={order.id} className="grid gap-4 p-5 transition hover:bg-orange-50/40 sm:grid-cols-[1fr_150px_135px] sm:items-center"><div><p className="font-black text-slate-950">{order.order_number || `Commande ${String(order.id).slice(0, 8)}`}</p><p className="mt-2 flex items-center gap-2 text-xs text-slate-500"><CalendarDays className="h-4 w-4" />{date(order.created_at)}</p></div><div><span className={`rounded-full px-3 py-1.5 text-xs font-black ${order.payment_status === "paid" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>{order.payment_status === "paid" ? "Payée" : order.payment_status || "En attente"}</span><p className="mt-2 text-xs font-semibold text-slate-500">{order.fulfillment_status || order.status || "À traiter"}</p></div><p className="text-xl font-black text-[#ff5a00] sm:text-right">{money(order.total, order.currency)}</p></article>)}</div>}</section>
        </div>
      </div>
    </div>
  );
}