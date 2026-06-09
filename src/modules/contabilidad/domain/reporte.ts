export function calcularTotalesReporte(
  ingresos: { valor: number }[],
  egresos: { valor: number }[],
): { totalIngresos: number; totalEgresos: number; neto: number } {
  const totalIngresos = ingresos.reduce((s, x) => s + x.valor, 0);
  const totalEgresos = egresos.reduce((s, x) => s + x.valor, 0);
  return { totalIngresos, totalEgresos, neto: totalIngresos - totalEgresos };
}
