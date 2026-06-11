export type PuntoSerie = { mes: string; ingresos: number; egresos: number };

export type MovimientoReciente = {
  tipo: "ingreso" | "egreso";
  id: string;
  fecha: string;
  concepto: string;
  valor: number;
  created_at: string;
};

export type ResumenDashboard = {
  cards: { ingresosMes: number; egresosMes: number; netoMes: number; stockTotalM: number };
  serie: PuntoSerie[];
  ultimos: MovimientoReciente[];
  alertas: {
    bajoStock: number;
    facturasPendientes: number;
    facturasSinDeclarar: number;
    recordatoriosVencidos: number;
  };
};
