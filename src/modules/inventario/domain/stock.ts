/** Bajo stock si el stock cae por debajo (estricto) del umbral configurado. */
export function esBajoStock(stock: number, umbral: number): boolean {
  return stock < umbral;
}
