import { describe, it, expect } from "vitest";
import { calcularLiquidacion } from "./liquidacion";

const PARAMS = {
  smmlv: 1_750_905,
  auxilio_transporte: 249_095,
  tope_auxilio_smmlv: 2,
  pct_pension: 4,
  pct_salud: 4,
};

const base = {
  sueldo_basico: 1_750_905,
  dias_laborados: 30,
  ajuste: 0,
  libranzas: 0,
  seguro_tipo: "ninguno" as const,
  seguro_valor: 0,
};

describe("calcularLiquidacion", () => {
  it("mes completo con auxilio (sueldo = 1 SMMLV)", () => {
    expect(calcularLiquidacion(base, PARAMS)).toEqual({
      sueldo_prop: 1_750_905,
      auxilio_prop: 249_095,
      total_devengado: 2_000_000,
      ibc: 1_750_905,
      ded_pension: 70_036,
      ded_salud: 70_036,
      ded_seguro: 0,
      total_deducido: 140_072,
      neto_pagado: 1_859_928,
    });
  });

  it("sin auxilio cuando sueldo > 2 SMMLV", () => {
    const r = calcularLiquidacion({ ...base, sueldo_basico: 4_000_000 }, PARAMS);
    expect(r.auxilio_prop).toBe(0);
    expect(r.total_devengado).toBe(4_000_000);
    expect(r.ibc).toBe(4_000_000);
    expect(r.ded_pension).toBe(160_000);
    expect(r.ded_salud).toBe(160_000);
    expect(r.neto_pagado).toBe(3_680_000);
  });

  it("auxilio aplica cuando sueldo es exactamente 2 SMMLV", () => {
    const r = calcularLiquidacion({ ...base, sueldo_basico: 3_501_810 }, PARAMS);
    expect(r.auxilio_prop).toBe(249_095);
  });

  it("mes parcial (15 días) con redondeo half-up por concepto", () => {
    const r = calcularLiquidacion({ ...base, dias_laborados: 15 }, PARAMS);
    expect(r.sueldo_prop).toBe(875_453); // 875.452,5 → 875.453
    expect(r.auxilio_prop).toBe(124_548); // 124.547,5 → 124.548
    expect(r.total_devengado).toBe(1_000_001);
    expect(r.ibc).toBe(875_453);
    expect(r.ded_pension).toBe(35_018);
    expect(r.ded_salud).toBe(35_018);
    expect(r.neto_pagado).toBe(929_965);
  });

  it("seguro fijo se descuenta completo", () => {
    const r = calcularLiquidacion(
      { ...base, sueldo_basico: 2_000_000, seguro_tipo: "fijo", seguro_valor: 60_000 },
      PARAMS,
    );
    expect(r.ded_seguro).toBe(60_000);
    expect(r.total_deducido).toBe(220_000);
    expect(r.neto_pagado).toBe(2_029_095);
  });

  it("seguro porcentaje usa el básico completo aunque el mes sea parcial", () => {
    const r = calcularLiquidacion(
      { ...base, sueldo_basico: 2_000_000, dias_laborados: 15, seguro_tipo: "porcentaje", seguro_valor: 2 },
      PARAMS,
    );
    expect(r.ded_seguro).toBe(40_000); // 2% de 2.000.000, no proporcional
    expect(r.sueldo_prop).toBe(1_000_000);
    expect(r.neto_pagado).toBe(1_004_548);
  });

  it("ajuste negativo y libranzas afectan devengado, IBC y neto", () => {
    const r = calcularLiquidacion(
      { ...base, sueldo_basico: 2_000_000, ajuste: -100_000, libranzas: 150_000 },
      PARAMS,
    );
    expect(r.total_devengado).toBe(2_149_095);
    expect(r.ibc).toBe(1_900_000);
    expect(r.ded_pension).toBe(76_000);
    expect(r.ded_salud).toBe(76_000);
    expect(r.total_deducido).toBe(302_000);
    expect(r.neto_pagado).toBe(1_847_095);
  });

  it("lanza si dias_laborados <= 0", () => {
    expect(() => calcularLiquidacion({ ...base, dias_laborados: 0 }, PARAMS)).toThrow();
    expect(() => calcularLiquidacion({ ...base, dias_laborados: -1 }, PARAMS)).toThrow();
  });

  it("lanza si sueldo_basico <= 0", () => {
    expect(() => calcularLiquidacion({ ...base, sueldo_basico: 0 }, PARAMS)).toThrow();
  });
});
