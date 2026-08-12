import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight,
  CheckCircle2,
  LoaderCircle,
  LockKeyhole,
  Mail,
  MapPin,
  ShieldCheck,
  Sparkles,
  UserRound,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "../lib/supabase";

const initialForm = {
  name: "",
  email: "",
  phone: "",
  address: "",
  postalCode: "",
  city: "",
  annualConsumptionKwh: "",
  consent: false,
};

async function geocodeAddress(query) {
  const response = await fetch(
    `https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(
      query
    )}&limit=1`
  );

  if (!response.ok) {
    throw new Error(
      "Le service de recherche d’adresse est momentanément indisponible."
    );
  }

  const result = await response.json();
  const feature = result.features?.[0];

  if (!feature) {
    throw new Error(
      "Adresse introuvable. Vérifiez la rue, le code postal et la ville."
    );
  }

  const [longitude, latitude] = feature.geometry.coordinates;

  return {
    latitude,
    longitude,
    city: feature.properties.city || "",
    postalCode: feature.properties.postcode || "",
  };
}

function Field({
  label,
  name,
  value,
  onChange,
  type = "text",
  placeholder = "",
  required = false,
  min,
  step,
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-bold text-slate-800">
        {label}
        {required ? " *" : ""}
      </span>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        min={min}
        step={step}
        className="min-h-12 w-full rounded-xl border border-slate-300 bg-white px-4 text-slate-950 outline-none transition focus:border-[#17649e] focus:ring-4 focus:ring-[#17649e]/10"
      />
    </label>
  );
}

