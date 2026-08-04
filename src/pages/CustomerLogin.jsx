import React, {
  useState,
} from "react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import {
  Mail,
  Lock,
  ArrowRight,
} from "lucide-react";

import { toast } from "sonner";

import {
  useCustomerAuth,
} from "../context/CustomerAuthContext";

export default function CustomerLogin() {

  const navigate =
    useNavigate();

  const {
    signIn,
    signInWithGoogle,
    signInWithApple,
    signInWithX,
  } = useCustomerAuth();

  const [
    email,
    setEmail,
  ] = useState("");

  const [
    password,
    setPassword,
  ] = useState("");

  const [
    loading,
    setLoading,
  ] = useState(false);

  const handleLogin =
    async (event) => {

      event.preventDefault();

      if (loading) return;

      try {

        setLoading(true);

        await signIn(
          email,
          password
        );

        toast.success(
          "Connexion réussie."
        );

        navigate("/mon-compte");

      } catch (error) {

        toast.error(
          error.message
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

              Bienvenue

            </h1>

            <p className="mt-3 text-gray-500">

              Connectez-vous pour suivre vos commandes,
              enregistrer votre adresse
              et finaliser vos achats.

            </p>

          </div>

          <form
            onSubmit={handleLogin}
            className="px-10 pt-8 pb-10 space-y-5"
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
                  value={email}
                  onChange={(event) =>
                    setEmail(
                      event.target.value
                    )
                  }
                  className="w-full h-14 rounded-2xl border border-gray-300 pl-12 pr-4 focus:outline-none focus:border-[#0b5ca8]"
                />

              </div>

            </div>

            <div>

              <label className="block text-sm font-semibold mb-2">

                Mot de passe

              </label>

              <div className="relative">

                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#0b5ca8]" />

                <input
                  type="password"
                  required
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
                        <div className="flex items-center justify-between">

              <label className="flex items-center gap-2 text-sm">

                <input
                  type="checkbox"
                  className="rounded"
                />

                Rester connecté

              </label>

              <button
                type="button"
                className="text-sm text-[#0b5ca8] hover:underline"
              >
                Mot de passe oublié ?
              </button>

            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-14 rounded-2xl bg-[#ff5a00] hover:bg-[#ff6f22] text-white font-bold flex items-center justify-center gap-3 transition-all duration-300 shadow-lg"
            >

              {loading ? (
                "Connexion..."
              ) : (
                <>
                  Se connecter
                  <ArrowRight className="w-5 h-5"/>
                </>
              )}

            </button>

            <div className="flex items-center gap-4 py-3">

              <div className="flex-1 h-px bg-gray-200"/>

              <span className="text-sm text-gray-400">

                OU

              </span>

              <div className="flex-1 h-px bg-gray-200"/>

            </div>

            <button
              type="button"
              onClick={() =>
                signInWithGoogle()
              }
              className="w-full h-14 rounded-2xl border border-gray-300 hover:border-[#0b5ca8] hover:bg-blue-50 transition-all flex items-center justify-center gap-3 font-semibold"
            >

              <img
                src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                alt="Google"
                className="w-6 h-6"
              />

              Continuer avec Google

            </button>


           
                        <div className="border-t border-gray-200 pt-7 mt-7 text-center">
              <p className="text-sm text-gray-500">
                Vous n’avez pas encore de compte ?
              </p>

              <Link
                to="/inscription"
                className="inline-flex items-center justify-center gap-2 min-h-12 px-7 mt-4 rounded-full border-2 border-[#ff5a00] text-[#ff5a00] font-bold hover:bg-[#ff5a00] hover:text-white transition-colors"
              >
                Créer mon compte

                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <p className="text-xs text-center text-gray-400 leading-relaxed pt-2">
              En vous connectant, vous acceptez les conditions
              d’utilisation et la politique de confidentialité de
              QEH OUTLET.
            </p>
          </form>
        </div>

        <p className="text-center text-sm text-white/55 mt-6">
          Connexion sécurisée à votre espace client QEH OUTLET
        </p>
      </div>
    </div>
  );
}