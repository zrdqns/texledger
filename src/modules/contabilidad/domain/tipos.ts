export type CuentaBancaria = {
  id: string;
  nombre: string;
  banco: string;
  numero: string | null;
  activo: boolean;
  created_at: string;
  updated_at: string;
};

export type Factura = {
  id: string;
  tipo: "venta" | "compra";
  numero: string;
  tercero: string;
  fecha_emision: string;
  valor: number;
  declarada: boolean;
  estado: "pendiente" | "pagada";
  archivo_url: string | null;
  nota: string | null;
  created_at: string;
  updated_at: string;
};

export type Ingreso = {
  id: string;
  fecha: string;
  concepto: string;
  valor: number;
  numero_comprobante: string | null;
  comprobante_url: string | null;
  factura_id: string | null;
  cuenta_bancaria_id: string | null;
  created_at: string;
  updated_at: string;
};

export type Egreso = {
  id: string;
  fecha_pago: string;
  cuenta_bancaria_id: string;
  valor: number;
  concepto: string;
  numero_comprobante: string | null;
  comprobante_url: string | null;
  factura_id: string | null;
  created_at: string;
  updated_at: string;
};
