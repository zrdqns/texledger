const MS_DIA = 86_400_000;

/**
 * Días calendario entre hoy y la fecha objetivo (positivo = faltan, negativo = pasada).
 * Fechas puras YYYY-MM-DD; Date.parse las trata como medianoche UTC, así que la
 * diferencia es siempre un múltiplo exacto de 24h.
 */
export function diasRestantes(fechaObjetivo: string, hoy: string): number {
  return Math.round((Date.parse(fechaObjetivo) - Date.parse(hoy)) / MS_DIA);
}

/** Vencido = fecha objetivo estrictamente anterior a hoy (YYYY-MM-DD compara lexicográfico). */
export function esVencido(fechaObjetivo: string, hoy: string): boolean {
  return fechaObjetivo < hoy;
}
