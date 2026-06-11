"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/core/auth/guard";
import { createClient } from "@/core/supabase/server";
import { createAdminClient } from "@/core/supabase/admin";
import { ok, fail, mapRpcError, type ActionResult } from "@/shared/action-result";
import type { Notificacion } from "../domain/tipos";

export async function listarNotificaciones(): Promise<Notificacion[]> {
  await requireUser();
  const supabase = await createClient();
  const { data } = await supabase
    .from("notificaciones")
    .select("*")
    .order("leida", { ascending: true })
    .order("created_at", { ascending: false })
    .limit(50);
  return (data ?? []) as Notificacion[];
}

export async function contarNoLeidas(): Promise<number> {
  await requireUser();
  const supabase = await createClient();
  const { count } = await supabase
    .from("notificaciones")
    .select("*", { count: "exact", head: true })
    .eq("leida", false);
  return count ?? 0;
}

export async function marcarLeida(id: string): Promise<ActionResult> {
  await requireUser();
  const admin = createAdminClient();
  const { error } = await admin.from("notificaciones").update({ leida: true }).eq("id", id);
  if (error) return fail("UNEXPECTED", "Error inesperado");
  revalidatePath("/recordatorios");
  return ok(undefined);
}

export async function marcarTodasLeidas(): Promise<ActionResult> {
  await requireUser();
  const admin = createAdminClient();
  const { error } = await admin.from("notificaciones").update({ leida: true }).eq("leida", false);
  if (error) return fail("UNEXPECTED", "Error inesperado");
  revalidatePath("/recordatorios");
  return ok(undefined);
}

export async function generarNotificacionesAhora(): Promise<ActionResult> {
  await requireUser();
  const admin = createAdminClient();
  const { error } = await admin.rpc("generar_notificaciones");
  if (error) return mapRpcError(error);
  revalidatePath("/recordatorios");
  return ok(undefined);
}
