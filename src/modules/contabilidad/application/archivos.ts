import "server-only";
import { createAdminClient } from "@/core/supabase/admin";

const BUCKET = "contabilidad";

/** Sube un archivo al bucket privado y devuelve su path. Retorna null si no hay archivo. */
export async function subirArchivo(file: File | null, carpeta: string, id: string): Promise<string | null> {
  if (!file || file.size === 0) return null;
  const admin = createAdminClient();
  const ext = file.name.includes(".") ? file.name.split(".").pop() : "bin";
  const path = `${carpeta}/${id}/${Date.now()}.${ext}`;
  const bytes = new Uint8Array(await file.arrayBuffer());
  const { error } = await admin.storage.from(BUCKET).upload(path, bytes, {
    contentType: file.type || "application/octet-stream",
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
