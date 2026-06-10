import type { SeguroTipo } from "./tipos";

export type InsumosLiquidacion = {
  sueldo_basico: number;
  dias_laborados: number;
  ajuste: number;
  libranzas: number;
  seguro_tipo: SeguroTipo;
  seguro_valor: number;
};

export type ParametrosCalculo = {
  smmlv: number;
  auxilio_transporte: number;
  tope_auxilio_smmlv: number;
  pct_pension: number;
  pct_salud: number;
};

export type DesgloseLiquidacion = {
  sueldo_prop: number;
  auxilio_prop: number;
  total_devengado: number;
  ibc: number;
  ded_pension: number;
  ded_salud: number;
  ded_seguro: number;
  total_deducido: number;
  neto_pagado: number;
};

/**
 * Liquidación de nómina mensual (spec §6). Redondeo COP half-up por concepto.
 * Simplificación v1: el ajuste por incapacidades/licencias es manual; no se
 * automatiza el efecto legal (auxilio en días de incapacidad, piso de IBC).
 */
export function calcularLiquidacion(
  insumos: InsumosLiquidacion,
  parametros: ParametrosCalculo,
): DesgloseLiquidacion {
  if (insumos.dias_laborados <= 0) throw new Error("dias_laborados debe ser mayor a 0");
  if (insumos.sueldo_basico <= 0) throw new Error("sueldo_basico debe ser mayor a 0");

  const sueldo_prop = Math.round((insumos.sueldo_basico * insumos.dias_laborados) / 30);
  const aplica_auxilio = insumos.sueldo_basico <= parametros.tope_auxilio_smmlv * parametros.smmlv;
  const auxilio_prop = aplica_auxilio
    ? Math.round((parametros.auxilio_transporte * insumos.dias_laborados) / 30)
    : 0;
  const total_devengado = sueldo_prop + auxilio_prop + insumos.ajuste;
  const ibc = total_devengado - auxilio_prop;
  const ded_pension = Math.round((ibc * parametros.pct_pension) / 100);
  const ded_salud = Math.round((ibc * parametros.pct_salud) / 100);
  const ded_seguro =
    insumos.seguro_tipo === "fijo"
      ? Math.round(insumos.seguro_valor)
      : insumos.seguro_tipo === "porcentaje"
        ? Math.round((insumos.sueldo_basico * insumos.seguro_valor) / 100) // base = sueldo básico completo del mes
        : 0;
  const total_deducido = ded_pension + ded_salud + ded_seguro + insumos.libranzas;
  const neto_pagado = total_devengado - total_deducido;

  return {
    sueldo_prop,
    auxilio_prop,
    total_devengado,
    ibc,
    ded_pension,
    ded_salud,
    ded_seguro,
    total_deducido,
    neto_pagado,
  };
}
