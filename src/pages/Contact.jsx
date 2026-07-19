import React from "react";
import { Phone, MapPin, Mail } from "lucide-react";

export default function Contact() {
  return (
    <div data-testid="contact-page" className="max-w-4xl mx-auto px-5 sm:px-8 py-16">
      <p className="overline text-primary mb-2">Contact</p>
      <h1 className="font-display font-black text-4xl sm:text-5xl tracking-tight mb-10">
        Parlons de votre projet
      </h1>

      <div className="grid sm:grid-cols-2 gap-5">
        <a
          href="tel:+33665235209"
          data-testid="contact-phone"
          className="flex items-center gap-4 p-6 rounded-2xl border border-border bg-card hover:-translate-y-1 hover:shadow-lg transition-transform"
        >
          <span className="w-12 h-12 rounded-full bg-accent text-accent-foreground grid place-items-center">
            <Phone className="w-5 h-5" />
          </span>
          <div>
            <p className="text-sm text-muted-foreground">Téléphone</p>
            <p className="font-display font-semibold text-lg">+33 6 65 23 52 09</p>
          </div>
        </a>

        <div className="flex items-center gap-4 p-6 rounded-2xl border border-border bg-card">
          <span className="w-12 h-12 rounded-full bg-secondary text-secondary-foreground grid place-items-center">
            <Mail className="w-5 h-5" />
          </span>
          <div>
            <p className="text-sm text-muted-foreground">Email</p>
            <p className="font-display font-semibold">Bientôt disponible</p>
          </div>
        </div>

        <div className="flex items-center gap-4 p-6 rounded-2xl border border-border bg-card sm:col-span-2">
          <span className="w-12 h-12 rounded-full bg-secondary text-secondary-foreground grid place-items-center">
            <MapPin className="w-5 h-5" />
          </span>
          <div>
            <p className="text-sm text-muted-foreground">Adresse</p>
            <p className="font-display font-semibold">Bientôt disponible</p>
          </div>
        </div>
      </div>
    </div>
  );
}
