import React from "react";

import {
  Link,
} from "react-router-dom";

import {
  Phone,
} from "lucide-react";

export const Footer = () => (
  <footer className="border-t border-border bg-muted/40 mt-24">
    <div className="max-w-7xl mx-auto px-5 sm:px-8 py-14 grid gap-10 md:grid-cols-3">
      <div>
        <Link
          to="/"
          aria-label="Retour à l’accueil EcoConfortHabitat.fr"
          className="inline-flex items-center mb-4 group"
        >
          <span className="whitespace-nowrap font-display font-black text-lg sm:text-xl tracking-[-0.045em] leading-none">
            <span className="text-foreground transition-colors group-hover:text-primary">
              EcoConfort
            </span>

            <span className="text-primary">
              Habitat
            </span>

            <span className="text-primary/70 text-[0.72em] tracking-[-0.02em]">
              .fr
            </span>
          </span>
        </Link>

        <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
          Solutions d&apos;énergie : solaire, climatisation,
          chauffage, chauffe-eau et plus.
        </p>
      </div>

      <div>
        <p className="overline text-muted-foreground mb-4">
          Navigation
        </p>

        <ul className="space-y-2 text-sm">
          <li>
            <Link
              to="/"
              className="hover:text-primary transition-colors"
            >
              Accueil
            </Link>
          </li>

          <li>
            <Link
              to="/produits"
              className="hover:text-primary transition-colors"
            >
              Produits
            </Link>
          </li>

          <li>
            <Link
              to="/contact"
              className="hover:text-primary transition-colors"
            >
              Contact
            </Link>
          </li>
        </ul>
      </div>

      <div>
        <p className="overline text-muted-foreground mb-4">
          Contact
        </p>

        <a
          href="tel:+33665235209"
          data-testid="footer-phone"
          className="inline-flex items-center gap-2 text-sm font-semibold hover:text-primary transition-colors"
        >
          <Phone className="w-4 h-4" />

          +33 6 65 23 52 09
        </a>
      </div>
    </div>

    <div className="border-t border-border py-6 px-5 text-center text-xs text-muted-foreground">
      © {new Date().getFullYear()} EcoConfortHabitat.fr. Tous
      droits réservés.
    </div>
  </footer>
);