export default function QEHEnergiesParticiper() {
  const [form, setForm] = useState(initialForm);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    document.title = "Participer | QEH Énergies";
  }, []);

  function handleChange(event) {
    const { name, value, checked, type } = event.target;
    setForm((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!form.consent) {
      toast.error("Votre accord est nécessaire pour traiter la demande.");
      return;
    }

    setIsSubmitting(true);

    try {
      const completeAddress = [form.address, form.postalCode, form.city]
        .filter(Boolean)
        .join(" ");
      const position = await geocodeAddress(completeAddress);

      const values = {
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        phone: form.phone.trim() || null,
        address: form.address.trim(),
        postal_code: form.postalCode.trim() || position.postalCode,
        city: form.city.trim() || position.city,
        latitude: position.latitude,
        longitude: position.longitude,
        annual_consumption_kwh: form.annualConsumptionKwh
          ? Number(form.annualConsumptionKwh)
          : null,
        consent_given: true,
      };

      const { error } = await supabase
        .from("solar_consumer_requests")
        .insert(values);

      if (error) throw error;

      toast.success(
        "Votre demande a bien été enregistrée. Nous vous recontacterons par e-mail."
      );
      setForm(initialForm);
    } catch (error) {
      console.error("Erreur d’enregistrement QEH Énergies :", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Impossible d’enregistrer votre demande."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div data-testid="qeh-energies-participer-page">
      <section className="relative overflow-hidden bg-[#020711] py-16 text-white sm:py-24">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-32 top-0 h-96 w-96 rounded-full bg-[#17649e]/25 blur-3xl" />
          <div className="absolute -right-40 bottom-0 h-[430px] w-[430px] rounded-full bg-[#69b72d]/20 blur-3xl" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }}
          className="relative mx-auto max-w-5xl px-5 text-center sm:px-8"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-[#69b72d]/40 bg-[#69b72d]/10 px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-[#82d246]">
            <Sparkles className="h-4 w-4" />
            Participer au réseau local
          </div>
          <h1 className="mx-auto mt-6 max-w-4xl font-display text-4xl font-black leading-tight sm:text-5xl lg:text-6xl">
            Je veux payer mon électricité{" "}
            <span className="text-[#82d246]">moins chère.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-3xl text-base leading-relaxed text-slate-300 sm:text-lg">
            Déposez votre demande. QEH Énergies vérifiera les possibilités de consommation solaire locale autour de votre adresse.
          </p>
        </motion.div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-8 px-5 py-14 sm:px-8 sm:py-20 lg:grid-cols-[0.72fr_1.28fr]">
        <motion.aside
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="rounded-3xl bg-[#020711] p-6 text-white shadow-[0_24px_70px_rgba(2,7,20,0.2)] sm:p-8"
        >
          <div className="relative -mx-6 -mt-6 mb-7 h-48 overflow-hidden rounded-t-3xl sm:-mx-8 sm:-mt-8">
            <img
              src="/images/qeh-energies/realisations/qeh-full-black.webp"
              alt="Panneaux photovoltaïques full black installés sur une toiture"
              className="h-full w-full object-cover"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#020711] via-transparent to-transparent" />
          </div>
          <div className="grid h-14 w-14 place-items-center rounded-2xl bg-[#69b72d]/15 text-[#82d246]">
            <UserRound className="h-7 w-7" />
          </div>
          <h2 className="mt-6 font-display text-3xl font-black">
            Votre demande en toute confidentialité
          </h2>
          <p className="mt-4 leading-relaxed text-slate-300">
            Vos coordonnées exactes ne sont jamais affichées sur la carte publique. Elles servent uniquement à étudier votre demande et à vous recontacter.
          </p>

          <div className="mt-8 space-y-4">
            {[
              "Recherche automatique autour de votre adresse",
              "Étude sans engagement",
              "Réponse directement par e-mail",
            ].map((item) => (
              <div key={item} className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[#82d246]" />
                <span className="text-sm font-semibold text-slate-200">
                  {item}
                </span>
              </div>
            ))}
          </div>

          <Link
            to="/qeh-energies/carte-solaire"
            className="mt-8 inline-flex items-center gap-2 font-black text-[#82d246]"
          >
            Consulter d’abord la carte
            <ArrowRight className="h-5 w-5" />
          </Link>
        </motion.aside>

        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 22 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_18px_55px_rgba(2,7,20,0.08)] sm:p-8"
        >
          <div className="mb-7 flex items-start gap-4">
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[#17649e]/10 text-[#17649e]">
              <Mail className="h-6 w-6" />
            </div>
            <div>
              <h2 className="font-display text-2xl font-black text-[#020711]">
                Demander une étude locale
              </h2>
              <p className="mt-1 text-sm leading-relaxed text-slate-500">
                Les champs marqués d’un astérisque sont obligatoires.
              </p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label="Nom et prénom"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
            />
            <Field
              label="E-mail"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              required
            />
            <Field
              label="Téléphone"
              name="phone"
              type="tel"
              value={form.phone}
              onChange={handleChange}
            />
            <Field
              label="Adresse"
              name="address"
              value={form.address}
              onChange={handleChange}
              placeholder="5 rue Basse"
              required
            />
            <Field
              label="Code postal"
              name="postalCode"
              value={form.postalCode}
              onChange={handleChange}
              placeholder="21430"
              required
            />
            <Field
              label="Ville"
              name="city"
              value={form.city}
              onChange={handleChange}
              placeholder="Savilly"
              required
            />
            <div className="sm:col-span-2">
              <Field
                label="Consommation annuelle approximative (kWh)"
                name="annualConsumptionKwh"
                type="number"
                min="0"
                step="1"
                value={form.annualConsumptionKwh}
                onChange={handleChange}
                placeholder="Ex. 6500"
              />
            </div>
          </div>

          <label className="mt-5 flex cursor-pointer items-start gap-3 rounded-2xl bg-slate-50 p-4 text-sm leading-relaxed text-slate-600">
            <input
              type="checkbox"
              name="consent"
              checked={form.consent}
              onChange={handleChange}
              className="mt-1 h-4 w-4 accent-[#17649e]"
            />
            <span>
              J’accepte que QEH Énergies utilise ces informations pour étudier ma demande et me recontacter. Mes coordonnées exactes ne seront pas publiées sur la carte.
            </span>
          </label>

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-5 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-[#17649e] px-6 font-black text-white shadow-[0_14px_35px_rgba(23,100,158,0.24)] transition hover:-translate-y-0.5 hover:bg-[#0e527f] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? (
              <LoaderCircle className="h-5 w-5 animate-spin" />
            ) : (
              <Mail className="h-5 w-5" />
            )}
            {isSubmitting ? "Enregistrement..." : "Envoyer ma demande"}
          </button>

          <div className="mt-4 flex items-center justify-center gap-2 text-xs text-slate-500">
            <LockKeyhole className="h-4 w-4 text-[#4f9720]" />
            Transmission sécurisée des informations
          </div>
        </motion.form>
      </section>

      <section className="mx-auto max-w-7xl px-5 pb-16 sm:px-8 sm:pb-20">
        <div className="flex items-start gap-4 rounded-3xl border border-[#17649e]/15 bg-[#17649e]/5 p-5 sm:p-7">
          <ShieldCheck className="mt-0.5 h-6 w-6 shrink-0 text-[#17649e]" />
          <div>
            <h2 className="font-display text-lg font-black text-[#020711]">
              La demande ne crée aucun engagement
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              QEH Énergies vous contactera uniquement après une première analyse des possibilités disponibles autour de votre adresse.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}