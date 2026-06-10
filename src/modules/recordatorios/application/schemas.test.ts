import { describe, it, expect } from "vitest";
import { recordatorioSchema } from "./schemas";

describe("recordatorioSchema", () => {
  const base = { tipo: "pago_pendiente", descripcion: "Pagar proveedor", fecha_objetivo: "2026-06-20" };
  it("acepta recordatorio válido sin factura", () => {
    expect(recordatorioSchema.safeParse(base).success).toBe(true);
  });
  it("acepta factura_id uuid opcional", () => {
    expect(recordatorioSchema.safeParse({ ...base, factura_id: "1b9d6bcd-bbfd-4b2d-9b5d-ab8dfbbd4bed" }).success).toBe(true);
  });
  it("rechaza tipo inválido", () => {
    expect(recordatorioSchema.safeParse({ ...base, tipo: "otro" }).success).toBe(false);
  });
  it("rechaza descripción vacía", () => {
    expect(recordatorioSchema.safeParse({ ...base, descripcion: "" }).success).toBe(false);
  });
  it("rechaza fecha mal formada", () => {
    expect(recordatorioSchema.safeParse({ ...base, fecha_objetivo: "20/06/2026" }).success).toBe(false);
  });
});
