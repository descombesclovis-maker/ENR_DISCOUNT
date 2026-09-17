import { createClient } from "npm:@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const RESEND_ORDER_API_KEY = Deno.env.get("RESEND_ORDER_API_KEY");
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const FROM_EMAIL = Deno.env.get("QEH_OUTLET_FROM_EMAIL") || Deno.env.get("QEH_PRO_FROM_EMAIL");
const FRONTEND_URL = (Deno.env.get("FRONTEND_URL") || "https://www.qeh-outlet.fr").replace(/\/$/, "");

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) throw new Error("Configuration Supabase serveur absente.");

const service = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
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
    headers: { ...corsHeaders, "Content-Type": "application/json", "Cache-Control": "no-store" },
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

function messageFromError(error: unknown) {
  return error instanceof Error ? error.message : String(error || "Erreur inconnue");
}

async function requireAdmin(request: Request) {
  const token = (request.headers.get("Authorization") || "").replace(/^Bearer\s+/i, "").trim();
  if (!token) throw new Error("ADMIN_AUTH_REQUIRED");

  const { data: userData, error: userError } = await service.auth.getUser(token);
  if (userError || !userData.user) throw new Error("ADMIN_AUTH_INVALID");

  const { data: admin, error } = await service
    .from("admin_users")
    .select("user_id, is_active")
    .eq("user_id", userData.user.id)
    .eq("is_active", true)
    .maybeSingle();

  if (error || !admin) throw new Error("ADMIN_ACCESS_DENIED");
  return userData.user;
}

function statusConfig(status: string) {
  if (status === "processing") {
    return {
      label: "Colis pris en charge",
      subject: "Votre commande QEH OUTLET est prise en charge",
      title: "Votre commande est prise en charge",
      text: "Notre équipe prépare maintenant votre commande pour son départ.",
    };
  }

  if (status === "shipped") {
    return {
      label: "Commande expédiée",
      subject: "Votre commande QEH OUTLET a été expédiée",
      title: "Votre colis est en route",
      text: "Votre commande a quitté nos locaux et poursuit maintenant son acheminement.",
    };
  }

  if (status === "delivered") {
    return {
      label: "Commande livrée",
      subject: "Votre commande QEH OUTLET est arrivée",
      title: "Votre colis est arrivé",
      text: "La livraison de votre commande est indiquée comme terminée.",
    };
  }

  throw new Error("Statut de livraison invalide.");
}

function carrierTrackingUrl(carrier: string | null) {
  const cleanCarrier = String(carrier || "").toLowerCase();
  if (cleanCarrier.includes("chronopost")) return "https://www.chronopost.fr/fr/suivi-colis";
  if (cleanCarrier.includes("colissimo") || cleanCarrier.includes("poste")) return "https://www.laposte.fr/outils/suivre-vos-envois";
  if (cleanCarrier.includes("mondial")) return "https://www.mondialrelay.fr/suivi-de-colis/";
  return null;
}

type EmailAttempt = { apiKey: string; from: string };

async function sendEmail(to: string, subject: string, html: string) {
  if (!FROM_EMAIL) throw new Error("Adresse d’envoi QEH OUTLET manquante.");

  const attempts: EmailAttempt[] = [];
  if (RESEND_ORDER_API_KEY) attempts.push({ apiKey: RESEND_ORDER_API_KEY, from: FROM_EMAIL });
  if (RESEND_API_KEY) attempts.push({ apiKey: RESEND_API_KEY, from: FROM_EMAIL });
  if (!attempts.length) throw new Error("Configuration e-mail QEH OUTLET manquante.");

  let lastError = "L’e-mail n’a pas pu être envoyé.";
  const seen = new Set<string>();

  for (const attempt of attempts) {
    const fingerprint = `${attempt.apiKey.slice(0, 8)}|${attempt.from}`;
    if (seen.has(fingerprint)) continue;
    seen.add(fingerprint);

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${attempt.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from: attempt.from, to: [to], subject, html }),
    });

    const result = await response.json().catch(() => ({}));
    if (response.ok) return result;
    lastError = result?.message || result?.error || lastError;
  }

  throw new Error(lastError);
}

