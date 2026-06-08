export type EstadoPedido = "borrador" | "confirmado" | "cerrado" | "anulado";

export type Pedido = {
  id: string;
  empresa_cliente: string;
  fecha: string;
  tela_id: string;
  metros_llegados_planta: number;
  prendas_pedidas: number;
  consumo_prenda_m: number;
  metros_consumidos: number | null;
  saldo_tela_m: number | null;
  estado: EstadoPedido;
  nota: string | null;
  usuario_id: string;
  created_at: string;
  updated_at: string;
};

export type PedidoConTela = Pedido & { tela_referencia: string };
