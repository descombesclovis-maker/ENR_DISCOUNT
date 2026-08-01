import React from "react";
import { Link } from "react-router-dom";

import {
  Phone,
  House,
  Package,
  Truck,
  ChevronRight,
} from "lucide-react";

export const Footer = () => (
  <footer className="border-t border-border bg-[#020714] text-white mt-24">
    <div className="max-w-7xl mx-auto px-5 sm:px-8 py-14 grid gap-10 md:grid-cols-3">
      {/* Logo */}
      <div>
        
        QEH OUTLET

        <p className="text-sm text-white/70 max-w-xs leading-relaxed">
          Matériel solaire, pompes à chaleur, climatisation,
          chauffe-eau, batteries et équipements professionnels
          sélectionnés à prix outlet.
        </p>
      </div>

      {/* Navigation */}
      <div>
        <p className="uppercase tracking-[0.2em] text-xs text-[#ff5a00] mb-5 font-bold">
          Navigation
        </p>

        <ul className="space-y-3 text-sm">
          <li>
            <Link
              to="/"
              className="flex items-center gap-3 hover:text-[#55a8ff] transition-colors"
            >
              <House className="w-4 h-4" />
              Accueil
            </Link>
          </li>

          <li>
            <Link
              to="/produits"
              className="flex items-center gap-3 hover:text-[#55a8ff] transition-colors"
            >
              <Package className="w-4 h-4" />
              Produits
            </Link>
          </li>

          <li>
            <Link
              to="/suivi-commande"
              className="flex items-center gap-3 hover:text-[#55a8ff] transition-colors"
            >
              <Truck className="w-4 h-4" />
              Suivi de commande
            </Link>
          </li>
        </ul>
      </div>

      {/* Votre espace */}
      <div>
        <p className="uppercase tracking-[0.2em] text-xs text-[#ff5a00] mb-5 font-bold">
          Votre espace
        </p>

        <ul className="space-y-3 text-sm">
          <li>
            <Link
              to="/favoris"
              className="flex items-center justify-between hover:text-[#55a8ff] transition-colors"
            >
              Mes favoris
              <ChevronRight className="w-4 h-4" />
            </Link>
          </li>

          <li>
            <Link
              to="/panier"
              className="flex items-center justify-between hover:text-[#55a8ff] transition-colors"
            >
              Mon panier
              <ChevronRight className="w-4 h-4" />
            </Link>
          </li>

          <li>
            <Link
              to="/suivi-commande"
              className="flex items-center justify-between hover:text-[#55a8ff] transition-colors"
            >
              Suivi de commande
              <ChevronRight className="w-4 h-4" />
            </Link>
          </li>
        </ul>

        <div className="mt-8">
          
        </div>
      </div>
    </div>

    <div className="border-t border-white/10 py-6 text-center text-xs text-white/50">
      © {new Date().getFullYear()} QEH OUTLET — Tous droits réservés.
    </div>
  </footer>
);