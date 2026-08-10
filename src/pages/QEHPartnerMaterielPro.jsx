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
import { priceLabel } from "../lib/api";
import { useCart } from "../context/CartContext";

function getPrimaryImage(images = []) {
  const ordered = [...images].sort(
    (a, b) => Number(a.display_order || 0) - Number(b.display_order || 0)
  );
  return ordered.find((image) => image.is_primary)?.image_url || ordered[0]?.image_url || "";
}

function isSaleActive(product) {
  if (!product.is_on_sale || !product.sale_price) return false;
  const now = Date.now();
  const starts = product.sale_start ? new Date(product.sale_start).getTime() : null;
  const ends = product.sale_end ? new Date(product.sale_end).getTime() : null;
  return (!starts || starts <= now) && (!ends || ends >= now);
}

export default function QEHPartnerMaterielPro() {
  const { addItem, count } = useCart();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [sort, setSort] = useState("newest");

  useEffect(() => {
    let active = true;

    const loadProducts = async () => {
      setLoading(true);
      setErrorMessage("");

      try {
        const { data, error } = await supabase
          .from("products")
          .select(`
            id,
            name,
            slug,
            brand,
            reference,
            price,
            sale_price,
            sale_start,
            sale_end,
            is_on_sale,
            stock,
            on_demand,
            product_condition,
            weight_kg,
            length_cm,
            width_cm,
            height_cm,
            requires_pallet,
            created_at,
            categories (id, name, slug),
            product_images (id, image_url, alt_text, is_primary, display_order)
          `)
          .eq("is_active", true)
          .order("created_at", { ascending: false });

        if (error) throw error;

        if (active) {
          setProducts(
            (data || []).map((product) => ({
              ...product,
              price: Number(product.price || 0),
              sale_price:
                product.sale_price === null ? null : Number(product.sale_price),
              image: getPrimaryImage(product.product_images),
              images: (product.product_images || []).map((image) => image.image_url),
            }))
          );
        }
      } catch (error) {
        console.error("Erreur catalogue professionnel :", error);
        if (active) setErrorMessage("Impossible de charger le catalogue professionnel.");
      } finally {
        if (active) setLoading(false);
      }
    };

    loadProducts();
    return () => { active = false; };
  }, []);

  const categories = useMemo(() => {
    const values = new Map();
    products.forEach((product) => {
      if (product.categories?.slug) values.set(product.categories.slug, product.categories.name);
    });
    return [...values.entries()].map(([slug, name]) => ({ slug, name }));
  }, [products]);

  const displayedProducts = useMemo(() => {
    const needle = search.trim().toLowerCase();
    const filtered = products.filter((product) => {
      const matchesCategory = !category || product.categories?.slug === category;
      const haystack = `${product.name} ${product.brand || ""} ${product.reference || ""}`.toLowerCase();
      return matchesCategory && (!needle || haystack.includes(needle));
    });

    return filtered.sort((a, b) => {
      const priceA = isSaleActive(a) ? a.sale_price : a.price;
      const priceB = isSaleActive(b) ? b.sale_price : b.price;
      if (sort === "price-asc") return priceA - priceB;
      if (sort === "price-desc") return priceB - priceA;
      if (sort === "brand") return String(a.brand || "").localeCompare(String(b.brand || ""), "fr");
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  }, [products, search, category, sort]);

  const addProfessionalItem = (product) => {
    sessionStorage.setItem("qeh_sales_channel", "professional");
    sessionStorage.setItem("qeh_delivery_type", "entreprise");
    addItem(product, 1);
    toast.success(`${product.name} ajouté au panier professionnel`);
  };

  return (
    <div className="qehp-pro-shop">
      <section className="qehp-pro-hero">
        <div className="qehp-pro-hero__mesh" aria-hidden="true" />
        <div className="qehp-container qehp-pro-hero__grid">
          <motion.div
            initial={{ opacity: 0, x: -28 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.65 }}
          >
            <span className="qehp-kicker"><Building2 size={16} /> Matériel réservé aux professionnels</span>
            <h1>Le gros volume, avec une logistique à la hauteur.</h1>
            <p>
              Une sélection pensée pour les installateurs, distributeurs et
              entreprises : matériels identifiés, disponibilité claire et
              transport professionnel calculé sur votre destination.
            </p>
            <div className="qehp-pro-hero__trust">
              <span><BadgeCheck /> Compte professionnel</span>
              <span><Truck /> Fret et palettes</span>
              <span><ShieldCheck /> Paiement sécurisé</span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.12 }}
            className="qehp-pro-hero__panel"
          >
            <PackagePlus />
            <span>Approvisionnement professionnel</span>
            <strong>Du colis à la palette</strong>
            <p>La destination est préconfigurée en entreprise pour obtenir les offres de fret adaptées.</p>
            <a href="#catalogue">Voir le catalogue <ArrowRight /></a>
          </motion.div>
        </div>
      </section>

      <section id="catalogue" className="qehp-pro-catalogue">
        <div className="qehp-container">
          <div className="qehp-pro-catalogue__heading">
            <div><span>Catalogue professionnel</span><h2>Matériel disponible</h2></div>
            <Link to="/panier?client=professionnel" className="qehp-pro-cart">
              <ShoppingCart /> Panier pro <strong>{count}</strong>
            </Link>
          </div>

          <div className="qehp-pro-filters">
            <label className="qehp-pro-search">
              <Search />
              <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Produit, marque ou référence…" />
              {search && <button type="button" onClick={() => setSearch("")} aria-label="Effacer la recherche"><X /></button>}
            </label>

            <label className="qehp-pro-select">
              <SlidersHorizontal />
              <select value={category} onChange={(event) => setCategory(event.target.value)}>
                <option value="">Toutes les catégories</option>
                {categories.map((item) => <option key={item.slug} value={item.slug}>{item.name}</option>)}
              </select>
            </label>

            <label className="qehp-pro-select">
              <select value={sort} onChange={(event) => setSort(event.target.value)}>
                <option value="newest">Nouveautés</option>
                <option value="price-asc">Prix croissant</option>
                <option value="price-desc">Prix décroissant</option>
                <option value="brand">Marque</option>
              </select>
            </label>
          </div>

          {loading ? (
            <div className="qehp-pro-state"><LoaderCircle className="qehp-spin" /><p>Chargement du catalogue professionnel…</p></div>
          ) : errorMessage ? (
            <div className="qehp-pro-state qehp-pro-state--error"><p>{errorMessage}</p></div>
          ) : displayedProducts.length === 0 ? (
            <div className="qehp-pro-state"><p>Aucun matériel ne correspond à votre recherche.</p></div>
          ) : (
            <div className="qehp-pro-grid">
              {displayedProducts.map((product, index) => {
                const sale = isSaleActive(product);
                const currentPrice = sale ? product.sale_price : product.price;
                const available = Number(product.stock || 0) > 0 || product.on_demand;

                return (
                  <motion.article
                    key={product.id}
                    initial={{ opacity: 0, y: 25 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.15 }}
                    transition={{ duration: 0.45, delay: (index % 4) * 0.05 }}
                    className="qehp-pro-product"
                  >
                    <Link to={`/produits/${product.slug || product.id}`} className="qehp-pro-product__image">
                      {product.image ? <img src={product.image} alt={product.name} /> : <PackagePlus />}
                      {product.requires_pallet && <span className="qehp-pro-product__pallet">Palette</span>}
                      {sale && <span className="qehp-pro-product__sale">Prix remisé</span>}
                    </Link>

                    <div className="qehp-pro-product__body">
                      <span className="qehp-pro-product__brand">{product.brand || "QEH Sélection"}</span>
                      <Link to={`/produits/${product.slug || product.id}`}><h3>{product.name}</h3></Link>
                      <p className="qehp-pro-product__reference">Réf. {product.reference || "sur demande"}</p>

                      <div className="qehp-pro-product__availability">
                        <i className={available ? "is-available" : ""} />
                        {Number(product.stock || 0) > 0
                          ? `${product.stock} disponible${Number(product.stock) > 1 ? "s" : ""}`
                          : product.on_demand ? "Approvisionnement sur demande" : "Indisponible"}
                      </div>

                      <div className="qehp-pro-product__footer">
                        <div>
                          {sale && <del>{priceLabel(product.price)}</del>}
                          <strong>{currentPrice > 0 ? priceLabel(currentPrice) : "Sur devis"}</strong>
                        </div>
                        <button type="button" onClick={() => addProfessionalItem(product)} disabled={!available || currentPrice <= 0} aria-label={`Ajouter ${product.name} au panier`}>
                          <ShoppingCart />
                        </button>
                      </div>
                    </div>
                  </motion.article>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}