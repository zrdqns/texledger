import { redirect } from "next/navigation";
import { createClient } from "@/core/supabase/server";

/** Exige sesión válida en Server Components/Actions. Usa getUser (no getSession). */
export async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  return user;
}
