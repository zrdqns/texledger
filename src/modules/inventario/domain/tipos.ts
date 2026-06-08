export type Tela = {
  id: string;
  referencia: string;
  descripcion: string;
  composicion: string | null;
  color: string | null;
  ancho_m: number | null;
  gramaje_gm2: number | null;
  proveedor: string | null;
  unidad: string;
  stock_actual_m: number;
  paquetes_rollos: number | null;
  umbral_bajo_stock_m: number;
  consumo_prenda_m: number | null;
  lote: string | null;
  ubicacion: string | null;
  activo: boolean;
  created_at: string;
  updated_at: string;
};

export type Movimiento = {
  id: string;
  tela_id: string;
  tipo: "entrada" | "salida" | "devolucion" | "ajuste";
  origen: "rollo" | "pedido" | "importacion" | "manual";
  cantidad_m: number;
  prendas: number | null;
  consumo_aplicado: number | null;
  saldo_resultante_m: number;
  nota: string | null;
  created_at: string;
};
