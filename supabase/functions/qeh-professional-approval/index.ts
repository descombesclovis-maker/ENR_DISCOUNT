import { createClient } from "npm:@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const QEH_PRO_FROM_EMAIL = Deno.env.get("QEH_PRO_FROM_EMAIL");
const FRONTEND_URL = (Deno.env.get("FRONTEND_URL") || "").replace(/\/$/, "");
const BOT_TOKEN = Deno.env.get("TELEGRAM_BOT_TOKEN");
const CHAT_ID = Deno.env.get("TELEGRAM_CHAT_ID");
const WEBHOOK_SECRET = Deno.env.get("TELEGRAM_WEBHOOK_SECRET");

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) throw new Error("Configuration Supabase serveur absente.");

const service = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});
const functionUrl = `${SUPABASE_URL}/functions/v1/qeh-professional-approval`;
const corsHeaders = {
  "Access-Control-Allow-Origin": FRONTEND_URL || "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

type Decision = "approve" | "reject";
type Application = {
  id: string; email: string; first_name: string; last_name: string;
  company_name: string; siret: string; vat_number?: string | null;
  phone: string; address: string; postal_code: string; city: string;
  country?: string | null; status: string; [key: string]: unknown;
};

function json(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function escapeHtml(value: unknown) {
  return String(value ?? "")
    .replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;").replaceAll("'", "&#039;");
}

function errorMessage(error: unknown): string {
  if (error instanceof Error && error.message) return error.message;
  if (error && typeof error === "object") {
    const item = error as Record<string, unknown>;
    const parts = [item.message, item.details, item.hint, item.code]
      .filter((value) => typeof value === "string" && value.trim())
      .map((value) => String(value).trim());
    if (parts.length) return [...new Set(parts)].join(" · ");
  }
  return typeof error === "string" && error.trim() ? error.trim() : "Erreur interne inconnue.";
}

async function requireAdmin(request: Request) {
  const token = (request.headers.get("Authorization") || "").replace(/^Bearer\s+/i, "").trim();
  if (!token) throw new Error("ADMIN_AUTH_REQUIRED");
  const { data: userData, error: userError } = await service.auth.getUser(token);
  if (userError || !userData.user) throw new Error("ADMIN_AUTH_INVALID");
  const { data: admin, error } = await service.from("admin_users")
    .select("user_id, is_active").eq("user_id", userData.user.id).eq("is_active", true).maybeSingle();
  if (error || !admin) throw new Error("ADMIN_ACCESS_DENIED");
  return userData.user;
}

async function findUserByEmail(email: string) {
  for (let page = 1; page <= 20; page += 1) {
    const { data, error } = await service.auth.admin.listUsers({ page, perPage: 1000 });
    if (error) throw error;
    const found = data.users.find((user) => String(user.email || "").toLowerCase() === email.toLowerCase());
    if (found) return found;
    if (data.users.length < 1000) return null;
  }
  throw new Error("La recherche du compte professionnel a dépassé la limite autorisée.");
}

function randomPassword() {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  return `Qeh!${Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("")}`;
}

async function sendEmail(to: string, subject: string, html: string) {
  if (!RESEND_API_KEY || !QEH_PRO_FROM_EMAIL) throw new Error("Configuration e-mail professionnelle manquante.");
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: QEH_PRO_FROM_EMAIL, to: [to], subject, html }),
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result?.message || "L’e-mail n’a pas pu être envoyé.");
}

function emailFrame(content: string) {
  return `<!doctype html><html lang="fr"><body style="margin:0;background:#020711;font-family:Arial,sans-serif;color:#eef2f7"><div style="padding:42px 16px"><div style="max-width:620px;margin:auto;border:1px solid #bd8a31;border-radius:26px;overflow:hidden;background:#071426"><div style="height:5px;background:linear-gradient(90deg,#8a5d17,#f3d98b,#8a5d17)"></div><div style="padding:38px"><div style="font-size:28px;font-weight:900;letter-spacing:3px;color:white">QEH <span style="color:#f3d98b">PARTNER</span></div><div style="margin-top:7px;color:#9da9b9;font-size:12px;letter-spacing:2px">MATÉRIEL PROFESSIONNEL</div>${content}<div style="margin-top:34px;padding-top:20px;border-top:1px solid rgba(255,255,255,.12);color:#8190a5;font-size:12px;line-height:1.6">Message automatique envoyé par QEH PARTNER.</div></div></div></div></body></html>`;
}

