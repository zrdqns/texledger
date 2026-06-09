"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/core/auth/guard";
import { createClient } from "@/core/supabase/server";
import { createAdminClient } from "@/core/supabase/admin";
import { ok, fail, type ActionResult } from "@/shared/action-result";
import { cuentaSchema, editarCuentaSchema } from "./schemas";
import type { CuentaBancaria } from "../domain/tipos";

export async function listarCuentas(incluirRetiradas = false): Promise<CuentaBancaria[]> {
  await requireUser();
  const supabase = await createClient();
  let q = supabase.from("cuentas_bancarias").select("*").order("nombre");
  if (!incluirRetiradas) q = q.eq("activo", true);
  const { data } = await q;
  return (data ?? []) as CuentaBancaria[];
}

export async function crearCuenta(input: unknown): Promise<ActionResult> {
  await requireUser();
  const parsed = cuentaSchema.safeParse(input);
  if (!parsed.success) return fail("VALIDATION", parsed.error.issues[0]?.message ?? "Datos inválidos");
  const admin = createAdminClient();
  const { error } = await admin.from("cuentas_bancarias").insert(parsed.data);
  if (error) return fail("UNEXPECTED", "Error inesperado");
  revalidatePath("/contabilidad/cuentas");
  return ok(undefined);
}

export async function editarCuenta(input: unknown): Promise<ActionResult> {
  await requireUser();
  const parsed = editarCuentaSchema.safeParse(input);
  if (!parsed.success) return fail("VALIDATION", parsed.error.issues[0]?.message ?? "Datos inválidos");
  const { id, ...campos } = parsed.data;
  const admin = createAdminClient();
  const { error } = await admin.from("cuentas_bancarias").update(campos).eq("id", id);
  if (error) return fail("UNEXPECTED", "Error inesperado");
  revalidatePath("/contabilidad/cuentas");
  return ok(undefined);
}

export async function retirarCuenta(id: string): Promise<ActionResult> {
  await requireUser();
  const admin = createAdminClient();
  const { error } = await admin.from("cuentas_bancarias").update({ activo: false }).eq("id", id);
  if (error) return fail("UNEXPECTED", "Error inesperado");
  revalidatePath("/contabilidad/cuentas");
  return ok(undefined);
}
