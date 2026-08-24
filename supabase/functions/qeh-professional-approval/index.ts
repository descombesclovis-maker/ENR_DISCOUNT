import { createClient } from "npm:@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const QEH_PRO_FROM_EMAIL = Deno.env.get("QEH_PRO_FROM_EMAIL");
const FRONTEND_URL = (Deno.env.get("FRONTEND_URL") || "").replace(/\/$/, "");

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error("Configuration Supabase serveur absente.");
}

const service = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function escapeHtml(value: unknown) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  if (error && typeof error === "object") {
    const structuredError = error as Record<string, unknown>;
    const parts = [
      structuredError.message,
      structuredError.details,
      structuredError.hint,
      structuredError.code,
    ]
      .filter((value) => typeof value === "string" && value.trim())
      .map((value) => String(value).trim());

    if (parts.length > 0) {
      return [...new Set(parts)].join(" · ");
    }

    try {
      return JSON.stringify(error);
    } catch {
      // On utilise le message de secours ci-dessous.
    }
  }

  if (typeof error === "string" && error.trim()) {
    return error.trim();
  }

  return "Erreur interne inconnue.";
}

async function requireAdmin(request: Request) {
  const authorization = request.headers.get("Authorization") || "";
  const token = authorization.replace(/^Bearer\s+/i, "").trim();

  if (!token) throw new Error("ADMIN_AUTH_REQUIRED");

  const { data: userData, error: userError } = await service.auth.getUser(token);
  if (userError || !userData.user) throw new Error("ADMIN_AUTH_INVALID");

  const { data: admin, error: adminError } = await service
    .from("admin_users")
    .select("user_id, is_active")
    .eq("user_id", userData.user.id)
    .eq("is_active", true)
    .maybeSingle();

  if (adminError || !admin) throw new Error("ADMIN_ACCESS_DENIED");
  return userData.user;
}

async function findUserByEmail(email: string) {
  for (let page = 1; page <= 20; page += 1) {
    const { data, error } = await service.auth.admin.listUsers({ page, perPage: 1000 });
    if (error) throw error;

    const found = data.users.find(
      (user) => String(user.email || "").toLowerCase() === email.toLowerCase(),
    );

    if (found) return found;
    if (data.users.length < 1000) return null;
  }

  throw new Error("La recherche du compte professionnel a dépassé la limite autorisée.");
}

function randomPassword() {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  const value = Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
  return `Qeh!${value}`;
}

async function sendEmail(to: string, subject: string, html: string) {
  if (!RESEND_API_KEY || !QEH_PRO_FROM_EMAIL) {
    throw new Error("RESEND_API_KEY ou QEH_PRO_FROM_EMAIL manquant.");
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from: QEH_PRO_FROM_EMAIL, to: [to], subject, html }),
  });

  const result = await response.json();
  if (!response.ok) {
    throw new Error(result?.message || "L’e-mail n’a pas pu être envoyé.");
  }

  return result;
}

