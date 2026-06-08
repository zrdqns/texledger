import { describe, it, expect } from "vitest";
import { calcularMetrosSalida } from "./salida";

describe("calcularMetrosSalida", () => {
  it("modo prenda: prendas × consumo", () => {
    expect(calcularMetrosSalida("prenda", { prendas: 10, consumo: 1.5 })).toBe(15);
  });
  it("modo metros: devuelve metros", () => {
    expect(calcularMetrosSalida("metros", { metros: 7 })).toBe(7);
  });
  it("prenda sin consumo lanza", () => {
    expect(() => calcularMetrosSalida("prenda", { prendas: 10 })).toThrow();
  });
  it("metros <= 0 lanza", () => {
    expect(() => calcularMetrosSalida("metros", { metros: 0 })).toThrow();
  });
});
