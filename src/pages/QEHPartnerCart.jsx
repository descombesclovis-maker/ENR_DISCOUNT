import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  BadgeCheck,
  Building2,
  CheckCircle2,
  LoaderCircle,
  LockKeyhole,
  Minus,
  PackageCheck,
  Plus,
  ShieldCheck,
  ShoppingCart,
  Sparkles,
  Trash2,
  Truck,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "../lib/supabase";
import { useCustomerAuth } from "../context/CustomerAuthContext";
import { useProfessionalAuth } from "../context/ProfessionalAuthContext";
import { usePartnerCart } from "../context/PartnerCartContext";

function money(value) {
  return Number(value || 0).toLocaleString("fr-FR", {
    style: "currency",
    currency: "EUR",
  });
}

export default function QEHPartnerCart() {
  const { user, profile, hasCompleteShippingAddress } = useCustomerAuth();
  const { professionalAccount } = useProfessionalAuth();
  const {
    items,
    updateQuantity,
    removeItem,
    clearCart,
    count,
    subtotalExcludingTax,
    taxAmount,
    totalIncludingTax,
  } = usePartnerCart();
  const [submitting, setSubmitting] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState(null);

  const customerName = useMemo(() => [profile?.first_name, profile?.last_name]
    .filter(Boolean)
    .join(" ") || user?.email || "Client professionnel", [profile, user]);

  async function submitOrder() {
    if (!items.length || submitting) return;

    if (!hasCompleteShippingAddress) {
      toast.error("Complétez votre adresse dans votre compte particulier avant de commander.");
      return;
    }

    setSubmitting(true);

    try {
      const shipping = {
        customer_name: customerName,
        customer_phone: profile?.phone || "",
        shipping_address: [profile?.address, profile?.address2].filter(Boolean).join("\n"),
        shipping_postal_code: profile?.postal_code || "",
        shipping_city: profile?.city || "",
        shipping_country: profile?.country || "France",
      };

      const orderItems = items.map((item) => ({
        product_id: item.product_id,
        quantity: Number(item.quantity),
      }));

      const { data: order, error: orderError } = await supabase
        .rpc("create_qeh_partner_order", {
          p_shipping: shipping,
          p_items: orderItems,
        })
        .single();

      if (orderError) throw orderError;

      clearCart();
      setConfirmedOrder({
        id: order.created_order_id,
        order_number: order.created_order_number,
      });
      toast.success("Votre demande de commande professionnelle est enregistrée.");
    } catch (error) {
      console.error("Erreur commande QEH Partner :", error);
      toast.error(error?.message || "Impossible d’enregistrer la commande professionnelle.");
    } finally {
      setSubmitting(false);
    }
  }

  if (confirmedOrder) {
    return (
      <section className="qehpro-cart-page qehpro-cart-page--success">
        <div className="qehpro-cart-grid" />
        <motion.div initial={{ opacity: 0, y: 35, scale: 0.94 }} animate={{ opacity: 1, y: 0, scale: 1 }} className="qehpro-order-success">
          <motion.div animate={{ rotate: [0, 8, -8, 0], scale: [1, 1.08, 1] }} transition={{ duration: 1.2 }}>
            <CheckCircle2 />
          </motion.div>
          <span><Sparkles /> Commande professionnelle transmise</span>
          <h1>Merci, votre demande est enregistrée.</h1>
          <p>Référence <strong>{confirmedOrder.order_number}</strong>. L’équipe QEH Partner vérifie la disponibilité et la logistique avant validation finale.</p>
          <Link to="/qeh-partner/materiel-pro" className="qehpro-gold-button"><ArrowLeft /> Retour au catalogue</Link>
        </motion.div>
      </section>
    );
  }

  return (
    <section className="qehpro-cart-page">
      <div className="qehpro-cart-grid" />
      <div className="qehpro-cart-orb qehpro-cart-orb--one" />
      <div className="qehpro-cart-orb qehpro-cart-orb--two" />

      <div className="qehpro-cart-shell">
        <motion.header initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="qehpro-cart-heading">
          <div>
            <span><LockKeyhole /> Espace professionnel privé</span>
            <h1>Panier Matériel Pro</h1>
            <p>Catalogue et commande entièrement indépendants de QEH OUTLET.</p>
          </div>
          <div className="qehpro-company-pill"><Building2 /><span><small>Compte validé</small><strong>{professionalAccount?.company_name}</strong></span><BadgeCheck /></div>
        </motion.header>

        {items.length === 0 ? (
          <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="qehpro-empty-cart">
            <ShoppingCart />
            <h2>Votre panier professionnel est vide</h2>
            <p>Ajoutez du matériel depuis votre catalogue privé QEH Partner.</p>
            <Link to="/qeh-partner/materiel-pro" className="qehpro-gold-button"><ArrowLeft /> Découvrir le matériel</Link>
          </motion.div>
        ) : (
          <div className="qehpro-cart-layout">
            <div className="qehpro-cart-items">
              <AnimatePresence initial={false}>
                {items.map((item, index) => (
                  <motion.article
                    key={item.cart_item_id}
                    layout
                    initial={{ opacity: 0, x: -25 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -50, height: 0 }}
                    transition={{ delay: index * 0.04 }}
                    className="qehpro-cart-card"
                  >
                    <div className="qehpro-cart-card__image">
                      {item.image_url ? <img src={item.image_url} alt={item.name} /> : <PackageCheck />}
                    </div>
                    <div className="qehpro-cart-card__content">
                      <span>{item.reference || "QEH Partner"}</span>
                      <h2>{item.name}</h2>
                      <p>Minimum de commande : {item.minimum_quantity} · TVA {item.vat_rate} %</p>
                      <strong>{money(item.price_excluding_tax)} HT / unité</strong>
                    </div>
                    <div className="qehpro-cart-card__controls">
                      <div>
                        <button type="button" onClick={() => updateQuantity(item.cart_item_id, item.quantity - 1)} disabled={item.quantity <= item.minimum_quantity} aria-label="Réduire la quantité"><Minus /></button>
                        <input type="number" min={item.minimum_quantity} max={item.stock || undefined} value={item.quantity} onChange={(event) => updateQuantity(item.cart_item_id, event.target.value)} aria-label={`Quantité de ${item.name}`} />
                        <button type="button" onClick={() => updateQuantity(item.cart_item_id, item.quantity + 1)} disabled={item.stock > 0 && item.quantity >= item.stock} aria-label="Augmenter la quantité"><Plus /></button>
                      </div>
                      <strong>{money(item.price_excluding_tax * item.quantity)} HT</strong>
                      <button type="button" onClick={() => removeItem(item.cart_item_id)} className="qehpro-remove" aria-label={`Retirer ${item.name}`}><Trash2 /></button>
                    </div>
                  </motion.article>
                ))}
              </AnimatePresence>
              <Link to="/qeh-partner/materiel-pro" className="qehpro-back-link"><ArrowLeft /> Continuer mes achats professionnels</Link>
            </div>

            <motion.aside initial={{ opacity: 0, x: 25 }} animate={{ opacity: 1, x: 0 }} className="qehpro-cart-summary">
              <span><Sparkles /> Récapitulatif professionnel</span>
              <h2>{count} article{count > 1 ? "s" : ""}</h2>
              <div className="qehpro-summary-row"><span>Sous-total HT</span><strong>{money(subtotalExcludingTax)}</strong></div>
              <div className="qehpro-summary-row"><span>TVA</span><strong>{money(taxAmount)}</strong></div>
              <div className="qehpro-summary-total"><span>Total TTC</span><strong>{money(totalIncludingTax)}</strong></div>
              <div className="qehpro-summary-trust"><Truck /><p><strong>Logistique professionnelle</strong>Notre équipe confirme le transport adapté après réception.</p></div>
              <button type="button" onClick={submitOrder} disabled={submitting} className="qehpro-gold-button qehpro-gold-button--wide">
                {submitting ? <LoaderCircle className="qehpro-spin" /> : <ShieldCheck />}
                {submitting ? "Transmission sécurisée…" : "Valider la demande de commande"}
              </button>
              {!hasCompleteShippingAddress ? <p className="qehpro-address-warning">Votre adresse de livraison doit être complétée dans votre compte.</p> : null}
            </motion.aside>
          </div>
        )}
      </div>
    </section>
  );
}