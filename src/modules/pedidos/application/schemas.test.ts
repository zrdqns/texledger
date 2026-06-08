import { describe, it, expect } from "vitest";
import { crearPedidoSchema } from "./schemas";

const base = {
  empresa_cliente: "ACME",
  fecha: "2026-06-08",
  tela_id: crypto.randomUUID(),
  metros_llegados_planta: 100,
  prendas_pedidas: 10,
  consumo_prenda_m: 1.5,
};

describe("crearPedidoSchema", () => {
  it("acepta un pedido válido", () => {
    expect(crearPedidoSchema.safeParse(base).success).toBe(true);
  });
  it("rechaza metros <= 0", () => {
    expect(crearPedidoSchema.safeParse({ ...base, metros_llegados_planta: 0 }).success).toBe(false);
  });
  it("rechaza prendas no entero", () => {
    expect(crearPedidoSchema.safeParse({ ...base, prendas_pedidas: 2.5 }).success).toBe(false);
  });
  it("rechaza consumo <= 0", () => {
    expect(crearPedidoSchema.safeParse({ ...base, consumo_prenda_m: 0 }).success).toBe(false);
  });
  it("rechaza fecha mal formada", () => {
    expect(crearPedidoSchema.safeParse({ ...base, fecha: "08/06/2026" }).success).toBe(false);
  });
});
