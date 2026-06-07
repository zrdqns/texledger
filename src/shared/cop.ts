const nf = new Intl.NumberFormat("es-CO", { maximumFractionDigits: 0 });

/** Formatea un valor en COP, redondeado al peso (half-up), sin decimales. */
export function formatCOP(valor: number): string {
  return `$ ${nf.format(Math.round(valor))}`;
}