async function telegram(method: string, payload: Record<string, unknown>) {
  if (!BOT_TOKEN) throw new Error("TELEGRAM_BOT_TOKEN manquant.");
  const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/${method}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const result = await response.json();
  if (!response.ok || !result?.ok) throw new Error(result?.description || `Erreur Telegram ${method}.`);
  return result;
}

async function notifyTelegram(application: Application) {
  if (!CHAT_ID || !WEBHOOK_SECRET) throw new Error("Configuration Telegram manquante.");
  await telegram("setWebhook", {
    url: functionUrl,
    secret_token: WEBHOOK_SECRET,
    allowed_updates: ["callback_query"],
    drop_pending_updates: false,
  });
  await telegram("sendMessage", {
    chat_id: CHAT_ID,
    text: [
      "🪪 NOUVELLE CANDIDATURE MATÉRIEL PRO", "",
      `Entreprise : ${application.company_name}`,
      `Référence : ${application.id.slice(0, 8).toUpperCase()}`, "",
      "Les coordonnées restent protégées dans l’administration QEH.",
      FRONTEND_URL ? `Consulter le dossier : ${FRONTEND_URL}/admin/partner/professionnels` : "",
      "La décision ci-dessous sera immédiatement synchronisée.",
    ].join("\n"),
    disable_web_page_preview: true,
    reply_markup: { inline_keyboard: [[
      { text: "✅ Accepter", callback_data: `qehpro:approve:${application.id}` },
      { text: "❌ Refuser", callback_data: `qehpro:reject:${application.id}` },
    ]] },
  });
}

async function telegramNotificationsEnabled() {
  const { data, error } = await service.from("qeh_admin_settings")
    .select("value").eq("setting_key", "notifications").maybeSingle();
  if (error) {
    console.error("Paramètres Telegram indisponibles :", error);
    return true;
  }
  const settings = (data?.value || {}) as Record<string, unknown>;
  return settings.telegram_enabled !== false && settings.notify_partner_request !== false;
}

