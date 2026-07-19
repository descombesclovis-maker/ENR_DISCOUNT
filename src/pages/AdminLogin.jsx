import React, { useEffect, useState } from "react";
import {
  Navigate,
  useLocation,
  useNavigate,
} from "react-router-dom";
import {
  Eye,
  EyeOff,
  LoaderCircle,
  LockKeyhole,
  Mail,
} from "lucide-react";
import { toast } from "sonner";

import { useAuth } from "../context/AuthContext";

export default function AdminLogin() {
  const navigate = useNavigate();
  const location = useLocation();

  const {
    signIn,
    user,
    isAdmin,
    loading: authLoading,
  } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] =
    useState(false);
  const [submitting, setSubmitting] = useState(false);

  const destination =
    location.state?.from || "/admin";

  useEffect(() => {
    document.title = "Connexion administrateur | ENR Discount";
  }, []);

  if (!authLoading && user && isAdmin) {
    return (
      <Navigate
        to="/admin"
        replace
      />
    );
  }

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!email.trim() || !password) {
      toast.error(
        "Renseigne ton adresse e-mail et ton mot de passe."
      );
      return;
    }

    setSubmitting(true);

    try {
      await signIn(email, password);

      toast.success("Connexion réussie.");

      navigate(destination, {
        replace: true,
      });
    } catch (error) {
      console.error(
        "Erreur de connexion administrateur :",
        error
      );

      let message =
        error?.message ||
        "Impossible de se connecter.";

      if (
        message.toLowerCase().includes(
          "invalid login credentials"
        )
      ) {
        message =
          "Adresse e-mail ou mot de passe incorrect.";
      }

      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main
      className="min-h-screen bg-secondary/30 grid place-items-center px-5 py-12"
      data-testid="admin-login-page"
    >
      <div className="w-full max-w-md">
        <div className="rounded-3xl border border-border bg-card shadow-sm p-7 sm:p-9">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary grid place-items-center mb-6">
            <LockKeyhole className="w-7 h-7" />
          </div>

          <p className="overline text-primary mb-2">
            ENR Discount
          </p>

          <h1 className="font-display font-black text-3xl tracking-tight">
            Administration
          </h1>

          <p className="text-muted-foreground mt-3 mb-8">
            Connecte-toi avec ton compte administrateur.
          </p>

          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >
            <div>
              <label
                htmlFor="admin-email"
                className="block text-sm font-semibold mb-2"
              >
                Adresse e-mail
              </label>

              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />

                <input
                  id="admin-email"
                  type="email"
                  value={email}
                  onChange={(event) =>
                    setEmail(event.target.value)
                  }
                  autoComplete="email"
                  required
                  disabled={submitting}
                  placeholder="admin@exemple.fr"
                  className="w-full h-12 rounded-xl border border-border bg-background pl-11 pr-4 outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
                  data-testid="admin-email"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="admin-password"
                className="block text-sm font-semibold mb-2"
              >
                Mot de passe
              </label>

              <div className="relative">
                <LockKeyhole className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />

                <input
                  id="admin-password"
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  value={password}
                  onChange={(event) =>
                    setPassword(event.target.value)
                  }
                  autoComplete="current-password"
                  required
                  disabled={submitting}
                  className="w-full h-12 rounded-xl border border-border bg-background pl-11 pr-12 outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
                  data-testid="admin-password"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword(
                      (currentValue) =>
                        !currentValue
                    )
                  }
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label={
                    showPassword
                      ? "Masquer le mot de passe"
                      : "Afficher le mot de passe"
                  }
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting || authLoading}
              className="w-full h-12 rounded-full bg-primary text-primary-foreground font-semibold inline-flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              data-testid="admin-login-submit"
            >
              {submitting ? (
                <>
                  <LoaderCircle className="w-5 h-5 animate-spin" />
                  Connexion…
                </>
              ) : (
                "Se connecter"
              )}
            </button>
          </form>

          <a
            href="/"
            className="block text-center text-sm text-muted-foreground hover:text-primary mt-7 transition-colors"
          >
            Retour au site
          </a>
        </div>
      </div>
    </main>
  );
}