function emailFrame(
  order: Record<string, unknown>,
  config: ReturnType<typeof statusConfig>,
  customerOrdersUrl: string,
) {
  const customerName = escapeHtml(order.customer_name || order.shipping_name || "Client");
  const orderNumber = escapeHtml(order.order_number || "");
  const carrier = escapeHtml(order.shipping_carrier_name || order.carrier || "");
  const trackingNumber = escapeHtml(order.tracking_number || "");

  const carrierLine = carrier
    ? `<p style="margin:6px 0;color:#aab6c7">Transporteur : <strong style="color:#fff">${carrier}</strong></p>`
    : "";

  const trackingLine = trackingNumber
    ? `<p style="margin:6px 0;color:#aab6c7">Numéro de suivi : <strong style="color:#fff">${trackingNumber}</strong></p>`
    : "";

  return `<!doctype html><html lang="fr"><body style="margin:0;background:#020711;font-family:Arial,sans-serif;color:#eef2f7"><div style="padding:42px 16px"><div style="max-width:620px;margin:auto;border:1px solid rgba(255,90,0,.45);border-radius:26px;overflow:hidden;background:#071426"><div style="height:5px;background:linear-gradient(90deg,#0b5ca8,#ff5a00,#0b5ca8)"></div><div style="padding:38px"><div style="font-size:28px;font-weight:900;letter-spacing:2px;color:white">QEH <span style="color:#ff6a16">OUTLET</span></div><div style="margin-top:7px;color:#8fa0b8;font-size:12px;letter-spacing:2px">SUIVI DE LIVRAISON</div><h1 style="margin:30px 0 12px;font-size:30px">${escapeHtml(config.title)}</h1><p style="color:#c7d0dc;line-height:1.7">Bonjour ${customerName},</p><p style="color:#c7d0dc;line-height:1.7">${escapeHtml(config.text)}</p><div style="margin:22px 0;padding:18px;border-radius:16px;background:#020711;border:1px solid rgba(255,255,255,.10)"><p style="margin:0 0 8px;color:#8fa0b8;font-size:12px;text-transform:uppercase;letter-spacing:1px">Commande</p><p style="margin:0;color:#fff;font-size:20px;font-weight:900">#${orderNumber}</p>${carrierLine}${trackingLine}</div><p style="color:#c7d0dc;line-height:1.7">Vous pouvez suivre l’avancement de votre livraison à tout moment dans votre espace client, rubrique <strong style="color:#fff">Mes commandes</strong>.</p><a href="${escapeHtml(customerOrdersUrl)}" style="display:block;margin:28px 0;padding:17px 22px;border-radius:14px;background:#ff5a00;color:#fff;text-align:center;text-decoration:none;font-weight:900">Voir Mes commandes</a><p style="color:#8e9bad;font-size:13px;line-height:1.6">Ouvrez ensuite la commande concernée pour retrouver son statut, son transporteur et son numéro de suivi.</p><div style="margin-top:34px;padding-top:20px;border-top:1px solid rgba(255,255,255,.12);color:#8190a5;font-size:12px;line-height:1.6">Message automatique envoyé par QEH OUTLET.</div></div></div></div></body></html>`;
}

async function publicTracking(token: string) {
  if (!token) throw new Error("Lien de suivi invalide.");

  const { data: order, error } = await service
    .from("orders")
    .select("id, order_number, fulfillment_status, tracking_number, carrier, shipping_carrier_name, tracking_url, estimated_delivery_date, shipping_delivery_date, processing_at, shipped_at, delivered_at")
    .eq("tracking_token", token)
    .maybeSingle();

  if (error) throw error;
  if (!order) return json({ error: "Suivi introuvable." }, 404);

  const { data: events, error: eventsError } = await service
    .from("order_tracking_events")
    .select("status, label, message, occurred_at")
    .eq("order_id", order.id)
    .order("occurred_at", { ascending: true });

  if (eventsError) throw eventsError;

  return json({
    order: {
      order_number: order.order_number,
      fulfillment_status: order.fulfillment_status,
      tracking_number: order.tracking_number,
      carrier: order.shipping_carrier_name || order.carrier,
      tracking_url: order.tracking_url,
      estimated_delivery_date: order.estimated_delivery_date || order.shipping_delivery_date,
      processing_at: order.processing_at,
      shipped_at: order.shipped_at,
      delivered_at: order.delivered_at,
    },
    events: events || [],
  });
}

