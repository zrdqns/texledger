"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/core/auth/guard";
import { createClient } from "@/core/supabase/server";
import { createAdminClient } from "@/core/supabase/admin";
import { ok, fail, type ActionResult } from "@/shared/action-result";
import { crearTelaSchema, editarTelaSchema } from "./schemas";
import type { Tela } from "../domain/tipos";

export async function listarTelas(
  opts: { soloBajoStock?: boolean; q?: string; incluirRetiradas?: boolean } = {},
): Promise<Tela[]> {
  await requireUser();
  const supabase = await createClient();
  let query = supabase.from("telas").select("*").order("referencia", { ascending: true });
  if (!opts.incluirRetiradas) query = query.eq("activo", true); // filtro activo/retiradas
  const { data } = await query;
  let telas = (data ?? []) as Tela[];
  // Búsqueda en JS (evita inyección en el filtro PostgREST .or con input del usuario)
  const q = opts.q?.trim().toLowerCase();
  if (q) {
    telas = telas.filter(
      (t) => t.referencia.toLowerCase().includes(q) || t.descripcion.toLowerCase().includes(q),
    );
  }
  if (opts.soloBajoStock) telas = telas.filter((t) => t.stock_actual_m < t.umbral_bajo_stock_m);
  return telas;
}

export async function obtenerTela(id: string): Promise<Tela | null> {
  await requireUser();
  const supabase = await createClient();
  const { data } = await supabase.from("telas").select("*").eq("id", id).maybeSingle();
  return (data as Tela) ?? null;
}

export async function crearTela(input: unknown): Promise<ActionResult<{ id: string }>> {
  await requireUser();
  const parsed = crearTelaSchema.safeParse(input);
  if (!parsed.success) return fail("VALIDATION", parsed.error.issues[0]?.message ?? "Datos inválidos");

  const admin = createAdminClient();
  const { data, error } = await admin.from("telas").insert(parsed.data).select("id").single();
  if (error) {
    if (error.code === "23505") return fail("BUSINESS", "La referencia ya existe");
    return fail("UNEXPECTED", "Error inesperado");
  }
  revalidatePath("/inventario");
  return ok({ id: data.id as string });
}

export async function editarTela(input: unknown): Promise<ActionResult> {
  await requireUser();
  const parsed = editarTelaSchema.safeParse(input);
  if (!parsed.success) return fail("VALIDATION", parsed.error.issues[0]?.message ?? "Datos inválidos");

  const { id, ...campos } = parsed.data;
  const admin = createAdminClient();
  const { error } = await admin.from("telas").update(campos).eq("id", id);
  if (error) {
    if (error.code === "23505") return fail("BUSINESS", "La referencia ya existe");
    return fail("UNEXPECTED", "Error inesperado");
  }
  revalidatePath("/inventario");
  revalidatePath(`/inventario/${id}`);
  return ok(undefined);
}

export async function retirarTela(id: string): Promise<ActionResult> {
  await requireUser();
  const admin = createAdminClient();
  const { error } = await admin.from("telas").update({ activo: false }).eq("id", id);
  if (error) return fail("UNEXPECTED", "Error inesperado");
  revalidatePath("/inventario");
  return ok(undefined);
}
