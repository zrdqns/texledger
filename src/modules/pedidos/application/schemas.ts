import { z } from "zod";

export const crearPedidoSchema = z.object({
  empresa_cliente: z.string().min(1, "Requerido"),
  fecha: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Fecha YYYY-MM-DD"),
  tela_id: z.string().uuid(),
  metros_llegados_planta: z.number().positive(),
  prendas_pedidas: z.number().int().positive(),
  consumo_prenda_m: z.number().positive(),
  nota: z.string().optional(),
});
export type CrearPedidoInput = z.infer<typeof crearPedidoSchema>;

export const editarPedidoSchema = crearPedidoSchema.extend({ id: z.string().uuid() });
export type EditarPedidoInput = z.infer<typeof editarPedidoSchema>;
