export type ModoSalida = "prenda" | "metros";

export function calcularMetrosSalida(
  modo: ModoSalida,
  args: { prendas?: number; consumo?: number; metros?: number },
): number {
  if (modo === "prenda") {
    const { prendas, consumo } = args;
    if (!prendas || prendas <= 0 || !consumo || consumo <= 0) {
      throw new Error("prendas y consumo requeridos");
    }
    return prendas * consumo;
  }
  const { metros } = args;
  if (!metros || metros <= 0) throw new Error("metros invalido");
  return metros;
}
