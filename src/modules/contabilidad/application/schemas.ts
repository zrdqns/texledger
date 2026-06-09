import { z } from "zod";

export const cuentaSchema = z.object({
  nombre: z.string().min(1, "Requerido"),
  banco: z.string().min(1, "Requerido"),
  numero: z.string().optional(),
});
export const editarCuentaSchema = cuentaSchema.extend({ id: z.string().uuid() });

export const facturaSchema = z.object({
  tipo: z.enum(["venta", "compra"]),
  numero: z.string().min(1, "Requerido"),
  tercero: z.string().min(1, "Requerido"),
  fecha_emision: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Fecha YYYY-MM-DD"),
  valor: z.number().positive(),
  nota: z.string().optional(),
});
export const editarFacturaSchema = facturaSchema.extend({ id: z.string().uuid() });

export const ingresoSchema = z.object({
  fecha: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  concepto: z.string().min(1),
  valor: z.number().positive(),
  numero_comprobante: z.string().optional(),
  factura_id: z.string().uuid().optional(),
  cuenta_bancaria_id: z.string().uuid().optional(),
});

export const egresoSchema = z.object({
  fecha_pago: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  concepto: z.string().min(1),
  valor: z.number().positive(),
  cuenta_bancaria_id: z.string().uuid(),
  numero_comprobante: z.string().optional(),
  factura_id: z.string().uuid().optional(),
});

export const rangoReporteSchema = z.object({
  desde: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  hasta: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});
