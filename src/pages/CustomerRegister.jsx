import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  User,
  Mail,
  Lock,
  UserPlus,
  ArrowRight,
  ShieldCheck,
  Truck,
  BadgeEuro,
} from "lucide-react";
import { toast } from "sonner";

import { useCustomerAuth } from "../context/CustomerAuthContext";
import { supabase } from "../lib/supabase";

export default function CustomerRegister() {
  const navigate = useNavigate();
  const { signUp } = useCustomerAuth();

  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    company: "",
    phone: "",
    address: "",
    address2: "",
    postal_code: "",
    city: "",
    country: "France",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);

  const [verificationStep, setVerificationStep] =
    useState(false);

  const [verificationCode, setVerificationCode] =
    useState("");

  const [registeredEmail, setRegisteredEmail] =
    useState("");

    const [registeredPassword, setRegisteredPassword] =
  useState("");

  const [verifying, setVerifying] =
    useState(false);

  const [resending, setResending] =
    useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (loading) return;

    if (
      form.password !==
      form.confirmPassword
    ) {
      toast.error(
        "Les mots de passe ne correspondent pas."
      );

      return;
    }

    if (form.password.length < 8) {
      toast.error(
        "Le mot de passe doit contenir au moins 8 caractères."
      );

      return;
    }

    try {
      setLoading(true);

      const cleanedEmail =
        form.email
          .trim()
          .toLowerCase();

      await signUp({
        email: cleanedEmail,
        password: form.password,

        first_name:
          form.first_name.trim(),

        last_name:
          form.last_name.trim(),

        company:
          form.company.trim(),

        phone:
          form.phone.trim(),

        address:
          form.address.trim(),

        address2:
          form.address2.trim(),

        postal_code:
          form.postal_code.trim(),

        city:
          form.city.trim(),

        country:
          form.country.trim(),
      });

      setRegisteredEmail(
  cleanedEmail
);

setRegisteredPassword(
  form.password
);

setVerificationCode("");

setVerificationStep(true);

      toast.success(
        "Un code de confirmation vient de vous être envoyé par e-mail."
      );
    } catch (error) {
      console.error(
        "Erreur création compte :",
        error
      );

      toast.error(
        error?.message ||
          "Impossible de créer le compte."
      );
    } finally {
      setLoading(false);
    }
  };

 const handleVerifyCode =
  async (event) => {
    event.preventDefault();

    if (verifying) return;

    const code =
      verificationCode
        .replace(/\D/g, "")
        .trim();

    if (code.length !== 6) {
      toast.error(
        "Veuillez saisir le code à 6 chiffres."
      );
      return;
    }

    if (!registeredEmail) {
      toast.error(
        "Adresse e-mail introuvable. Veuillez recommencer l'inscription."
      );
      return;
    }

    try {
      setVerifying(true);

      /*
       * 1. Vérification du code reçu par e-mail.
       * Supabase confirme l'adresse si le code est valide.
       */
      const {
        data: verificationData,
        error: verificationError,
      } = await supabase.auth.verifyOtp({
        email: registeredEmail,
        token: code,
        type: "signup",
      });

      if (verificationError) {
        throw verificationError;
      }

      console.log(
        "E-mail confirmé :",
        verificationData?.user?.email
      );

      /*
       * 2. Si verifyOtp nous donne déjà une session,
       * aucune deuxième connexion n'est nécessaire.
       */
      if (verificationData?.session) {
        setRegisteredPassword("");

        toast.success(
          "Adresse e-mail confirmée. Bienvenue chez QEH OUTLET !"
        );

        navigate(
          "/mon-compte",
          {
            replace: true,
          }
        );

        return;
      }

      /*
       * 3. Solution de secours :
       * si aucune session n'est renvoyée après l'OTP,
       * connexion avec les identifiants créés juste avant.
       */
      if (!registeredPassword) {
        toast.success(
          "Adresse e-mail confirmée ! Vous pouvez maintenant vous connecter."
        );

        navigate(
          "/connexion",
          {
            replace: true,
          }
        );

        return;
      }

      const {
        data: signInData,
        error: signInError,
      } =
        await supabase.auth.signInWithPassword({
          email: registeredEmail,
          password: registeredPassword,
        });

      if (signInError) {
        throw signInError;
      }

      if (
        !signInData?.user ||
        !signInData?.session
      ) {
        throw new Error(
          "L'adresse e-mail est confirmée mais la connexion n'a pas pu être établie."
        );
      }

      setRegisteredPassword("");

      toast.success(
        "Adresse e-mail confirmée. Bienvenue chez QEH OUTLET !"
      );

      navigate(
        "/mon-compte",
        {
          replace: true,
        }
      );
    } catch (error) {
      console.error(
        "Erreur vérification OTP :",
        error
      );

      const message =
        String(
          error?.message || ""
        ).toLowerCase();

      if (
        message.includes("expired") ||
        message.includes("otp_expired")
      ) {
        toast.error(
          "Ce code a expiré. Cliquez sur « Renvoyer le code »."
        );
      } else if (
        message.includes("invalid") ||
        message.includes("token")
      ) {
        toast.error(
          "Le code saisi est incorrect."
        );
      } else {
        toast.error(
          error?.message ||
            "Impossible de confirmer votre adresse e-mail."
        );
      }
    } finally {
      setVerifying(false);
    }
  };

  const handleResendCode =
    async () => {
      if (resending) return;

      if (!registeredEmail) {
        toast.error(
          "Adresse e-mail introuvable."
        );

        return;
      }

      try {
        setResending(true);

        const { error } =
          await supabase.auth.resend({
            type: "signup",
            email:
              registeredEmail,
          });

        if (error) {
          throw error;
        }

        toast.success(
          "Un nouveau code vient de vous être envoyé."
        );
      } catch (error) {
        console.error(
          "Erreur renvoi OTP :",
          error
        );

        toast.error(
          error?.message ||
            "Impossible de renvoyer le code."
        );
      } finally {
        setResending(false);
      }
    };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#020814] via-[#071a35] to-[#0b5ca8]">
      <div className="max-w-7xl mx-auto min-h-screen grid lg:grid-cols-2">

        {/* COLONNE GAUCHE */}
        <div className="hidden lg:flex flex-col justify-center px-16 text-white relative overflow-hidden">

          <div className="absolute -left-20 -top-20 w-80 h-80 rounded-full bg-[#ff5a00]/20 blur-3xl" />

          <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full bg-[#0b5ca8]/30 blur-3xl" />

          <img
            src="/images/qeh-outlet-logo.jpg"
            alt="QEH OUTLET"
            className="w-64 mb-10"
          />

          <p className="uppercase tracking-[0.35em] text-[#ff5a00] font-black text-xs">
            QEH OUTLET
          </p>

          <h1 className="text-6xl font-black leading-tight mt-6">
            Créez votre
            <br />
            espace client
          </h1>

          <p className="mt-8 text-white/70 text-xl leading-relaxed">
            Suivez vos commandes,
            <br />
            téléchargez vos factures,
            <br />
            retrouvez vos devis
            <br />
            et bénéficiez d&apos;un
            espace client sécurisé.
          </p>

          <div className="space-y-7 mt-16">

            <div className="flex items-center gap-5">
              <div className="w-14 h-14 rounded-2xl bg-[#ff5a00] flex items-center justify-center">
                <ShieldCheck className="w-7 h-7" />
              </div>

              <div>
                <div className="font-black">
                  Paiement sécurisé
                </div>

                <div className="text-white/60">
                  Protection Stripe
                </div>
              </div>
            </div>

            <div className="flex items-center gap-5">
              <div className="w-14 h-14 rounded-2xl bg-[#ff5a00] flex items-center justify-center">
                <Truck className="w-7 h-7" />
              </div>

              <div>
                <div className="font-black">
                  Livraison suivie
                </div>

                <div className="text-white/60">
                  Suivi de vos commandes
                </div>
              </div>
            </div>

            <div className="flex items-center gap-5">
              <div className="w-14 h-14 rounded-2xl bg-[#ff5a00] flex items-center justify-center">
                <BadgeEuro className="w-7 h-7" />
              </div>

              <div>
                <div className="font-black">
                  Prix Outlet
                </div>

                <div className="text-white/60">
                  Les meilleures offres
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* COLONNE DROITE */}
        <div className="flex items-center justify-center p-5 sm:p-8">

          <div className="w-full max-w-xl rounded-[36px] bg-white shadow-2xl p-7 sm:p-10">

            {verificationStep ? (

              /* =========================
                 VERIFICATION DU CODE
                 ========================= */

              <div className="text-center">

                <div className="w-20 h-20 mx-auto rounded-full bg-[#0b5ca8]/10 flex items-center justify-center">
                  <Mail className="w-10 h-10 text-[#0b5ca8]" />
                </div>

                <p className="uppercase tracking-[0.30em] text-xs font-black text-[#ff5a00] mt-8">
                  Vérification
                </p>

                <h2 className="text-4xl font-black mt-4">
                  Confirmez votre e-mail
                </h2>

                <p className="text-slate-500 mt-4 leading-relaxed">
                  Un code de confirmation
                  à 6 chiffres a été envoyé à :
                </p>

                <p className="font-black text-[#0b5ca8] mt-3 break-all">
                  {registeredEmail}
                </p>

                <form
                  onSubmit={
                    handleVerifyCode
                  }
                  className="mt-10"
                >

                  <input
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    autoFocus
                    maxLength={6}
                    value={
                      verificationCode
                    }
                    onChange={(
                      event
                    ) => {
                      const value =
                        event.target.value
                          .replace(
                            /\D/g,
                            ""
                          )
                          .slice(
                            0,
                            6
                          );

                      setVerificationCode(
                        value
                      );
                    }}
                    placeholder="000000"
                    className="w-full h-20 rounded-2xl border-2 border-slate-300 text-center text-3xl font-black tracking-[0.45em] focus:outline-none focus:ring-2 focus:ring-[#ff5a00] focus:border-transparent"
                  />

                  <button
                    type="submit"
                    disabled={
                      verifying ||
                      verificationCode.length !==
                        6
                    }
                    className="w-full h-14 mt-6 rounded-2xl bg-[#ff5a00] hover:bg-[#ff6f22] disabled:opacity-50 disabled:cursor-not-allowed text-white font-black flex items-center justify-center gap-3 transition-all"
                  >

                    <ShieldCheck className="w-5 h-5" />

                    {verifying
                      ? "Vérification..."
                      : "Confirmer mon adresse"}

                    <ArrowRight className="w-5 h-5" />

                  </button>

                </form>

                <div className="border-t border-slate-200 mt-8 pt-8">

                  <p className="text-sm text-slate-500">
                    Vous n&apos;avez
                    pas reçu le code ?
                  </p>

                  <button
                    type="button"
                    disabled={
                      resending
                    }
                    onClick={
                      handleResendCode
                    }
                    className="mt-3 font-black text-[#0b5ca8] hover:text-[#ff5a00] disabled:opacity-50"
                  >
                    {resending
                      ? "Envoi en cours..."
                      : "Renvoyer le code"}
                  </button>

                </div>

              </div>

            ) : (

              /* =========================
                 FORMULAIRE INSCRIPTION
                 ========================= */

              <div>

                <p className="uppercase tracking-[0.30em] text-xs font-black text-[#ff5a00]">
                  Créer un compte
                </p>

                <h2 className="text-4xl font-black mt-4">
                  Bienvenue chez
                  <br />
                  QEH OUTLET
                </h2>

                <p className="text-slate-500 mt-4">
                  Complétez les informations
                  ci-dessous pour créer votre
                  espace client.
                </p>

                <form
                  onSubmit={
                    handleSubmit
                  }
                  className="space-y-6 mt-10"
                >

                  {/* PRENOM / NOM */}
                  <div className="grid md:grid-cols-2 gap-5">

                    <div>
                      <label className="block text-sm font-bold mb-2">
                        Prénom
                      </label>

                      <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#0b5ca8]" />

                        <input
                          name="first_name"
                          required
                          value={
                            form.first_name
                          }
                          onChange={
                            handleChange
                          }
                          placeholder="Votre prénom"
                          autoComplete="given-name"
                          className="w-full h-14 rounded-2xl border border-slate-300 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-[#ff5a00]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-bold mb-2">
                        Nom
                      </label>

                      <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#0b5ca8]" />

                        <input
                          name="last_name"
                          required
                          value={
                            form.last_name
                          }
                          onChange={
                            handleChange
                          }
                          placeholder="Votre nom"
                          autoComplete="family-name"
                          className="w-full h-14 rounded-2xl border border-slate-300 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-[#ff5a00]"
                        />
                      </div>
                    </div>

                  </div>

                  {/* SOCIETE / TELEPHONE */}
                  <div className="grid md:grid-cols-2 gap-5">

                    <div>
                      <label className="block text-sm font-bold mb-2">
                        Société
                      </label>

                      <input
                        name="company"
                        value={
                          form.company
                        }
                        onChange={
                          handleChange
                        }
                        placeholder="Votre société"
                        autoComplete="organization"
                        className="w-full h-14 rounded-2xl border border-slate-300 px-4 focus:outline-none focus:ring-2 focus:ring-[#ff5a00]"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold mb-2">
                        Téléphone
                      </label>

                      <input
                        type="tel"
                        name="phone"
                        required
                        value={
                          form.phone
                        }
                        onChange={
                          handleChange
                        }
                        placeholder="06 00 00 00 00"
                        autoComplete="tel"
                        className="w-full h-14 rounded-2xl border border-slate-300 px-4 focus:outline-none focus:ring-2 focus:ring-[#ff5a00]"
                      />
                    </div>

                  </div>

                  {/* ADRESSE */}
                  <div>
                    <label className="block text-sm font-bold mb-2">
                      Adresse
                    </label>

                    <input
                      name="address"
                      required
                      value={
                        form.address
                      }
                      onChange={
                        handleChange
                      }
                      placeholder="Numéro et nom de rue"
                      autoComplete="street-address"
                      className="w-full h-14 rounded-2xl border border-slate-300 px-4 focus:outline-none focus:ring-2 focus:ring-[#ff5a00]"
                    />
                  </div>

                  {/* COMPLEMENT */}
                  <div>
                    <label className="block text-sm font-bold mb-2">
                      Complément d&apos;adresse
                    </label>

                    <input
                      name="address2"
                      value={
                        form.address2
                      }
                      onChange={
                        handleChange
                      }
                      placeholder="Bâtiment, étage..."
                      className="w-full h-14 rounded-2xl border border-slate-300 px-4 focus:outline-none focus:ring-2 focus:ring-[#ff5a00]"
                    />
                  </div>

                  {/* CP / VILLE / PAYS */}
                  <div className="grid md:grid-cols-3 gap-5">

                    <div>
                      <label className="block text-sm font-bold mb-2">
                        Code postal
                      </label>

                      <input
                        name="postal_code"
                        required
                        value={
                          form.postal_code
                        }
                        onChange={
                          handleChange
                        }
                        placeholder="75001"
                        autoComplete="postal-code"
                        className="w-full h-14 rounded-2xl border border-slate-300 px-4 focus:outline-none focus:ring-2 focus:ring-[#ff5a00]"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold mb-2">
                        Ville
                      </label>

                      <input
                        name="city"
                        required
                        value={
                          form.city
                        }
                        onChange={
                          handleChange
                        }
                        placeholder="Paris"
                        autoComplete="address-level2"
                        className="w-full h-14 rounded-2xl border border-slate-300 px-4 focus:outline-none focus:ring-2 focus:ring-[#ff5a00]"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold mb-2">
                        Pays
                      </label>

                      <input
                        name="country"
                        required
                        value={
                          form.country
                        }
                        onChange={
                          handleChange
                        }
                        autoComplete="country-name"
                        className="w-full h-14 rounded-2xl border border-slate-300 px-4 focus:outline-none focus:ring-2 focus:ring-[#ff5a00]"
                      />
                    </div>

                  </div>

                  {/* EMAIL */}
                  <div>
                    <label className="block text-sm font-bold mb-2">
                      Adresse e-mail
                    </label>

                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#0b5ca8]" />

                      <input
                        type="email"
                        name="email"
                        required
                        value={
                          form.email
                        }
                        onChange={
                          handleChange
                        }
                        placeholder="exemple@email.fr"
                        autoComplete="email"
                        className="w-full h-14 rounded-2xl border border-slate-300 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-[#ff5a00]"
                      />
                    </div>
                  </div>

                  {/* PASSWORD */}
                  <div>
                    <label className="block text-sm font-bold mb-2">
                      Mot de passe
                    </label>

                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#0b5ca8]" />

                      <input
                        type="password"
                        name="password"
                        required
                        minLength={8}
                        value={
                          form.password
                        }
                        onChange={
                          handleChange
                        }
                        placeholder="Minimum 8 caractères"
                        autoComplete="new-password"
                        className="w-full h-14 rounded-2xl border border-slate-300 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-[#ff5a00]"
                      />
                    </div>
                  </div>

                  {/* CONFIRM PASSWORD */}
                  <div>
                    <label className="block text-sm font-bold mb-2">
                      Confirmer le mot de passe
                    </label>

                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#0b5ca8]" />

                      <input
                        type="password"
                        name="confirmPassword"
                        required
                        minLength={8}
                        value={
                          form.confirmPassword
                        }
                        onChange={
                          handleChange
                        }
                        placeholder="Retapez votre mot de passe"
                        autoComplete="new-password"
                        className="w-full h-14 rounded-2xl border border-slate-300 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-[#ff5a00]"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={
                      loading
                    }
                    className="w-full h-14 rounded-2xl bg-[#ff5a00] hover:bg-[#ff6f22] disabled:opacity-50 text-white font-black flex items-center justify-center gap-3 shadow-xl transition-all"
                  >
                    <UserPlus className="w-5 h-5" />

                    {loading
                      ? "Création du compte..."
                      : "Créer mon compte"}

                    <ArrowRight className="w-5 h-5" />
                  </button>

                </form>

                <div className="border-t border-slate-200 pt-8 mt-8">

                  <p className="text-center text-slate-500">
                    Déjà client ?
                  </p>

                  <Link
                    to="/connexion"
                    className="w-full mt-5 h-14 rounded-2xl border-2 border-[#0b5ca8] text-[#0b5ca8] hover:bg-[#0b5ca8] hover:text-white font-black flex items-center justify-center gap-3 transition-all"
                  >
                    Se connecter

                    <ArrowRight className="w-5 h-5" />
                  </Link>

                </div>

                <p className="text-xs text-center text-slate-400 leading-relaxed mt-8">
                  En créant votre compte,
                  vous acceptez les Conditions
                  Générales d&apos;Utilisation
                  et la Politique de Confidentialité
                  de QEH OUTLET.
                </p>

              </div>

            )}

          </div>
        </div>

      </div>
    </div>
  );
}