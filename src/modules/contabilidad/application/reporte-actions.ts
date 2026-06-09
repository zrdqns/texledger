"use server";

import { requireUser } from "@/core/auth/guard";
import { createClient } from "@/core/supabase/server";
import { calcularTotalesReporte } from "../domain/reporte";
import { rangoReporteSchema } from "./schemas";
import type { Ingreso, Egreso } from "../domain/tipos";

export async function consultarReporte(desde: string, hasta: string): Promise<{
  ingresos: Ingreso[];
  egresos: Egreso[];
  totales: { totalIngresos: number; totalEgresos: number; neto: number };
}> {
  await requireUser();
  // Validación server-side del rango (defensa, no solo el pre-filtro de la página)
  const rango = rangoReporteSchema.parse({ desde, hasta });

  const supabase = await createClient();
  const [{ data: ing }, { data: egr }] = await Promise.all([
    supabase.from("ingresos").select("*").gte("fecha", rango.desde).lte("fecha", rango.hasta).order("fecha"),
    supabase.from("egresos").select("*").gte("fecha_pago", rango.desde).lte("fecha_pago", rango.hasta).order("fecha_pago"),
  ]);
  const ingresos = (ing ?? []) as Ingreso[];
  const egresos = (egr ?? []) as Egreso[];
  const totales = calcularTotalesReporte(ingresos, egresos);
  return { ingresos, egresos, totales };
}
