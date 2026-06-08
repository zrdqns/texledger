import "server-only";
import { createClient } from "@supabase/supabase-js";
import { publicEnv, getServiceRoleKey } from "@/core/config/env";

/** Cliente con service-role: ejecuta RPCs SECURITY DEFINER y escrituras directas. Solo servidor. */
export function createAdminClient() {
  return createClient(publicEnv.NEXT_PUBLIC_SUPABASE_URL, getServiceRoleKey(), {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
