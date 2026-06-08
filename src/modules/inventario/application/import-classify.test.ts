import { describe, it, expect } from "vitest";
import { clasificarFilas } from "./import-classify";

const base = { descripcion: "d", metraje_inicial_m: 10, unidad: "metros", umbral_bajo_stock_m: 5 };

describe("clasificarFilas", () => {
  it("separa válidas e inválidas (Zod)", () => {
    const r = clasificarFilas([{ ...base, referencia: "A" }, { ...base, referencia: "", }], new Set());
    expect(r.validas).toHaveLength(1);
    expect(r.invalidas).toHaveLength(1);
  });
  it("marca duplicadas intra-archivo (segunda ocurrencia)", () => {
    const r = clasificarFilas([{ ...base, referencia: "A" }, { ...base, referencia: "A" }], new Set());
    expect(r.validas).toHaveLength(1);
    expect(r.duplicadas).toHaveLength(1);
  });
  it("marca duplicadas contra DB", () => {
    const r = clasificarFilas([{ ...base, referencia: "A" }], new Set(["A"]));
    expect(r.validas).toHaveLength(0);
    expect(r.duplicadas).toHaveLength(1);
  });
});
