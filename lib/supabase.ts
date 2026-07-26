import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Client-side Supabase access with a feature flag: when the env vars are
 * absent (e.g. before the user finishes console setup), the app runs in
 * auth-free mode — everything playable, nothing saved. Setting the two
 * NEXT_PUBLIC_ vars and redeploying activates accounts with no code change.
 */
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabaseEnabled = Boolean(url && anonKey);

let client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient | null {
  if (!supabaseEnabled) return null;
  if (!client) client = createClient(url!, anonKey!);
  return client;
}
