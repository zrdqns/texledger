import { z } from "zod";

export const crearTelaSchema = z.object({
  referencia: z.string().min(1, "Requerida"),
  descripcion: z.string().min(1, "Requerida"),
  composicion: z.string().optional(),
  color: z.string().optional(),
  ancho_m: z.number().positive().optional(),
  gramaje_gm2: z.number().positive().optional(),
  proveedor: z.string().optional(),
  unidad: z.string().min(1).default("metros"),
  paquetes_rollos: z.number().int().positive().optional(),
  umbral_bajo_stock_m: z.number().nonnegative(),
  consumo_prenda_m: z.number().positive().optional(),
  lote: z.string().optional(),
  ubicacion: z.string().optional(),
});
export type CrearTelaInput = z.infer<typeof crearTelaSchema>;

export const editarTelaSchema = crearTelaSchema.extend({
  id: z.string().uuid(),
});
export type EditarTelaInput = z.infer<typeof editarTelaSchema>;

export const entradaSchema = z.object({
  tela_id: z.string().uuid(),
  metros: z.number().positive(),
  nota: z.string().optional(),
});

export const salidaSchema = z
  .object({
    tela_id: z.string().uuid(),
    modo: z.enum(["prenda", "metros"]),
    prendas: z.number().int().positive().optional(),
    consumo: z.number().positive().optional(),
    metros: z.number().positive().optional(),
    nota: z.string().optional(),
  })
  .refine((v) => (v.modo === "prenda" ? v.prendas != null && v.consumo != null : true), {
    message: "prendas y consumo requeridos",
  })
  .refine((v) => (v.modo === "metros" ? v.metros != null : true), {
    message: "metros requerido",
  });

export const ajusteSchema = z.object({
  tela_id: z.string().uuid(),
  stock_contado: z.number().nonnegative(),
  nota: z.string().optional(),
});

export const filaImportSchema = z.object({
  referencia: z.string().min(1),
  descripcion: z.string().min(1),
  composicion: z.string().optional(),
  color: z.string().optional(),
  ancho_m: z.number().positive().optional(),
  gramaje_gm2: z.number().positive().optional(),
  proveedor: z.string().optional(),
  metraje_inicial_m: z.number().nonnegative(),
  paquetes_rollos: z.number().int().positive().optional(),
  unidad: z.string().min(1).default("metros"),
  umbral_bajo_stock_m: z.number().nonnegative(),
  consumo_prenda_m: z.number().positive().optional(),
  lote: z.string().optional(),
  ubicacion: z.string().optional(),
});
export type FilaImport = z.infer<typeof filaImportSchema>;
