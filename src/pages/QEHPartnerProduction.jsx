import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Check,
  CheckCircle2,
  Gauge,
  LoaderCircle,
  MapPin,
  ShieldCheck,
  Sparkles,
  SunMedium,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "../lib/supabase";

const initialForm = {
  full_name: "",
  email: "",
  phone: "",
  address: "",
  postal_code: "",
  city: "",
  project_type: "toiture",
  project_stage: "idee",
  roof_area: "",
  estimated_power: "",
  annual_consumption: "",
  message: "",
  consent: false,
};

const steps = [
  {
    number: "01",
    title: "Vous présentez le site",
    text: "Quelques informations suffisent pour qualifier le potentiel du projet.",
  },
  {
    number: "02",
    title: "Nous étudions le potentiel",
    text: "Notre équipe vérifie la cohérence technique et territoriale de la demande.",
  },
  {
    number: "03",
    title: "Nous construisons la suite",
    text: "Vous êtes recontacté avec les prochaines étapes adaptées à votre situation.",
  },
];

export default function QEHPartnerProduction() {
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const progress = useMemo(() => {
    const fields = [
      form.full_name,
      form.email,
      form.phone,
      form.address,
      form.postal_code,
      form.city,
      form.project_type,
      form.project_stage,
    ];
    const completed = fields.filter((field) => String(field).trim()).length;
    return Math.round((completed / fields.length) * 100);
  }, [form]);

  const updateField = (event) => {
    const { name, value, type, checked } = event.target;
    setForm((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.consent) {
      toast.error("Vous devez accepter d’être recontacté.");
      return;
    }

    setSubmitting(true);

    try {
      const { error } = await supabase
        .from("qeh_partner_producer_applications")
        .insert({
          ...form,
          roof_area: form.roof_area ? Number(form.roof_area) : null,
          estimated_power: form.estimated_power
            ? Number(form.estimated_power)
            : null,
          annual_consumption: form.annual_consumption
            ? Number(form.annual_consumption)
            : null,
          consent: true,
        });

      if (error) throw error;

      setSubmitted(true);
      setForm(initialForm);
      toast.success("Votre projet a bien été transmis.");
    } catch (error) {
      console.error("Erreur demande producteur :", error);
      toast.error("Impossible d’envoyer la demande pour le moment.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="qehp-subpage qehp-production">
      <section className="qehp-subhero">
        <div className="qehp-subhero__aurora" aria-hidden="true" />
        <div className="qehp-container qehp-subhero__grid">
          <motion.div
            initial={{ opacity: 0, x: -35 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
          >
            <span className="qehp-kicker">
              <SunMedium size={16} />
              Devenir producteur
            </span>
            <h1>Votre toiture peut produire bien plus que de l’électricité.</h1>
            <p>
              Présentez-nous votre projet. QEH PARTNER étudie son potentiel et
              vous accompagne vers une production solaire locale, claire et
              valorisée.
            </p>

            <div className="qehp-subhero__pills">
              <span><MapPin size={16} /> Étude locale</span>
              <span><Gauge size={16} /> Potentiel qualifié</span>
              <span><ShieldCheck size={16} /> Données protégées</span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.75, delay: 0.12 }}
            className="qehp-energy-visual"
          >
            <img
              src="/images/qeh-energies/realisations/qeh-carport-bois.webp"
              alt="Construction locale d’un carport destiné à accueillir du photovoltaïque"
              className="qehp-energy-visual__photo"
            />
            <div className="qehp-energy-visual__sun"><SunMedium /></div>
            <div className="qehp-energy-visual__ring" />
            <div className="qehp-energy-visual__metric">
              <Zap />
              <div><strong>100 %</strong><span>Projet personnalisé</span></div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="qehp-form-section">
        <div className="qehp-container qehp-form-layout">
          <aside className="qehp-form-aside">
            <span className="qehp-form-aside__eyebrow">Un parcours simple</span>
            <h2>Transformons votre potentiel en projet concret.</h2>
            <div className="qehp-process">
              {steps.map((step) => (
                <div key={step.number} className="qehp-process__item">
                  <span>{step.number}</span>
                  <div><h3>{step.title}</h3><p>{step.text}</p></div>
                </div>
              ))}
            </div>
          </aside>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.15 }}
            className="qehp-premium-form-card"
          >
            <div className="qehp-form-card__header">
              <div>
                <span>Étude confidentielle et gratuite</span>
                <h2>Présentez votre projet</h2>
              </div>
              <div className="qehp-form-progress" aria-label={`${progress}% complété`}>
                <strong>{progress}%</strong>
                <span><i style={{ width: `${progress}%` }} /></span>
              </div>
            </div>

            {submitted ? (
              <div className="qehp-success-panel">
                <CheckCircle2 />
                <h3>Votre projet est entre de bonnes mains.</h3>
                <p>
                  Votre demande a été enregistrée. Notre équipe vous
                  recontactera après une première étude.
                </p>
                <button type="button" onClick={() => setSubmitted(false)}>
                  Présenter un autre projet
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="qehp-form">
                <div className="qehp-form__section-title">
                  <span>01</span><div><h3>Vos coordonnées</h3><p>Pour échanger avec vous sur le projet.</p></div>
                </div>

                <div className="qehp-field-grid qehp-field-grid--two">
                  <label className="qehp-field">
                    <span>Nom et prénom *</span>
                    <input name="full_name" value={form.full_name} onChange={updateField} required placeholder="Jean Dupont" />
                  </label>
                  <label className="qehp-field">
                    <span>Téléphone *</span>
                    <input name="phone" value={form.phone} onChange={updateField} required type="tel" placeholder="06 00 00 00 00" />
                  </label>
                  <label className="qehp-field qehp-field--wide">
                    <span>Adresse e-mail *</span>
                    <input name="email" value={form.email} onChange={updateField} required type="email" placeholder="vous@exemple.fr" />
                  </label>
                </div>

                <div className="qehp-form__section-title">
                  <span>02</span><div><h3>Le site de production</h3><p>La localisation exacte du projet.</p></div>
                </div>

                <div className="qehp-field-grid qehp-field-grid--three">
                  <label className="qehp-field qehp-field--wide">
                    <span>Adresse du projet *</span>
                    <input name="address" value={form.address} onChange={updateField} required placeholder="5 rue de la Mare" />
                  </label>
                  <label className="qehp-field">
                    <span>Code postal *</span>
                    <input name="postal_code" value={form.postal_code} onChange={updateField} required inputMode="numeric" placeholder="21430" />
                  </label>
                  <label className="qehp-field">
                    <span>Ville *</span>
                    <input name="city" value={form.city} onChange={updateField} required placeholder="Votre ville" />
                  </label>
                  <label className="qehp-field">
                    <span>Type d’installation</span>
                    <select name="project_type" value={form.project_type} onChange={updateField}>
                      <option value="toiture">Toiture</option>
                      <option value="ombriere">Ombrière</option>
                      <option value="sol">Installation au sol</option>
                      <option value="autre">Autre</option>
                    </select>
                  </label>
                </div>

                <div className="qehp-form__section-title">
                  <span>03</span><div><h3>Votre potentiel</h3><p>Une estimation suffit à cette étape.</p></div>
                </div>

                <div className="qehp-field-grid qehp-field-grid--three">
                  <label className="qehp-field">
                    <span>Surface disponible (m²)</span>
                    <input name="roof_area" value={form.roof_area} onChange={updateField} type="number" min="0" placeholder="120" />
                  </label>
                  <label className="qehp-field">
                    <span>Puissance envisagée (kWc)</span>
                    <input name="estimated_power" value={form.estimated_power} onChange={updateField} type="number" min="0" step="0.1" placeholder="36" />
                  </label>
                  <label className="qehp-field">
                    <span>Consommation annuelle (kWh)</span>
                    <input name="annual_consumption" value={form.annual_consumption} onChange={updateField} type="number" min="0" placeholder="15000" />
                  </label>
                  <label className="qehp-field qehp-field--wide">
                    <span>Avancement du projet</span>
                    <select name="project_stage" value={form.project_stage} onChange={updateField}>
                      <option value="idee">Simple idée</option>
                      <option value="etude">Projet à étudier</option>
                      <option value="devis">Je compare des solutions</option>
                      <option value="pret">Projet prêt à démarrer</option>
                    </select>
                  </label>
                  <label className="qehp-field qehp-field--full">
                    <span>Informations complémentaires</span>
                    <textarea name="message" value={form.message} onChange={updateField} rows="4" placeholder="Décrivez librement votre projet…" />
                  </label>
                </div>

                <label className="qehp-consent">
                  <input type="checkbox" name="consent" checked={form.consent} onChange={updateField} />
                  <span className="qehp-consent__box"><Check /></span>
                  <span>J’accepte d’être recontacté par QEH PARTNER au sujet de ce projet. *</span>
                </label>

                <button type="submit" className="qehp-submit" disabled={submitting}>
                  {submitting ? <LoaderCircle className="qehp-spin" /> : <Sparkles />}
                  {submitting ? "Transmission…" : "Transmettre mon projet"}
                  {!submitting && <ArrowRight />}
                </button>
              </form>
            )}
          </motion.div>
        </div>
      </section>
    </div>
  );
}