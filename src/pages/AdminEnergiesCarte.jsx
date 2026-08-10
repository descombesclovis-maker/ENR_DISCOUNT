import React, { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Circle,
  LoaderCircle,
  MapPin,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { supabase } from "../lib/supabase";

const emptyZone = {
  public_name: "",
  address: "",
  postal_code: "",
  city: "",
  latitude: "",
  longitude: "",
  radius_meters: 2000,
  is_active: true,
};

export default function AdminEnergiesCarte() {
  const [zones, setZones] = useState([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyZone);
  const [defaultRadiusMeters, setDefaultRadiusMeters] = useState(2000);

  const loadZones = useCallback(async () => {
    setLoading(true);
    setErrorMessage("");
    const [zonesResult, settingsResult] = await Promise.all([
      supabase.from("solar_map_zones").select("*").order("created_at", { ascending: false }),
      supabase.from("qeh_admin_settings").select("value").eq("setting_key", "energies").maybeSingle(),
    ]);
    const { data, error } = zonesResult;
    if (error) {
      setZones([]);
      setErrorMessage(error.message);
    } else {
      setZones(data || []);
    }
    const radiusKm = Number(settingsResult.data?.value?.default_radius_km);
    if (!settingsResult.error && Number.isFinite(radiusKm) && radiusKm > 0) {
      setDefaultRadiusMeters(Math.max(100, radiusKm * 1000));
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadZones();
  }, [loadZones]);

  const filtered = useMemo(() => {
    const value = query.trim().toLocaleLowerCase("fr-FR");
    if (!value) return zones;
    return zones.filter((zone) =>
      [zone.public_name, zone.address, zone.postal_code, zone.city]
        .filter(Boolean)
        .join(" ")
        .toLocaleLowerCase("fr-FR")
        .includes(value)
    );
  }, [query, zones]);

  function openForm(zone = null) {
    setEditing(zone);
    setForm(
      zone
        ? {
            public_name: zone.public_name || "",
            address: zone.address || "",
            postal_code: zone.postal_code || "",
            city: zone.city || "",
            latitude: zone.latitude ?? "",
            longitude: zone.longitude ?? "",
            radius_meters: zone.radius_meters || 2000,
            is_active: zone.is_active !== false,
          }
        : { ...emptyZone, radius_meters: defaultRadiusMeters }
    );
    setFormOpen(true);
  }

  function closeForm() {
    setEditing(null);
    setForm({ ...emptyZone, radius_meters: defaultRadiusMeters });
    setFormOpen(false);
  }

  async function saveZone(event) {
    event.preventDefault();
    setSaving(true);
    setErrorMessage("");
    const values = {
      public_name: form.public_name.trim(),
      address: form.address.trim(),
      postal_code: form.postal_code.trim(),
      city: form.city.trim(),
      latitude: Number(form.latitude),
      longitude: Number(form.longitude),
      radius_meters: Math.max(100, Number(form.radius_meters) || 2000),
      is_active: Boolean(form.is_active),
    };
    const operation = editing
      ? supabase.from("solar_map_zones").update(values).eq("id", editing.id)
      : supabase.from("solar_map_zones").insert(values);
    const { error } = await operation;
    if (error) setErrorMessage(error.message);
    else {
      closeForm();
      await loadZones();
    }
    setSaving(false);
  }

  async function toggleZone(zone) {
    const { error } = await supabase
      .from("solar_map_zones")
      .update({ is_active: !zone.is_active })
      .eq("id", zone.id);
    if (error) setErrorMessage(error.message);
    else loadZones();
  }

  async function deleteZone(zone) {
    if (!window.confirm(`Supprimer la zone « ${zone.public_name || zone.city} » ?`)) return;
    const { error } = await supabase.from("solar_map_zones").delete().eq("id", zone.id);
    if (error) setErrorMessage(error.message);
    else loadZones();
  }

  return (
    <div className="min-h-screen p-4 sm:p-6 xl:p-8">
      <div className="mx-auto max-w-[1450px]">
        <header className="relative overflow-hidden rounded-[28px] bg-[#050b16] p-6 text-white sm:p-8">
          <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[#69b72d]/25 blur-3xl" />
          <div className="relative flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-[#82d246]">QEH Énergies</p>
              <h1 className="mt-3 font-display text-3xl font-black sm:text-4xl">Carte solaire</h1>
              <p className="mt-3 max-w-2xl text-slate-300">Ajoutez les zones visibles sur la carte et définissez précisément leur rayon.</p>
            </div>
            <button type="button" onClick={() => openForm()} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#69b72d] px-6 font-black text-[#020711] hover:bg-[#82d246]">
              <Plus className="h-5 w-5" /> Ajouter une zone
            </button>
          </div>
        </header>

        <section className="mt-5 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_14px_45px_rgba(2,7,17,0.06)]">
          <div className="flex flex-col gap-3 border-b border-slate-200 p-4 sm:flex-row sm:p-5">
            <label className="relative flex-1">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Rechercher une adresse ou une ville…" className="min-h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-12 pr-4 font-semibold outline-none" />
            </label>
            <button type="button" onClick={loadZones} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 font-black"><RefreshCw className="h-4 w-4" /> Actualiser</button>
          </div>

          {errorMessage ? <div className="m-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-700">{errorMessage}</div> : null}
          {loading ? (
            <div className="grid min-h-[340px] place-items-center"><LoaderCircle className="h-8 w-8 animate-spin text-[#69b72d]" /></div>
          ) : filtered.length === 0 ? (
            <div className="grid min-h-[340px] place-items-center px-6 text-center text-slate-500">Aucune zone enregistrée.</div>
          ) : (
            <div className="grid gap-4 p-4 sm:grid-cols-2 xl:grid-cols-3 sm:p-5">
              {filtered.map((zone) => (
                <article key={zone.id} className="rounded-3xl border border-slate-200 p-5 transition hover:-translate-y-1 hover:shadow-lg">
                  <div className="flex items-start justify-between gap-3">
                    <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#69b72d]/12 text-[#4f9720]"><Circle className="h-7 w-7 fill-current opacity-70" /></div>
                    <button type="button" onClick={() => toggleZone(zone)} className={`rounded-full px-3 py-1.5 text-xs font-black ${zone.is_active ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>{zone.is_active ? "Visible" : "Masquée"}</button>
                  </div>
                  <h2 className="mt-5 font-display text-xl font-black">{zone.public_name || zone.city}</h2>
                  <p className="mt-2 flex items-start gap-2 text-sm font-semibold text-slate-500"><MapPin className="mt-0.5 h-4 w-4 shrink-0" />{zone.address}, {zone.postal_code} {zone.city}</p>
                  <div className="mt-4 rounded-2xl bg-slate-50 p-3 text-sm"><span className="font-bold text-slate-500">Rayon public :</span> <strong>{Number(zone.radius_meters || 2000) / 1000} km</strong></div>
                  <div className="mt-5 flex gap-2">
                    <button type="button" onClick={() => openForm(zone)} className="inline-flex min-h-10 flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 font-black"><Pencil className="h-4 w-4" /> Modifier</button>
                    <button type="button" onClick={() => deleteZone(zone)} className="grid h-10 w-10 place-items-center rounded-xl border border-red-100 text-red-500" aria-label="Supprimer"><Trash2 className="h-4 w-4" /></button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>

      {formOpen ? (
        <div className="fixed inset-0 z-[100] grid place-items-center overflow-y-auto bg-[#020711]/65 p-4 backdrop-blur-sm">
          <motion.form initial={{ opacity: 0, y: 20, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} onSubmit={saveZone} className="my-6 w-full max-w-3xl rounded-3xl bg-white p-5 shadow-2xl sm:p-7">
            <div className="flex items-start justify-between gap-4">
              <div><p className="text-xs font-black uppercase tracking-[0.18em] text-[#4f9720]">QEH Énergies</p><h2 className="mt-2 font-display text-2xl font-black">{editing ? "Modifier la zone" : "Ajouter une zone"}</h2></div>
              <button type="button" onClick={closeForm} className="grid h-10 w-10 place-items-center rounded-xl bg-slate-100"><X className="h-5 w-5" /></button>
            </div>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {[
                ["public_name", "Nom public", "text"], ["address", "Adresse", "text"],
                ["postal_code", "Code postal", "text"], ["city", "Ville", "text"],
                ["latitude", "Latitude", "number"], ["longitude", "Longitude", "number"],
                ["radius_meters", "Rayon en mètres", "number"],
              ].map(([name, label, type]) => (
                <label key={name} className={name === "address" ? "sm:col-span-2" : ""}><span className="mb-2 block text-sm font-black text-slate-700">{label}</span><input type={type} step={type === "number" ? "any" : undefined} required value={form[name]} onChange={(event) => setForm((current) => ({ ...current, [name]: event.target.value }))} className="min-h-12 w-full rounded-xl border border-slate-200 px-4 outline-none focus:border-[#69b72d] focus:ring-4 focus:ring-[#69b72d]/10" /></label>
              ))}
            </div>
            <label className="mt-5 flex items-center gap-3 rounded-2xl bg-slate-50 p-4 font-bold text-slate-700"><input type="checkbox" checked={form.is_active} onChange={(event) => setForm((current) => ({ ...current, is_active: event.target.checked }))} className="h-5 w-5 accent-[#69b72d]" />Afficher la zone sur la carte publique</label>
            <button type="submit" disabled={saving} className="mt-6 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-[#69b72d] px-6 font-black text-[#020711] disabled:opacity-60">{saving ? <LoaderCircle className="h-5 w-5 animate-spin" /> : <MapPin className="h-5 w-5" />}{saving ? "Enregistrement…" : "Enregistrer la zone"}</button>
          </motion.form>
        </div>
      ) : null}
    </div>
  );
}