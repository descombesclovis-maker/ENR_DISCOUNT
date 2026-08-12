import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  FileCheck2,
  MapPin,
  Network,
  ShieldCheck,
  Sun,
  UsersRound,
  Zap,
} from "lucide-react";
import QEHContextBanner from "../components/QEHContextBanner";

const steps = [
  {
    number: "01",
    icon: MapPin,
    title: "Recherche dans un rayon de 2 km",
    description:
      "Vous renseignez votre adresse. La carte vérifie les zones et producteurs solaires référencés à proximité.",
  },
  {
    number: "02",
    icon: FileCheck2,
    title: "Étude de votre situation",
    description:
      "QEH Énergies analyse les besoins, la production disponible et les contraintes techniques ou administratives.",
  },
  {
    number: "03",
    icon: UsersRound,
    title: "Création d’un collectif local",
    description:
      "Les producteurs et consommateurs compatibles peuvent être réunis dans une opération d’autoconsommation collective.",
  },
  {
    number: "04",
    icon: Network,
    title: "Organisation et suivi",
    description:
      "La répartition de l’énergie et les échanges sont organisés dans un cadre contractuel avant toute mise en service.",
  },
];

export default function QEHEnergiesFonctionnement() {
  useEffect(() => {
    document.title = "Comment ça marche ? | QEH Énergies";
  }, []);

  return (
    <div data-testid="qeh-energies-fonctionnement-page">
      <section className="relative overflow-hidden bg-[#020711] py-16 text-white sm:py-24">
        <img
          src="/images/qeh-energies/realisations/qeh-grande-toiture.webp"
          alt="Grande toiture photovoltaïque réalisée par Quali Éco Habitat"
          className="absolute inset-0 h-full w-full object-cover opacity-25"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#020711]/70 via-[#020711]/75 to-[#020711]" />
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-32 top-0 h-96 w-96 rounded-full bg-[#17649e]/25 blur-3xl" />
          <div className="absolute -right-40 bottom-0 h-[430px] w-[430px] rounded-full bg-[#69b72d]/20 blur-3xl" />
          <div className="absolute inset-0 bg-[linear-gradient(rgba(23,100,158,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(23,100,158,0.1)_1px,transparent_1px)] bg-[size:52px_52px]" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }}
          className="relative mx-auto max-w-5xl px-5 text-center sm:px-8"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-[#69b72d]/40 bg-[#69b72d]/10 px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-[#82d246]">
            <Zap className="h-4 w-4" />
            Autoconsommation collective
          </div>

          <h1 className="mx-auto mt-6 max-w-4xl font-display text-4xl font-black leading-tight sm:text-5xl lg:text-6xl">
            Comment fonctionne l’énergie solaire{" "}
            <span className="text-[#82d246]">locale ?</span>
          </h1>

          <p className="mx-auto mt-6 max-w-3xl text-base leading-relaxed text-slate-300 sm:text-lg">
            QEH Énergies étudie la possibilité de rapprocher une production solaire locale et des consommateurs situés dans le même secteur.
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              to="/qeh-energies/carte-solaire"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#69b72d] px-6 font-black text-[#020711] transition hover:bg-[#82d246]"
            >
              Voir la carte
              <MapPin className="h-5 w-5" />
            </Link>
            <Link
              to="/qeh-energies/participer"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-white/25 bg-white/5 px-6 font-bold transition hover:border-[#17649e] hover:bg-[#17649e]/20"
            >
              Participer
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </motion.div>
      </section>

      <QEHContextBanner
        theme="energies"
        eyebrow="Une énergie ancrée dans le territoire"
        title="Producteurs et consommateurs, à quelques kilomètres seulement."
        description="La carte QEH rapproche les projets solaires et les foyers locaux. Visualisez les zones existantes puis demandez l’étude de votre adresse."
        image="/images/qeh-energies/realisations/qeh-bac-acier.webp"
        imageAlt="Installation photovoltaïque sur un bâtiment local"
        reverse
        links={[
          { to: "/qeh-energies/carte-solaire", label: "Explorer la carte" },
          { to: "/qeh-energies/participer", label: "Rejoindre le réseau local" },
          { to: "/qeh-partner/production", label: "Devenir producteur" },
        ]}
      />

      <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-24">
        <div className="mb-12 max-w-3xl">
          <p className="text-xs font-black uppercase tracking-[0.22em] text-[#4f9720]">
            Les quatre étapes
          </p>
          <h2 className="mt-3 font-display text-3xl font-black text-[#020711] sm:text-4xl">
            De la recherche à l’organisation du projet
          </h2>
          <p className="mt-4 leading-relaxed text-slate-600">
            Une demande ne déclenche aucun engagement automatique. Chaque possibilité est vérifiée avant une proposition concrète.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          {steps.map((step, index) => {
            const Icon = step.icon;

            return (
              <motion.article
                key={step.number}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.25 }}
                transition={{ duration: 0.45, delay: index * 0.07 }}
                className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_18px_55px_rgba(2,7,20,0.07)] transition hover:-translate-y-1 hover:border-[#69b72d]/55 sm:p-8"
              >
                <span className="absolute right-5 top-3 font-display text-7xl font-black text-slate-100 transition group-hover:text-[#69b72d]/10">
                  {step.number}
                </span>
                <div className="relative grid h-14 w-14 place-items-center rounded-2xl bg-[#69b72d]/12 text-[#4f9720]">
                  <Icon className="h-7 w-7" />
                </div>
                <h3 className="relative mt-6 font-display text-2xl font-black text-[#020711]">
                  {step.title}
                </h3>
                <p className="relative mt-3 leading-relaxed text-slate-600">
                  {step.description}
                </p>
              </motion.article>
            );
          })}
        </div>
      </section>

      <section className="bg-[#020711] py-16 text-white sm:py-20">
        <div className="mx-auto grid max-w-7xl gap-5 px-5 sm:px-8 md:grid-cols-3">
          {[
            {
              icon: Sun,
              title: "Une production locale",
              text: "L’électricité provient d’installations solaires situées dans le secteur étudié.",
            },
            {
              icon: Building2,
              title: "Une structure organisatrice",
              text: "Une personne morale organisatrice coordonne les participants et le fonctionnement du collectif.",
            },
            {
              icon: ShieldCheck,
              title: "Un cadre contrôlé",
              text: "Les conditions techniques, administratives et contractuelles sont étudiées avant toute activation.",
            },
          ].map((item) => {
            const Icon = item.icon;

            return (
              <article
                key={item.title}
                className="rounded-3xl border border-white/10 bg-white/5 p-6"
              >
                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#69b72d]/15 text-[#82d246]">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="mt-5 font-display text-xl font-black">
                  {item.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-slate-300">
                  {item.text}
                </p>
              </article>
            );
          })}
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-5 py-16 sm:px-8 sm:py-20">
        <div className="rounded-3xl border border-amber-200 bg-amber-50 p-6 sm:p-8">
          <div className="flex items-start gap-4">
            <CheckCircle2 className="mt-0.5 h-7 w-7 shrink-0 text-amber-700" />
            <div>
              <h2 className="font-display text-xl font-black text-amber-950">
                Une étude de faisabilité, pas une promesse automatique
              </h2>
              <p className="mt-3 leading-relaxed text-amber-900/80">
                La présence d’une zone ou d’un producteur dans un rayon de 2 km ne garantit pas automatiquement l’accès à son énergie. QEH Énergies doit vérifier la disponibilité, l’équilibre du collectif et les conditions applicables au projet.
              </p>
              <Link
                to="/qeh-energies/participer"
                className="mt-5 inline-flex items-center gap-2 font-black text-amber-900"
              >
                Demander une étude
                <ArrowRight className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}