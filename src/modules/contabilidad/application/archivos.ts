import "server-only";
import { createAdminClient } from "@/core/supabase/admin";

const BUCKET = "contabilidad";

/** Tipos permitidos: la extensión se deriva de aquí (no del nombre del archivo del cliente). */
const MIME_PERMITIDOS: Record<string, string> = {
  "application/pdf": "pdf",
  "image/png": "png",
  "image/jpeg": "jpg",
};

/** Error de validación de archivo (tipo no permitido). */
export class ArchivoInvalidoError extends Error {}

/** Pre-valida un campo de archivo de FormData: ok si no hay archivo o si su MIME está permitido. */
export function validarArchivo(file: unknown): { ok: true } | { ok: false; mensaje: string } {
  if (!(file instanceof File) || file.size === 0) return { ok: true };
  if (!MIME_PERMITIDOS[file.type]) {
    return { ok: false, mensaje: "Tipo de archivo no permitido (solo PDF, PNG o JPG)" };
  }
  return { ok: true };
}

/** Sube un archivo al bucket privado y devuelve su path. Retorna null si no hay archivo. */
export async function subirArchivo(file: File | null, carpeta: string, id: string): Promise<string | null> {
  if (!file || file.size === 0) return null;
  const ext = MIME_PERMITIDOS[file.type];
  if (!ext) throw new ArchivoInvalidoError("Tipo de archivo no permitido (solo PDF, PNG o JPG)");
  const admin = createAdminClient();
  const path = `${carpeta}/${id}/${Date.now()}.${ext}`;
  const bytes = new Uint8Array(await file.arrayBuffer());
  const { error } = await admin.storage.from(BUCKET).upload(path, bytes, {
    contentType: file.type,
    upsert: false,
  });
  if (error) throw new Error("No se pudo subir el archivo");
  return path;
}

/** Genera una URL firmada de vida corta (60s) para un path del bucket. */
export async function urlFirmada(path: string): Promise<string | null> {
  const admin = createAdminClient();
  const { data } = await admin.storage.from(BUCKET).createSignedUrl(path, 60);
  return data?.signedUrl ?? null;
}
