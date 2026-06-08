export type ActionResult<T = void> =
  | { ok: true; data: T }
  | { ok: false; code: "VALIDATION" | "BUSINESS" | "UNEXPECTED"; message: string };

export function ok<T>(data: T): ActionResult<T> {
  return { ok: true, data };
}

export function fail(
  code: "VALIDATION" | "BUSINESS" | "UNEXPECTED",
  message: string,
): ActionResult<never> {
  return { ok: false, code, message };
}

/** Mapea un error de Supabase RPC: P0001 (RAISE EXCEPTION del negocio) → BUSINESS; resto → UNEXPECTED. */
export function mapRpcError(error: { code?: string; message?: string } | null): ActionResult<never> {
  if (error?.code === "P0001") {
    return fail("BUSINESS", error.message ?? "Operación rechazada");
  }
  return fail("UNEXPECTED", "Error inesperado");
}
