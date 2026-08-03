import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  Building2,
  ChevronRight,
  FileText,
  Globe2,
  Heart,
  LoaderCircle,
  LogOut,
  MapPin,
  PackageSearch,
  Phone,
  Save,
  ShieldCheck,
  User,
} from "lucide-react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import { toast } from "sonner";

import {
  useCustomerAuth,
} from "../context/CustomerAuthContext";

const INITIAL_FORM = {
  first_name: "",
  last_name: "",
  company: "",
  phone: "",
  address: "",
  address2: "",
  postal_code: "",
  city: "",
  country: "France",
};

export default function CustomerAccount() {
  const navigate =
    useNavigate();

  const personalSectionRef =
    useRef(null);

  const addressSectionRef =
    useRef(null);

  const {
    user,
    profile,
    updateProfile,
    signOut,
    loading,
    hasCompleteShippingAddress,
  } = useCustomerAuth();

  const [
    form,
    setForm,
  ] = useState(INITIAL_FORM);

  const [
    saving,
    setSaving,
  ] = useState(false);

  const [
    loggingOut,
    setLoggingOut,
  ] = useState(false);

  useEffect(() => {
    document.title =
      "Mon compte | QEH OUTLET";
  }, []);

  useEffect(() => {
    if (loading) {
      return;
    }

    if (!user) {
      navigate(
        "/connexion",
        {
          replace: true,
        }
      );
    }
  }, [
    loading,
    user,
    navigate,
  ]);

  useEffect(() => {
    if (!profile) {
      return;
    }

    setForm({
      first_name:
        profile.first_name ||
        "",

      last_name:
        profile.last_name ||
        "",

      company:
        profile.company ||
        "",

      phone:
        profile.phone ||
        "",

      address:
        profile.address ||
        "",

      address2:
        profile.address2 ||
        "",

      postal_code:
        profile.postal_code ||
        "",

      city:
        profile.city ||
        "",

      country:
        profile.country ||
        "France",
    });
  }, [profile]);

  const customerName =
    useMemo(() => {
      const completeName = [
        profile?.first_name,
        profile?.last_name,
      ]
        .filter(Boolean)
        .join(" ")
        .trim();

      if (completeName) {
        return completeName;
      }

      return (
        user?.email ||
        "Client QEH OUTLET"
      );
    }, [
      profile,
      user,
    ]);

  const handleChange =
    (event) => {
      const {
        name,
        value,
      } = event.target;

      setForm(
        (currentForm) => ({
          ...currentForm,
          [name]: value,
        })
      );
    };

  const scrollToSection =
    (sectionRef) => {
      sectionRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    };

  const handleSubmit =
    async (event) => {
      event.preventDefault();

      if (saving) {
        return;
      }

      if (
        !form.first_name.trim() ||
        !form.last_name.trim()
      ) {
        toast.error(
          "Le prénom et le nom sont obligatoires."
        );

        scrollToSection(
          personalSectionRef
        );

        return;
      }

      try {
        setSaving(true);

        await updateProfile(
          form
        );

        toast.success(
          "Vos informations ont été enregistrées."
        );
      } catch (error) {
        console.error(
          "Erreur lors de l’enregistrement du profil :",
          error
        );

        toast.error(
          error?.message ||
            "Impossible d’enregistrer vos informations."
        );
      } finally {
        setSaving(false);
      }
    };

  const handleLogout =
    async () => {
      if (loggingOut) {
        return;
      }

      try {
        setLoggingOut(true);

        await signOut();

        toast.success(
          "Vous êtes déconnecté."
        );

        navigate(
          "/",
          {
            replace: true,
          }
        );
      } catch (error) {
        console.error(
          "Erreur lors de la déconnexion :",
          error
        );

        toast.error(
          error?.message ||
            "Impossible de vous déconnecter."
        );
      } finally {
        setLoggingOut(false);
      }
    };

  if (loading) {
    return (
      <div className="min-h-[70vh] bg-slate-50 grid place-items-center px-5">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto rounded-3xl bg-[#020714] text-[#55a8ff] grid place-items-center">
            <LoaderCircle className="w-8 h-8 animate-spin" />
          </div>

          <h1 className="font-display font-black text-2xl text-slate-950 mt-5">
            Chargement de votre espace
          </h1>

          <p className="text-sm text-slate-500 mt-2">
            QEH OUTLET prépare vos informations.
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div
      data-testid="customer-account-page"
      className="min-h-screen bg-slate-50"
    >
      <section className="relative overflow-hidden bg-[#020714]">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-48 -left-40 w-[480px] h-[480px] rounded-full bg-[#0b5ca8]/25 blur-3xl" />

          <div className="absolute -bottom-52 -right-36 w-[500px] h-[500px] rounded-full bg-[#ff5a00]/15 blur-3xl" />

          <div className="absolute inset-0 bg-[linear-gradient(rgba(11,92,168,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(11,92,168,0.08)_1px,transparent_1px)] bg-[size:48px_48px]" />
        </div>

        <div className="relative max-w-7xl mx-auto px-5 sm:px-8 py-14 sm:py-20">
          <p className="text-xs font-black uppercase tracking-[0.25em] text-[#ff5a00]">
            Espace client QEH OUTLET
          </p>

          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8 mt-4">
            <div>
              <h1 className="font-display font-black text-4xl sm:text-5xl lg:text-6xl text-white tracking-tight">
                Bonjour,
                <br />

                <span className="text-[#55a8ff]">
                  {customerName}
                </span>
              </h1>

              <p className="max-w-2xl text-white/60 leading-relaxed mt-5">
                Gérez vos coordonnées, votre adresse de livraison
                et les informations nécessaires à vos commandes.
              </p>
            </div>

            <div
              className={`inline-flex items-center gap-3 min-h-12 px-5 rounded-2xl border font-bold ${
                hasCompleteShippingAddress
                  ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-300"
                  : "border-[#ff5a00]/40 bg-[#ff5a00]/10 text-[#ff9a63]"
              }`}
            >
              {hasCompleteShippingAddress ? (
                <ShieldCheck className="w-5 h-5" />
              ) : (
                <MapPin className="w-5 h-5" />
              )}

              {hasCompleteShippingAddress
                ? "Compte prêt pour commander"
                : "Adresse de livraison à compléter"}
            </div>
          </div>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-5 sm:px-8 py-10 sm:py-14">
        <section className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <Link
            to="/suivi-commande"
            className="group rounded-3xl border border-slate-200 bg-white p-6 shadow-sm hover:-translate-y-1 hover:border-[#0b5ca8]/40 hover:shadow-[0_20px_50px_rgba(2,7,20,0.10)] transition-all duration-300"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="w-13 h-13 rounded-2xl bg-[#0b5ca8]/10 text-[#0b5ca8] grid place-items-center">
                <PackageSearch className="w-6 h-6" />
              </div>

              <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-[#ff5a00] group-hover:translate-x-1 transition-all" />
            </div>

            <h2 className="font-display font-black text-xl text-slate-950 mt-6">
              Mes commandes
            </h2>

            <p className="text-sm text-slate-500 leading-relaxed mt-2">
              Retrouvez le suivi et le statut de vos commandes.
            </p>
          </Link>

          <Link
            to="/favoris"
            className="group rounded-3xl border border-slate-200 bg-white p-6 shadow-sm hover:-translate-y-1 hover:border-[#0b5ca8]/40 hover:shadow-[0_20px_50px_rgba(2,7,20,0.10)] transition-all duration-300"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="w-13 h-13 rounded-2xl bg-[#ff5a00]/10 text-[#ff5a00] grid place-items-center">
                <Heart className="w-6 h-6" />
              </div>

              <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-[#ff5a00] group-hover:translate-x-1 transition-all" />
            </div>

            <h2 className="font-display font-black text-xl text-slate-950 mt-6">
              Mes favoris
            </h2>

            <p className="text-sm text-slate-500 leading-relaxed mt-2">
              Retrouvez les produits que vous avez enregistrés.
            </p>
          </Link>

          <button
            type="button"
            onClick={() =>
              scrollToSection(
                addressSectionRef
              )
            }
            className="group text-left rounded-3xl border border-slate-200 bg-white p-6 shadow-sm hover:-translate-y-1 hover:border-[#0b5ca8]/40 hover:shadow-[0_20px_50px_rgba(2,7,20,0.10)] transition-all duration-300"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="w-13 h-13 rounded-2xl bg-[#0b5ca8]/10 text-[#0b5ca8] grid place-items-center">
                <MapPin className="w-6 h-6" />
              </div>

              <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-[#ff5a00] group-hover:translate-x-1 transition-all" />
            </div>

            <h2 className="font-display font-black text-xl text-slate-950 mt-6">
              Mon adresse
            </h2>

            <p className="text-sm text-slate-500 leading-relaxed mt-2">
              Complétez ou modifiez votre adresse de livraison.
            </p>
          </button>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div className="w-13 h-13 rounded-2xl bg-slate-100 text-slate-500 grid place-items-center">
                <FileText className="w-6 h-6" />
              </div>

              <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-black uppercase tracking-wide text-slate-500">
                Bientôt
              </span>
            </div>

            <h2 className="font-display font-black text-xl text-slate-950 mt-6">
              Mes factures
            </h2>

            <p className="text-sm text-slate-500 leading-relaxed mt-2">
              Vos factures PDF seront prochainement disponibles ici.
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              scrollToSection(
                personalSectionRef
              )
            }
            className="group text-left rounded-3xl border border-slate-200 bg-white p-6 shadow-sm hover:-translate-y-1 hover:border-[#0b5ca8]/40 hover:shadow-[0_20px_50px_rgba(2,7,20,0.10)] transition-all duration-300"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="w-13 h-13 rounded-2xl bg-[#ff5a00]/10 text-[#ff5a00] grid place-items-center">
                <User className="w-6 h-6" />
              </div>

              <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-[#ff5a00] group-hover:translate-x-1 transition-all" />
            </div>

            <h2 className="font-display font-black text-xl text-slate-950 mt-6">
              Mon profil
            </h2>

            <p className="text-sm text-slate-500 leading-relaxed mt-2">
              Mettez à jour vos informations personnelles.
            </p>
          </button>

          <button
            type="button"
            onClick={
              handleLogout
            }
            disabled={
              loggingOut
            }
            className="group text-left rounded-3xl border border-red-200 bg-red-50 p-6 shadow-sm hover:-translate-y-1 hover:bg-red-100 hover:shadow-[0_20px_50px_rgba(127,29,29,0.10)] transition-all duration-300 disabled:opacity-60"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="w-13 h-13 rounded-2xl bg-red-100 text-red-600 grid place-items-center">
                {loggingOut ? (
                  <LoaderCircle className="w-6 h-6 animate-spin" />
                ) : (
                  <LogOut className="w-6 h-6" />
                )}
              </div>

              <ChevronRight className="w-5 h-5 text-red-300 group-hover:text-red-600 group-hover:translate-x-1 transition-all" />
            </div>

            <h2 className="font-display font-black text-xl text-red-700 mt-6">
              Déconnexion
            </h2>

            <p className="text-sm text-red-500 leading-relaxed mt-2">
              Quittez votre espace client en toute sécurité.
            </p>
          </button>
        </section>
                <form
          onSubmit={handleSubmit}
          className="grid xl:grid-cols-[1.3fr_0.7fr] gap-8 mt-10"
        >
          <div className="space-y-8">

            <section
              ref={personalSectionRef}
              className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm"
            >

              <h2 className="font-display font-black text-3xl text-slate-950">
                Informations personnelles
              </h2>

              <p className="text-slate-500 mt-2">
                Ces informations seront utilisées lors de vos commandes.
              </p>

              <div className="grid md:grid-cols-2 gap-6 mt-8">

                <div>

                  <label className="block text-sm font-bold mb-2">
                    Prénom
                  </label>

                  <div className="relative">

                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#0b5ca8]" />

                    <input
                      name="first_name"
                      value={form.first_name}
                      onChange={handleChange}
                      className="w-full h-14 rounded-2xl border border-slate-300 pl-12 pr-4 focus:outline-none focus:border-[#0b5ca8]"
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
                      value={form.last_name}
                      onChange={handleChange}
                      className="w-full h-14 rounded-2xl border border-slate-300 pl-12 pr-4 focus:outline-none focus:border-[#0b5ca8]"
                    />

                  </div>

                </div>

                <div>

                  <label className="block text-sm font-bold mb-2">
                    Société
                  </label>

                  <div className="relative">

                    <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#0b5ca8]" />

                    <input
                      name="company"
                      value={form.company}
                      onChange={handleChange}
                      className="w-full h-14 rounded-2xl border border-slate-300 pl-12 pr-4 focus:outline-none focus:border-[#0b5ca8]"
                    />

                  </div>

                </div>

                <div>

                  <label className="block text-sm font-bold mb-2">
                    Téléphone
                  </label>

                  <div className="relative">

                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#0b5ca8]" />

                    <input
                      name="phone"
                      value={form.phone}
                      onChange={handleChange}
                      className="w-full h-14 rounded-2xl border border-slate-300 pl-12 pr-4 focus:outline-none focus:border-[#0b5ca8]"
                    />

                  </div>

                </div>

              </div>

            </section>

            <section
              ref={addressSectionRef}
              className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm"
            >

              <h2 className="font-display font-black text-3xl text-slate-950">
                Adresse de livraison
              </h2>

              <p className="text-slate-500 mt-2">
                Cette adresse sera proposée automatiquement lors du paiement.
              </p>

              <div className="space-y-6 mt-8">

                <div>

                  <label className="block text-sm font-bold mb-2">
                    Adresse
                  </label>

                  <div className="relative">

                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#0b5ca8]" />

                    <input
                      name="address"
                      value={form.address}
                      onChange={handleChange}
                      className="w-full h-14 rounded-2xl border border-slate-300 pl-12 pr-4 focus:outline-none focus:border-[#0b5ca8]"
                    />

                  </div>

                </div>

                <div>

                  <label className="block text-sm font-bold mb-2">
                    Complément
                  </label>

                  <input
                    name="address2"
                    value={form.address2}
                    onChange={handleChange}
                    className="w-full h-14 rounded-2xl border border-slate-300 px-4 focus:outline-none focus:border-[#0b5ca8]"
                  />

                </div>

                <div className="grid md:grid-cols-3 gap-5">

                  <div>

                    <label className="block text-sm font-bold mb-2">
                      Code postal
                    </label>

                    <input
                      name="postal_code"
                      value={form.postal_code}
                      onChange={handleChange}
                      className="w-full h-14 rounded-2xl border border-slate-300 px-4 focus:outline-none focus:border-[#0b5ca8]"
                    />

                  </div>

                  <div>

                    <label className="block text-sm font-bold mb-2">
                      Ville
                    </label>

                    <input
                      name="city"
                      value={form.city}
                      onChange={handleChange}
                      className="w-full h-14 rounded-2xl border border-slate-300 px-4 focus:outline-none focus:border-[#0b5ca8]"
                    />

                  </div>

                  <div>

                    <label className="block text-sm font-bold mb-2">
                      Pays
                    </label>

                    <div className="relative">

                      <Globe2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#0b5ca8]" />

                      <input
                        name="country"
                        value={form.country}
                        onChange={handleChange}
                        className="w-full h-14 rounded-2xl border border-slate-300 pl-12 pr-4 focus:outline-none focus:border-[#0b5ca8]"
                      />

                    </div>

                  </div>

                </div>

              </div>

            </section>

            </div>
                      <aside className="space-y-8">

            <div className="rounded-[32px] bg-[#020714] text-white p-8 overflow-hidden relative">

              <div className="absolute -right-16 -top-16 w-52 h-52 rounded-full bg-[#0b5ca8]/30 blur-3xl" />

              <div className="absolute -left-20 -bottom-20 w-56 h-56 rounded-full bg-[#ff5a00]/20 blur-3xl" />

              <div className="relative">

                <p className="uppercase tracking-[0.25em] text-xs text-[#ff5a00] font-black">
                  Compte client
                </p>

                <h2 className="font-display font-black text-3xl mt-4">
                  {customerName}
                </h2>

                <p className="text-white/70 mt-3 break-all">
                  {user.email}
                </p>

                <div className="mt-8 space-y-4">

                  <div className="flex justify-between items-center rounded-2xl bg-white/5 px-5 py-4">

                    <span className="text-white/70">
                      Profil
                    </span>

                    <span className="font-bold text-[#55a8ff]">
                      Actif
                    </span>

                  </div>

                  <div className="flex justify-between items-center rounded-2xl bg-white/5 px-5 py-4">

                    <span className="text-white/70">
                      Livraison
                    </span>

                    <span
                      className={`font-bold ${
                        hasCompleteShippingAddress
                          ? "text-emerald-400"
                          : "text-[#ff9a63]"
                      }`}
                    >
                      {hasCompleteShippingAddress
                        ? "Complète"
                        : "À compléter"}
                    </span>

                  </div>

                  <div className="flex justify-between items-center rounded-2xl bg-white/5 px-5 py-4">

                    <span className="text-white/70">
                      Sécurité
                    </span>

                    <span className="font-bold text-emerald-400">
                      Sécurisé
                    </span>

                  </div>

                </div>

              </div>

            </div>

            <div className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm">

              <h3 className="font-display font-black text-2xl">
                Sauvegarde
              </h3>

              <p className="text-slate-500 mt-3 leading-relaxed">
                Toutes les informations enregistrées ici seront
                automatiquement utilisées lors de vos prochaines
                commandes sur QEH OUTLET.
              </p>

              <button
                type="submit"
                disabled={saving}
                className="w-full mt-8 h-14 rounded-2xl bg-[#ff5a00] hover:bg-[#ff6f22] text-white font-black flex items-center justify-center gap-3 transition-all disabled:opacity-60"
              >

                {saving ? (

                  <LoaderCircle className="w-5 h-5 animate-spin" />

                ) : (

                  <Save className="w-5 h-5" />

                )}

                {saving
                  ? "Enregistrement..."
                  : "Enregistrer mes informations"}

              </button>

              <button
                type="button"
                onClick={handleLogout}
                disabled={loggingOut}
                className="w-full mt-4 h-14 rounded-2xl border border-red-300 text-red-600 hover:bg-red-50 font-bold transition-all"
              >

                {loggingOut
                  ? "Déconnexion..."
                  : "Se déconnecter"}

              </button>

            </div>

          </aside>

        </form>

      </main>

    </div>

  );

}