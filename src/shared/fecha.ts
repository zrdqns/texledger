export const TZ_BOGOTA = "America/Bogota";

/** Fecha de hoy en America/Bogota como string YYYY-MM-DD (fecha calendario). */
export function hoyBogota(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: TZ_BOGOTA,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

const fmtTimestampBogota = new Intl.DateTimeFormat("es-CO", {
  timeZone: TZ_BOGOTA,
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

/** Formatea un timestamptz ISO (created_at, etc.) a dd/mm/aaaa en America/Bogota. */
export function formatTimestampBogota(iso: string): string {
  return fmtTimestampBogota.format(new Date(iso));
}

/**
 * Formatea una fecha calendario (YYYY-MM-DD) a dd/mm/aaaa.
 * Trata el valor como fecha pura (sin hora) para evitar corrimientos de ±1 día.
 */
export function formatFechaBogota(isoDate: string): string {
  const parts = isoDate.split("-");
  const y = parts[0] ?? "";
  const m = parts[1] ?? "";
  const d = parts[2] ?? "";
  return `${d}/${m}/${y}`;
}
