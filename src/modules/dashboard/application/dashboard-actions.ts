"use server";

import { requireUser } from "@/core/auth/guard";
import { createClient } from "@/core/supabase/server";
import { hoyBogota } from "@/shared/fecha";
import { calcularTotalesReporte } from "@/modules/contabilidad/domain/reporte";
import {
  ultimosMeses,
  agregarPorMes,
  mezclarMovimientos,
  restarDias,
  contarBajoStock,
  type Movimiento,
} from "../domain/agregacion";
import type { ResumenDashboard } from "../domain/tipos";

export async function obtenerResumenDashboard(): Promise<ResumenDashboard> {
  await requireUser(); // una sola vez, antes de disparar las queries (spec §2.3)

  const hoy = hoyBogota();
  const mesActual = hoy.slice(0, 7);
  const meses = ultimosMeses(hoy, 12);
  const inicio = (meses[0] ?? mesActual) + "-01";
  const limite30 = restarDias(hoy, 30);

  const supabase = await createClient();
  const [ingRes, egrRes, telasRes, pendRes, sinDeclRes, vencidosRes] = await Promise.all([
    supabase.from("ingresos").select("id, fecha, concepto, valor, created_at").gte("fecha", inicio),
    supabase.from("egresos").select("id, fecha_pago, concepto, valor, created_at").gte("fecha_pago", inicio),
    supabase.from("telas").select("stock_actual_m, umbral_bajo_stock_m").eq("activo", true),
    supabase.from("facturas").select("*", { count: "exact", head: true }).eq("estado", "pendiente"),
    supabase.from("facturas").select("*", { count: "exact", head: true }).eq("declarada", false).lte("fecha_emision", limite30),
    supabase
      .from("recordatorios")
      .select("*", { count: "exact", head: true })
      .or(`estado.eq.vencido,and(estado.eq.pendiente,fecha_objetivo.lt.${hoy})`),
  ]);

  const ingresos = (ingRes.data ?? []) as Movimiento[];
  const egresos = (
    (egrRes.data ?? []) as { id: string; fecha_pago: string; concepto: string; valor: number; created_at: string }[]
  ).map(({ fecha_pago, ...resto }) => ({ ...resto, fecha: fecha_pago }));
  const telas = (telasRes.data ?? []) as { stock_actual_m: number; umbral_bajo_stock_m: number }[];

  // Cards: solo filas del mes actual (spec §4.4); la serie usa las filas completas.
  const totales = calcularTotalesReporte(
    ingresos.filter((m) => m.fecha.startsWith(mesActual)),
    egresos.filter((m) => m.fecha.startsWith(mesActual)),
  );

  return {
    cards: {
      ingresosMes: totales.totalIngresos,
      egresosMes: totales.totalEgresos,
      netoMes: totales.neto,
      stockTotalM: telas.reduce((s, t) => s + t.stock_actual_m, 0),
    },
    serie: agregarPorMes(ingresos, egresos, meses),
    ultimos: mezclarMovimientos(ingresos, egresos, 10),
    alertas: {
      bajoStock: contarBajoStock(telas),
      facturasPendientes: pendRes.count ?? 0,
      facturasSinDeclarar: sinDeclRes.count ?? 0,
      recordatoriosVencidos: vencidosRes.count ?? 0,
    },
  };
}
