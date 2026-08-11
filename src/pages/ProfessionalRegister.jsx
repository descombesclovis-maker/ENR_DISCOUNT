import React, { useState } from "react";
import {
  Link,
  useNavigate,
} from "react-router-dom";
import {
  AnimatePresence,
  motion,
} from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  CheckCircle2,
  FileBadge2,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  Sparkles,
  User,
} from "lucide-react";
import { toast } from "sonner";

import { supabase } from "../lib/supabase";

const initialForm = {
  company_name: "",
  siret: "",
  vat_number: "",
  first_name: "",
  last_name: "",
  phone: "",
  address: "",
  postal_code: "",
  city: "",
  country: "France",
  email: "",
};

export default function ProfessionalRegister() {
  const navigate = useNavigate();

  const [form, setForm] =
    useState(initialForm);

  const [loading, setLoading] =
    useState(false);

  const [created, setCreated] =
    useState(false);

  function updateField(event) {
    const {
      name,
      value,
    } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (loading) return;

    const siret =
      form.siret.replace(/\s/g, "");

    if (!/^\d{14}$/.test(siret)) {
      toast.error(
        "Le numéro SIRET doit contenir exactement 14 chiffres."
      );

      return;
    }

    setLoading(true);

    try {
      const {
        error,
      } = await supabase
        .from(
          "qeh_professional_applications"
        )
        .insert({
          company_name:
            form.company_name.trim(),

          siret,

          vat_number:
            form.vat_number.trim() ||
            null,

          first_name:
            form.first_name.trim(),

          last_name:
            form.last_name.trim(),

          phone:
            form.phone.trim(),

          address:
            form.address.trim(),

          postal_code:
            form.postal_code.trim(),

          city:
            form.city.trim(),

          country:
            form.country.trim() ||
            "France",

          email:
            form.email
              .trim()
              .toLowerCase(),

          status: "pending",
        });

      if (error) {
        if (error.code === "23505") {
          throw new Error(
            "Une demande est déjà en cours de vérification pour cette adresse e-mail."
          );
        }

        throw error;
      }

      setCreated(true);

      toast.success(
        "Votre candidature professionnelle a bien été transmise."
      );
    } catch (error) {
      toast.error(
        error?.message ||
          "Impossible d’enregistrer votre demande professionnelle."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="qehpro-auth qehpro-auth--register">
      <div className="qehpro-auth__grid" />

      <div className="qehpro-orb qehpro-orb--one" />

      <div className="qehpro-orb qehpro-orb--two" />

      {[10, 24, 39, 55, 72, 88].map(
        (left, index) => (
          <motion.span
            key={left}
            className="qehpro-particle"
            style={{
              left: `${left}%`,
            }}
            animate={{
              y: [60, -900],
              opacity: [0, 0.7, 0],
            }}
            transition={{
              duration: 8 + index,
              repeat: Infinity,
              delay: index * 0.65,
            }}
          />
        )
      )}

      <motion.div
        initial={{
          opacity: 0,
          y: 35,
          scale: 0.97,
        }}
        animate={{
          opacity: 1,
          y: 0,
          scale: 1,
        }}
        transition={{
          duration: 0.7,
          ease: [0.22, 1, 0.36, 1],
        }}
        className="qehpro-auth__card qehpro-auth__card--register"
      >
        <div className="qehpro-auth__shine" />

        <div className="qehpro-auth__brand">
          <motion.img
            src="/images/qeh-partner-logo-gold.png"
            alt="QEH PARTNER"
            animate={{
              filter: [
                "drop-shadow(0 0 8px rgba(242,207,121,.18))",
                "drop-shadow(0 0 28px rgba(242,207,121,.55))",
                "drop-shadow(0 0 8px rgba(242,207,121,.18))",
              ],
            }}
            transition={{
              duration: 3.2,
              repeat: Infinity,
            }}
          />

          <span>
            <Sparkles />
            Candidature professionnelle
          </span>

          <h1>
            Demander mon accès Matériel Pro
          </h1>

          <p>
            Présentez votre entreprise.
            Après vérification, l’équipe QEH
            vous enverra automatiquement
            votre identifiant et un lien
            sécurisé pour choisir votre mot
            de passe.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="qehpro-auth__form qehpro-register-form"
        >
          <div className="qehpro-register-section">
            <div className="qehpro-register-section__title">
              <Building2 />

              <span>
                <strong>
                  Votre entreprise
                </strong>

               
              </span>
            </div>

            <div className="qehpro-register-grid">
              <label className="qehpro-register-grid__wide">
                <span>
                  Raison sociale
                </span>

                <div>
                  <Building2 />

                  <input
                    name="company_name"
                    required
                    value={
                      form.company_name
                    }
                    onChange={
                      updateField
                    }
                    placeholder="Nom de votre entreprise"
                  />
                </div>
              </label>

              <label>
                <span>
                  Numéro SIRET
                </span>

                <div>
                  <FileBadge2 />

                  <input
                    name="siret"
                    required
                    inputMode="numeric"
                    maxLength="17"
                    value={form.siret}
                    onChange={updateField}
                    placeholder="14 chiffres"
                  />
                </div>
              </label>

              <label>
                <span>
                  Numéro de TVA
                </span>

                <div>
                  <ShieldCheck />

                  <input
                    name="vat_number"
                    value={
                      form.vat_number
                    }
                    onChange={
                      updateField
                    }
                    placeholder="FR 00 000000000"
                  />
                </div>
              </label>
            </div>
          </div>

          <div className="qehpro-register-section">
            <div className="qehpro-register-section__title">
              <User />

              <span>
                <strong>
                  Responsable du compte
                </strong>

              </span>
            </div>

            <div className="qehpro-register-grid">
              <label>
                <span>
                  Prénom
                </span>

                <div>
                  <User />

                  <input
                    name="first_name"
                    required
                    value={
                      form.first_name
                    }
                    onChange={
                      updateField
                    }
                  />
                </div>
              </label>

              <label>
                <span>
                  Nom
                </span>

                <div>
                  <User />

                  <input
                    name="last_name"
                    required
                    value={
                      form.last_name
                    }
                    onChange={
                      updateField
                    }
                  />
                </div>
              </label>

              <label>
                <span>
                  Téléphone
                </span>

                <div>
                  <Phone />

                  <input
                    name="phone"
                    type="tel"
                    required
                    value={form.phone}
                    onChange={updateField}
                  />
                </div>
              </label>

              <label>
                <span>
                  Adresse e-mail
                  professionnelle
                </span>

                <div>
                  <Mail />

                  <input
                    name="email"
                    type="email"
                    required
                    autoComplete="email"
                    value={form.email}
                    onChange={updateField}
                  />
                </div>
              </label>
            </div>
          </div>

          <div className="qehpro-register-section">
            <div className="qehpro-register-section__title">
              <MapPin />

              <span>
                <strong>
                  Adresse professionnelle
                </strong>
              </span>
            </div>

            <div className="qehpro-register-grid">
              <label className="qehpro-register-grid__wide">
                <span>
                  Adresse
                </span>

                <div>
                  <MapPin />

                  <input
                    name="address"
                    required
                    value={form.address}
                    onChange={updateField}
                  />
                </div>
              </label>

              <label>
                <span>
                  Code postal
                </span>

                <div>
                  <MapPin />

                  <input
                    name="postal_code"
                    required
                    value={
                      form.postal_code
                    }
                    onChange={
                      updateField
                    }
                  />
                </div>
              </label>

              <label>
                <span>
                  Ville
                </span>

                <div>
                  <MapPin />

                  <input
                    name="city"
                    required
                    value={form.city}
                    onChange={updateField}
                  />
                </div>
              </label>
            </div>
          </div>

          <motion.button
            type="submit"
            disabled={loading}
            whileHover={{
              scale: 1.01,
            }}
            whileTap={{
              scale: 0.985,
            }}
            className="qehpro-gold-button qehpro-gold-button--wide"
          >
            {loading ? (
              <span className="qehpro-loader" />
            ) : (
              <ShieldCheck />
            )}

            {loading
              ? "Transmission sécurisée…"
              : "Envoyer ma demande de compte Pro"}

            {!loading ? (
              <ArrowRight />
            ) : null}
          </motion.button>
        </form>

        <div className="qehpro-auth__footer">
          <Link to="/qeh-partner/connexion-pro">
            <ArrowLeft />
            J’ai déjà un compte
            professionnel
          </Link>

          <p>
            Aucun compte n’est créé avant
            la validation manuelle de votre
            entreprise.
          </p>
        </div>
      </motion.div>

      <AnimatePresence>
        {created ? (
          <motion.div
            className="qehpro-welcome-modal"
            initial={{
              opacity: 0,
            }}
            animate={{
              opacity: 1,
            }}
            exit={{
              opacity: 0,
            }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="qehpro-welcome-title"
          >
            <motion.div
              className="qehpro-welcome-modal__panel"
              initial={{
                opacity: 0,
                y: 50,
                scale: 0.88,
              }}
              animate={{
                opacity: 1,
                y: 0,
                scale: 1,
              }}
              transition={{
                type: "spring",
                stiffness: 210,
                damping: 19,
              }}
            >
              <div className="qehpro-welcome-modal__glow" />

              <div className="qehpro-welcome-modal__seal">
                <motion.span
                  animate={{
                    rotate: 360,
                  }}
                  transition={{
                    duration: 13,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                />

                <motion.div
                  initial={{
                    scale: 0,
                    rotate: -30,
                  }}
                  animate={{
                    scale: 1,
                    rotate: 0,
                  }}
                  transition={{
                    delay: 0.18,
                    type: "spring",
                  }}
                >
                  <CheckCircle2 />
                </motion.div>
              </div>

              <span className="qehpro-welcome-modal__eyebrow">
                <Sparkles />
                Candidature enregistrée
              </span>

              <h2 id="qehpro-welcome-title">
                Bienvenue chez QEH PARTNER
                <br />

                <em>
                  Matériel Pro
                </em>
              </h2>

              <p>
                Ce n’est plus qu’une question
                de temps avant que nous vous
                envoyions vos identifiants,
                après vérification de votre
                entreprise.
              </p>

              <small>
                Une fois votre demande
                autorisée depuis
                l’administration, vous
                recevrez automatiquement un
                e-mail sécurisé pour activer
                votre accès.
              </small>

              <button
                type="button"
                className="qehpro-gold-button qehpro-gold-button--wide"
                onClick={() =>
                  navigate(
                    "/qeh-partner/connexion-pro"
                  )
                }
              >
                J’ai compris
                <ArrowRight />
              </button>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </section>
  );
}