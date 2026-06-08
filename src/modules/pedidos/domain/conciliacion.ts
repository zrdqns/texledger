export type EstadoConciliacion = "queda" | "exacto" | "deficit";

export function calcularConciliacion(
  metrosLlegados: number,
  prendas: number,
  consumo: number,
): { metrosConsumidos: number; saldo: number; estado: EstadoConciliacion } {
  if (prendas <= 0 || consumo <= 0) throw new Error("prendas y consumo deben ser > 0");
  const metrosConsumidos = prendas * consumo;
  const saldo = metrosLlegados - metrosConsumidos;
  const estado: EstadoConciliacion = saldo > 0 ? "queda" : saldo === 0 ? "exacto" : "deficit";
  return { metrosConsumidos, saldo, estado };
}
