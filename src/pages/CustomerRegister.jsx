import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  User,
  Mail,
  Lock,
  UserPlus,
} from "lucide-react";
import { toast } from "sonner";

import { useCustomerAuth } from "../context/CustomerAuthContext";

export default function CustomerRegister() {
  const navigate = useNavigate();

  const { signUp } = useCustomerAuth();

  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [loading, setLoading] =
    useState(false);

  const handleChange = (event) => {
    setForm((current) => ({
      ...current,
      [event.target.name]:
        event.target.value,
    }));
  };

  const handleSubmit = async (
    event
  ) => {
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

    try {
      setLoading(true);

      await signUp({
        email: form.email,
        password: form.password,
        first_name:
          form.first_name,
        last_name:
          form.last_name,
      });

      toast.success(
        "Compte créé avec succès."
      );

      navigate("/connexion");
    } catch (error) {
      console.error(error);

      toast.error(
        error.message ||
          "Impossible de créer le compte."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto px-5 py-16">

      <div className="rounded-3xl border border-border bg-card p-8 shadow-lg">

        <p className="overline text-primary mb-3">
          QEH OUTLET
        </p>

        <h1 className="font-display font-black text-4xl mb-3">
          Créer un compte
        </h1>

        <p className="text-muted-foreground mb-8">
          Créez votre espace client
          pour commander rapidement
          et suivre vos commandes.
        </p>

        <form
          onSubmit={handleSubmit}
          className="space-y-5"
        >

          <div className="grid sm:grid-cols-2 gap-4">

            <div>

              <label className="text-sm font-semibold block mb-2">
                Prénom
              </label>

              <div className="relative">

                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />

                <input
                  name="first_name"
                  required
                  value={
                    form.first_name
                  }
                  onChange={
                    handleChange
                  }
                  className="w-full h-12 rounded-xl border border-border pl-12 pr-4"
                />

              </div>

            </div>

            <div>

              <label className="text-sm font-semibold block mb-2">
                Nom
              </label>

              <div className="relative">

                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />

                <input
                  name="last_name"
                  required
                  value={
                    form.last_name
                  }
                  onChange={
                    handleChange
                  }
                  className="w-full h-12 rounded-xl border border-border pl-12 pr-4"
                />

              </div>

            </div>

          </div>

          <div>

            <label className="text-sm font-semibold block mb-2">
              Adresse e-mail
            </label>

            <div className="relative">

              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />

              <input
                type="email"
                name="email"
                required
                value={form.email}
                onChange={
                  handleChange
                }
                className="w-full h-12 rounded-xl border border-border pl-12 pr-4"
              />

            </div>

          </div>

          <div>

            <label className="text-sm font-semibold block mb-2">
              Mot de passe
            </label>

            <div className="relative">

              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />

              <input
                type="password"
                name="password"
                required
                value={
                  form.password
                }
                onChange={
                  handleChange
                }
                className="w-full h-12 rounded-xl border border-border pl-12 pr-4"
              />

            </div>

          </div>

          <div>

            <label className="text-sm font-semibold block mb-2">
              Confirmation
            </label>

            <div className="relative">

              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />

              <input
                type="password"
                name="confirmPassword"
                required
                value={
                  form.confirmPassword
                }
                onChange={
                  handleChange
                }
                className="w-full h-12 rounded-xl border border-border pl-12 pr-4"
              />

            </div>

          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-12 rounded-xl bg-primary text-primary-foreground font-bold flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors"
          >

            <UserPlus className="w-5 h-5" />

            {loading
              ? "Création..."
              : "Créer mon compte"}

          </button>

        </form>

        <div className="border-t border-border mt-8 pt-8 text-center">

          <p className="text-muted-foreground">

            Déjà client ?

          </p>

          <Link
            to="/connexion"
            className="inline-flex mt-4 h-11 items-center justify-center px-6 rounded-full border border-primary text-primary font-semibold hover:bg-primary hover:text-white transition-colors"
          >
            Se connecter
          </Link>

        </div>

      </div>
    </div>
  );
}