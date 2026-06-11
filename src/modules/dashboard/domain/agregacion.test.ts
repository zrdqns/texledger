import { describe, it, expect } from "vitest";
import { ultimosMeses, agregarPorMes, mezclarMovimientos, restarDias, contarBajoStock } from "./agregacion";

describe("ultimosMeses", () => {
  it("12 meses cruzando año, viejo→nuevo e incluyendo el actual", () => {
    expect(ultimosMeses("2026-06-10", 12)).toEqual([
      "2025-07", "2025-08", "2025-09", "2025-10", "2025-11", "2025-12",
      "2026-01", "2026-02", "2026-03", "2026-04", "2026-05", "2026-06",
    ]);
  });
  it("n=1 devuelve solo el mes actual", () => {
    expect(ultimosMeses("2026-01-05", 1)).toEqual(["2026-01"]);
  });
});

describe("agregarPorMes", () => {
  const meses = ["2026-04", "2026-05", "2026-06"];
  it("zero-fill de meses sin datos y suma por mes en orden", () => {
    const r = agregarPorMes(
      [
        { fecha: "2026-04-10", valor: 100 },
        { fecha: "2026-04-20", valor: 50 },
        { fecha: "2026-06-01", valor: 30 },
      ],
      [{ fecha: "2026-05-15", valor: 80 }],
      meses,
    );
    expect(r).toEqual([
      { mes: "2026-04", ingresos: 150, egresos: 0 },
      { mes: "2026-05", ingresos: 0, egresos: 80 },
      { mes: "2026-06", ingresos: 30, egresos: 0 },
    ]);
  });
  it("ignora filas fuera del rango", () => {
    const r = agregarPorMes([{ fecha: "2026-03-31", valor: 999 }], [], meses);
    expect(r).toEqual([
      { mes: "2026-04", ingresos: 0, egresos: 0 },
      { mes: "2026-05", ingresos: 0, egresos: 0 },
      { mes: "2026-06", ingresos: 0, egresos: 0 },
    ]);
  });
});

describe("mezclarMovimientos", () => {
  const mov = (id: string, fecha: string, created_at: string) => ({
    id, fecha, concepto: id, valor: 10, created_at,
  });
  it("mezcla, ordena fecha desc con desempate created_at desc y limita a n", () => {
    const r = mezclarMovimientos(
      [mov("i1", "2026-06-01", "2026-06-01T10:00:00Z"), mov("i2", "2026-06-03", "2026-06-03T08:00:00Z")],
      [mov("e1", "2026-06-03", "2026-06-03T09:00:00Z"), mov("e2", "2026-05-30", "2026-05-30T09:00:00Z")],
      3,
    );
    expect(r.map((m) => m.id)).toEqual(["e1", "i2", "i1"]);
    expect(r[0]?.tipo).toBe("egreso");
    expect(r[1]?.tipo).toBe("ingreso");
  });
});

describe("restarDias", () => {
  it("resta dentro del mes", () => {
    expect(restarDias("2026-06-10", 5)).toBe("2026-06-05");
  });
  it("cruza mes", () => {
    expect(restarDias("2026-06-10", 30)).toBe("2026-05-11");
  });
  it("cruza año", () => {
    expect(restarDias("2026-01-15", 30)).toBe("2025-12-16");
  });
});

describe("contarBajoStock", () => {
  it("cuenta stock < umbral; igual al umbral no cuenta", () => {
    expect(
      contarBajoStock([
        { stock_actual_m: 5, umbral_bajo_stock_m: 10 },
        { stock_actual_m: 10, umbral_bajo_stock_m: 10 },
        { stock_actual_m: 20, umbral_bajo_stock_m: 10 },
      ]),
    ).toBe(1);
  });
});
