"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/core/auth/guard";
import { createClient } from "@/core/supabase/server";
import { createAdminClient } from "@/core/supabase/admin";
import { ok, fail, type ActionResult } from "@/shared/action-result";
import { parametroSchema, editarParametroSchema } from "./schemas";
import type { ParametroNomina } from "../domain/tipos";

export async function listarParametros(): Promise<ParametroNomina[]> {
  await requireUser();
  const supabase = await createClient();
  const { data } = await supabase.from("parametros_nomina").select("*").order("anio", { ascending: false });
  return (data ?? []) as ParametroNomina[];
}

export async function obtenerParametro(id: string): Promise<ParametroNomina | null> {
  await requireUser();
  const supabase = await createClient();
  const { data } = await supabase.from("parametros_nomina").select("*").eq("id", id).maybeSingle();
  return data as ParametroNomina | null;
}

export async function crearParametro(input: unknown): Promise<ActionResult> {
  await requireUser();
  const parsed = parametroSchema.safeParse(input);
  if (!parsed.success) return fail("VALIDATION", parsed.error.issues[0]?.message ?? "Datos inválidos");
  const admin = createAdminClient();
  const { error } = await admin.from("parametros_nomina").insert(parsed.data);
  if (error) {
    if (error.code === "23505") return fail("BUSINESS", "Ya existen parámetros para ese año");
    return fail("UNEXPECTED", "Error inesperado");
  }
  revalidatePath("/nomina/parametros");
  return ok(undefined);
}

export async function editarParametro(input: unknown): Promise<ActionResult> {
  await requireUser();
  const parsed = editarParametroSchema.safeParse(input);
  if (!parsed.success) return fail("VALIDATION", parsed.error.issues[0]?.message ?? "Datos inválidos");
  const { id, ...campos } = parsed.data;
  const admin = createAdminClient();
  const { error } = await admin.from("parametros_nomina").update(campos).eq("id", id);
  if (error) {
    if (error.code === "23505") return fail("BUSINESS", "Ya existen parámetros para ese año");
    return fail("UNEXPECTED", "Error inesperado");
  }
  revalidatePath("/nomina/parametros");
  return ok(undefined);
}
