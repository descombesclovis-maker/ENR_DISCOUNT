import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Eye,
  EyeOff,
  KeyRound,
  LoaderCircle,
  LockKeyhole,
  Mail,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Sun,
  UserRound,
} from "lucide-react";
import { supabase } from "../lib/supabase";

const universes = [
  {
    name: "QEH OUTLET",
    description: "Produits, clients et commandes",
    color: "#ff5a00",
    icon: ShoppingBag,
  },
  {
    name: "QEH ÉNERGIES",
    description: "Consommateurs et carte solaire",
    color: "#69b72d",
    icon: Sun,
  },
  {
    name: "QEH PARTNER",
    description: "Production, matériel et franchises",
    color: "#c99532",
    icon: Sparkles,
  },
];

function getFriendlyError(error) {
  const message = String(error?.message || "").toLowerCase();

  if (message.includes("invalid login credentials")) {
    return "Adresse e-mail ou mot de passe incorrect.";
  }

  if (message.includes("email not confirmed")) {
    return "Cette adresse e-mail n’a pas encore été confirmée.";
  }

  if (message.includes("too many requests")) {
    return "Trop de tentatives. Patientez quelques minutes avant de recommencer.";
  }

  return "Impossible de vous connecter pour le moment. Vérifiez vos informations.";
}

