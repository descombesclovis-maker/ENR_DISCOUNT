import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { supabase } from "../lib/supabase";

const VISITOR_STORAGE_KEY = "qeh_visitor_id";

function createVisitorId() {
  if (globalThis.crypto?.randomUUID) {
    return globalThis.crypto.randomUUID();
  }

  return `qeh-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function getVisitorId() {
  try {
    const existingId = sessionStorage.getItem(VISITOR_STORAGE_KEY);

    if (existingId) return existingId;

    const newId = createVisitorId();
    sessionStorage.setItem(VISITOR_STORAGE_KEY, newId);
    return newId;
  } catch {
    return createVisitorId();
  }
}

function getReferrerOrigin() {
  if (!document.referrer) return null;

  try {
    return new URL(document.referrer).origin;
  } catch {
    return null;
  }
}

function getUniverse(pathname) {
  if (pathname.startsWith("/qeh-energies")) return "qeh_energies";
  if (pathname.startsWith("/qeh-partner")) return "qeh_partner";
  return "qeh_outlet";
}

export default function SiteAnalyticsTracker() {
  const location = useLocation();

  useEffect(() => {
    if (location.pathname.startsWith("/admin")) return;

    const timer = window.setTimeout(async () => {
      const { error } = await supabase.from("site_page_views").insert({
        visitor_id: getVisitorId(),
        path: location.pathname,
        universe: getUniverse(location.pathname),
        referrer: getReferrerOrigin(),
      });

      if (error && error.code !== "42P01") {
        console.warn("Statistiques QEH indisponibles :", error.message);
      }
    }, 400);

    return () => window.clearTimeout(timer);
  }, [location.pathname]);

  return null;
}
