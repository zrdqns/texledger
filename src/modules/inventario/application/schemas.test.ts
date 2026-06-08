import { describe, it, expect } from "vitest";
import { crearTelaSchema, salidaSchema, filaImportSchema } from "./schemas";

describe("crearTelaSchema", () => {
  it("acepta lo mínimo requerido", () => {
    const r = crearTelaSchema.safeParse({
      referencia: "REF-1", descripcion: "Jersey", unidad: "metros", umbral_bajo_stock_m: 50,
    });
    expect(r.success).toBe(true);
  });
  it("rechaza referencia vacía", () => {
    const r = crearTelaSchema.safeParse({ referencia: "", descripcion: "x", unidad: "metros", umbral_bajo_stock_m: 1 });
    expect(r.success).toBe(false);
  });
});

describe("salidaSchema", () => {
  it("modo prenda exige prendas y consumo", () => {
    expect(salidaSchema.safeParse({ tela_id: crypto.randomUUID(), modo: "prenda", prendas: 5, consumo: 1.2 }).success).toBe(true);
    expect(salidaSchema.safeParse({ tela_id: crypto.randomUUID(), modo: "prenda" }).success).toBe(false);
  });
  it("modo metros exige metros", () => {
    expect(salidaSchema.safeParse({ tela_id: crypto.randomUUID(), modo: "metros", metros: 3 }).success).toBe(true);
    expect(salidaSchema.safeParse({ tela_id: crypto.randomUUID(), modo: "metros" }).success).toBe(false);
  });
});

describe("filaImportSchema", () => {
  it("requiere referencia, descripcion, metraje_inicial_m, unidad, umbral", () => {
    const r = filaImportSchema.safeParse({
      referencia: "R1", descripcion: "d", metraje_inicial_m: 100, unidad: "metros", umbral_bajo_stock_m: 10,
    });
    expect(r.success).toBe(true);
  });
  it("rechaza metraje negativo", () => {
    const r = filaImportSchema.safeParse({
      referencia: "R1", descripcion: "d", metraje_inicial_m: -1, unidad: "metros", umbral_bajo_stock_m: 10,
    });
    expect(r.success).toBe(false);
  });
});
