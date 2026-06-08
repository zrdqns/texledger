import { describe, it, expect } from "vitest";
import { calcularConciliacion } from "./conciliacion";

describe("calcularConciliacion", () => {
  it("queda sobrante", () => {
    expect(calcularConciliacion(100, 10, 1.5)).toEqual({ metrosConsumidos: 15, saldo: 85, estado: "queda" });
  });
  it("exacto", () => {
    expect(calcularConciliacion(15, 10, 1.5)).toEqual({ metrosConsumidos: 15, saldo: 0, estado: "exacto" });
  });
  it("deficit", () => {
    expect(calcularConciliacion(10, 10, 1.5)).toEqual({ metrosConsumidos: 15, saldo: -5, estado: "deficit" });
  });
  it("rechaza prendas o consumo <= 0", () => {
    expect(() => calcularConciliacion(10, 0, 1.5)).toThrow();
    expect(() => calcularConciliacion(10, 5, 0)).toThrow();
  });
});
