import { describe, it, expect } from "vitest";
import { cuentaSchema, facturaSchema } from "./schemas";

describe("cuentaSchema", () => {
  it("acepta nombre y banco", () => {
    expect(cuentaSchema.safeParse({ nombre: "Principal", banco: "Bancolombia" }).success).toBe(true);
  });
  it("rechaza banco vacío", () => {
    expect(cuentaSchema.safeParse({ nombre: "x", banco: "" }).success).toBe(false);
  });
});

describe("facturaSchema", () => {
  const base = { tipo: "venta", numero: "F-1", tercero: "ACME", fecha_emision: "2026-06-09", valor: 1000 };
  it("acepta factura válida", () => {
    expect(facturaSchema.safeParse(base).success).toBe(true);
  });
  it("rechaza valor <= 0", () => {
    expect(facturaSchema.safeParse({ ...base, valor: 0 }).success).toBe(false);
  });
  it("rechaza tipo inválido", () => {
    expect(facturaSchema.safeParse({ ...base, tipo: "otro" }).success).toBe(false);
  });
});
