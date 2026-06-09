"use server";

import { requireUser } from "@/core/auth/guard";
import { ok, fail, type ActionResult } from "@/shared/action-result";
import { urlFirmada } from "./archivos";

export async function obtenerUrlArchivo(path: string): Promise<ActionResult<{ url: string }>> {
  await requireUser();
  const url = await urlFirmada(path);
  if (!url) return fail("UNEXPECTED", "No se pudo generar el enlace");
  return ok({ url });
}
