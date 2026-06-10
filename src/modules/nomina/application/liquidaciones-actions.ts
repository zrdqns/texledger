"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/core/auth/guard";
import { createClient } from "@/core/supabase/server";
import { createAdminClient } from "@/core/supabase/admin";
import { ok, fail, type ActionResult } from "@/shared/action-result";
import { liquidacionSchema } from "./schemas";
import { calcularLiquidacion } from "../domain/liquidacion";
import type { Empleado, ParametroNomina, LiquidacionConEmpleado } from "../domain/tipos";

const JOIN_EMPLEADO = "*, empleados(nombre, documento, cargo)";

export async function listarLiquidaciones(): Promise<LiquidacionConEmpleado[]> {
  await requireUser();
  const supabase = await createClient();
  const { data } = await supabase
    .from("liquidaciones")
    .select(JOIN_EMPLEADO)
    .order("periodo_anio", { ascending: false })
    .order("periodo_mes", { ascending: false })
    .order("created_at", { ascending: false });
  return (data ?? []) as unknown as LiquidacionConEmpleado[];
}

export async function obtenerLiquidacion(id: string): Promise<LiquidacionConEmpleado | null> {
  await requireUser();
  const supabase = await createClient();
  const { data } = await supabase.from("liquidaciones").select(JOIN_EMPLEADO).eq("id", id).maybeSingle();
  return data as unknown as LiquidacionConEmpleado | null;
}

export async function crearLiquidacion(input: unknown): Promise<ActionResult<{ id: string }>> {
  const user = await requireUser();
  const parsed = liquidacionSchema.safeParse(input);
  if (!parsed.success) return fail("VALIDATION", parsed.error.issues[0]?.message ?? "Datos inválidos");
  const insumos = parsed.data;

  const supabase = await createClient();
  const [{ data: empleado }, { data: parametro }] = await Promise.all([
    supabase.from("empleados").select("*").eq("id", insumos.empleado_id).maybeSingle(),
    supabase.from("parametros_nomina").select("*").eq("anio", insumos.periodo_anio).maybeSingle(),
  ]);
  if (!empleado) return fail("BUSINESS", "Empleado no encontrado");
  const emp = empleado as Empleado;

  if (!parametro) {
    return fail("BUSINESS", `No hay parámetros para el año ${insumos.periodo_anio}: configúralos en Nómina → Parámetros`);
  }
  const par = parametro as ParametroNomina;

  const desglose = calcularLiquidacion(
    {
      sueldo_basico: emp.sueldo_basico,
      dias_laborados: insumos.dias_laborados,
      ajuste: insumos.ajuste_incap_licencia_valor,
      libranzas: insumos.libranzas,
      seguro_tipo: emp.seguro_tipo,
      seguro_valor: emp.seguro_valor,
    },
    par,
  );

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("liquidaciones")
    .insert({
      ...insumos,
      sueldo_basico: emp.sueldo_basico,
      seguro_tipo: emp.seguro_tipo,
      seguro_valor: emp.seguro_valor,
      smmlv: par.smmlv,
      auxilio_transporte: par.auxilio_transporte,
      tope_auxilio_smmlv: par.tope_auxilio_smmlv,
      pct_pension: par.pct_pension,
      pct_salud: par.pct_salud,
      ...desglose,
      usuario_id: user.id,
    })
    .select("id")
    .single();
  if (error) {
    if (error.code === "23505") return fail("BUSINESS", "Ya existe una liquidación para ese empleado y mes");
    return fail("UNEXPECTED", "Error inesperado");
  }
  revalidatePath("/nomina/liquidaciones");
  return ok({ id: data.id as string });
}
