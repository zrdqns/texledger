import { describe, it, expect } from "vitest";
import { calcularTotalesReporte } from "./reporte";

describe("calcularTotalesReporte", () => {
  it("suma ingresos y egresos y calcula neto", () => {
    const r = calcularTotalesReporte([{ valor: 100 }, { valor: 50 }], [{ valor: 30 }]);
    expect(r).toEqual({ totalIngresos: 150, totalEgresos: 30, neto: 120 });
  });
  it("listas vacías dan ceros", () => {
    expect(calcularTotalesReporte([], [])).toEqual({ totalIngresos: 0, totalEgresos: 0, neto: 0 });
  });
});
