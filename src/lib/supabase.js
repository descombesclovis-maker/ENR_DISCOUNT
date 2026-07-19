import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  process.env.REACT_APP_SUPABASE_URL;

const supabasePublishableKey =
  process.env.REACT_APP_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl) {
  throw new Error(
    "REACT_APP_SUPABASE_URL est absente du fichier .env.local."
  );
}

if (!supabasePublishableKey) {
  throw new Error(
    "REACT_APP_SUPABASE_PUBLISHABLE_KEY est absente du fichier .env.local."
  );
}

export const supabase = createClient(
  supabaseUrl,
  supabasePublishableKey
);

export default supabase;