"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/core/auth/guard";
import { createClient } from "@/core/supabase/server";
import { createAdminClient } from "@/core/supabase/admin";
import { ok, fail, type ActionResult } from "@/shared/action-result";
import { recordatorioSchema } from "./schemas";
import type { RecordatorioConFactura } from "../domain/tipos";

/** Cierra la notificación de vencido abierta del recordatorio (evita alertas huérfanas). */
async function cerrarNotificacionVencido(admin: ReturnType<typeof createAdminClient>, id: string) {
  await admin
    .from("notificaciones")
    .update({ leida: true })
    .eq("entidad_tipo", "recordatorio")
    .eq("entidad_id", id)
    .eq("leida", false);
}

export async function listarRecordatorios(): Promise<RecordatorioConFactura[]> {
  await requireUser();
  const supabase = await createClient();
  const { data } = await supabase
    .from("recordatorios")
    .select("*, facturas(numero, tercero)")
    .order("fecha_objetivo", { ascending: true });
  return (data ?? []) as unknown as RecordatorioConFactura[];
}

export async function crearRecordatorio(input: unknown): Promise<ActionResult> {
  await requireUser();
  const parsed = recordatorioSchema.safeParse(input);
  if (!parsed.success) return fail("VALIDATION", parsed.error.issues[0]?.message ?? "Datos inválidos");
  const admin = createAdminClient();
  const { error } = await admin.from("recordatorios").insert(parsed.data);
  if (error) return fail("UNEXPECTED", "Error inesperado");
  revalidatePath("/recordatorios");
  return ok(undefined);
}

export async function marcarCumplido(id: string): Promise<ActionResult> {
  await requireUser();
  const admin = createAdminClient();
  const { error } = await admin.from("recordatorios").update({ estado: "cumplido" }).eq("id", id);
  if (error) return fail("UNEXPECTED", "Error inesperado");
  await cerrarNotificacionVencido(admin, id);
  revalidatePath("/recordatorios");
  return ok(undefined);
}

export async function eliminarRecordatorio(id: string): Promise<ActionResult> {
  await requireUser();
  const admin = createAdminClient();
  const { error } = await admin.from("recordatorios").delete().eq("id", id);
  if (error) return fail("UNEXPECTED", "Error inesperado");
  await cerrarNotificacionVencido(admin, id);
  revalidatePath("/recordatorios");
  return ok(undefined);
}
