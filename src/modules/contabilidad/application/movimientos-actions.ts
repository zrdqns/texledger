"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/core/auth/guard";
import { createClient } from "@/core/supabase/server";
import { createAdminClient } from "@/core/supabase/admin";
import { ok, fail, type ActionResult } from "@/shared/action-result";
import { ingresoSchema, egresoSchema } from "./schemas";
import { subirArchivo } from "./archivos";
import type { Ingreso, Egreso } from "../domain/tipos";

function opt(v: FormDataEntryValue | null): string | undefined {
  const s = (v as string)?.trim();
  return s ? s : undefined;
}

export async function listarIngresos(): Promise<Ingreso[]> {
  await requireUser();
  const supabase = await createClient();
  const { data } = await supabase.from("ingresos").select("*").order("fecha", { ascending: false });
  return (data ?? []) as Ingreso[];
}

export async function listarEgresos(): Promise<Egreso[]> {
  await requireUser();
  const supabase = await createClient();
  const { data } = await supabase.from("egresos").select("*").order("fecha_pago", { ascending: false });
  return (data ?? []) as Egreso[];
}

export async function crearIngreso(formData: FormData): Promise<ActionResult> {
  await requireUser();
  const parsed = ingresoSchema.safeParse({
    fecha: formData.get("fecha"),
    concepto: formData.get("concepto"),
    valor: Number(formData.get("valor")),
    numero_comprobante: opt(formData.get("numero_comprobante")),
    factura_id: opt(formData.get("factura_id")),
    cuenta_bancaria_id: opt(formData.get("cuenta_bancaria_id")),
  });
  if (!parsed.success) return fail("VALIDATION", parsed.error.issues[0]?.message ?? "Datos inválidos");

  const admin = createAdminClient();
  const { data, error } = await admin.from("ingresos").insert(parsed.data).select("id").single();
  if (error) {
    if (error.code === "23505") return fail("BUSINESS", "Esa factura ya tiene un pago registrado");
    return fail("UNEXPECTED", "Error inesperado");
  }
  const archivo = formData.get("archivo");
  if (archivo instanceof File && archivo.size > 0) {
    try {
      const path = await subirArchivo(archivo, "ingresos", data.id as string);
      if (path) await admin.from("ingresos").update({ comprobante_url: path }).eq("id", data.id);
    } catch {
      return fail("UNEXPECTED", "Ingreso creado pero falló la subida del comprobante");
    }
  }
  revalidatePath("/contabilidad/ingresos");
  return ok(undefined);
}

export async function crearEgreso(formData: FormData): Promise<ActionResult> {
  await requireUser();
  const parsed = egresoSchema.safeParse({
    fecha_pago: formData.get("fecha_pago"),
    concepto: formData.get("concepto"),
    valor: Number(formData.get("valor")),
    cuenta_bancaria_id: formData.get("cuenta_bancaria_id"),
    numero_comprobante: opt(formData.get("numero_comprobante")),
    factura_id: opt(formData.get("factura_id")),
  });
  if (!parsed.success) return fail("VALIDATION", parsed.error.issues[0]?.message ?? "Datos inválidos");

  const admin = createAdminClient();
  const { data, error } = await admin.from("egresos").insert(parsed.data).select("id").single();
  if (error) {
    if (error.code === "23505") return fail("BUSINESS", "Esa factura ya tiene un pago registrado");
    return fail("UNEXPECTED", "Error inesperado");
  }
  const archivo = formData.get("archivo");
  if (archivo instanceof File && archivo.size > 0) {
    try {
      const path = await subirArchivo(archivo, "egresos", data.id as string);
      if (path) await admin.from("egresos").update({ comprobante_url: path }).eq("id", data.id);
    } catch {
      return fail("UNEXPECTED", "Egreso creado pero falló la subida del comprobante");
    }
  }
  revalidatePath("/contabilidad/egresos");
  return ok(undefined);
}
