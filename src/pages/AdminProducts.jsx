import React, { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Boxes,
  Edit3,
  Eye,
  EyeOff,
  LoaderCircle,
  PackagePlus,
  RefreshCw,
  Search,
  Trash2,
} from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase";

function money(value) {
  return Number(value || 0).toLocaleString("fr-FR", {
    style: "currency",
    currency: "EUR",
  });
}

function primaryImage(images) {
  const list = Array.isArray(images) ? images : [];
  return list.find((image) => image.is_primary)?.image_url || list[0]?.image_url || "";
}

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [searchValue, setSearchValue] = useState("");
  const [visibility, setVisibility] = useState("all");

  const loadProducts = useCallback(async () => {
    setLoading(true);
    setErrorMessage("");

    const { data, error } = await supabase
      .from("products")
      .select(`
        id,
        name,
        slug,
        brand,
        reference,
        sku,
        price,
        sale_price,
        is_on_sale,
        stock,
        on_demand,
        requires_pallet,
        is_active,
        is_featured,
        created_at,
        categories (id, name),
        product_images (id, image_url, is_primary, display_order),
        product_variants (id, stock, is_active)
      `)
      .order("created_at", { ascending: false });

    if (error) {
      setErrorMessage(error.message);
      setProducts([]);
    } else {
      setProducts(data || []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const filteredProducts = useMemo(() => {
    const query = searchValue.trim().toLocaleLowerCase("fr-FR");
    return products.filter((product) => {
      const matchesVisibility =
        visibility === "all" ||
        (visibility === "active" && product.is_active) ||
        (visibility === "hidden" && !product.is_active) ||
        (visibility === "low" && Number(product.stock || 0) <= 3);
      const searchable = [product.name, product.brand, product.reference, product.sku]
        .filter(Boolean)
        .join(" ")
        .toLocaleLowerCase("fr-FR");
      return matchesVisibility && (!query || searchable.includes(query));
    });
  }, [products, searchValue, visibility]);

  const activeCount = products.filter((product) => product.is_active).length;
  const stockValue = products.reduce(
    (total, product) => total + Number(product.stock || 0) * Number(product.price || 0),
    0
  );

  async function toggleVisibility(product) {
    const { error } = await supabase
      .from("products")
      .update({ is_active: !product.is_active })
      .eq("id", product.id);
    if (error) setErrorMessage(error.message);
    else setProducts((current) => current.map((item) => item.id === product.id ? { ...item, is_active: !item.is_active } : item));
  }

  async function deleteProduct(product) {
    if (!window.confirm(`Supprimer définitivement « ${product.name} » ?`)) return;
    const { error } = await supabase.from("products").delete().eq("id", product.id);
    if (error) setErrorMessage(error.message);
    else setProducts((current) => current.filter((item) => item.id !== product.id));
  }

  return (
    <div className="min-h-screen p-4 sm:p-6 xl:p-8">
      <div className="mx-auto max-w-[1450px]">
        <motion.header initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="relative overflow-hidden rounded-[30px] bg-[#050b16] p-6 text-white sm:p-8">
          <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[#ff5a00]/25 blur-3xl" />
          <div className="relative flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
            <div>
              <div className="flex items-center gap-2 text-[#ff7a2f]"><Boxes className="h-5 w-5" /><p className="text-xs font-black uppercase tracking-[0.2em]">QEH OUTLET</p></div>
              <h1 className="mt-3 font-display text-3xl font-black sm:text-4xl">Catalogue produits</h1>
              <p className="mt-3 max-w-2xl text-slate-300">Pilotez les produits, prix, stocks, variantes et contraintes de livraison.</p>
            </div>
            <Link to="/admin/produits/nouveau" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#ff5a00] px-7 font-black text-white shadow-[0_12px_35px_rgba(255,90,0,.28)]"><PackagePlus className="h-5 w-5" />Ajouter un produit</Link>
          </div>
          <div className="relative mt-7 grid gap-3 sm:grid-cols-3"><div className="rounded-2xl border border-white/10 bg-white/[.06] p-4"><p className="text-xs font-bold text-slate-400">Produits</p><p className="mt-1 text-2xl font-black">{products.length}</p></div><div className="rounded-2xl border border-white/10 bg-white/[.06] p-4"><p className="text-xs font-bold text-slate-400">En ligne</p><p className="mt-1 text-2xl font-black text-[#ff7a2f]">{activeCount}</p></div><div className="rounded-2xl border border-white/10 bg-white/[.06] p-4"><p className="text-xs font-bold text-slate-400">Valeur du stock</p><p className="mt-1 text-2xl font-black">{money(stockValue)}</p></div></div>
        </motion.header>

        <section className="mt-5 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_14px_45px_rgba(2,7,17,.06)]">
          <div className="flex flex-col gap-3 border-b border-slate-200 p-4 sm:flex-row sm:p-5"><label className="relative flex-1"><Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" /><input type="search" value={searchValue} onChange={(e) => setSearchValue(e.target.value)} placeholder="Rechercher un produit, une marque, une référence ou un SKU…" className="min-h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-12 pr-4 font-semibold outline-none focus:border-[#ff5a00] focus:bg-white focus:ring-4 focus:ring-[#ff5a00]/10" /></label><select value={visibility} onChange={(e) => setVisibility(e.target.value)} className="min-h-12 rounded-xl border border-slate-200 bg-white px-4 font-bold outline-none"><option value="all">Tous les produits</option><option value="active">En ligne</option><option value="hidden">Masqués</option><option value="low">Stock faible</option></select><button type="button" onClick={loadProducts} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 font-black"><RefreshCw className="h-4 w-4" />Actualiser</button></div>
          {errorMessage ? <div className="m-5 rounded-2xl border border-red-200 bg-red-50 p-4 font-bold text-red-700">{errorMessage}</div> : null}
          {loading ? <div className="grid min-h-[380px] place-items-center"><LoaderCircle className="h-9 w-9 animate-spin text-[#ff5a00]" /></div> : filteredProducts.length === 0 ? <div className="grid min-h-[340px] place-items-center p-6 text-center"><div><Boxes className="mx-auto h-12 w-12 text-slate-300" /><p className="mt-4 font-black">Aucun produit trouvé</p><p className="mt-1 text-sm text-slate-500">Modifiez les filtres ou ajoutez un produit.</p></div></div> : <div className="grid gap-4 p-4 md:grid-cols-2 2xl:grid-cols-3 sm:p-5">{filteredProducts.map((product, index) => {
            const image = primaryImage(product.product_images);
            const variants = product.product_variants || [];
            const variantStock = variants.reduce((sum, variant) => sum + Number(variant.stock || 0), 0);
            const displayedPrice = product.is_on_sale && product.sale_price ? product.sale_price : product.price;
            return <motion.article initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(index * .035, .25) }} key={product.id} className="overflow-hidden rounded-3xl border border-slate-200 bg-white transition hover:-translate-y-1 hover:border-orange-200 hover:shadow-xl"><div className="relative grid h-48 place-items-center bg-slate-50 p-4">{image ? <img src={image} alt={product.name} className="h-full w-full object-contain" /> : <Boxes className="h-16 w-16 text-slate-300" />}<span className={`absolute right-3 top-3 rounded-full px-3 py-1.5 text-xs font-black ${product.is_active ? "bg-emerald-50 text-emerald-700" : "bg-slate-200 text-slate-600"}`}>{product.is_active ? "En ligne" : "Masqué"}</span>{product.requires_pallet ? <span className="absolute bottom-3 left-3 rounded-full bg-[#050b16] px-3 py-1 text-[10px] font-black uppercase text-white">Palette</span> : null}</div><div className="p-5"><p className="text-xs font-black uppercase tracking-[.14em] text-[#ff5a00]">{product.brand || product.categories?.name || "QEH Sélection"}</p><h2 className="mt-2 line-clamp-2 min-h-[56px] text-xl font-black text-slate-950">{product.name}</h2><p className="mt-2 text-xs font-semibold text-slate-500">{product.reference || product.sku || "Sans référence"}</p><div className="mt-5 grid grid-cols-3 gap-2 text-center"><div className="rounded-xl bg-slate-50 p-2"><p className="text-[10px] font-bold text-slate-400">PRIX</p><p className="mt-1 font-black">{money(displayedPrice)}</p></div><div className="rounded-xl bg-slate-50 p-2"><p className="text-[10px] font-bold text-slate-400">STOCK</p><p className="mt-1 font-black">{product.stock || 0}</p></div><div className="rounded-xl bg-slate-50 p-2"><p className="text-[10px] font-bold text-slate-400">VARIANTES</p><p className="mt-1 font-black">{variants.length}</p><p className="text-[9px] text-slate-400">{variantStock} unités</p></div></div><div className="mt-5 flex gap-2"><Link to={`/admin/produits/${product.id}/modifier`} className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-[#050b16] font-black text-white hover:bg-[#ff5a00]"><Edit3 className="h-4 w-4" />Modifier</Link><button type="button" onClick={() => toggleVisibility(product)} className="grid h-11 w-11 place-items-center rounded-xl border border-slate-200 text-slate-600" aria-label={product.is_active ? "Masquer" : "Afficher"}>{product.is_active ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button><button type="button" onClick={() => deleteProduct(product)} className="grid h-11 w-11 place-items-center rounded-xl border border-red-100 text-red-500" aria-label="Supprimer"><Trash2 className="h-4 w-4" /></button></div></div></motion.article>;
          })}</div>}
        </section>
      </div>
    </div>
  );
}