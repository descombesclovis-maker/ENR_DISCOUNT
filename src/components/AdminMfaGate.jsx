import React, { useCallback, useEffect, useState } from "react";
import { KeyRound, LoaderCircle, LockKeyhole, ShieldCheck, Smartphone } from "lucide-react";
import { Outlet } from "react-router-dom";
import { supabase } from "../lib/supabase";

export default function AdminMfaGate() {
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState("checking");
  const [factorId, setFactorId] = useState("");
  const [qrCode, setQrCode] = useState("");
  const [manualSecret, setManualSecret] = useState("");
  const [code, setCode] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const refreshSecurityState = useCallback(async () => {
    setLoading(true);
    setErrorMessage("");

    try {
      const { data: aal, error: aalError } =
        await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
      if (aalError) throw aalError;

      if (aal?.currentLevel === "aal2") {
        setMode("verified");
        return;
      }

      const { data: factors, error: factorsError } =
        await supabase.auth.mfa.listFactors();
      if (factorsError) throw factorsError;

      const verifiedTotp = (factors?.totp || []).find(
        (factor) => factor.status === "verified",
      );

      if (verifiedTotp) {
        setFactorId(verifiedTotp.id);
        setMode("challenge");
      } else {
        setMode("enroll");
      }
    } catch (error) {
      console.error("Vérification MFA administrateur impossible :", error);
      setMode("error");
      setErrorMessage(
        "Impossible de vérifier la double authentification. L’administration reste verrouillée par sécurité.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshSecurityState();
  }, [refreshSecurityState]);

  async function startEnrollment() {
    setSubmitting(true);
    setErrorMessage("");

    try {
      const { data, error } = await supabase.auth.mfa.enroll({
        factorType: "totp",
        friendlyName: "QEH Administration",
      });
      if (error) throw error;

      setFactorId(data.id);
      setQrCode(data.totp?.qr_code || "");
      setManualSecret(data.totp?.secret || "");
      setMode("verify-enrollment");
    } catch (error) {
      console.error("Activation MFA impossible :", error);
      setErrorMessage(
        error?.message || "Impossible de démarrer la double authentification.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function verifyTotp() {
    const cleanCode = code.replace(/\s+/g, "");
    if (!/^\d{6}$/.test(cleanCode)) {
      setErrorMessage("Saisissez le code à 6 chiffres de votre application d’authentification.");
      return;
    }

    if (!factorId) {
      setErrorMessage("Facteur MFA introuvable. Rechargez la page.");
      return;
    }

    setSubmitting(true);
    setErrorMessage("");

    try {
      const { data: challenge, error: challengeError } =
        await supabase.auth.mfa.challenge({ factorId });
      if (challengeError) throw challengeError;

      const { error: verifyError } = await supabase.auth.mfa.verify({
        factorId,
        challengeId: challenge.id,
        code: cleanCode,
      });
      if (verifyError) throw verifyError;

      setCode("");
      setQrCode("");
      setManualSecret("");
      await refreshSecurityState();
    } catch (error) {
      console.error("Validation MFA impossible :", error);
      setErrorMessage(
        "Code invalide ou expiré. Attendez le prochain code de votre application et réessayez.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (loading || mode === "checking") {
    return (
      <div className="min-h-screen grid place-items-center bg-[#020711] px-5 text-white">
        <div className="text-center">
          <LoaderCircle className="mx-auto mb-4 h-10 w-10 animate-spin text-[#69b72d]" />
          <p className="font-display font-bold">Vérification de la sécurité administrateur…</p>
        </div>
      </div>
    );
  }

  if (mode === "verified") return <Outlet />;

  return (
    <div className="min-h-screen bg-[#020711] px-5 py-12 text-white grid place-items-center">
      <div className="w-full max-w-xl overflow-hidden rounded-[30px] border border-white/10 bg-white text-[#020711] shadow-[0_35px_110px_rgba(0,0,0,.45)]">
        <div className="h-1.5 bg-gradient-to-r from-[#17649e] via-[#c99532] to-[#69b72d]" />
        <div className="p-6 sm:p-9">
          <div className="flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#020711] text-white">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-[.18em] text-[#17649e]">QEH · Sécurité</p>
              <h1 className="mt-1 font-display text-2xl font-black">Double authentification obligatoire</h1>
            </div>
          </div>

          <p className="mt-5 text-sm leading-relaxed text-slate-600">
            Le mot de passe seul ne suffit plus pour accéder à l’administration. Utilisez une application TOTP comme Google Authenticator, Microsoft Authenticator, Authy ou 1Password.
          </p>

          {errorMessage && (
            <div role="alert" className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
              {errorMessage}
            </div>
          )}

          {mode === "enroll" && (
            <div className="mt-7">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                <div className="flex gap-3">
                  <Smartphone className="h-5 w-5 shrink-0 text-[#17649e]" />
                  <p>Vous allez scanner un QR code avec votre téléphone. Aucun numéro de téléphone n’est nécessaire.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={startEnrollment}
                disabled={submitting}
                className="mt-5 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-[#020711] px-6 font-bold text-white disabled:opacity-60"
              >
                {submitting ? <LoaderCircle className="h-5 w-5 animate-spin" /> : <LockKeyhole className="h-5 w-5" />}
                Activer la double authentification
              </button>
            </div>
          )}

          {mode === "verify-enrollment" && (
            <div className="mt-7">
              {qrCode && (
                <div className="mx-auto w-fit rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
                  <img src={qrCode} alt="QR code de double authentification QEH" className="h-56 w-56" />
                </div>
              )}
              {manualSecret && (
                <details className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm">
                  <summary className="cursor-pointer font-bold text-slate-700">Impossible de scanner le QR code ?</summary>
                  <p className="mt-3 break-all font-mono text-xs text-slate-600">{manualSecret}</p>
                  <p className="mt-2 text-xs text-slate-500">Ne partagez jamais cette clé.</p>
                </details>
              )}
              <p className="mt-5 text-sm font-semibold text-slate-700">Entrez ensuite le code à 6 chiffres affiché dans l’application :</p>
              <TotpInput code={code} setCode={setCode} submitting={submitting} onSubmit={verifyTotp} />
            </div>
          )}

          {mode === "challenge" && (
            <div className="mt-7">
              <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800">
                Votre mot de passe est validé. Entrez maintenant le code temporaire de votre application d’authentification.
              </div>
              <TotpInput code={code} setCode={setCode} submitting={submitting} onSubmit={verifyTotp} />
            </div>
          )}

          {mode === "error" && (
            <button
              type="button"
              onClick={refreshSecurityState}
              className="mt-5 min-h-12 w-full rounded-full bg-[#020711] px-6 font-bold text-white"
            >
              Réessayer la vérification
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function TotpInput({ code, setCode, submitting, onSubmit }) {
  return (
    <form
      className="mt-4"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
    >
      <div className="relative">
        <KeyRound className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
        <input
          value={code}
          onChange={(event) => setCode(event.target.value.replace(/\D/g, "").slice(0, 6))}
          inputMode="numeric"
          autoComplete="one-time-code"
          pattern="[0-9]{6}"
          maxLength={6}
          placeholder="000000"
          className="h-14 w-full rounded-2xl border border-slate-200 bg-slate-50 pl-12 pr-4 text-center font-mono text-2xl font-black tracking-[.35em] outline-none focus:border-[#17649e] focus:bg-white focus:ring-4 focus:ring-[#17649e]/10"
        />
      </div>
      <button
        type="submit"
        disabled={submitting || code.length !== 6}
        className="mt-4 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-[#17649e] px-6 font-bold text-white disabled:opacity-50"
      >
        {submitting && <LoaderCircle className="h-5 w-5 animate-spin" />}
        Valider le code sécurisé
      </button>
    </form>
  );
}
