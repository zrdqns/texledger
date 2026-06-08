"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/core/auth/guard";
import { createClient } from "@/core/supabase/server";
import { createAdminClient } from "@/core/supabase/admin";
import { ok, fail, mapRpcError, type ActionResult } from "@/shared/action-result";
import { entradaSchema, salidaSchema, ajusteSchema } from "./schemas";
import type { Movimiento } from "../domain/tipos";

export async function listarKardex(telaId: string): Promise<Movimiento[]> {
  await requireUser();
  const supabase = await createClient();
  const { data } = await supabase
    .from("movimientos_inventario")
    .select("*")
    .eq("tela_id", telaId)
    .order("created_at", { ascending: false });
  return (data ?? []) as Movimiento[];
}

export async function registrarEntrada(input: unknown): Promise<ActionResult<number>> {
  await requireUser();
  const parsed = entradaSchema.safeParse(input);
  if (!parsed.success) return fail("VALIDATION", parsed.error.issues[0]?.message ?? "Datos inválidos");

  const admin = createAdminClient();
  const { data, error } = await admin.rpc("registrar_entrada_tela", {
    p_tela_id: parsed.data.tela_id,
    p_metros: parsed.data.metros,
    p_nota: parsed.data.nota ?? null,
  });
  if (error) return mapRpcError(error);
  revalidatePath(`/inventario/${parsed.data.tela_id}`);
  revalidatePath("/inventario");
  return ok(data as number);
}

export async function registrarSalida(input: unknown): Promise<ActionResult<number>> {
  await requireUser();
  const parsed = salidaSchema.safeParse(input);
  if (!parsed.success) return fail("VALIDATION", parsed.error.issues[0]?.message ?? "Datos inválidos");

  const admin = createAdminClient();
  const { data, error } = await admin.rpc("registrar_salida_tela", {
    p_tela_id: parsed.data.tela_id,
    p_modo: parsed.data.modo,
    p_prendas: parsed.data.prendas ?? null,
    p_consumo: parsed.data.consumo ?? null,
    p_metros: parsed.data.metros ?? null,
    p_nota: parsed.data.nota ?? null,
  });
  if (error) return mapRpcError(error);
  revalidatePath(`/inventario/${parsed.data.tela_id}`);
  revalidatePath("/inventario");
  return ok(data as number);
}

export async function registrarAjuste(input: unknown): Promise<ActionResult<number>> {
  await requireUser();
  const parsed = ajusteSchema.safeParse(input);
  if (!parsed.success) return fail("VALIDATION", parsed.error.issues[0]?.message ?? "Datos inválidos");

  const admin = createAdminClient();
  const { data, error } = await admin.rpc("registrar_ajuste_tela", {
    p_tela_id: parsed.data.tela_id,
    p_stock_contado: parsed.data.stock_contado,
    p_nota: parsed.data.nota ?? null,
  });
  if (error) return mapRpcError(error);
  revalidatePath(`/inventario/${parsed.data.tela_id}`);
  revalidatePath("/inventario");
  return ok(data as number);
}
