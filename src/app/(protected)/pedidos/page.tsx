import Link from "next/link";
import { listarPedidos } from "@/modules/pedidos/application/pedidos-actions";
import { PedidosTabla } from "@/modules/pedidos/presentation/pedidos-tabla";

const ESTADOS = ["borrador", "confirmado", "cerrado", "anulado"];

export default async function PedidosPage({
  searchParams,
}: {
  searchParams: Promise<{ estado?: string }>;
}) {
  const { estado } = await searchParams;
  const pedidos = await listarPedidos(estado);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-zinc-100">Pedidos</h2>
        <Link href="/pedidos/nuevo" className="rounded-md bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-emerald-500">Nuevo pedido</Link>
      </div>
      <div className="flex flex-wrap gap-2">
        <Link href="/pedidos" className={`rounded-md px-3 py-1.5 text-sm ${!estado ? "bg-zinc-700 text-white" : "border border-zinc-700 text-zinc-300 hover:bg-zinc-800"}`}>Todos</Link>
        {ESTADOS.map((e) => (
          <Link key={e} href={`/pedidos?estado=${e}`} className={`rounded-md px-3 py-1.5 text-sm capitalize ${estado === e ? "bg-zinc-700 text-white" : "border border-zinc-700 text-zinc-300 hover:bg-zinc-800"}`}>{e}</Link>
        ))}
      </div>
      <PedidosTabla pedidos={pedidos} />
    </div>
  );
}
