import { createBrowserClient } from "@supabase/ssr";
import { publicEnv } from "@/core/config/env";

/** Cliente Supabase para componentes de cliente. */
export function createClient() {
  return createBrowserClient(
    publicEnv.NEXT_PUBLIC_SUPABASE_URL,
    publicEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}
