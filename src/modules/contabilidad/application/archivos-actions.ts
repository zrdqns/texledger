"use server";

import { requireUser } from "@/core/auth/guard";
import { ok, fail, type ActionResult } from "@/shared/action-result";
import { urlFirmada } from "./archivos";

/** Solo paths legítimos del bucket: <carpeta>/<uuid>/<timestamp>.<ext>. Evita acceso arbitrario / traversal. */
const PATH_RE = /^(facturas|ingresos|egresos)\/[0-9a-f-]{36}\/\d+\.[A-Za-z0-9]+$/;

export async function obtenerUrlArchivo(path: string): Promise<ActionResult<{ url: string }>> {
  await requireUser();
  if (!PATH_RE.test(path)) return fail("VALIDATION", "Ruta de archivo inválida");
  const url = await urlFirmada(path);
  if (!url) return fail("UNEXPECTED", "No se pudo generar el enlace");
  return ok({ url });
}
