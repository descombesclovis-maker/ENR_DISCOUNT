import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Award,
  BriefcaseBusiness,
  Check,
  CheckCircle2,
  Crown,
  Handshake,
  LoaderCircle,
  MapPinned,
  Rocket,
  Sparkles,
  UsersRound,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "../lib/supabase";

const initialForm = {
  full_name: "",
  email: "",
  phone: "",
  company: "",
  city: "",
  department: "",
  preferred_area: "",
  current_activity: "",
  management_experience: "",
  investment_budget: "",
  start_timeline: "",
  motivation: "",
  consent: false,
};

const pillars = [
  { icon: Award, title: "Une marque différenciante", text: "Une identité forte au croisement de l’énergie, du conseil et du local." },
  { icon: Rocket, title: "Une méthode structurée", text: "Un parcours commercial et opérationnel conçu pour vous faire gagner du temps." },
  { icon: UsersRound, title: "Un accompagnement humain", text: "Vous entreprenez avec un réseau, des outils et des interlocuteurs engagés." },
];

export default function QEHPartnerFranchise() {
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const progress = useMemo(() => {
    const required = [form.full_name, form.email, form.phone, form.city, form.department, form.motivation];
    return Math.round((required.filter((value) => String(value).trim()).length / required.length) * 100);
  }, [form]);

  const updateField = (event) => {
    const { name, value, type, checked } = event.target;
    setForm((current) => ({ ...current, [name]: type === "checkbox" ? checked : value }));
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
        .from("qeh_partner_franchise_applications")
        .insert({ ...form, consent: true });

      if (error) throw error;

      setSubmitted(true);
      setForm(initialForm);
      toast.success("Votre candidature a bien été transmise.");
    } catch (error) {
      console.error("Erreur candidature franchise :", error);
      toast.error("Impossible d’envoyer la candidature pour le moment.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="qehp-subpage qehp-franchise">
      <section className="qehp-franchise-hero">
        <div className="qehp-franchise-hero__beam" aria-hidden="true" />
        <div className="qehp-container qehp-franchise-hero__content">
          <motion.div
            initial={{ opacity: 0, y: 26 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <span className="qehp-kicker"><Crown size={16} /> Franchise QEH Énergies</span>
            <h1>Entreprenez avec une longueur d’avance.</h1>
            <p>
              Développez QEH Énergies sur votre territoire et rejoignez une
              aventure entrepreneuriale qui associe transition énergétique,
              proximité et ambition commerciale.
            </p>
            <a href="#candidature" className="qehp-button qehp-button--gold">
              Déposer ma candidature <ArrowRight size={19} />
            </a>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.12 }}
            className="qehp-franchise-hero__seal"
          >
            <Handshake />
            <strong>PARTENAIRE</strong>
            <span>QEH ÉNERGIES</span>
          </motion.div>
        </div>
      </section>

      <section className="qehp-franchise-pillars">
        <div className="qehp-container qehp-franchise-pillars__grid">
          {pillars.map((pillar, index) => {
            const Icon = pillar.icon;
            return (
              <motion.article
                key={pillar.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Icon />
                <h2>{pillar.title}</h2>
                <p>{pillar.text}</p>
              </motion.article>
            );
          })}
        </div>
      </section>

      <section id="candidature" className="qehp-form-section qehp-form-section--franchise">
        <div className="qehp-container qehp-franchise-form-layout">
          <aside className="qehp-franchise-form-aside">
            <span>Votre territoire. Votre entreprise. Notre réseau.</span>
            <h2>Vous avez le profil pour faire grandir QEH.</h2>
            <p>
              Nous recherchons des entrepreneurs impliqués, ancrés localement
              et désireux de construire une activité solide dans l’énergie.
            </p>

            <ul>
              <li><BriefcaseBusiness /> Fibre commerciale et entrepreneuriale</li>
              <li><MapPinned /> Bonne connaissance du territoire</li>
              <li><Handshake /> Goût du conseil et de la relation client</li>
              <li><Sparkles /> Envie de porter une marque ambitieuse</li>
            </ul>
          </aside>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.12 }}
            className="qehp-premium-form-card qehp-premium-form-card--franchise"
          >
            <div className="qehp-form-card__header">
              <div><span>Candidature confidentielle</span><h2>Devenir franchisé</h2></div>
              <div className="qehp-form-progress" aria-label={`${progress}% complété`}>
                <strong>{progress}%</strong><span><i style={{ width: `${progress}%` }} /></span>
              </div>
            </div>

            {submitted ? (
              <div className="qehp-success-panel">
                <CheckCircle2 />
                <h3>Votre candidature est enregistrée.</h3>
                <p>Notre direction l’étudiera avec attention avant de vous recontacter.</p>
                <button type="button" onClick={() => setSubmitted(false)}>Déposer une autre candidature</button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="qehp-form">
                <div className="qehp-form__section-title"><span>01</span><div><h3>Faisons connaissance</h3><p>Vos coordonnées et votre situation actuelle.</p></div></div>
                <div className="qehp-field-grid qehp-field-grid--two">
                  <label className="qehp-field"><span>Nom et prénom *</span><input name="full_name" value={form.full_name} onChange={updateField} required placeholder="Jean Dupont" /></label>
                  <label className="qehp-field"><span>Téléphone *</span><input name="phone" value={form.phone} onChange={updateField} required type="tel" placeholder="06 00 00 00 00" /></label>
                  <label className="qehp-field"><span>Adresse e-mail *</span><input name="email" value={form.email} onChange={updateField} required type="email" placeholder="vous@exemple.fr" /></label>
                  <label className="qehp-field"><span>Société actuelle</span><input name="company" value={form.company} onChange={updateField} placeholder="Nom de votre société" /></label>
                  <label className="qehp-field qehp-field--full"><span>Activité actuelle</span><input name="current_activity" value={form.current_activity} onChange={updateField} placeholder="Décrivez votre métier actuel" /></label>
                </div>

                <div className="qehp-form__section-title"><span>02</span><div><h3>Votre territoire</h3><p>La zone sur laquelle vous souhaitez vous développer.</p></div></div>
                <div className="qehp-field-grid qehp-field-grid--three">
                  <label className="qehp-field"><span>Ville *</span><input name="city" value={form.city} onChange={updateField} required placeholder="Votre ville" /></label>
                  <label className="qehp-field"><span>Département *</span><input name="department" value={form.department} onChange={updateField} required placeholder="21" /></label>
                  <label className="qehp-field"><span>Zone souhaitée</span><input name="preferred_area" value={form.preferred_area} onChange={updateField} placeholder="Côte-d’Or, Morvan…" /></label>
                </div>

                <div className="qehp-form__section-title"><span>03</span><div><h3>Votre projet entrepreneurial</h3><p>Vos moyens, votre expérience et votre ambition.</p></div></div>
                <div className="qehp-field-grid qehp-field-grid--two">
                  <label className="qehp-field"><span>Expérience en management</span><select name="management_experience" value={form.management_experience} onChange={updateField}><option value="">Sélectionner</option><option value="aucune">Aucune</option><option value="moins_3">Moins de 3 ans</option><option value="3_7">3 à 7 ans</option><option value="plus_7">Plus de 7 ans</option></select></label>
                  <label className="qehp-field"><span>Apport disponible</span><select name="investment_budget" value={form.investment_budget} onChange={updateField}><option value="">Sélectionner</option><option value="moins_25k">Moins de 25 000 €</option><option value="25k_50k">25 000 à 50 000 €</option><option value="50k_100k">50 000 à 100 000 €</option><option value="plus_100k">Plus de 100 000 €</option></select></label>
                  <label className="qehp-field qehp-field--full"><span>Délai de lancement envisagé</span><select name="start_timeline" value={form.start_timeline} onChange={updateField}><option value="">Sélectionner</option><option value="moins_3_mois">Moins de 3 mois</option><option value="3_6_mois">3 à 6 mois</option><option value="6_12_mois">6 à 12 mois</option><option value="plus_12_mois">Plus de 12 mois</option></select></label>
                  <label className="qehp-field qehp-field--full"><span>Pourquoi souhaitez-vous rejoindre QEH ? *</span><textarea name="motivation" value={form.motivation} onChange={updateField} required rows="6" placeholder="Parlez-nous de votre parcours, de votre motivation et de votre vision…" /></label>
                </div>

                <label className="qehp-consent">
                  <input type="checkbox" name="consent" checked={form.consent} onChange={updateField} />
                  <span className="qehp-consent__box"><Check /></span>
                  <span>J’accepte d’être recontacté dans le cadre de ma candidature. *</span>
                </label>

                <button type="submit" className="qehp-submit" disabled={submitting}>
                  {submitting ? <LoaderCircle className="qehp-spin" /> : <Crown />}
                  {submitting ? "Transmission…" : "Envoyer ma candidature"}
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