import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, ArrowLeft, Send } from "lucide-react";
import { toast } from "sonner";

import { supabase } from "../lib/supabase";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (loading) return;

    const cleanedEmail = String(email || "")
      .trim()
      .toLowerCase();

    if (!cleanedEmail) {
      toast.error("Veuillez saisir votre adresse e-mail.");
      return;
    }

    try {
      setLoading(true);

      const { error } =
        await supabase.auth.resetPasswordForEmail(
          cleanedEmail,
          {
            redirectTo:
              `${window.location.origin}/reinitialiser-mot-de-passe`,
          }
        );

      if (error) {
        throw error;
      }

      setSent(true);

      toast.success(
        "E-mail de réinitialisation envoyé."
      );
    } catch (error) {
      console.error(
        "Erreur réinitialisation mot de passe :",
        error
      );

      toast.error(
        error?.message ||
          "Impossible d'envoyer l'e-mail de réinitialisation."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#020814] via-[#071a35] to-[#0b5ca8] flex items-center justify-center px-5 py-12">
      <div className="w-full max-w-md">
        <div className="rounded-[30px] bg-white shadow-2xl overflow-hidden">
          <div className="px-10 pt-10 text-center">
            <img
              src="/images/qeh-outlet-logo.jpg"
              alt="QEH OUTLET"
              className="mx-auto h-20 object-contain"
            />

            <h1 className="mt-8 text-3xl font-black">
              Mot de passe oublié ?
            </h1>

            <p className="mt-3 text-gray-500">
              Saisissez l’adresse e-mail associée à votre
              compte QEH OUTLET.
            </p>
          </div>

          <div className="px-10 pt-8 pb-10">
            {!sent ? (
              <form
                onSubmit={handleSubmit}
                className="space-y-5"
              >
                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Adresse e-mail
                  </label>

                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#0b5ca8]" />

                    <input
                      type="email"
                      required
                      autoComplete="email"
                      value={email}
                      onChange={(event) =>
                        setEmail(event.target.value)
                      }
                      placeholder="votre@email.fr"
                      className="w-full h-14 rounded-2xl border border-gray-300 pl-12 pr-4 focus:outline-none focus:border-[#0b5ca8]"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-14 rounded-2xl bg-[#ff5a00] hover:bg-[#ff6f22] disabled:opacity-60 text-white font-bold flex items-center justify-center gap-3 transition-all duration-300 shadow-lg"
                >
                  {loading ? (
                    "Envoi..."
                  ) : (
                    <>
                      Envoyer le lien
                      <Send className="w-5 h-5" />
                    </>
                  )}
                </button>
              </form>
            ) : (
              <div className="text-center">
                <div className="mx-auto w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                  <Mail className="w-8 h-8 text-green-600" />
                </div>

                <h2 className="mt-5 text-xl font-bold">
                  Vérifiez votre boîte mail
                </h2>

                <p className="mt-3 text-gray-500">
                  Si un compte existe pour
                  <strong> {email}</strong>, vous recevrez
                  un lien permettant de choisir un nouveau
                  mot de passe.
                </p>

                <button
                  type="button"
                  onClick={() => setSent(false)}
                  className="mt-6 text-sm text-[#0b5ca8] hover:underline"
                >
                  Utiliser une autre adresse e-mail
                </button>
              </div>
            )}

            <div className="border-t border-gray-200 pt-7 mt-7 text-center">
              <Link
                to="/connexion"
                className="inline-flex items-center gap-2 text-[#0b5ca8] font-semibold hover:underline"
              >
                <ArrowLeft className="w-4 h-4" />
                Retour à la connexion
              </Link>
            </div>
          </div>
        </div>

        <p className="text-center text-sm text-white/55 mt-6">
          Espace client sécurisé QEH OUTLET
        </p>
      </div>
    </div>
  );
}