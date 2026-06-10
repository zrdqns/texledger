import { z } from "zod";

export const parametroSchema = z.object({
  anio: z.number().int("Año entero").min(2000).max(2100),
  smmlv: z.number().positive("SMMLV debe ser mayor a 0"),
  auxilio_transporte: z.number().min(0),
  tope_auxilio_smmlv: z.number().positive(),
  pct_pension: z.number().min(0).max(100),
  pct_salud: z.number().min(0).max(100),
});
export const editarParametroSchema = parametroSchema.extend({ id: z.string().uuid() });

export const empleadoSchema = z.object({
  nombre: z.string().min(1, "Requerido"),
  documento: z.string().optional(),
  cargo: z.string().optional(),
  sueldo_basico: z.number().positive("El sueldo debe ser mayor a 0"),
  seguro_tipo: z.enum(["fijo", "porcentaje", "ninguno"]),
  seguro_valor: z.number().min(0),
  fecha_ingreso: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Fecha YYYY-MM-DD").optional(),
});
export const editarEmpleadoSchema = empleadoSchema.extend({ id: z.string().uuid() });

export const liquidacionSchema = z.object({
  empleado_id: z.string().uuid("Selecciona un empleado"),
  periodo_anio: z.number().int().min(2000).max(2100),
  periodo_mes: z.number().int().min(1).max(12),
  dias_laborados: z.number().positive("Días laborados debe ser mayor a 0").max(30, "Máximo 30 días (mes comercial)"),
  incapacidades_dias: z.number().min(0),
  licencias_dias: z.number().min(0),
  ajuste_incap_licencia_valor: z.number(),
  libranzas: z.number().min(0),
});
