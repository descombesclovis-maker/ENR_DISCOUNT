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

  const handleChange = (event) => {
    setForm((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  };

  const handleSubmit = async (event) => {

    event.preventDefault();

    if (loading) return;

    if (form.password !== form.confirmPassword) {
      toast.error("Les mots de passe ne correspondent pas.");
      return;
    }

    try {

      setLoading(true);

      await signUp({
        email: form.email,
        password: form.password,
        first_name: form.first_name,
        last_name: form.last_name,
      });

      toast.success("Compte créé avec succès.");

      navigate("/connexion");

    } catch (error) {

      toast.error(
        error.message ||
        "Impossible de créer le compte."
      );

    } finally {

      setLoading(false);

    }

  };

  return (

<div className="min-h-screen bg-gradient-to-br from-[#020814] via-[#071a35] to-[#0b5ca8]">

<div className="max-w-7xl mx-auto min-h-screen grid lg:grid-cols-2">

<div className="hidden lg:flex flex-col justify-center px-16 text-white relative overflow-hidden">

<div className="absolute -left-20 -top-20 w-80 h-80 rounded-full bg-[#ff5a00]/20 blur-3xl"/>

<div className="absolute bottom-0 right-0 w-96 h-96 rounded-full bg-[#0b5ca8]/30 blur-3xl"/>

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
espace client

</h1>

<p className="mt-8 text-white/70 text-xl leading-relaxed">

Suivez vos commandes,
téléchargez vos factures,
retrouvez vos devis
et bénéficiez d'un espace
client sécurisé.

</p>

<div className="space-y-7 mt-16">

<div className="flex items-center gap-5">

<div className="w-14 h-14 rounded-2xl bg-[#ff5a00] flex items-center justify-center">

<ShieldCheck className="w-7 h-7"/>

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

<Truck className="w-7 h-7"/>

</div>

<div>

<div className="font-black">

Livraison rapide

</div>

<div className="text-white/60">

Suivi en temps réel

</div>

</div>

</div>

<div className="flex items-center gap-5">

<div className="w-14 h-14 rounded-2xl bg-[#ff5a00] flex items-center justify-center">

<BadgeEuro className="w-7 h-7"/>

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

<div className="flex items-center justify-center p-8">

<div className="w-full max-w-xl rounded-[36px] bg-white shadow-2xl p-10">

<p className="uppercase tracking-[0.30em] text-xs font-black text-[#ff5a00]">

Créer un compte

</p>

<h2 className="text-4xl font-black mt-4">

Bienvenue chez
QEH OUTLET

</h2>

<p className="text-slate-500 mt-4">

Complétez les informations ci-dessous
pour créer votre espace client.

</p>

<form
onSubmit={handleSubmit}
className="space-y-6 mt-10">


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
        value={form.first_name}
        onChange={handleChange}
        placeholder="Votre prénom"
        className="w-full h-14 rounded-2xl border border-slate-300 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-[#ff5a00] focus:border-transparent transition-all"
      />

    </div>

  </div>

  <div>

    <label className="block text-sm font-bold mb-2">
      Nom
    </label>
    <div className="grid md:grid-cols-2 gap-5">

  <div>

    <label className="block text-sm font-bold mb-2">
      Société
    </label>

    <input
      name="company"
      value={form.company}
      onChange={handleChange}
      className="w-full h-14 rounded-2xl border border-slate-300 px-4"
    />

  </div>

  <div>

    <label className="block text-sm font-bold mb-2">
      Téléphone
    </label>

    <input
      name="phone"
      value={form.phone}
      onChange={handleChange}
      className="w-full h-14 rounded-2xl border border-slate-300 px-4"
    />

  </div>

</div>

<div>

  <label className="block text-sm font-bold mb-2">
    Adresse
  </label>

  <input
    name="address"
    value={form.address}
    onChange={handleChange}
    className="w-full h-14 rounded-2xl border border-slate-300 px-4"
  />

</div>

<div>

  <label className="block text-sm font-bold mb-2">
    Complément d'adresse
  </label>

  <input
    name="address2"
    value={form.address2}
    onChange={handleChange}
    className="w-full h-14 rounded-2xl border border-slate-300 px-4"
  />

</div>

<div className="grid md:grid-cols-3 gap-5">

  <input
    placeholder="Code postal"
    name="postal_code"
    value={form.postal_code}
    onChange={handleChange}
    className="h-14 rounded-2xl border border-slate-300 px-4"
  />

  <input
    placeholder="Ville"
    name="city"
    value={form.city}
    onChange={handleChange}
    className="h-14 rounded-2xl border border-slate-300 px-4"
  />

  <input
    placeholder="Pays"
    name="country"
    value={form.country}
    onChange={handleChange}
    className="h-14 rounded-2xl border border-slate-300 px-4"
  />

</div>
    <div className="relative">

      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#0b5ca8]" />

      <input
        name="last_name"
        required
        value={form.last_name}
        onChange={handleChange}
        placeholder="Votre nom"
        className="w-full h-14 rounded-2xl border border-slate-300 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-[#ff5a00] focus:border-transparent transition-all"
      />

    </div>

  </div>

</div>

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
      value={form.email}
      onChange={handleChange}
      placeholder="exemple@email.fr"
      className="w-full h-14 rounded-2xl border border-slate-300 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-[#ff5a00] focus:border-transparent transition-all"
    />

  </div>

</div>

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
      value={form.password}
      onChange={handleChange}
      placeholder="Minimum 8 caractères"
      className="w-full h-14 rounded-2xl border border-slate-300 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-[#ff5a00] focus:border-transparent transition-all"
    />

  </div>

</div>

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
      value={form.confirmPassword}
      onChange={handleChange}
      placeholder="Retapez votre mot de passe"
      className="w-full h-14 rounded-2xl border border-slate-300 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-[#ff5a00] focus:border-transparent transition-all"
    />

  </div>

</div>

<button
  type="submit"
  disabled={loading}
  className="w-full h-14 rounded-2xl bg-[#ff5a00] hover:bg-[#ff6f22] text-white font-black flex items-center justify-center gap-3 shadow-xl transition-all duration-300"
>

  <UserPlus className="w-5 h-5"/>

  {loading
    ? "Création du compte..."
    : "Créer mon compte"}

  <ArrowRight className="w-5 h-5"/>

</button>

</form>

<div className="border-t border-slate-200 pt-8 mt-8">

  <p className="text-center text-slate-500">

    Déjà client ?

  </p>

  <Link
    to="/connexion"
    className="w-full mt-5 h-14 rounded-2xl border-2 border-[#0b5ca8] text-[#0b5ca8] hover:bg-[#0b5ca8] hover:text-white font-black flex items-center justify-center gap-3 transition-all duration-300"
  >

    Se connecter

    <ArrowRight className="w-5 h-5"/>

  </Link>

</div>

<p className="text-xs text-center text-slate-400 leading-relaxed mt-8">

En créant votre compte, vous acceptez
les Conditions Générales d'Utilisation
et la Politique de Confidentialité
de QEH OUTLET.

</p>

</div>

</div>

</div>

</div>

);
}