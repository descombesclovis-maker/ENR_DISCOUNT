import React, { useEffect, useState } from "react";
import {
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Eye,
  EyeOff,
  Lock,
  Mail,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";

import { supabase } from "../lib/supabase";
import { useCustomerAuth } from "../context/CustomerAuthContext";
import { useProfessionalAuth } from "../context/ProfessionalAuthContext";

export default function ProfessionalLogin() {
  const navigate = useNavigate();
  const location = useLocation();

  const {
    signIn,
    signOut,
    isAuthenticated,
  } = useCustomerAuth();

  const {
    isProfessional,
    professionalAccount,
    refreshProfessionalAccount,
  } = useProfessionalAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const destination =
    location.state?.from ||
    "/qeh-partner/materiel-pro";

  useEffect(() => {
    if (isAuthenticated && isProfessional) {
      navigate(destination, {
        replace: true,
      });
    }
  }, [
    destination,
    isAuthenticated,
    isProfessional,
    navigate,
  ]);

  async function handleSubmit(event) {
    event.preventDefault();

    if (loading) return;

    setLoading(true);

    try {
      const result = await signIn(
        email.trim().toLowerCase(),
        password
      );

      const {
        data: account,
        error,
      } = await supabase
        .from("qeh_professional_accounts")
        .select(`
          user_id,
          company_name,
          siret,
          vat_number,
          status
        `)
        .eq("user_id", result.user.id)
        .maybeSingle();

      if (error) {
        throw error;
      }

      if (
        !account ||
        account.status !== "approved"
      ) {
        await signOut();

        if (account?.status === "pending") {
          throw new Error(
            "Votre compte professionnel est encore en attente de validation."
          );
        }

        if (account?.status === "suspended") {
          throw new Error(
            "Votre accès professionnel est suspendu. Contactez QEH PARTNER."
          );
        }

        throw new Error(
          "Ce compte n’est pas autorisé à accéder au catalogue professionnel."
        );
      }

      await refreshProfessionalAccount(
        result.user
      );

      toast.success(
        `Bienvenue ${account.company_name}.`
      );

      navigate(destination, {
        replace: true,
      });
    } catch (error) {
      toast.error(
        error?.message ||
          "Connexion professionnelle impossible."
      );
    } finally {
      setLoading(false);
    }
  }

  function openProfessionalRegistration() {
    navigate(
      "/qeh-partner/inscription-pro"
    );
  }

  return (
    <section className="qehpro-auth">
      <div className="qehpro-auth__grid" />

      <div className="qehpro-orb qehpro-orb--one" />

      <div className="qehpro-orb qehpro-orb--two" />

      {[12, 28, 44, 61, 78, 90].map(
        (left, index) => (
          <motion.span
            key={left}
            className="qehpro-particle"
            style={{
              left: `${left}%`,
            }}
            animate={{
              y: [40, -650],
              opacity: [0, 0.75, 0],
            }}
            transition={{
              duration: 7 + index,
              repeat: Infinity,
              delay: index * 0.7,
            }}
          />
        )
      )}

      <motion.div
        initial={{
          opacity: 0,
          y: 35,
          scale: 0.96,
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
        className="qehpro-auth__card"
      >
        <div className="qehpro-auth__shine" />

        <div className="qehpro-auth__brand">
          <motion.img
            src="/images/qeh-partner-logo-gold.png"
            alt="QEH PARTNER"
            animate={{
              filter: [
                "drop-shadow(0 0 8px rgba(242,207,121,.15))",
                "drop-shadow(0 0 24px rgba(242,207,121,.5))",
                "drop-shadow(0 0 8px rgba(242,207,121,.15))",
              ],
            }}
            transition={{
              duration: 3.2,
              repeat: Infinity,
            }}
          />

          <span>
            <Sparkles />
            Accès professionnel sécurisé
          </span>

          <h1>
            Connexion Matériel Pro
          </h1>

          <p>
            Tarifs HT, stocks dédiés,
            commandes de gros et logistique
            professionnelle.
          </p>
        </div>

        {isAuthenticated &&
        !isProfessional ? (
          <div className="qehpro-auth__notice">
            <Building2 />

            <div>
              <strong>
                Compte particulier actuellement
                connecté
              </strong>

              <p>
                {professionalAccount?.status ===
                "pending"
                  ? "Votre validation professionnelle est en cours."
                  : "Déconnectez-vous puis utilisez un compte professionnel approuvé."}
              </p>
            </div>
          </div>
        ) : null}

        <form
          onSubmit={handleSubmit}
          className="qehpro-auth__form"
        >
          <label>
            <span>
              Adresse e-mail professionnelle
            </span>

            <div>
              <Mail />

              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(event) =>
                  setEmail(event.target.value)
                }
                placeholder="vous@entreprise.fr"
              />
            </div>
          </label>

          <label>
            <span>
              Mot de passe
            </span>

            <div>
              <Lock />

              <input
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                required
                autoComplete="current-password"
                value={password}
                onChange={(event) =>
                  setPassword(
                    event.target.value
                  )
                }
              />

              <button
                type="button"
                onClick={() =>
                  setShowPassword(
                    (current) => !current
                  )
                }
                aria-label={
                  showPassword
                    ? "Masquer le mot de passe"
                    : "Afficher le mot de passe"
                }
              >
                {showPassword ? (
                  <EyeOff />
                ) : (
                  <Eye />
                )}
              </button>
            </div>
          </label>

          <div className="qehpro-auth__options">
            <span>
              <ShieldCheck />
              Connexion chiffrée
            </span>

            <Link to="/qeh-partner/mot-de-passe-oublie">
              Mot de passe oublié ?
            </Link>
          </div>

          <motion.button
            type="submit"
            disabled={loading}
            whileHover={{
              scale: 1.015,
            }}
            whileTap={{
              scale: 0.985,
            }}
            className="qehpro-gold-button qehpro-gold-button--wide"
          >
            {loading ? (
              <span className="qehpro-loader" />
            ) : (
              <Building2 />
            )}

            {loading
              ? "Vérification…"
              : "Se connecter en tant que pro"}

            {!loading ? (
              <ArrowRight />
            ) : null}
          </motion.button>
        </form>

        <div
          style={{
            position: "relative",
            marginTop: "30px",
            paddingTop: "28px",
            borderTop:
              "1px solid rgba(245,220,148,0.25)",
            textAlign: "center",
          }}
        >
          <p
            style={{
              marginBottom: "15px",
              color: "#c8d0dc",
              fontSize: "15px",
              fontWeight: "700",
            }}
          >
            Vous n’avez pas encore d’accès
            professionnel ?
          </p>

          <motion.button
            type="button"
            onClick={
              openProfessionalRegistration
            }
            whileHover={{
              scale: 1.02,
              y: -3,
            }}
            whileTap={{
              scale: 0.98,
            }}
            style={{
              position: "relative",
              display: "flex",
              width: "100%",
              minHeight: "64px",
              alignItems: "center",
              justifyContent: "center",
              gap: "12px",
              overflow: "hidden",
              border:
                "1px solid #fff0b8",
              borderRadius: "18px",
              padding: "0 24px",
              color: "#07101c",
              background:
                "linear-gradient(110deg, #8e6119 0%, #f8e4a4 35%, #c58e2d 65%, #fff0b8 100%)",
              backgroundSize: "240% 100%",
              boxShadow:
                "0 16px 50px rgba(216,169,61,0.42), inset 0 1px rgba(255,255,255,0.75)",
              fontSize: "16px",
              fontWeight: "950",
              cursor: "pointer",
            }}
          >
            <Sparkles
              style={{
                width: "21px",
                height: "21px",
              }}
            />

            S’inscrire en tant que pro

            <ArrowRight
              style={{
                width: "21px",
                height: "21px",
              }}
            />
          </motion.button>

          <small
            style={{
              display: "block",
              marginTop: "13px",
              color: "#8390a3",
              fontSize: "12px",
              lineHeight: "1.5",
            }}
          >
            Votre entreprise sera vérifiée avant
            l’envoi de vos identifiants.
          </small>
        </div>

        <div className="qehpro-auth__footer">
          <Link to="/connexion">
            <ArrowLeft />
            Vous connecter en tant que
            particulier
          </Link>
        </div>
      </motion.div>
    </section>
  );
}