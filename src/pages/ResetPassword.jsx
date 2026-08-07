import React, {
  useEffect,
  useState,
} from "react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import {
  Lock,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

import { toast } from "sonner";

import { supabase } from "../lib/supabase";

export default function ResetPassword() {
  const navigate = useNavigate();

  const [
    password,
    setPassword,
  ] = useState("");

  const [
    confirmPassword,
    setConfirmPassword,
  ] = useState("");

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    checkingSession,
    setCheckingSession,
  ] = useState(true);

  const [
    recoverySessionReady,
    setRecoverySessionReady,
  ] = useState(false);

  useEffect(() => {
    let mounted = true;

    const checkRecoverySession =
      async () => {
        try {
          const {
            data,
            error,
          } =
            await supabase.auth
              .getSession();

          if (error) {
            throw error;
          }

          if (!mounted) return;

          setRecoverySessionReady(
            Boolean(data?.session)
          );
        } catch (error) {
          console.error(
            "Erreur session de récupération :",
            error
          );

          if (mounted) {
            setRecoverySessionReady(false);
          }
        } finally {
          if (mounted) {
            setCheckingSession(false);
          }
        }
      };

    checkRecoverySession();

    const {
      data: {
        subscription,
      },
    } =
      supabase.auth
        .onAuthStateChange(
          (event, session) => {
            if (!mounted) return;

            if (
              event ===
                "PASSWORD_RECOVERY" ||
              session
            ) {
              setRecoverySessionReady(
                true
              );

              setCheckingSession(
                false
              );
            }
          }
        );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const handleSubmit =
    async (event) => {
      event.preventDefault();

      if (loading) return;

      if (password.length < 8) {
        toast.error(
          "Le mot de passe doit contenir au moins 8 caractères."
        );
        return;
      }

      if (
        password !==
        confirmPassword
      ) {
        toast.error(
          "Les deux mots de passe ne correspondent pas."
        );
        return;
      }

      try {
        setLoading(true);

        const {
          error,
        } =
          await supabase.auth
            .updateUser({
              password,
            });

        if (error) {
          throw error;
        }

        toast.success(
          "Votre mot de passe a été modifié."
        );

        /*
         * On ferme la session temporaire
         * créée par le lien de récupération.
         */
        await supabase.auth.signOut();

        navigate(
          "/connexion",
          {
            replace: true,
          }
        );
      } catch (error) {
        console.error(
          "Erreur modification mot de passe :",
          error
        );

        toast.error(
          error?.message ||
            "Impossible de modifier votre mot de passe."
        );
      } finally {
        setLoading(false);
      }
    };

  if (checkingSession) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#020814] via-[#071a35] to-[#0b5ca8] flex items-center justify-center px-5">
        <div className="text-white font-semibold">
          Vérification du lien...
        </div>
      </div>
    );
  }

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

            {recoverySessionReady ? (
              <>
                <h1 className="mt-8 text-3xl font-black">
                  Nouveau mot de passe
                </h1>

                <p className="mt-3 text-gray-500">
                  Choisissez votre nouveau
                  mot de passe QEH OUTLET.
                </p>
              </>
            ) : (
              <>
                <h1 className="mt-8 text-3xl font-black">
                  Lien invalide
                </h1>

                <p className="mt-3 text-gray-500">
                  Ce lien de réinitialisation
                  est invalide ou a expiré.
                </p>
              </>
            )}
          </div>

          <div className="px-10 pt-8 pb-10">
            {recoverySessionReady ? (
              <form
                onSubmit={handleSubmit}
                className="space-y-5"
              >
                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Nouveau mot de passe
                  </label>

                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#0b5ca8]" />

                    <input
                      type="password"
                      required
                      minLength={8}
                      autoComplete="new-password"
                      value={password}
                      onChange={(event) =>
                        setPassword(
                          event.target.value
                        )
                      }
                      className="w-full h-14 rounded-2xl border border-gray-300 pl-12 pr-4 focus:outline-none focus:border-[#0b5ca8]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Confirmer le mot de passe
                  </label>

                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#0b5ca8]" />

                    <input
                      type="password"
                      required
                      minLength={8}
                      autoComplete="new-password"
                      value={confirmPassword}
                      onChange={(event) =>
                        setConfirmPassword(
                          event.target.value
                        )
                      }
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
                    "Modification..."
                  ) : (
                    <>
                      Enregistrer le nouveau mot de passe
                      <CheckCircle2 className="w-5 h-5" />
                    </>
                  )}
                </button>
              </form>
            ) : (
              <Link
                to="/mot-de-passe-oublie"
                className="w-full h-14 rounded-2xl bg-[#ff5a00] hover:bg-[#ff6f22] text-white font-bold flex items-center justify-center gap-3 transition-all"
              >
                Demander un nouveau lien

                <ArrowRight className="w-5 h-5" />
              </Link>
            )}

            <div className="border-t border-gray-200 pt-7 mt-7 text-center">
              <Link
                to="/connexion"
                className="text-sm text-[#0b5ca8] font-semibold hover:underline"
              >
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