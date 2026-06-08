"use server";

import * as XLSX from "xlsx";
import { revalidatePath } from "next/cache";
import { requireUser } from "@/core/auth/guard";
import { createAdminClient } from "@/core/supabase/admin";
import { ok, fail, mapRpcError, type ActionResult } from "@/shared/action-result";
import { clasificarFilas, type ResultadoClasificacion } from "./import-classify";
import type { FilaImport } from "./schemas";

/** Convierte celdas a número cuando vienen como string ("1.234,5" o "1234.5"). */
function aNumero(v: unknown): unknown {
  if (typeof v === "number" || v == null || v === "") return v;
  const limpio = String(v).replace(/\./g, "").replace(",", ".");
  const n = Number(limpio);
  return Number.isNaN(n) ? v : n;
}

const NUM_COLS = ["ancho_m", "gramaje_gm2", "metraje_inicial_m", "paquetes_rollos", "umbral_bajo_stock_m", "consumo_prenda_m"];

export async function previsualizarImport(formData: FormData): Promise<ActionResult<ResultadoClasificacion>> {
  await requireUser();
  const file = formData.get("archivo");
  if (!(file instanceof File)) return fail("VALIDATION", "Archivo requerido");

  let filas: Record<string, unknown>[];
  try {
    const buf = await file.arrayBuffer();
    const wb = XLSX.read(buf, { type: "array" });
    const sheet = wb.Sheets[wb.SheetNames[0]!];
    if (!sheet) return fail("VALIDATION", "El archivo no tiene hojas");
    const crudas = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: undefined });
    filas = crudas.map((row) => {
      const out: Record<string, unknown> = { ...row };
      for (const c of NUM_COLS) if (c in out) out[c] = aNumero(out[c]);
      return out;
    });
  } catch {
    return fail("VALIDATION", "No se pudo leer el Excel");
  }

  // Referencias existentes en DB
  const admin = createAdminClient();
  const refs = filas.map((f) => f.referencia).filter((r): r is string => typeof r === "string" && r.length > 0);
  const { data: existentes, error } = await admin.from("telas").select("referencia").in("referencia", refs);
  if (error) return fail("UNEXPECTED", "Error consultando referencias");
  const enDb = new Set((existentes ?? []).map((r) => r.referencia as string));

  return ok(clasificarFilas(filas, enDb));
}

export async function confirmarImport(validas: FilaImport[]): Promise<ActionResult<{ creadas: number }>> {
  await requireUser();
  if (validas.length === 0) return fail("VALIDATION", "No hay filas válidas para importar");

  const admin = createAdminClient();
  const { data, error } = await admin.rpc("importar_inventario", { p_filas: validas });
  if (error) return mapRpcError(error);
  revalidatePath("/inventario");
  return ok({ creadas: (data as { creadas: number }).creadas });
}
