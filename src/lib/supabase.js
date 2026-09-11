import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabasePublishableKey = process.env.REACT_APP_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl) {
  throw new Error(
    "REACT_APP_SUPABASE_URL est absente du fichier .env.local.",
  );
}

if (!supabasePublishableKey) {
  throw new Error(
    "REACT_APP_SUPABASE_PUBLISHABLE_KEY est absente du fichier .env.local.",
  );
}

// La session d'authentification reste disponible pendant la session du navigateur,
// mais n'est pas conservée durablement dans localStorage.
const client = createClient(supabaseUrl, supabasePublishableKey, {
  auth: {
    storage: window.sessionStorage,
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

const originalInvoke = client.functions.invoke.bind(client.functions);

client.functions.invoke = async (functionName, options = {}) => {
  if (functionName !== "create-checkout-session") {
    return originalInvoke(functionName, options);
  }

  let relayPoint = null;
  let relayActive = false;

  try {
    relayActive = sessionStorage.getItem("qeh_mondial_relay_active") === "1";
    const storedRelayPoint = sessionStorage.getItem(
      "qeh_selected_mondial_relay",
    );
    relayPoint = storedRelayPoint ? JSON.parse(storedRelayPoint) : null;
  } catch {
    relayPoint = null;
  }

  if (relayActive && !relayPoint?.code) {
    return {
      data: null,
      error: new Error(
        "Choisissez votre Point Relais Mondial Relay avant de poursuivre le paiement.",
      ),
    };
  }

  if (!relayActive) {
    return originalInvoke(functionName, options);
  }

  const cleanRelayPoint = relayPoint
    ? {
        code: relayPoint.code,
        name: relayPoint.name ?? null,
        network: relayPoint.network ?? "MONR",
        address: relayPoint.address ?? null,
        postalCode: relayPoint.postalCode ?? null,
        city: relayPoint.city ?? null,
        latitude: relayPoint.latitude ?? null,
        longitude: relayPoint.longitude ?? null,
        distanceMeters: relayPoint.distanceMeters ?? null,
      }
    : null;

  return originalInvoke("create-checkout-session-with-relay", {
    ...options,
    body: {
      ...(options?.body || {}),
      relay_point: cleanRelayPoint,
    },
  });
};

export const supabase = client;
export default client;
