export type SeguroTipo = "fijo" | "porcentaje" | "ninguno";

export type ParametroNomina = {
  id: string;
  anio: number;
  smmlv: number;
  auxilio_transporte: number;
  tope_auxilio_smmlv: number;
  pct_pension: number;
  pct_salud: number;
  created_at: string;
  updated_at: string;
};

export type Empleado = {
  id: string;
  nombre: string;
  documento: string | null;
  cargo: string | null;
  sueldo_basico: number;
  seguro_tipo: SeguroTipo;
  seguro_valor: number;
  activo: boolean;
  fecha_ingreso: string | null;
  foto_url: string | null;
  created_at: string;
  updated_at: string;
};

export type Liquidacion = {
  id: string;
  empleado_id: string;
  periodo_anio: number;
  periodo_mes: number;
  // insumos
  dias_laborados: number;
  incapacidades_dias: number;
  licencias_dias: number;
  ajuste_incap_licencia_valor: number;
  libranzas: number;
  // snapshot de empleado y parámetros
  sueldo_basico: number;
  smmlv: number;
  auxilio_transporte: number;
  tope_auxilio_smmlv: number;
  pct_pension: number;
  pct_salud: number;
  seguro_tipo: SeguroTipo;
  seguro_valor: number;
  // desglose calculado
  sueldo_prop: number;
  auxilio_prop: number;
  total_devengado: number;
  ibc: number;
  ded_pension: number;
  ded_salud: number;
  ded_seguro: number;
  total_deducido: number;
  neto_pagado: number;
  usuario_id: string | null;
  created_at: string;
  updated_at: string;
};

export type LiquidacionConEmpleado = Liquidacion & {
  empleados: { nombre: string; documento: string | null; cargo: string | null; foto_url: string | null } | null;
};
