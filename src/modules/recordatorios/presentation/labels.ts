import type { RecordatorioTipo } from "../domain/tipos";

export const TIPO_LABEL: Record<RecordatorioTipo, string> = {
  factura: "Factura",
  pago_pendiente: "Pago pendiente",
  factura_sin_declarar: "Factura sin declarar",
};