export default function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberEmail, setRememberEmail] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    document.title = "Connexion administration | QEH";

    try {
      const savedEmail = localStorage.getItem("qeh_admin_email");
      if (savedEmail) setEmail(savedEmail);
    } catch {
      // Le formulaire reste utilisable si le stockage local est indisponible.
    }
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();

    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail || !password) {
      setErrorMessage("Renseignez votre adresse e-mail et votre mot de passe.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password,
      });

      if (error) throw error;

      try {
        if (rememberEmail) {
          localStorage.setItem("qeh_admin_email", normalizedEmail);
        } else {
          localStorage.removeItem("qeh_admin_email");
        }
      } catch {
        // La connexion reste valide même si la mémorisation échoue.
      }

      navigate("/admin", { replace: true });
    } catch (error) {
      console.error("Erreur de connexion administrateur :", error);
      setErrorMessage(getFriendlyError(error));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#020711] text-white">
      <style>{`
        @keyframes qehLoginFloat {
          0%, 100% { transform: translate3d(0, 0, 0) scale(1); }
          50% { transform: translate3d(0, -18px, 0) scale(1.04); }
        }

        @keyframes qehLoginShine {
          0% { transform: translateX(-150%) rotate(15deg); opacity: 0; }
          18% { opacity: 0.9; }
          55% { transform: translateX(480%) rotate(15deg); opacity: 0.7; }
          70%, 100% { transform: translateX(480%) rotate(15deg); opacity: 0; }
        }

        .qeh-login-float-a { animation: qehLoginFloat 8s ease-in-out infinite; }
        .qeh-login-float-b { animation: qehLoginFloat 10s ease-in-out infinite reverse; }
        .qeh-login-shine { animation: qehLoginShine 3.6s ease-in-out infinite; }

        @media (prefers-reduced-motion: reduce) {
          .qeh-login-float-a,
          .qeh-login-float-b,
          .qeh-login-shine { animation: none; }
        }
      `}</style>

      <div className="pointer-events-none absolute inset-0">
        <div className="qeh-login-float-a absolute -left-36 -top-36 h-[420px] w-[420px] rounded-full bg-[#17649e]/25 blur-[90px]" />
        <div className="qeh-login-float-b absolute -bottom-44 right-[-80px] h-[440px] w-[440px] rounded-full bg-[#69b72d]/16 blur-[100px]" />
        <div className="absolute left-[42%] top-[18%] h-64 w-64 rounded-full bg-[#c99532]/10 blur-[85px]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(23,100,158,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(23,100,158,0.08)_1px,transparent_1px)] bg-[size:54px_54px] [mask-image:linear-gradient(to_bottom,black,transparent_90%)]" />
      </div>

      <div className="relative mx-auto grid min-h-screen max-w-[1500px] lg:grid-cols-[1.05fr_0.95fr]">
        <motion.section
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.65 }}
          className="hidden flex-col justify-between p-10 lg:flex xl:p-14"
        >
          <Link
            to="/"
            className="inline-flex w-fit items-center gap-2 text-sm font-bold text-slate-400 transition hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Revenir aux sites QEH
          </Link>

          <div className="my-auto max-w-2xl py-12">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-slate-300 backdrop-blur-md">
              <ShieldCheck className="h-4 w-4 text-[#69b72d]" />
              Console sécurisée
            </div>

            <h1 className="mt-7 font-display text-5xl font-black leading-[1.03] xl:text-7xl">
              Trois univers.
              <br />
              <span className="bg-gradient-to-r from-[#ff6a1a] via-[#f2cf79] to-[#82d246] bg-clip-text text-transparent">
                Une seule vision.
              </span>
            </h1>

            <p className="mt-6 max-w-xl text-base leading-relaxed text-slate-300 xl:text-lg">
              Accédez à l’ensemble des activités QEH depuis une administration centrale, claire et entièrement sécurisée.
            </p>

            <div className="mt-10 grid gap-3">
              {universes.map((universe, index) => {
                const Icon = universe.icon;

                return (
                  <motion.div
                    key={universe.name}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.45, delay: 0.25 + index * 0.1 }}
                    className="group flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur-sm transition hover:translate-x-2 hover:bg-white/[0.07]"
                  >
                    <div
                      className="grid h-11 w-11 shrink-0 place-items-center rounded-xl"
                      style={{
                        color: universe.color,
                        backgroundColor: `${universe.color}18`,
                      }}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-display text-sm font-black">
                        {universe.name}
                      </p>
                      <p className="mt-1 text-xs text-slate-400">
                        {universe.description}
                      </p>
                    </div>
                    <span
                      className="h-2 w-2 rounded-full shadow-[0_0_14px_currentColor]"
                      style={{
                        color: universe.color,
                        backgroundColor: universe.color,
                      }}
                    />
                  </motion.div>
                );
              })}
            </div>
          </div>

          <p className="text-xs font-semibold text-slate-500">
            © {new Date().getFullYear()} QEH · Accès strictement réservé
          </p>
        </motion.section>

        <section className="relative flex items-center justify-center px-5 py-10 sm:px-8 lg:px-10">
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.58, delay: 0.08 }}
            className="relative w-full max-w-[520px]"
          >
            <div className="pointer-events-none absolute -inset-px rounded-[33px] bg-gradient-to-br from-[#17649e]/70 via-white/10 to-[#c99532]/65" />

            <div className="relative overflow-hidden rounded-[32px] bg-white p-5 text-[#020711] shadow-[0_35px_110px_rgba(0,0,0,0.45)] sm:p-8 xl:p-10">
              <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#ff5a00] via-[#c99532] via-50% to-[#69b72d]" />

              <div className="flex items-center justify-between gap-4">
                <div className="relative flex h-16 w-[124px] items-center justify-center overflow-hidden rounded-2xl bg-[#020711] shadow-[0_14px_35px_rgba(2,7,17,0.2)]">
                  <span className="absolute inset-x-4 top-3 h-px bg-gradient-to-r from-[#17649e] via-white to-[#69b72d]" />
                  <span className="font-display text-3xl font-black tracking-[0.1em] text-white">
                    QEH
                  </span>
                  <span className="absolute inset-x-4 bottom-3 h-px bg-gradient-to-r from-[#ff5a00] via-[#c99532] to-[#69b72d]" />
                  <span className="qeh-login-shine pointer-events-none absolute inset-y-[-30%] left-[-40%] w-10 bg-gradient-to-r from-transparent via-white/60 to-transparent blur-sm" />
                </div>

                <div className="flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-black text-emerald-700">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_10px_#10b981]" />
                  Sécurisé
                </div>
              </div>

              <div className="mt-8">
                <p className="text-xs font-black uppercase tracking-[0.2em] text-[#17649e]">
                  Administration centrale
                </p>
                <h2 className="mt-3 font-display text-3xl font-black sm:text-4xl">
                  Heureux de vous revoir.
                </h2>
                <p className="mt-3 leading-relaxed text-slate-500">
                  Connectez-vous pour accéder aux trois espaces de gestion QEH.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="mt-8">
                {errorMessage ? (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    role="alert"
                    className="mb-5 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold leading-relaxed text-red-700"
                  >
                    <LockKeyhole className="mt-0.5 h-5 w-5 shrink-0" />
                    {errorMessage}
                  </motion.div>
                ) : null}

                <label className="block">
                  <span className="mb-2 block text-sm font-black text-slate-700">
                    Adresse e-mail
                  </span>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      autoComplete="username"
                      placeholder="administration@qeh.fr"
                      required
                      className="min-h-14 w-full rounded-2xl border border-slate-200 bg-slate-50 pl-12 pr-4 font-semibold outline-none transition focus:border-[#17649e] focus:bg-white focus:ring-4 focus:ring-[#17649e]/10"
                    />
                  </div>
                </label>

                <label className="mt-5 block">
                  <span className="mb-2 block text-sm font-black text-slate-700">
                    Mot de passe
                  </span>
                  <div className="relative">
                    <KeyRound className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      autoComplete="current-password"
                      placeholder="Votre mot de passe"
                      required
                      className="min-h-14 w-full rounded-2xl border border-slate-200 bg-slate-50 pl-12 pr-12 font-semibold outline-none transition focus:border-[#17649e] focus:bg-white focus:ring-4 focus:ring-[#17649e]/10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((current) => !current)}
                      className="absolute right-3 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-xl text-slate-400 transition hover:bg-slate-200 hover:text-slate-700"
                      aria-label={
                        showPassword
                          ? "Masquer le mot de passe"
                          : "Afficher le mot de passe"
                      }
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </label>

                <div className="mt-4 flex items-center justify-between gap-4">
                  <label className="flex cursor-pointer items-center gap-2 text-sm font-semibold text-slate-600">
                    <input
                      type="checkbox"
                      checked={rememberEmail}
                      onChange={(event) => setRememberEmail(event.target.checked)}
                      className="h-4 w-4 rounded accent-[#17649e]"
                    />
                    Mémoriser mon e-mail
                  </label>

                  <span className="text-xs font-bold text-slate-400">
                    Accès administrateur
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="group relative mt-7 inline-flex min-h-14 w-full items-center justify-center gap-3 overflow-hidden rounded-2xl bg-[#020711] px-6 font-black text-white shadow-[0_16px_40px_rgba(2,7,17,0.22)] transition hover:-translate-y-0.5 hover:shadow-[0_20px_48px_rgba(2,7,17,0.3)] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <span className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-[#ff5a00] via-[#c99532] to-[#69b72d] transition-all group-hover:h-full group-hover:opacity-20" />
                  {isSubmitting ? (
                    <LoaderCircle className="relative h-5 w-5 animate-spin" />
                  ) : (
                    <UserRound className="relative h-5 w-5" />
                  )}
                  <span className="relative">
                    {isSubmitting ? "Connexion sécurisée..." : "Se connecter"}
                  </span>
                  {!isSubmitting ? (
                    <ArrowRight className="relative h-5 w-5 transition group-hover:translate-x-1" />
                  ) : null}
                </button>
              </form>

              <div className="mt-6 flex items-start gap-3 rounded-2xl bg-slate-50 p-4 text-xs leading-relaxed text-slate-500">
                <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-[#4f9720]" />
                Cette interface est exclusivement réservée aux administrateurs autorisés de QEH.
              </div>

              <Link
                to="/"
                className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-slate-500 transition hover:text-[#020711] lg:hidden"
              >
                <ArrowLeft className="h-4 w-4" />
                Revenir aux sites QEH
              </Link>
            </div>
          </motion.div>
        </section>
      </div>
    </div>
  );
}