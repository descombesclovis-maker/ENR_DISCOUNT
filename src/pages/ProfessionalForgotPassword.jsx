import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, CheckCircle2, Mail, Send, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "../lib/supabase";

export default function ProfessionalForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(
        email.trim().toLowerCase(),
        { redirectTo: `${window.location.origin}/qeh-partner/reinitialiser-mot-de-passe` }
      );
      if (error) throw error;
      setSent(true);
      toast.success("Lien de réinitialisation envoyé.");
    } catch (error) {
      toast.error(error?.message || "Impossible d’envoyer le lien.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="qehpro-auth">
      <div className="qehpro-auth__grid" /><div className="qehpro-orb qehpro-orb--one" /><div className="qehpro-orb qehpro-orb--two" />
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="qehpro-auth__card qehpro-auth__card--compact">
        <div className="qehpro-auth__shine" />
        <div className="qehpro-auth__brand">
          <img src="/images/qeh-partner-logo-gold.png" alt="QEH PARTNER" />
          <span><Sparkles /> Récupération sécurisée</span>
          <h1>Mot de passe oublié</h1>
          <p>Recevez un lien sécurisé sur l’adresse de votre compte professionnel.</p>
        </div>

        {!sent ? (
          <form onSubmit={handleSubmit} className="qehpro-auth__form">
            <label><span>Adresse e-mail professionnelle</span><div><Mail /><input type="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="vous@entreprise.fr" /></div></label>
            <button type="submit" disabled={loading} className="qehpro-gold-button">{loading ? <span className="qehpro-loader" /> : <Send />}{loading ? "Envoi…" : "Recevoir le lien"}</button>
          </form>
        ) : (
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="qehpro-success">
            <CheckCircle2 /><h2>Consultez votre boîte mail</h2><p>Si ce compte existe, le lien vient d’être envoyé à <strong>{email}</strong>.</p>
          </motion.div>
        )}

        <div className="qehpro-auth__footer"><Link to="/qeh-partner/connexion-pro"><ArrowLeft /> Retour à la connexion Pro</Link></div>
      </motion.div>
    </section>
  );
}