import Link from "next/link";
import { listarPedidos } from "@/modules/pedidos/application/pedidos-actions";
import { PedidosTabla } from "@/modules/pedidos/presentation/pedidos-tabla";
import { PageHeader } from "@/components/ui/page-header";
import { btnPrimario } from "@/components/ui/estilos";

const ESTADOS = ["borrador", "confirmado", "cerrado", "anulado"];

const pillActiva = "rounded-lg bg-superficie-alta px-3 py-1.5 text-sm capitalize text-texto";
const pillInactiva = "rounded-lg border border-borde px-3 py-1.5 text-sm capitalize text-texto-suave hover:bg-superficie-alta";

export default async function PedidosPage({
  searchParams,
}: {
  searchParams: Promise<{ estado?: string }>;
}) {
  const { estado } = await searchParams;
  const pedidos = await listarPedidos(estado);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        titulo="Pedidos"
        accion={<Link href="/pedidos/nuevo" className={btnPrimario}>Nuevo pedido</Link>}
      />
      <div className="flex flex-wrap gap-2">
        <Link href="/pedidos" className={!estado ? pillActiva : pillInactiva}>Todos</Link>
        {ESTADOS.map((e) => (
          <Link key={e} href={`/pedidos?estado=${e}`} className={estado === e ? pillActiva : pillInactiva}>{e}</Link>
        ))}
      </div>
      <PedidosTabla pedidos={pedidos} />
    </div>
  );
}
