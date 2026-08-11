import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BadgeCheck,
  Building2,
  LoaderCircle,
  PackagePlus,
  Search,
  ShieldCheck,
  ShoppingCart,
  SlidersHorizontal,
  Truck,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "../lib/supabase";
import { usePartnerCart } from "../context/PartnerCartContext";
import { useProfessionalAuth } from "../context/ProfessionalAuthContext";

function money(value) {
  return Number(value || 0).toLocaleString("fr-FR", {
    style: "currency",
    currency: "EUR",
  });
}

export default function QEHPartnerMaterielPro() {
  const { addItem, count } = usePartnerCart();
  const { professionalAccount } = useProfessionalAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [sort, setSort] = useState("newest");

  useEffect(() => {
    let active = true;

    async function loadProducts() {
      setLoading(true);
      setErrorMessage("");

      const { data, error } = await supabase
        .from("qeh_partner_products")
        .select("id, name, reference, description, category, price_excluding_tax, vat_rate, stock, minimum_quantity, image_url, is_active, created_at")
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (!active) return;

      if (error) {
        setProducts([]);
        setErrorMessage(error.message || "Impossible de charger le catalogue professionnel.");
      } else {
        setProducts((data || []).map((product) => ({
          ...product,
          price_excluding_tax: Number(product.price_excluding_tax || 0),
          vat_rate: Number(product.vat_rate ?? 20),
          stock: Number(product.stock || 0),
          minimum_quantity: Math.max(1, Number(product.minimum_quantity || 1)),
        })));
      }

      setLoading(false);
    }

    loadProducts();
    return () => { active = false; };
  }, []);

  const categories = useMemo(() => [
    ...new Set(products.map((product) => product.category).filter(Boolean)),
  ].sort((a, b) => a.localeCompare(b, "fr")), [products]);

  const displayedProducts = useMemo(() => {
    const needle = search.trim().toLocaleLowerCase("fr-FR");
    const filtered = products.filter((product) => {
      const haystack = `${product.name} ${product.reference || ""} ${product.description || ""}`
        .toLocaleLowerCase("fr-FR");
      return (!category || product.category === category) && (!needle || haystack.includes(needle));
    });

    return [...filtered].sort((a, b) => {
      if (sort === "price-asc") return a.price_excluding_tax - b.price_excluding_tax;
      if (sort === "price-desc") return b.price_excluding_tax - a.price_excluding_tax;
      if (sort === "name") return a.name.localeCompare(b.name, "fr");
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  }, [products, search, category, sort]);

  function addProfessionalItem(product) {
    addItem(product, product.minimum_quantity);
    toast.success(`${product.name} ajouté au panier Pro`, {
      description: `Quantité minimale : ${product.minimum_quantity}`,
    });
  }

  return (
    <div className="qehp-pro-shop">
      <section className="qehp-pro-hero">
        <div className="qehp-pro-hero__mesh" aria-hidden="true" />
        <div className="qehp-container qehp-pro-hero__grid">
          <motion.div initial={{ opacity: 0, x: -28 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.65 }}>
            <span className="qehp-kicker"><Building2 size={16} /> Catalogue privé · {professionalAccount?.company_name}</span>
            <h1>Le gros volume, avec une logistique à la hauteur.</h1>
            <p>
              Un catalogue distinct de QEH OUTLET, réservé aux professionnels validés :
              prix HT, stocks dédiés, quantités minimales et commandes de gros.
            </p>
            <div className="qehp-pro-hero__trust">
              <span><BadgeCheck /> Compte professionnel validé</span>
              <span><Truck /> Fret et palettes</span>
              <span><ShieldCheck /> Espace protégé</span>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.12 }} className="qehp-pro-hero__panel">
            <PackagePlus />
            <span>Approvisionnement professionnel</span>
            <strong>Du colis à la palette</strong>
            <p>Votre panier, vos produits et vos commandes sont indépendants de QEH OUTLET.</p>
            <a href="#catalogue">Voir le catalogue <ArrowRight /></a>
          </motion.div>
        </div>
      </section>

      <section id="catalogue" className="qehp-pro-catalogue">
        <div className="qehp-container">
          <div className="qehp-pro-catalogue__heading">
            <div><span>Catalogue professionnel privé</span><h2>Matériel disponible</h2></div>
            <Link to="/qeh-partner/panier-pro" className="qehp-pro-cart">
              <ShoppingCart /> Panier pro <strong>{count}</strong>
            </Link>
          </div>

          <div className="qehp-pro-filters">
            <label className="qehp-pro-search">
              <Search />
              <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Produit ou référence…" />
              {search ? <button type="button" onClick={() => setSearch("")} aria-label="Effacer la recherche"><X /></button> : null}
            </label>

            <label className="qehp-pro-select">
              <SlidersHorizontal />
              <select value={category} onChange={(event) => setCategory(event.target.value)}>
                <option value="">Toutes les catégories</option>
                {categories.map((value) => <option key={value} value={value}>{value}</option>)}
              </select>
            </label>

            <label className="qehp-pro-select">
              <select value={sort} onChange={(event) => setSort(event.target.value)}>
                <option value="newest">Nouveautés</option>
                <option value="price-asc">Prix HT croissant</option>
                <option value="price-desc">Prix HT décroissant</option>
                <option value="name">Nom du produit</option>
              </select>
            </label>
          </div>

          {loading ? (
            <div className="qehp-pro-state"><LoaderCircle className="qehp-spin" /><p>Ouverture du catalogue privé…</p></div>
          ) : errorMessage ? (
            <div className="qehp-pro-state qehp-pro-state--error"><p>{errorMessage}</p></div>
          ) : displayedProducts.length === 0 ? (
            <div className="qehp-pro-state"><PackagePlus /><p>Aucun matériel professionnel ne correspond à votre recherche.</p></div>
          ) : (
            <div className="qehp-pro-grid">
              {displayedProducts.map((product, index) => (
                <motion.article
                  key={product.id}
                  initial={{ opacity: 0, y: 25 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.15 }}
                  transition={{ duration: 0.45, delay: (index % 4) * 0.05 }}
                  className="qehp-pro-product"
                >
                  <div className="qehp-pro-product__image">
                    {product.image_url ? <img src={product.image_url} alt={product.name} /> : <PackagePlus />}
                    <span className="qehp-pro-product__pallet">Réservé aux pros</span>
                  </div>

                  <div className="qehp-pro-product__body">
                    <span className="qehp-pro-product__brand">{product.category || "QEH Partner"}</span>
                    <h3>{product.name}</h3>
                    <p className="qehp-pro-product__reference">Réf. {product.reference || "sur demande"}</p>
                    <p className="qehp-pro-product__description">{product.description || "Matériel professionnel sélectionné par QEH Partner."}</p>

                    <div className="qehp-pro-product__availability">
                      <i className={product.stock > 0 ? "is-available" : ""} />
                      {product.stock > 0 ? `${product.stock} en stock` : "Indisponible"}
                      <span> · Minimum {product.minimum_quantity}</span>
                    </div>

                    <div className="qehp-pro-product__footer">
                      <div>
                        <strong>{money(product.price_excluding_tax)} HT</strong>
                        <small>TVA {product.vat_rate} %</small>
                      </div>
                      <button type="button" onClick={() => addProfessionalItem(product)} disabled={product.stock <= 0 || product.price_excluding_tax <= 0} aria-label={`Ajouter ${product.name} au panier professionnel`}>
                        <ShoppingCart />
                      </button>
                    </div>
                  </div>
                </motion.article>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}