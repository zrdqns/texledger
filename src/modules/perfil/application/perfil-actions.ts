"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { requireUser } from "@/core/auth/guard";
import { createClient } from "@/core/supabase/server";
import { createAdminClient } from "@/core/supabase/admin";
import { ok, fail, type ActionResult } from "@/shared/action-result";

const perfilSchema = z.object({
  nombre: z.string().trim().min(1, "El nombre es requerido").max(80, "Nombre demasiado largo"),
  foto_url: z.string().max(600000, "Imagen demasiado grande").nullable().optional(),
});

export type PerfilActual = { nombre: string | null; foto_url: string | null };

/** Lee el perfil del usuario logueado (tabla perfiles, no metadata de auth). */
export async function obtenerPerfilActual(): Promise<PerfilActual | null> {
  const user = await requireUser();
  const supabase = await createClient();
  const { data } = await supabase.from("perfiles").select("nombre, foto_url").eq("id", user.id).maybeSingle();
  return (data as PerfilActual) ?? null;
}

/**
 * Actualiza nombre y foto en la tabla `perfiles`. NO toca user_metadata de auth:
 * una foto base64 ahí infla el JWT/cookies y rompe el request (HTTP 431).
 */
export async function actualizarPerfil(input: unknown): Promise<ActionResult> {
  const user = await requireUser();
  const parsed = perfilSchema.safeParse(input);
  if (!parsed.success) return fail("VALIDATION", parsed.error.issues[0]?.message ?? "Datos inválidos");

  const admin = createAdminClient();
  const { error } = await admin
    .from("perfiles")
    .upsert({ id: user.id, nombre: parsed.data.nombre, foto_url: parsed.data.foto_url ?? null });
  if (error) return fail("UNEXPECTED", "No se pudo actualizar el perfil");

  revalidatePath("/", "layout");
  return ok(undefined);
}
