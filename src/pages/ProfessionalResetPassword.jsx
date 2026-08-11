import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle2, Lock, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "../lib/supabase";

export default function ProfessionalResetPassword() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [sessionReady, setSessionReady] = useState(false);
  const [checking, setChecking] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    supabase.auth.getSession().then(({ data }) => {
      if (mounted) { setSessionReady(Boolean(data.session)); setChecking(false); }
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (mounted && (event === "PASSWORD_RECOVERY" || session)) { setSessionReady(true); setChecking(false); }
    });
    return () => { mounted = false; subscription.unsubscribe(); };
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();
    if (password.length < 8) return toast.error("Utilisez au moins 8 caractères.");
    if (password !== confirmation) return toast.error("Les mots de passe ne correspondent pas.");
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      await supabase.auth.signOut();
      toast.success("Votre mot de passe professionnel a été modifié.");
      navigate("/qeh-partner/connexion-pro", { replace: true });
    } catch (error) {
      toast.error(error?.message || "Modification impossible.");
    } finally { setLoading(false); }
  }

  if (checking) return <section className="qehpro-auth"><span className="qehpro-loader" /></section>;

  return (
    <section className="qehpro-auth">
      <div className="qehpro-auth__grid" /><div className="qehpro-orb qehpro-orb--one" /><div className="qehpro-orb qehpro-orb--two" />
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="qehpro-auth__card qehpro-auth__card--compact">
        <div className="qehpro-auth__shine" />
        <div className="qehpro-auth__brand"><img src="/images/qeh-partner-logo-gold.png" alt="QEH PARTNER" /><span><ShieldCheck /> Protection du compte</span><h1>Nouveau mot de passe</h1></div>
        {sessionReady ? (
          <form onSubmit={handleSubmit} className="qehpro-auth__form">
            <label><span>Nouveau mot de passe</span><div><Lock /><input type="password" minLength="8" required value={password} onChange={(event) => setPassword(event.target.value)} /></div></label>
            <label><span>Confirmer le mot de passe</span><div><Lock /><input type="password" minLength="8" required value={confirmation} onChange={(event) => setConfirmation(event.target.value)} /></div></label>
            <button type="submit" disabled={loading} className="qehpro-gold-button">{loading ? <span className="qehpro-loader" /> : <CheckCircle2 />}{loading ? "Modification…" : "Enregistrer"}</button>
          </form>
        ) : (
          <div className="qehpro-success"><h2>Lien invalide ou expiré</h2><Link to="/qeh-partner/mot-de-passe-oublie">Demander un nouveau lien</Link></div>
        )}
      </motion.div>
    </section>
  );
}