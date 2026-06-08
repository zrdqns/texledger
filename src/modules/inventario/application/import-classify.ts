import { filaImportSchema, type FilaImport } from "./schemas";

export type FilaInvalida = { fila: number; motivo: string };
export type FilaDuplicada = { fila: number; referencia: string; origen: "archivo" | "db" };

export type ResultadoClasificacion = {
  validas: FilaImport[];
  invalidas: FilaInvalida[];
  duplicadas: FilaDuplicada[];
};

/** Clasifica filas crudas: válidas (Zod), inválidas, y duplicadas (intra-archivo o contra DB). */
export function clasificarFilas(
  filas: unknown[],
  referenciasEnDb: Set<string>,
): ResultadoClasificacion {
  const validas: FilaImport[] = [];
  const invalidas: FilaInvalida[] = [];
  const duplicadas: FilaDuplicada[] = [];
  const vistas = new Set<string>();

  filas.forEach((cruda, i) => {
    const fila = i + 1;
    const parsed = filaImportSchema.safeParse(cruda);
    if (!parsed.success) {
      invalidas.push({ fila, motivo: parsed.error.issues[0]?.message ?? "inválida" });
      return;
    }
    const ref = parsed.data.referencia;
    if (referenciasEnDb.has(ref)) {
      duplicadas.push({ fila, referencia: ref, origen: "db" });
      return;
    }
    if (vistas.has(ref)) {
      duplicadas.push({ fila, referencia: ref, origen: "archivo" });
      return;
    }
    vistas.add(ref);
    validas.push(parsed.data);
  });

  return { validas, invalidas, duplicadas };
}
