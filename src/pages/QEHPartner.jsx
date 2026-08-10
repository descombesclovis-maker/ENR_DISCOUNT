import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BadgeEuro,
  Building2,
  Factory,
  Handshake,
  ShieldCheck,
  Sparkles,
  SunMedium,
  Truck,
} from "lucide-react";

const universes = [
  {
    eyebrow: "Production",
    title: "Produisez une énergie qui vous ressemble",
    description:
      "Présentez votre projet solaire et rejoignez un réseau local pensé pour valoriser chaque kilowatt produit.",
    to: "/qeh-partner/production",
    cta: "Devenir producteur",
    icon: SunMedium,
    className: "qehp-universe--production",
  },
  {
    eyebrow: "Matériel professionnel",
    title: "Le matériel en gros, sans les complications",
    description:
      "Accédez à une sélection professionnelle, des volumes adaptés et une livraison entreprise calculée automatiquement.",
    to: "/qeh-partner/materiel-pro",
    cta: "Accéder au catalogue pro",
    icon: Factory,
    className: "qehp-universe--material",
  },
  {
    eyebrow: "Franchises",
    title: "Développez QEH Énergies sur votre territoire",
    description:
      "Entreprenez avec une marque, une méthode et un accompagnement conçus pour accélérer votre réussite.",
    to: "/qeh-partner/franchise",
    cta: "Devenir franchisé",
    icon: Handshake,
    className: "qehp-universe--franchise",
  },
];

const strengths = [
  {
    icon: ShieldCheck,
    title: "Un cadre professionnel",
    text: "Des parcours clairs, des demandes qualifiées et un suivi humain.",
  },
  {
    icon: Truck,
    title: "Une logistique maîtrisée",
    text: "Les besoins professionnels sont traités comme des livraisons professionnelles.",
  },
  {
    icon: BadgeEuro,
    title: "Une valeur partagée",
    text: "Nous construisons des opportunités durables pour chaque partenaire.",
  },
  {
    icon: Building2,
    title: "Un réseau de proximité",
    text: "QEH grandit avec des partenaires engagés dans leur territoire.",
  },
];

const reveal = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
};

export default function QEHPartner() {
  return (
    <div className="qehp-home">
      <section className="qehp-hero">
        <div className="qehp-orbit qehp-orbit--one" aria-hidden="true" />
        <div className="qehp-orbit qehp-orbit--two" aria-hidden="true" />
        <div className="qehp-hero__grid" aria-hidden="true" />

        <div className="qehp-container qehp-hero__content">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="qehp-hero__copy"
          >
            <span className="qehp-kicker">
              <Sparkles size={16} />
              L’écosystème professionnel QEH
            </span>

            <h1>
              Trois façons de bâtir
              <span> l’énergie de demain.</span>
            </h1>

            <p>
              Produire, s’équiper ou entreprendre : QEH PARTNER rassemble les
              opportunités professionnelles du groupe dans une expérience
              unique, premium et directe.
            </p>

            <div className="qehp-hero__buttons">
              <a href="#univers" className="qehp-button qehp-button--gold">
                Explorer les opportunités
                <ArrowRight size={19} />
              </a>

              <Link
                to="/qeh-energies"
                className="qehp-button qehp-button--ghost"
              >
                Découvrir QEH Énergies
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.92, rotateY: -8 }}
            animate={{ opacity: 1, scale: 1, rotateY: 0 }}
            transition={{ duration: 0.85, delay: 0.15 }}
            className="qehp-hero__logo-wrap"
          >
            <div className="qehp-hero__logo-halo" />
            <img src="/images/qeh-partner-logo-gold.png" alt="QEH PARTNER" />
            <div className="qehp-hero__badge">
              <span>QEH</span>
              Un réseau. Trois opportunités.
            </div>
          </motion.div>
        </div>

        <div className="qehp-hero__marquee" aria-hidden="true">
          <div>
            PRODUCTION <span>✦</span> MATÉRIEL PROFESSIONNEL <span>✦</span>
            FRANCHISES <span>✦</span> PRODUCTION <span>✦</span> MATÉRIEL
            PROFESSIONNEL <span>✦</span> FRANCHISES <span>✦</span>
          </div>
        </div>
      </section>

      <section id="univers" className="qehp-section qehp-section--light">
        <div className="qehp-container">
          <motion.div
            variants={reveal}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6 }}
            className="qehp-section-heading"
          >
            <span>Choisissez votre univers</span>
            <h2>Une porte d’entrée pour chaque ambition</h2>
            <p>
              Chaque parcours possède son identité, ses outils et son
              accompagnement, tout en bénéficiant de la force du réseau QEH.
            </p>
          </motion.div>

          <div className="qehp-universe-grid">
            {universes.map((universe, index) => {
              const Icon = universe.icon;

              return (
                <motion.article
                  key={universe.to}
                  variants={reveal}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.55, delay: index * 0.12 }}
                  className={`qehp-universe ${universe.className}`}
                >
                  <div className="qehp-universe__shine" aria-hidden="true" />
                  <div className="qehp-universe__number">0{index + 1}</div>
                  <div className="qehp-universe__icon">
                    <Icon />
                  </div>
                  <span className="qehp-universe__eyebrow">
                    {universe.eyebrow}
                  </span>
                  <h3>{universe.title}</h3>
                  <p>{universe.description}</p>
                  <Link to={universe.to} className="qehp-universe__link">
                    {universe.cta}
                    <ArrowRight size={18} />
                  </Link>
                </motion.article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="qehp-section qehp-section--dark">
        <div className="qehp-container">
          <div className="qehp-strengths-heading">
            <span>Pourquoi QEH PARTNER ?</span>
            <h2>Le premium doit aussi être simple.</h2>
          </div>

          <div className="qehp-strengths-grid">
            {strengths.map((strength, index) => {
              const Icon = strength.icon;

              return (
                <motion.div
                  key={strength.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.45, delay: index * 0.08 }}
                  className="qehp-strength"
                >
                  <Icon />
                  <h3>{strength.title}</h3>
                  <p>{strength.text}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="qehp-cta">
        <div className="qehp-container qehp-cta__inner">
          <div>
            <span>Votre projet commence ici</span>
            <h2>Prêt à devenir partenaire ?</h2>
          </div>

          <Link
            to="/qeh-partner/franchise"
            className="qehp-button qehp-button--dark"
          >
            Présenter mon projet
            <ArrowRight size={19} />
          </Link>
        </div>
      </section>
    </div>
  );
}