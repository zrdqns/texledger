"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/core/auth/guard";
import { createClient } from "@/core/supabase/server";
import { createAdminClient } from "@/core/supabase/admin";
import { ok, fail, mapRpcError, type ActionResult } from "@/shared/action-result";
import { crearPedidoSchema, editarPedidoSchema } from "./schemas";
import type { Pedido, PedidoConTela } from "../domain/tipos";

type Row = Pedido & { telas: { referencia: string } | null };

export async function listarPedidos(estado?: string): Promise<PedidoConTela[]> {
  await requireUser();
  const supabase = await createClient();
  let query = supabase
    .from("pedidos")
    .select("*, telas(referencia)")
    .order("created_at", { ascending: false });
  if (estado) query = query.eq("estado", estado);
  const { data } = await query;
  return ((data ?? []) as Row[]).map(({ telas, ...p }) => ({
    ...p,
    tela_referencia: telas?.referencia ?? "",
  }));
}

export async function obtenerPedido(id: string): Promise<PedidoConTela | null> {
  await requireUser();
  const supabase = await createClient();
  const { data } = await supabase
    .from("pedidos")
    .select("*, telas(referencia)")
    .eq("id", id)
    .maybeSingle();
  if (!data) return null;
  const { telas, ...p } = data as Row;
  return { ...p, tela_referencia: telas?.referencia ?? "" };
}

export async function crearPedido(input: unknown): Promise<ActionResult<{ id: string }>> {
  const user = await requireUser();
  const parsed = crearPedidoSchema.safeParse(input);
  if (!parsed.success) return fail("VALIDATION", parsed.error.issues[0]?.message ?? "Datos inválidos");

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("pedidos")
    .insert({ ...parsed.data, usuario_id: user.id })
    .select("id")
    .single();
  if (error) return fail("UNEXPECTED", "Error inesperado");
  revalidatePath("/pedidos");
  return ok({ id: data.id as string });
}

export async function editarPedido(input: unknown): Promise<ActionResult> {
  await requireUser();
  const parsed = editarPedidoSchema.safeParse(input);
  if (!parsed.success) return fail("VALIDATION", parsed.error.issues[0]?.message ?? "Datos inválidos");

  const { id, ...campos } = parsed.data;
  const admin = createAdminClient();
  const { data: actual } = await admin.from("pedidos").select("estado").eq("id", id).maybeSingle();
  if (!actual) return fail("BUSINESS", "El pedido no existe");
  if ((actual.estado as string) !== "borrador") return fail("BUSINESS", "Solo se puede editar un borrador");

  const { error } = await admin.from("pedidos").update(campos).eq("id", id);
  if (error) return fail("UNEXPECTED", "Error inesperado");
  revalidatePath("/pedidos");
  revalidatePath(`/pedidos/${id}`);
  return ok(undefined);
}

export async function confirmarPedido(id: string): Promise<ActionResult> {
  await requireUser();
  const admin = createAdminClient();
  const { error } = await admin.rpc("confirmar_pedido", { p_pedido_id: id });
  if (error) return mapRpcError(error);
  revalidatePath("/pedidos");
  revalidatePath(`/pedidos/${id}`);
  revalidatePath("/inventario");
  return ok(undefined);
}

export async function anularPedido(id: string): Promise<ActionResult> {
  await requireUser();
  const admin = createAdminClient();
  const { error } = await admin.rpc("anular_pedido", { p_pedido_id: id });
  if (error) return mapRpcError(error);
  revalidatePath("/pedidos");
  revalidatePath(`/pedidos/${id}`);
  revalidatePath("/inventario");
  return ok(undefined);
}

export async function cerrarPedido(id: string): Promise<ActionResult> {
  await requireUser();
  const admin = createAdminClient();
  const { data: actual } = await admin.from("pedidos").select("estado").eq("id", id).maybeSingle();
  if (!actual) return fail("BUSINESS", "El pedido no existe");
  if ((actual.estado as string) !== "confirmado") return fail("BUSINESS", "Solo se cierra un pedido confirmado");
  const { error } = await admin.from("pedidos").update({ estado: "cerrado" }).eq("id", id);
  if (error) return fail("UNEXPECTED", "Error inesperado");
  revalidatePath("/pedidos");
  revalidatePath(`/pedidos/${id}`);
  return ok(undefined);
}