async function processDecision(
  applicationId: string,
  decision: Decision,
  rejectionReason: string | undefined,
  reviewerId: string | null,
) {
  const { data: current, error: currentError } = await service
    .from("qeh_professional_applications").select("*").eq("id", applicationId).single();
  if (currentError || !current) throw new Error("Candidature professionnelle introuvable.");
  if (["approved", "rejected"].includes(current.status)) {
    return { success: true, decision: current.status, already_processed: true };
  }

  const { data: claimed, error: claimError } = await service.from("qeh_professional_applications")
    .update({ status: "processing", processing_error: null, updated_at: new Date().toISOString() })
    .eq("id", applicationId).in("status", ["pending", "error"]).select("*").maybeSingle();
  if (claimError) throw claimError;
  if (!claimed) throw new Error("Cette candidature est déjà en cours de traitement.");
  const application = claimed as Application;

  try {
    if (decision === "reject") {
      const reason = String(rejectionReason || "Votre demande ne répond pas encore aux critères d’ouverture d’un compte Matériel Pro.").trim();
      await sendEmail(
        application.email,
        "Réponse à votre candidature QEH PARTNER",
        emailFrame(`<h1 style="margin:32px 0 12px;font-size:30px">Votre demande a été étudiée</h1><p style="color:#c7d0dc;line-height:1.7">Bonjour ${escapeHtml(application.first_name)},</p><p style="color:#c7d0dc;line-height:1.7">Nous ne pouvons pas ouvrir votre accès Matériel Pro pour le moment.</p><div style="margin:22px 0;padding:18px;border-left:3px solid #d8a93d;background:rgba(216,169,61,.08);color:#e4e8ed">${escapeHtml(reason)}</div>`),
      );
      const { error } = await service.from("qeh_professional_applications").update({
        status: "rejected", rejection_reason: reason, reviewed_by: reviewerId,
        reviewed_at: new Date().toISOString(), processing_error: null, updated_at: new Date().toISOString(),
      }).eq("id", application.id).eq("status", "processing");
      if (error) throw error;
      return { success: true, decision: "rejected" };
    }

    if (!FRONTEND_URL) throw new Error("FRONTEND_URL manquant.");
    let authUser = await findUserByEmail(application.email);
    if (!authUser) {
      const { data, error } = await service.auth.admin.createUser({
        email: application.email,
        password: randomPassword(),
        email_confirm: true,
        app_metadata: { qeh_account_type: "professional" },
        user_metadata: {
          first_name: application.first_name,
          last_name: application.last_name,
          company_name: application.company_name,
        },
      });
      if (error || !data.user) throw error || new Error("Compte Auth non créé.");
      authUser = data.user;
    } else {
      const { data, error } = await service.auth.admin.updateUserById(authUser.id, {
        app_metadata: { ...(authUser.app_metadata || {}), qeh_account_type: "professional" },
      });
      if (error || !data.user) throw error || new Error("Compte Auth non mis à jour.");
      authUser = data.user;
    }

    const { error: profileError } = await service.from("customer_profiles").upsert({
      id: authUser.id, first_name: application.first_name, last_name: application.last_name,
      email: application.email, company: application.company_name, phone: application.phone,
      address: application.address, postal_code: application.postal_code, city: application.city,
      country: application.country || "France", updated_at: new Date().toISOString(),
    }, { onConflict: "id" });
    if (profileError) throw profileError;

    const { data: linkData, error: linkError } = await service.auth.admin.generateLink({
      type: "recovery",
      email: application.email,
      options: { redirectTo: `${FRONTEND_URL}/qeh-partner/reinitialiser-mot-de-passe` },
    });
    if (linkError || !linkData?.properties?.action_link) {
      throw linkError || new Error("Lien sécurisé d’activation non généré.");
    }
    await sendEmail(
      application.email,
      "Votre accès QEH PARTNER Matériel Pro est validé",
      emailFrame(`<h1 style="margin:32px 0 12px;font-size:31px">Bienvenue dans l’espace Matériel Pro</h1><p style="color:#c7d0dc;line-height:1.7">Bonjour ${escapeHtml(application.first_name)},</p><p style="color:#c7d0dc;line-height:1.7">Votre entreprise <strong style="color:white">${escapeHtml(application.company_name)}</strong> a été vérifiée. Votre accès professionnel est maintenant autorisé.</p><div style="margin:24px 0;padding:20px;border-radius:16px;background:#020711;border:1px solid rgba(216,169,61,.3)"><div style="color:#8e9bad;font-size:12px;text-transform:uppercase;letter-spacing:1px">Votre identifiant</div><div style="margin-top:7px;color:#f3d98b;font-size:18px;font-weight:800">${escapeHtml(application.email)}</div></div><a href="${escapeHtml(linkData.properties.action_link)}" style="display:block;margin:28px 0;padding:17px 22px;border-radius:14px;background:linear-gradient(110deg,#a8751f,#f6dc91,#c5902f);color:#07101c;text-align:center;text-decoration:none;font-weight:900">Choisir mon mot de passe et activer mon accès</a><p style="color:#8e9bad;font-size:13px;line-height:1.6">Pour votre sécurité, aucun mot de passe n’est envoyé en clair.</p>`),
    );

    const { error: accountError } = await service.from("qeh_professional_accounts").upsert({
      user_id: authUser.id, company_name: application.company_name, siret: application.siret,
      vat_number: application.vat_number, status: "approved", updated_at: new Date().toISOString(),
    }, { onConflict: "user_id" });
    if (accountError) throw accountError;

    const { error: finalError } = await service.from("qeh_professional_applications").update({
      status: "approved", auth_user_id: authUser.id, reviewed_by: reviewerId,
      reviewed_at: new Date().toISOString(), approval_email_sent_at: new Date().toISOString(),
      processing_error: null, updated_at: new Date().toISOString(),
    }).eq("id", application.id).eq("status", "processing");
    if (finalError) throw finalError;
    return { success: true, decision: "approved", email_sent: true };
  } catch (error) {
    await service.from("qeh_professional_applications").update({
      status: "error", processing_error: errorMessage(error), updated_at: new Date().toISOString(),
    }).eq("id", application.id).eq("status", "processing");
    throw error;
  }
}