async function adminUpdate(request: Request, body: Record<string, unknown>) {
  const admin = await requireAdmin(request);
  const orderId = String(body.order_id || "").trim();
  const status = String(body.status || "").trim();
  const carrier = String(body.carrier || "").trim() || null;
  const trackingNumber = String(body.tracking_number || "").trim() || null;
  const estimatedDeliveryDate = String(body.estimated_delivery_date || "").trim() || null;
  const forceResend = body.force_resend === true;

  if (!orderId) throw new Error("Commande manquante.");

  const config = statusConfig(status);
  if (status === "shipped" && (!carrier || !trackingNumber)) {
    throw new Error("Renseignez le transporteur et le numéro de suivi avant l’expédition.");
  }

  const { data: current, error: currentError } = await service
    .from("orders")
    .select("id, order_number, customer_email, customer_name, shipping_name, tracking_number, carrier, shipping_carrier_name, tracking_url")
    .eq("id", orderId)
    .single();

  if (currentError || !current) throw currentError || new Error("Commande introuvable.");
  if (!current.customer_email) throw new Error("Cette commande n’a pas d’adresse e-mail client.");

  const { data: existingEvent, error: existingEventError } = await service
    .from("order_tracking_events")
    .select("id, email_sent_at")
    .eq("order_id", orderId)
    .eq("status", status)
    .maybeSingle();

  if (existingEventError) throw existingEventError;
  if (existingEvent?.email_sent_at && !forceResend) {
    return json({
      success: true,
      already_notified: true,
      status,
      email_sent_at: existingEvent.email_sent_at,
    });
  }

  const now = new Date().toISOString();
  const officialUrl = carrierTrackingUrl(carrier);
  const update: Record<string, unknown> = {
    fulfillment_status: status,
    updated_at: now,
  };

  if (carrier) {
    update.carrier = carrier;
    update.shipping_carrier_name = carrier;
  }
  if (trackingNumber) update.tracking_number = trackingNumber;
  if (estimatedDeliveryDate) update.estimated_delivery_date = estimatedDeliveryDate;
  if (officialUrl) update.tracking_url = officialUrl;
  if (status === "processing") update.processing_at = now;
  if (status === "shipped") update.shipped_at = now;
  if (status === "delivered") update.delivered_at = now;

  const { data: updatedOrder, error: updateError } = await service
    .from("orders")
    .update(update)
    .eq("id", orderId)
    .select("id, order_number, customer_email, customer_name, shipping_name, fulfillment_status, tracking_number, carrier, shipping_carrier_name, tracking_url, estimated_delivery_date, processing_at, shipped_at, delivered_at")
    .single();

  if (updateError) throw updateError;

  const eventMessage = status === "processing"
    ? "La commande est prise en charge par l’équipe QEH OUTLET."
    : status === "shipped"
      ? `Le colis a été expédié${carrier ? ` avec ${carrier}` : ""}.`
      : "La livraison est indiquée comme terminée.";

  const { data: event, error: eventError } = await service
    .from("order_tracking_events")
    .upsert({
      order_id: orderId,
      status,
      label: config.label,
      message: eventMessage,
      source: `admin:${admin.id}`,
      occurred_at: existingEvent?.email_sent_at ? undefined : now,
      email_error: null,
      updated_at: now,
    }, { onConflict: "order_id,status" })
    .select("id")
    .single();

  if (eventError) throw eventError;

  const customerOrdersUrl = `${FRONTEND_URL}/mes-commandes`;

  try {
    await sendEmail(
      updatedOrder.customer_email,
      config.subject,
      emailFrame(updatedOrder, config, customerOrdersUrl),
    );

    await service
      .from("order_tracking_events")
      .update({ email_sent_at: now, email_error: null, updated_at: now })
      .eq("id", event.id);
  } catch (emailError) {
    const errorText = messageFromError(emailError);
    await service
      .from("order_tracking_events")
      .update({ email_error: errorText, updated_at: now })
      .eq("id", event.id);

    throw new Error(`Le statut a été enregistré mais l’e-mail n’a pas été envoyé : ${errorText}`);
  }

  return json({
    success: true,
    order: updatedOrder,
    customer_orders_url: customerOrdersUrl,
    email_sent: true,
  });
}

Deno.serve(async (request: Request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (request.method !== "POST") return json({ error: "Méthode non autorisée." }, 405);

  try {
    const body = await request.json() as Record<string, unknown>;
    const action = String(body.action || "");

    if (action === "public_tracking") {
      return await publicTracking(String(body.tracking_token || ""));
    }

    if (action === "admin_update") {
      return await adminUpdate(request, body);
    }

    return json({ error: "Action inconnue." }, 400);
  } catch (error) {
    const message = messageFromError(error);
    const status = message.startsWith("ADMIN_") ? 403 : 400;
    return json({ error: message }, status);
  }
});