function emailFrame(content: string) {
  return `<!doctype html><html lang="fr"><body style="margin:0;background:#020711;font-family:Arial,sans-serif;color:#eef2f7"><div style="padding:42px 16px"><div style="max-width:620px;margin:auto;border:1px solid #bd8a31;border-radius:26px;overflow:hidden;background:#071426;box-shadow:0 30px 80px rgba(0,0,0,.4)"><div style="height:5px;background:linear-gradient(90deg,#8a5d17,#f3d98b,#8a5d17)"></div><div style="padding:38px"><div style="font-size:28px;font-weight:900;letter-spacing:3px;color:white">QEH <span style="color:#f3d98b">PARTNER</span></div><div style="margin-top:7px;color:#9da9b9;font-size:12px;letter-spacing:2px">MATÉRIEL PROFESSIONNEL</div>${content}<div style="margin-top:34px;padding-top:20px;border-top:1px solid rgba(255,255,255,.12);color:#8190a5;font-size:12px;line-height:1.6">Message automatique envoyé par QEH PARTNER. Si vous n’êtes pas à l’origine de cette demande, vous pouvez ignorer cet e-mail.</div></div></div></div></body></html>`;
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (request.method !== "POST") return json({ error: "Méthode non autorisée." }, 405);

  let applicationId = "";

  try {
    const admin = await requireAdmin(request);
    const body = await request.json();
    applicationId = typeof body.application_id === "string" ? body.application_id : "";
    const decision = body.decision === "approve" || body.decision === "reject"
      ? body.decision
      : "";

    if (!applicationId || !decision) {
      return json({ error: "Décision ou candidature absente." }, 400);
    }

    const { data: application, error: applicationError } = await service
      .from("qeh_professional_applications")
      .select("*")
      .eq("id", applicationId)
      .single();

    if (applicationError || !application) {
      return json({ error: "Candidature professionnelle introuvable." }, 404);
    }

    if (!["pending", "error"].includes(application.status)) {
      return json({ error: "Cette candidature a déjà été traitée." }, 409);
    }

    if (decision === "reject") {
      const reason = String(body.rejection_reason || "Votre demande ne répond pas encore aux critères d’ouverture d’un compte Matériel Pro.").trim();

      await sendEmail(
        application.email,
        "Réponse à votre candidature QEH PARTNER",
        emailFrame(`<h1 style="margin:32px 0 12px;font-size:30px">Votre demande a été étudiée</h1><p style="color:#c7d0dc;line-height:1.7">Bonjour ${escapeHtml(application.first_name)},</p><p style="color:#c7d0dc;line-height:1.7">Nous ne pouvons pas ouvrir votre accès Matériel Pro pour le moment.</p><div style="margin:22px 0;padding:18px;border-left:3px solid #d8a93d;background:rgba(216,169,61,.08);color:#e4e8ed">${escapeHtml(reason)}</div><p style="color:#c7d0dc;line-height:1.7">Notre équipe reste disponible pour réexaminer votre situation.</p>`),
      );

      const { error } = await service
        .from("qeh_professional_applications")
        .update({
          status: "rejected",
          rejection_reason: reason,
          reviewed_by: admin.id,
          reviewed_at: new Date().toISOString(),
          processing_error: null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", application.id);

      if (error) throw error;
      return json({ success: true, decision: "rejected" });
    }

    if (!FRONTEND_URL) throw new Error("FRONTEND_URL manquant.");

    await service
      .from("qeh_professional_applications")
      .update({ status: "processing", processing_error: null, updated_at: new Date().toISOString() })
      .eq("id", application.id);

    let authUser = await findUserByEmail(application.email);

    if (!authUser) {
      const { data, error } = await service.auth.admin.createUser({
        email: application.email,
        password: randomPassword(),
        email_confirm: true,
        user_metadata: {
          qeh_account_type: "professional",
          first_name: application.first_name,
          last_name: application.last_name,
          company_name: application.company_name,
        },
      });

      if (error || !data.user) throw error || new Error("Compte Auth non créé.");
      authUser = data.user;
    }

    const { error: profileError } = await service
      .from("customer_profiles")
      .upsert({
        id: authUser.id,
        first_name: application.first_name,
        last_name: application.last_name,
        email: application.email,
        company: application.company_name,
        phone: application.phone,
        address: application.address,
        postal_code: application.postal_code,
        city: application.city,
        country: application.country || "France",
        updated_at: new Date().toISOString(),
      }, { onConflict: "id" });

    if (profileError) throw profileError;

    const { error: accountError } = await service
      .from("qeh_professional_accounts")
      .upsert({
        user_id: authUser.id,
        company_name: application.company_name,
        siret: application.siret,
        vat_number: application.vat_number,
        status: "approved",
        updated_at: new Date().toISOString(),
      }, { onConflict: "user_id" });

    if (accountError) throw accountError;

    const { data: linkData, error: linkError } = await service.auth.admin.generateLink({
      type: "recovery",
      email: application.email,
      options: {
        redirectTo: `${FRONTEND_URL}/qeh-partner/reinitialiser-mot-de-passe`,
      },
    });

    if (linkError || !linkData?.properties?.action_link) {
      throw linkError || new Error("Lien sécurisé d’activation non généré.");
    }

    await sendEmail(
      application.email,
      "Votre accès QEH PARTNER Matériel Pro est validé",
      emailFrame(`<h1 style="margin:32px 0 12px;font-size:31px">Bienvenue dans l’espace Matériel Pro</h1><p style="color:#c7d0dc;line-height:1.7">Bonjour ${escapeHtml(application.first_name)},</p><p style="color:#c7d0dc;line-height:1.7">Votre entreprise <strong style="color:white">${escapeHtml(application.company_name)}</strong> a été vérifiée. Votre accès professionnel est maintenant autorisé.</p><div style="margin:24px 0;padding:20px;border-radius:16px;background:#020711;border:1px solid rgba(216,169,61,.3)"><div style="color:#8e9bad;font-size:12px;text-transform:uppercase;letter-spacing:1px">Votre identifiant</div><div style="margin-top:7px;color:#f3d98b;font-size:18px;font-weight:800">${escapeHtml(application.email)}</div></div><a href="${escapeHtml(linkData.properties.action_link)}" style="display:block;margin:28px 0;padding:17px 22px;border-radius:14px;background:linear-gradient(110deg,#a8751f,#f6dc91,#c5902f);color:#07101c;text-align:center;text-decoration:none;font-weight:900">Choisir mon mot de passe et activer mon accès</a><p style="color:#8e9bad;font-size:13px;line-height:1.6">Pour votre sécurité, aucun mot de passe n’est envoyé en clair. Ce bouton vous permet de définir personnellement votre mot de passe.</p>`),
    );

    const { error: finalError } = await service
      .from("qeh_professional_applications")
      .update({
        status: "approved",
        auth_user_id: authUser.id,
        reviewed_by: admin.id,
        reviewed_at: new Date().toISOString(),
        approval_email_sent_at: new Date().toISOString(),
        processing_error: null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", application.id);

    if (finalError) throw finalError;
    return json({ success: true, decision: "approved", email_sent: true });
  } catch (error) {
    const message = getErrorMessage(error);
    console.error("Erreur qeh-professional-approval:", error);

    if (applicationId) {
      await service
        .from("qeh_professional_applications")
        .update({ status: "error", processing_error: message, updated_at: new Date().toISOString() })
        .eq("id", applicationId)
        .in("status", ["pending", "processing", "error"]);
    }

    const unauthorized = message.startsWith("ADMIN_");
    return json({ error: unauthorized ? "Accès administrateur refusé." : message }, unauthorized ? 403 : 500);
  }
});
