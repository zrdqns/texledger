export type RecordatorioTipo = "factura" | "pago_pendiente" | "factura_sin_declarar";
export type RecordatorioEstado = "pendiente" | "cumplido" | "vencido";

export type Recordatorio = {
  id: string;
  tipo: RecordatorioTipo;
  descripcion: string;
  fecha_objetivo: string;
  estado: RecordatorioEstado;
  factura_id: string | null;
  created_at: string;
  updated_at: string;
};

export type RecordatorioConFactura = Recordatorio & {
  facturas: { numero: string; tercero: string } | null;
};

export type Notificacion = {
  id: string;
  tipo: string;
  titulo: string;
  mensaje: string;
  leida: boolean;
  entidad_tipo: string;
  entidad_id: string;
  created_at: string;
};
