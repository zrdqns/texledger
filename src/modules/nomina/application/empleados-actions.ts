"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/core/auth/guard";
import { createClient } from "@/core/supabase/server";
import { createAdminClient } from "@/core/supabase/admin";
import { ok, fail, type ActionResult } from "@/shared/action-result";
import { empleadoSchema, editarEmpleadoSchema } from "./schemas";
import type { Empleado } from "../domain/tipos";

export async function listarEmpleados(incluirRetirados = false): Promise<Empleado[]> {
  await requireUser();
  const supabase = await createClient();
  let q = supabase.from("empleados").select("*").order("nombre");
  if (!incluirRetirados) q = q.eq("activo", true);
  const { data } = await q;
  return (data ?? []) as Empleado[];
}

export async function obtenerEmpleado(id: string): Promise<Empleado | null> {
  await requireUser();
  const supabase = await createClient();
  const { data } = await supabase.from("empleados").select("*").eq("id", id).maybeSingle();
  return data as Empleado | null;
}

export async function crearEmpleado(input: unknown): Promise<ActionResult> {
  await requireUser();
  const parsed = empleadoSchema.safeParse(input);
  if (!parsed.success) return fail("VALIDATION", parsed.error.issues[0]?.message ?? "Datos inválidos");
  const admin = createAdminClient();
  const { error } = await admin.from("empleados").insert(parsed.data);
  if (error) return fail("UNEXPECTED", "Error inesperado");
  revalidatePath("/nomina/empleados");
  return ok(undefined);
}

export async function editarEmpleado(input: unknown): Promise<ActionResult> {
  await requireUser();
  const parsed = editarEmpleadoSchema.safeParse(input);
  if (!parsed.success) return fail("VALIDATION", parsed.error.issues[0]?.message ?? "Datos inválidos");
  const { id, ...campos } = parsed.data;
  const admin = createAdminClient();
  const { error } = await admin.from("empleados").update(campos).eq("id", id);
  if (error) return fail("UNEXPECTED", "Error inesperado");
  revalidatePath("/nomina/empleados");
  return ok(undefined);
}

export async function retirarEmpleado(id: string): Promise<ActionResult> {
  await requireUser();
  const admin = createAdminClient();
  const { error } = await admin.from("empleados").update({ activo: false }).eq("id", id);
  if (error) return fail("UNEXPECTED", "Error inesperado");
  revalidatePath("/nomina/empleados");
  return ok(undefined);
}
