import { createClient } from "npm:@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const RESEND_ORDER_API_KEY = Deno.env.get("RESEND_ORDER_API_KEY");
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const QEH_OUTLET_FROM_EMAIL = Deno.env.get("QEH_OUTLET_FROM_EMAIL");
const QEH_PRO_FROM_EMAIL = Deno.env.get("QEH_PRO_FROM_EMAIL");
const FRONTEND_URL = (Deno.env.get("FRONTEND_URL") || "https://www.qeh-outlet.fr").replace(/\/$/, "");

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  throw new Error("Configuration Supabase serveur absente.");
}

const service = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

function json(body: Record<string, unknown>, status = 200) {
  return Response.json(body, {
    status,
    headers: {
      "Cache-Control": "no-store, max-age=0",
      "X-Content-Type-Options": "nosniff",
    },
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

function money(value: unknown, currency = "EUR") {
  const amount = Number(value ?? 0);
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: String(currency || "EUR").toUpperCase(),
  }).format(Number.isFinite(amount) ? amount : 0);
}

function formatDate(value: unknown) {
  const date = new Date(String(value ?? ""));
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "long",
    timeStyle: "short",
    timeZone: "Europe/Paris",
  }).format(date);
}

async function verifyHmac(orderId: string, timestamp: string, signature: string) {
  const timestampNumber = Number(timestamp);
  if (!Number.isFinite(timestampNumber)) return false;
  if (Math.abs(Date.now() - timestampNumber) > 5 * 60 * 1000) return false;
  if (!/^[a-f0-9]{64}$/i.test(signature)) return false;

  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(SERVICE_ROLE_KEY),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["verify"],
  );

  const signatureBytes = new Uint8Array(
    signature.match(/.{2}/g)!.map((byte) => Number.parseInt(byte, 16)),
  );

  return crypto.subtle.verify(
    "HMAC",
    key,
    signatureBytes,
    encoder.encode(`${timestamp}.${orderId}`),
  );
}

function emailFrame(content: string) {
  return `<!doctype html><html lang="fr"><body style="margin:0;background:#f4f6f8;font-family:Arial,sans-serif;color:#16202a"><div style="padding:36px 14px"><div style="max-width:680px;margin:auto;background:#ffffff;border-radius:22px;overflow:hidden;border:1px solid #e6e9ed"><div style="height:5px;background:linear-gradient(90deg,#111827,#0f766e,#111827)"></div><div style="padding:34px"><div style="font-size:28px;font-weight:900;letter-spacing:1.5px;color:#111827">QEH <span style="color:#0f766e">OUTLET</span></div><div style="margin-top:6px;color:#6b7280;font-size:12px;letter-spacing:1.5px">CONFIRMATION DE COMMANDE</div>${content}<div style="margin-top:34px;padding-top:20px;border-top:1px solid #e5e7eb;color:#6b7280;font-size:12px;line-height:1.6">E-mail automatique QEH OUTLET. Retrouvez ensuite toutes les informations de livraison dans votre espace client.</div></div></div></div></body></html>`;
}

type EmailAttempt = { apiKey: string; from: string; label: string };

async function sendEmail(to: string, subject: string, html: string) {
  const attempts: EmailAttempt[] = [];

  if (RESEND_ORDER_API_KEY && QEH_OUTLET_FROM_EMAIL) {
    attempts.push({ apiKey: RESEND_ORDER_API_KEY, from: QEH_OUTLET_FROM_EMAIL, label: "order/outlet" });
  }
  if (RESEND_API_KEY && QEH_OUTLET_FROM_EMAIL) {
    attempts.push({ apiKey: RESEND_API_KEY, from: QEH_OUTLET_FROM_EMAIL, label: "legacy/outlet" });
  }
  if (RESEND_ORDER_API_KEY && QEH_PRO_FROM_EMAIL) {
    attempts.push({ apiKey: RESEND_ORDER_API_KEY, from: QEH_PRO_FROM_EMAIL, label: "order/pro" });
  }
  if (RESEND_API_KEY && QEH_PRO_FROM_EMAIL) {
    attempts.push({ apiKey: RESEND_API_KEY, from: QEH_PRO_FROM_EMAIL, label: "legacy/pro" });
  }

  if (!attempts.length) {
    throw new Error("Aucune configuration Resend exploitable trouvée dans les secrets Supabase.");
  }

  const seen = new Set<string>();
  let lastError = "Resend a refusé l’envoi de l’e-mail.";

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

    lastError = `${attempt.label}: ${result?.message || result?.error || "Erreur Resend inconnue"}`;
  }

  throw new Error(lastError);
}

