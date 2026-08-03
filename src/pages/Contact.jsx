import React, { useState } from "react";

import {
  Phone,
  Mail,
  MapPin,
  Clock,
  Send,
  MessageCircle,
  Sparkles,
  Clock3,
  ShieldCheck,
} from "lucide-react";

export default function Contact() {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleChange = (e) => {
    setForm((current) => ({
      ...current,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Le formulaire sera connecté
    // directement à ton adresse
    // contact@qeh-outlet.com
    // à l'étape suivante.

    alert(
      "Votre message est prêt à être envoyé."
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-5 sm:px-8 py-16">

      <div className="mb-16 text-center">

        <p className="uppercase tracking-[0.35em] text-primary text-xs font-black">

          QEH OUTLET

        </p>

        <h1 className="font-display font-black text-5xl mt-4">

          Contactez-nous

        </h1>

        <p className="text-muted-foreground mt-5 max-w-2xl mx-auto text-lg">

          Une question concernant un produit,
          un devis ou une commande ?
          Notre équipe vous répond dans
          les meilleurs délais.

        </p>

      </div>

      <main className="max-w-7xl mx-auto px-5 sm:px-8 py-12 sm:py-16">
        <section className="grid md:grid-cols-3 gap-5">
          <article className="group rounded-3xl border border-slate-200 bg-white p-6 sm:p-7 shadow-sm hover:-translate-y-1 hover:border-[#0b5ca8]/40 hover:shadow-[0_20px_50px_rgba(2,7,20,0.10)] transition-all duration-300">
            <div className="w-14 h-14 rounded-2xl bg-[#0b5ca8]/10 text-[#0b5ca8] grid place-items-center group-hover:bg-[#0b5ca8] group-hover:text-white transition-colors">
              <Phone className="w-6 h-6" />
            </div>

            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#ff5a00] mt-6">
              Téléphone
            </p>

           <h2 className="font-display font-black text-xl text-slate-950 mt-2">
  06 15 59 68 46
</h2>

<p className="text-sm text-slate-500 leading-relaxed mt-3">
  Appelez-nous du lundi au vendredi pour toute demande.
</p>
          </article>

          <article className="group rounded-3xl border border-slate-200 bg-white p-6 sm:p-7 shadow-sm hover:-translate-y-1 hover:border-[#0b5ca8]/40 hover:shadow-[0_20px_50px_rgba(2,7,20,0.10)] transition-all duration-300">
            <div className="w-14 h-14 rounded-2xl bg-[#0b5ca8]/10 text-[#0b5ca8] grid place-items-center group-hover:bg-[#0b5ca8] group-hover:text-white transition-colors">
              <Mail className="w-6 h-6" />
            </div>

            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#ff5a00] mt-6">
              E-mail
            </p>
<h2 className="font-display font-black text-xl text-slate-950 mt-2">
  contact@qeh-outlet.com
</h2>

<p className="text-sm text-slate-500 leading-relaxed mt-3">
  Nous répondons généralement sous 24 heures.
</p>
          </article>

          <article className="group rounded-3xl border border-slate-200 bg-white p-6 sm:p-7 shadow-sm hover:-translate-y-1 hover:border-[#0b5ca8]/40 hover:shadow-[0_20px_50px_rgba(2,7,20,0.10)] transition-all duration-300">
            <div className="w-14 h-14 rounded-2xl bg-[#0b5ca8]/10 text-[#0b5ca8] grid place-items-center group-hover:bg-[#0b5ca8] group-hover:text-white transition-colors">
              <MapPin className="w-6 h-6" />
            </div>

            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#ff5a00] mt-6">
              Adresse
            </p>

          <h2 className="font-display font-black text-xl text-slate-950 mt-2">
  5 Rue Basse
  <br />
  21430 Savilly
</h2>

<p className="text-sm text-slate-500 leading-relaxed mt-3">
  Siège de QEH OUTLET.
</p>
          </article>
        </section>

        <section className="grid lg:grid-cols-[1.15fr_0.85fr] gap-8 mt-10">
          <div className="relative overflow-hidden rounded-3xl bg-[#020714] p-7 sm:p-10 text-white shadow-[0_25px_70px_rgba(2,7,20,0.20)]">
            <div className="absolute -top-24 -right-20 w-72 h-72 rounded-full bg-[#0b5ca8]/25 blur-3xl pointer-events-none" />

            <div className="absolute -bottom-24 -left-16 w-64 h-64 rounded-full bg-[#ff5a00]/15 blur-3xl pointer-events-none" />

            <div className="relative">
              <div className="w-14 h-14 rounded-2xl border border-[#0b5ca8]/40 bg-[#0b5ca8]/15 text-[#55a8ff] grid place-items-center">
                <Sparkles className="w-6 h-6" />
              </div>

              <p className="text-xs font-black uppercase tracking-[0.22em] text-[#ff5a00] mt-7">
                Service QEH OUTLET
              </p>

              <h2 className="font-display font-black text-3xl sm:text-4xl tracking-tight mt-3">
                Une équipe disponible pour vous accompagner
              </h2>

              <p className="max-w-2xl text-white/60 leading-relaxed mt-5">
                Besoin d’une information sur l’état d’un produit,
                sa compatibilité, sa disponibilité ou son
                expédition ? Nos coordonnées seront bientôt
                disponibles sur cette page.
              </p>

              <div className="grid sm:grid-cols-2 gap-4 mt-8">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                  <Clock3 className="w-5 h-5 text-[#55a8ff]" />

                  <p className="font-bold mt-4">
                    Réponse rapide
                  </p>

                  <p className="text-sm text-white/50 leading-relaxed mt-2">
                    Nous faisons le nécessaire pour traiter chaque
                    demande dans les meilleurs délais.
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                  <ShieldCheck className="w-5 h-5 text-[#55a8ff]" />

                  <p className="font-bold mt-4">
                    Informations fiables
                  </p>

                  <p className="text-sm text-white/50 leading-relaxed mt-2">
                    Les informations communiquées concernent
                    directement nos produits et nos commandes.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <aside className="rounded-3xl border border-slate-200 bg-white p-7 sm:p-8 shadow-sm">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-[#ff5a00]">
              Avant de nous contacter
            </p>

            <h2 className="font-display font-black text-2xl text-slate-950 mt-3">
              Préparez les informations utiles
            </h2>

            <p className="text-sm text-slate-500 leading-relaxed mt-4">
              Pour obtenir une réponse plus précise, pensez à
              préparer les éléments correspondant à votre demande.
            </p>

            <div className="space-y-4 mt-7">
              <div className="flex items-start gap-4">
                <span className="w-8 h-8 shrink-0 rounded-full bg-[#0b5ca8] text-white text-xs font-black grid place-items-center">
                  1
                </span>

                <div>
                  <p className="font-bold text-slate-950">
                    Demande concernant un produit
                  </p>

                  <p className="text-sm text-slate-500 mt-1">
                    Préparez son nom, sa référence ou son SKU.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <span className="w-8 h-8 shrink-0 rounded-full bg-[#0b5ca8] text-white text-xs font-black grid place-items-center">
                  2
                </span>

                <div>
                  <p className="font-bold text-slate-950">
                    Demande concernant une commande
                  </p>

                  <p className="text-sm text-slate-500 mt-1">
                    Préparez votre numéro de commande ou l’adresse
                    utilisée lors du paiement.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <span className="w-8 h-8 shrink-0 rounded-full bg-[#ff5a00] text-white text-xs font-black grid place-items-center">
                  3
                </span>

                <div>
                  <p className="font-bold text-slate-950">
                    Demande concernant une livraison
                  </p>

                  <p className="text-sm text-slate-500 mt-1">
                    Préparez votre numéro de suivi Colissimo ou
                    Chronopost.
                  </p>
                </div>
              </div>
            </div>
          </aside>
        </section>
      </main>
    </div>
  );
}