async function handleTelegramUpdate(body: Record<string, unknown>) {
  const callback = body.callback_query as Record<string, unknown> | undefined;
  if (!callback) return json({ received: true, ignored: true });
  const message = callback.message as Record<string, unknown> | undefined;
  const chat = message?.chat as Record<string, unknown> | undefined;
  const callbackId = String(callback.id || "");

  if (!CHAT_ID || String(chat?.id || "") !== String(CHAT_ID)) {
    if (callbackId) {
      await telegram("answerCallbackQuery", {
        callback_query_id: callbackId, text: "Action non autorisée.", show_alert: true,
      });
    }
    return json({ received: true, ignored: true }, 403);
  }

  const match = String(callback.data || "").match(/^qehpro:(approve|reject):([0-9a-f-]{36})$/i);
  if (!match) return json({ received: true, ignored: true });
  const decision = match[1].toLowerCase() as Decision;
  await telegram("answerCallbackQuery", {
    callback_query_id: callbackId, text: "Décision en cours de traitement…",
  });
  const result = await processDecision(match[2], decision, undefined, null);
  const finalLabel = result.decision === "approved"
    ? "✅ ACCEPTÉE — e-mail d’activation envoyé"
    : "❌ REFUSÉE — candidat informé par e-mail";
  await telegram("editMessageText", {
    chat_id: CHAT_ID,
    message_id: message?.message_id,
    text: `${String(message?.text || "Candidature Matériel Pro")}\n\n${finalLabel}`,
    disable_web_page_preview: true,
  });
  return json({ received: true, ...result });
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (request.method !== "POST") return json({ error: "Méthode non autorisée." }, 405);

  const telegramRequest = Boolean(
    WEBHOOK_SECRET && request.headers.get("x-telegram-bot-api-secret-token") === WEBHOOK_SECRET,
  );
  const internalRequest = Boolean(
    WEBHOOK_SECRET && request.headers.get("x-qeh-notification-secret") === WEBHOOK_SECRET,
  );

  try {
    const body = await request.json() as Record<string, unknown>;
    if (telegramRequest) return await handleTelegramUpdate(body);
    if (internalRequest) {
      const record = body.record as { id?: string } | undefined;
      if (body.type === "INSERT" && body.table === "qeh_professional_applications" && record?.id) {
        if (!(await telegramNotificationsEnabled())) {
          return json({ received: true, ignored: true, reason: "Notifications Telegram désactivées." });
        }
        const { data: application, error } = await service.from("qeh_professional_applications")
          .select("*").eq("id", record.id).single();
        if (error || !application) throw error || new Error("Candidature introuvable.");
        await notifyTelegram(application as Application);
        return json({ received: true, notified: true });
      }
      return json({ received: true, ignored: true });
    }

    const admin = await requireAdmin(request);
    const applicationId = typeof body.application_id === "string" ? body.application_id : "";
    const decision = body.decision === "approve" || body.decision === "reject" ? body.decision : "";
    if (!applicationId || !decision) return json({ error: "Décision ou candidature absente." }, 400);
    const result = await processDecision(
      applicationId,
      decision,
      typeof body.rejection_reason === "string" ? body.rejection_reason : undefined,
      admin.id,
    );
    return json(result);
  } catch (error) {
    const message = errorMessage(error);
    console.error("Erreur qeh-professional-approval:", error);
    const unauthorized = message.startsWith("ADMIN_");
    return json({ error: unauthorized ? "Accès administrateur refusé." : message }, unauthorized ? 403 : 500);
  }
});
