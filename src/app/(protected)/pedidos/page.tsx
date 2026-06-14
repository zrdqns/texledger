import Link from "next/link";
import { AlertTriangle, CheckCircle2, ClipboardList, Scissors } from "lucide-react";
import { listarPedidos } from "@/modules/pedidos/application/pedidos-actions";
import { PedidosTabla } from "@/modules/pedidos/presentation/pedidos-tabla";
import { PageHeader } from "@/components/ui/page-header";
import { CardTabla } from "@/components/ui/card-tabla";
import { StatCard } from "@/components/ui/stat-card";
import { btnPrimario, pillActiva, pillInactiva } from "@/components/ui/estilos";

const ESTADOS = ["borrador", "confirmado", "cerrado", "anulado"];
const nfMetros = new Intl.NumberFormat("es-CO", { maximumFractionDigits: 1 });

export default async function PedidosPage({
  searchParams,
}: {
  searchParams: Promise<{ estado?: string }>;
}) {
  const { estado } = await searchParams;
  const todos = await listarPedidos();
  const pedidos = estado ? todos.filter((p) => p.estado === estado) : todos;

  const confirmados = todos.filter((p) => p.estado === "confirmado").length;
  const enDeficit = todos.filter((p) => p.saldo_tela_m != null && p.saldo_tela_m < 0).length;
  const metrosConsumidos = todos.reduce((s, p) => s + (p.metros_consumidos ?? 0), 0);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        titulo="Pedidos"
        subtitulo="Conciliación de tela por pedido de producción"
        accion={<Link href="/pedidos/nuevo" className={btnPrimario}>Nuevo pedido</Link>}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total de pedidos" valor={String(todos.length)} icono={ClipboardList} tono="neutro" />
        <StatCard label="Confirmados" valor={String(confirmados)} icono={CheckCircle2} tono="ok" />
        <StatCard
          label="Con déficit de tela"
          valor={String(enDeficit)}
          icono={AlertTriangle}
          tono={enDeficit > 0 ? "peligro" : "neutro"}
        />
        <StatCard label="Metros consumidos" valor={`${nfMetros.format(metrosConsumidos)} m`} icono={Scissors} tono="neutro" />
      </div>

      <div className="flex flex-wrap gap-2">
        <Link href="/pedidos" className={!estado ? pillActiva : pillInactiva}>Todos</Link>
        {ESTADOS.map((e) => (
          <Link key={e} href={`/pedidos?estado=${e}`} className={estado === e ? `${pillActiva} capitalize` : `${pillInactiva} capitalize`}>{e}</Link>
        ))}
      </div>

      <CardTabla titulo="Historial de pedidos">
        <PedidosTabla pedidos={pedidos} />
      </CardTabla>
    </div>
  );
}
