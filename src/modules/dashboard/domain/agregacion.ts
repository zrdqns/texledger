import type { MovimientoReciente, PuntoSerie } from "./tipos";

export type Movimiento = { id: string; fecha: string; concepto: string; valor: number; created_at: string };

const MS_DIA = 86_400_000;

/** Claves YYYY-MM de los últimos n meses (incluye el de `hoy`), viejo→nuevo. `hoy` en YYYY-MM-DD. */
export function ultimosMeses(hoy: string, n: number): string[] {
  const anio = Number(hoy.slice(0, 4));
  const mes = Number(hoy.slice(5, 7));
  const res: string[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const total = anio * 12 + (mes - 1) - i;
    const a = Math.floor(total / 12);
    const m = (total % 12) + 1;
    res.push(`${a}-${String(m).padStart(2, "0")}`);
  }
  return res;
}

/** Serie mensual con zero-fill; ignora filas cuyo YYYY-MM no esté en `meses`. */
export function agregarPorMes(
  ingresos: { fecha: string; valor: number }[],
  egresos: { fecha: string; valor: number }[],
  meses: string[],
): PuntoSerie[] {
  const porMes = new Map<string, PuntoSerie>();
  for (const mes of meses) porMes.set(mes, { mes, ingresos: 0, egresos: 0 });
  for (const r of ingresos) {
    const p = porMes.get(r.fecha.slice(0, 7));
    if (p) p.ingresos += r.valor;
  }
  for (const r of egresos) {
    const p = porMes.get(r.fecha.slice(0, 7));
    if (p) p.egresos += r.valor;
  }
  return [...porMes.values()];
}

/** Mezcla ingresos y egresos, ordena por fecha desc (desempate created_at desc) y toma n. */
export function mezclarMovimientos(ingresos: Movimiento[], egresos: Movimiento[], n: number): MovimientoReciente[] {
  const todos: MovimientoReciente[] = [
    ...ingresos.map((m) => ({ tipo: "ingreso" as const, ...m })),
    ...egresos.map((m) => ({ tipo: "egreso" as const, ...m })),
  ];
  todos.sort((a, b) =>
    a.fecha === b.fecha ? b.created_at.localeCompare(a.created_at) : b.fecha.localeCompare(a.fecha),
  );
  return todos.slice(0, n);
}

/** Resta n días a una fecha YYYY-MM-DD (aritmética UTC exacta sobre fechas puras). */
export function restarDias(fecha: string, n: number): string {
  return new Date(Date.parse(fecha) - n * MS_DIA).toISOString().slice(0, 10);
}

export function contarBajoStock(telas: { stock_actual_m: number; umbral_bajo_stock_m: number }[]): number {
  return telas.filter((t) => t.stock_actual_m < t.umbral_bajo_stock_m).length;
}
