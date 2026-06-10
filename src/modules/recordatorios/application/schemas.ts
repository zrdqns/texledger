import { z } from "zod";

export const recordatorioSchema = z.object({
  tipo: z.enum(["factura", "pago_pendiente", "factura_sin_declarar"]),
  descripcion: z.string().min(1, "Requerido"),
  fecha_objetivo: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Fecha YYYY-MM-DD"),
  factura_id: z.string().uuid().optional(),
});
