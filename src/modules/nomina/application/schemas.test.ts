import { describe, it, expect } from "vitest";
import { parametroSchema, empleadoSchema, liquidacionSchema } from "./schemas";

describe("parametroSchema", () => {
  const base = { anio: 2026, smmlv: 1750905, auxilio_transporte: 249095, tope_auxilio_smmlv: 2, pct_pension: 4, pct_salud: 4 };
  it("acepta parámetros válidos", () => {
    expect(parametroSchema.safeParse(base).success).toBe(true);
  });
  it("rechaza año no entero", () => {
    expect(parametroSchema.safeParse({ ...base, anio: 2026.5 }).success).toBe(false);
  });
  it("rechaza smmlv <= 0", () => {
    expect(parametroSchema.safeParse({ ...base, smmlv: 0 }).success).toBe(false);
  });
});

describe("empleadoSchema", () => {
  const base = { nombre: "Ana Pérez", sueldo_basico: 2000000, seguro_tipo: "ninguno", seguro_valor: 0 };
  it("acepta empleado válido", () => {
    expect(empleadoSchema.safeParse(base).success).toBe(true);
  });
  it("rechaza sueldo_basico <= 0", () => {
    expect(empleadoSchema.safeParse({ ...base, sueldo_basico: 0 }).success).toBe(false);
  });
  it("rechaza seguro_tipo inválido", () => {
    expect(empleadoSchema.safeParse({ ...base, seguro_tipo: "otro" }).success).toBe(false);
  });
});

describe("liquidacionSchema", () => {
  const base = {
    empleado_id: "1b9d6bcd-bbfd-4b2d-9b5d-ab8dfbbd4bed",
    periodo_anio: 2026,
    periodo_mes: 6,
    dias_laborados: 30,
    incapacidades_dias: 0,
    licencias_dias: 0,
    ajuste_incap_licencia_valor: 0,
    libranzas: 0,
  };
  it("acepta liquidación válida", () => {
    expect(liquidacionSchema.safeParse(base).success).toBe(true);
  });
  it("acepta ajuste negativo", () => {
    expect(liquidacionSchema.safeParse({ ...base, ajuste_incap_licencia_valor: -50000 }).success).toBe(true);
  });
  it("rechaza periodo_mes fuera de 1..12", () => {
    expect(liquidacionSchema.safeParse({ ...base, periodo_mes: 13 }).success).toBe(false);
    expect(liquidacionSchema.safeParse({ ...base, periodo_mes: 0 }).success).toBe(false);
  });
  it("rechaza dias_laborados fuera de rango", () => {
    expect(liquidacionSchema.safeParse({ ...base, dias_laborados: 0 }).success).toBe(false);
    expect(liquidacionSchema.safeParse({ ...base, dias_laborados: 31 }).success).toBe(false);
  });
  it("rechaza libranzas negativas", () => {
    expect(liquidacionSchema.safeParse({ ...base, libranzas: -1 }).success).toBe(false);
  });
});