Deno.serve(async (request) => {
  if (request.method !== "POST") return json({ error: "Méthode non autorisée." }, 405);

  const contentLength = Number(request.headers.get("content-length") || "0");
  if (Number.isFinite(contentLength) && contentLength > 4096) {
    return json({ error: "Requête trop volumineuse." }, 413);
  }

  let orderId = "";
  let claimed = false;

  try {
    const body = await request.json().catch(() => ({}));
    orderId = String(body?.order_id ?? "").trim();

    if (!/^[0-9a-f-]{36}$/i.test(orderId)) {
      return json({ error: "Requête invalide." }, 400);
    }

    const timestamp = request.headers.get("x-qeh-timestamp") || "";
    const signature = request.headers.get("x-qeh-signature") || "";
    const legacyInternalKey = request.headers.get("x-qeh-internal-key") || "";

    const hmacValid = timestamp && signature
      ? await verifyHmac(orderId, timestamp, signature)
      : false;

    const legacyValid = legacyInternalKey === SERVICE_ROLE_KEY;
    if (!hmacValid && !legacyValid) return json({ error: "Non autorisé." }, 401);

    const { data: order, error: orderError } = await service
      .from("orders")
      .select(`
        id,
        order_number,
        customer_email,
        customer_name,
        shipping_name,
        shipping_company,
        shipping_phone,
        shipping_address_line1,
        shipping_address_line2,
        shipping_postal_code,
        shipping_city,
        shipping_country,
        currency,
        subtotal,
        shipping_amount,
        total,
        total_amount,
        payment_status,
        fulfillment_status,
        paid_at,
        created_at,
        shipping_carrier_name,
        shipping_service_name,
        shipping_delivery_date,
        confirmation_email_sent_at
      `)
      .eq("id", orderId)
      .single();

    if (orderError || !order) return json({ error: "Commande introuvable." }, 404);
    if (order.payment_status !== "paid") return json({ error: "La commande n’est pas payée." }, 409);

    if (order.confirmation_email_sent_at) {
      return json({ success: true, already_sent: true, sent_at: order.confirmation_email_sent_at });
    }

    const { data: claimData, error: claimError } = await service.rpc("qeh_claim_order_confirmation", {
      p_order_id: orderId,
    });

    if (claimError) throw claimError;
    claimed = claimData === true;

    if (!claimed) {
      return json({ success: true, already_processing: true });
    }

    const email = String(order.customer_email ?? "").trim().toLowerCase();
    if (!email) throw new Error("Aucune adresse e-mail client sur la commande.");

    const { data: items, error: itemsError } = await service
      .from("order_items")
      .select("product_name, variant_name, reference, sku, unit_price, quantity, line_total")
      .eq("order_id", orderId)
      .order("created_at", { ascending: true });

    if (itemsError) throw itemsError;

    const itemRows = (items ?? []).map((item) => {
      const name = [item.product_name, item.variant_name].filter(Boolean).join(" — ");
      const ref = item.reference || item.sku;
      return `<tr><td style="padding:12px 0;border-bottom:1px solid #edf0f2"><div style="font-weight:700;color:#111827">${escapeHtml(name)}</div>${ref ? `<div style="margin-top:4px;color:#6b7280;font-size:12px">Réf. ${escapeHtml(ref)}</div>` : ""}</td><td style="padding:12px 8px;border-bottom:1px solid #edf0f2;text-align:center;color:#374151">${escapeHtml(item.quantity)}</td><td style="padding:12px 0;border-bottom:1px solid #edf0f2;text-align:right;font-weight:700;color:#111827">${money(item.line_total, order.currency)}</td></tr>`;
    }).join("");

    const customerName = order.shipping_name || order.customer_name || "Client";
    const carrier = [order.shipping_carrier_name, order.shipping_service_name].filter(Boolean).join(" — ");
    const address = [
      order.shipping_address_line1,
      order.shipping_address_line2,
      [order.shipping_postal_code, order.shipping_city].filter(Boolean).join(" "),
      order.shipping_country,
    ].filter(Boolean).join(", ");

    const customerOrdersUrl = `${FRONTEND_URL}/mes-commandes`;

    const html = emailFrame(`
      <h1 style="margin:30px 0 12px;font-size:30px;color:#111827">Commande confirmée ✅</h1>
      <p style="color:#4b5563;line-height:1.7">Bonjour ${escapeHtml(customerName)},</p>
      <p style="color:#4b5563;line-height:1.7">Nous avons bien reçu votre paiement. Votre commande <strong style="color:#111827">${escapeHtml(order.order_number)}</strong> est confirmée et va être préparée.</p>
      <div style="margin:24px 0;padding:18px;border-radius:16px;background:#f0fdfa;border:1px solid #ccfbf1"><div style="font-size:12px;color:#0f766e;text-transform:uppercase;letter-spacing:1px;font-weight:700">Paiement confirmé</div><div style="margin-top:8px;font-size:22px;font-weight:900;color:#111827">${money(order.total ?? order.total_amount, order.currency)}</div><div style="margin-top:4px;color:#6b7280;font-size:13px">${formatDate(order.paid_at || order.created_at)}</div></div>
      <h2 style="margin:28px 0 10px;font-size:20px;color:#111827">Votre commande</h2>
      <table style="width:100%;border-collapse:collapse;font-size:14px"><thead><tr><th style="text-align:left;padding-bottom:8px;color:#6b7280">Produit</th><th style="text-align:center;padding-bottom:8px;color:#6b7280">Qté</th><th style="text-align:right;padding-bottom:8px;color:#6b7280">Total</th></tr></thead><tbody>${itemRows || `<tr><td colspan="3" style="padding:14px 0;color:#6b7280">Détail des articles indisponible.</td></tr>`}</tbody></table>
      <div style="margin-top:18px;padding-top:8px"><div style="display:flex;justify-content:space-between;padding:5px 0;color:#6b7280"><span>Sous-total</span><strong style="color:#111827">${money(order.subtotal, order.currency)}</strong></div><div style="display:flex;justify-content:space-between;padding:5px 0;color:#6b7280"><span>Livraison</span><strong style="color:#111827">${money(order.shipping_amount, order.currency)}</strong></div><div style="display:flex;justify-content:space-between;padding:10px 0 0;font-size:18px"><span style="font-weight:800;color:#111827">Total TTC</span><strong style="color:#111827">${money(order.total ?? order.total_amount, order.currency)}</strong></div></div>
      <h2 style="margin:30px 0 10px;font-size:20px;color:#111827">Livraison</h2>
      <div style="padding:18px;border-radius:16px;background:#f9fafb;border:1px solid #e5e7eb;color:#4b5563;line-height:1.7"><div><strong style="color:#111827">Transporteur :</strong> ${escapeHtml(carrier || "À confirmer")}</div><div><strong style="color:#111827">Adresse :</strong> ${escapeHtml(address || "À confirmer")}</div>${order.shipping_delivery_date ? `<div><strong style="color:#111827">Livraison estimée :</strong> ${escapeHtml(order.shipping_delivery_date)}</div>` : ""}</div>
      <div style="margin-top:26px;padding:20px;border-radius:16px;background:#fff7ed;border:1px solid #fed7aa"><div style="font-weight:900;color:#9a3412">Suivez votre commande depuis votre espace client</div><p style="margin:8px 0 0;color:#7c2d12;line-height:1.6">Toutes les étapes de préparation et de livraison seront disponibles dans <strong>Mes commandes</strong>. Vous recevrez également un e-mail lorsque votre colis sera pris en charge, expédié puis livré.</p></div>
      <a href="${escapeHtml(customerOrdersUrl)}" style="display:block;margin:24px 0;padding:16px 22px;border-radius:14px;background:#ff5a00;color:#ffffff;text-align:center;text-decoration:none;font-weight:900">Accéder à Mes commandes</a>
      <p style="margin-top:22px;color:#4b5563;line-height:1.7">La page « Suivi de commande » reste disponible dans votre espace client pour consulter le suivi officiel du transporteur lorsque vous disposez d’un numéro de colis.</p>
    `);

    const resendResult = await sendEmail(
      email,
      `Commande ${order.order_number} confirmée — QEH OUTLET`,
      html,
    );

    const sentAt = new Date().toISOString();

    const { error: updateError } = await service
      .from("orders")
      .update({ confirmation_email_sent_at: sentAt, confirmation_email_claimed_at: null })
      .eq("id", orderId)
      .is("confirmation_email_sent_at", null);

    if (updateError) throw updateError;

    return json({
      success: true,
      email_sent: true,
      resend_id: resendResult?.id ?? null,
      sent_at: sentAt,
      customer_orders_url: customerOrdersUrl,
    });
  } catch (error) {
    console.error("Erreur qeh-order-confirmation :", error);

    if (claimed && orderId) {
      const { error: releaseError } = await service
        .from("orders")
        .update({ confirmation_email_claimed_at: null })
        .eq("id", orderId)
        .is("confirmation_email_sent_at", null);

      if (releaseError) {
        console.error("Libération du verrou e-mail impossible :", releaseError);
      }
    }

    return json({
      success: false,
      error: error instanceof Error ? error.message : "Erreur interne.",
    }, 500);
  }
});