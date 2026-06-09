"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/core/auth/guard";
import { createClient } from "@/core/supabase/server";
import { createAdminClient } from "@/core/supabase/admin";
import { ok, fail, type ActionResult } from "@/shared/action-result";
import { facturaSchema, editarFacturaSchema } from "./schemas";
import { subirArchivo, validarArchivo } from "./archivos";
import type { Factura } from "../domain/tipos";

export async function listarFacturas(filtros?: { tipo?: string; estado?: string; declarada?: boolean }): Promise<Factura[]> {
  await requireUser();
  const supabase = await createClient();
  let q = supabase.from("facturas").select("*").order("fecha_emision", { ascending: false });
  if (filtros?.tipo) q = q.eq("tipo", filtros.tipo);
  if (filtros?.estado) q = q.eq("estado", filtros.estado);
  if (filtros?.declarada !== undefined) q = q.eq("declarada", filtros.declarada);
  const { data } = await q;
  return (data ?? []) as Factura[];
}

export async function obtenerFactura(id: string): Promise<Factura | null> {
  await requireUser();
  const supabase = await createClient();
  const { data } = await supabase.from("facturas").select("*").eq("id", id).maybeSingle();
  return (data as Factura) ?? null;
}

export async function crearFactura(formData: FormData): Promise<ActionResult<{ id: string }>> {
  await requireUser();
  const parsed = facturaSchema.safeParse({
    tipo: formData.get("tipo"),
    numero: formData.get("numero"),
    tercero: formData.get("tercero"),
    fecha_emision: formData.get("fecha_emision"),
    valor: Number(formData.get("valor")),
    nota: (formData.get("nota") as string) || undefined,
  });
  if (!parsed.success) return fail("VALIDATION", parsed.error.issues[0]?.message ?? "Datos inválidos");
  const va = validarArchivo(formData.get("archivo"));
  if (!va.ok) return fail("VALIDATION", va.mensaje);

  const admin = createAdminClient();
  const { data, error } = await admin.from("facturas").insert(parsed.data).select("id").single();
  if (error) {
    if (error.code === "23505") return fail("BUSINESS", "Número de factura duplicado");
    return fail("UNEXPECTED", "Error inesperado");
  }
  const id = data.id as string;

  const archivo = formData.get("archivo");
  if (archivo instanceof File && archivo.size > 0) {
    try {
      const path = await subirArchivo(archivo, "facturas", id);
      if (path) await admin.from("facturas").update({ archivo_url: path }).eq("id", id);
    } catch {
      return fail("UNEXPECTED", "Factura creada pero falló la subida del archivo");
    }
  }
  revalidatePath("/contabilidad/facturas");
  return ok({ id });
}

export async function editarFactura(input: unknown): Promise<ActionResult> {
  await requireUser();
  const parsed = editarFacturaSchema.safeParse(input);
  if (!parsed.success) return fail("VALIDATION", parsed.error.issues[0]?.message ?? "Datos inválidos");
  const { id, ...d } = parsed.data;

  const admin = createAdminClient();
  const { data: actual } = await admin.from("facturas").select("*").eq("id", id).maybeSingle();
  if (!actual) return fail("BUSINESS", "La factura no existe");
  const f = actual as Factura;

  if (f.estado === "pagada") {
    const cambioInmutable =
      f.tipo !== d.tipo || f.numero !== d.numero || f.tercero !== d.tercero ||
      Number(f.valor) !== d.valor || f.fecha_emision !== d.fecha_emision;
    if (cambioInmutable) return fail("BUSINESS", "No se puede editar una factura pagada (solo la nota)");
    const { error } = await admin.from("facturas").update({ nota: d.nota ?? null }).eq("id", id);
    if (error) return fail("UNEXPECTED", "Error inesperado");
  } else {
    const { error } = await admin.from("facturas").update(d).eq("id", id);
    if (error) {
      if (error.code === "23505") return fail("BUSINESS", "Número de factura duplicado");
      return fail("UNEXPECTED", "Error inesperado");
    }
  }
  revalidatePath("/contabilidad/facturas");
  revalidatePath(`/contabilidad/facturas/${id}`);
  return ok(undefined);
}

export async function alternarDeclarada(id: string, declarada: boolean): Promise<ActionResult> {
  await requireUser();
  const admin = createAdminClient();
  const { error } = await admin.from("facturas").update({ declarada }).eq("id", id);
  if (error) return fail("UNEXPECTED", "Error inesperado");
  revalidatePath("/contabilidad/facturas");
  return ok(undefined);
}
