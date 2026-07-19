import React from "react";
import { Link } from "react-router-dom";
import { Zap, Phone } from "lucide-react";

export const Footer = () => (
  <footer className="border-t border-border bg-muted/40 mt-24">
    <div className="max-w-7xl mx-auto px-5 sm:px-8 py-14 grid gap-10 md:grid-cols-3">
      <div>
        <div className="flex items-center gap-2 mb-4">
          <span className="w-8 h-8 rounded-lg bg-primary text-primary-foreground grid place-items-center">
            <Zap className="w-4 h-4" strokeWidth={2.4} />
          </span>
          <span className="font-display font-extrabold text-lg">
            ENR <span className="text-primary">discount</span>
          </span>
        </div>
        <p className="text-sm text-muted-foreground max-w-xs">
          Solutions d'énergie : solaire, climatisation, chauffage, chauffe-eau et plus.
        </p>
      </div>

      <div>
        <p className="overline text-muted-foreground mb-4">Navigation</p>
        <ul className="space-y-2 text-sm">
          <li><Link to="/" className="hover:text-primary transition-colors">Accueil</Link></li>
          <li><Link to="/produits" className="hover:text-primary transition-colors">Produits</Link></li>
          <li><Link to="/contact" className="hover:text-primary transition-colors">Contact</Link></li>
        </ul>
      </div>

      <div>
        <p className="overline text-muted-foreground mb-4">Contact</p>
        <a
          href="tel:+33665235209"
          data-testid="footer-phone"
          className="inline-flex items-center gap-2 text-sm font-semibold hover:text-primary transition-colors"
        >
          <Phone className="w-4 h-4" /> +33 6 65 23 52 09
        </a>
      </div>
    </div>
    <div className="border-t border-border py-6 text-center text-xs text-muted-foreground">
      © {new Date().getFullYear()} ENR discount. Tous droits réservés.
    </div>
  </footer>
);
