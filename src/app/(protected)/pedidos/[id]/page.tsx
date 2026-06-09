import Link from "next/link";
import { notFound } from "next/navigation";
import { obtenerPedido } from "@/modules/pedidos/application/pedidos-actions";
import { PedidoAcciones } from "@/modules/pedidos/presentation/pedido-acciones";
import { formatFechaBogota } from "@/shared/fecha";

export default async function PedidoDetallePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const p = await obtenerPedido(id);
  if (!p) notFound();

  const saldoTxt =
    p.saldo_tela_m == null ? "—" :
    p.saldo_tela_m > 0 ? `Queda ${p.saldo_tela_m} m` :
    p.saldo_tela_m === 0 ? "Exacto" : `Déficit ${Math.abs(p.saldo_tela_m)} m`;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between">
        <div>
          <Link href="/pedidos" className="text-sm text-zinc-400 hover:text-zinc-100">← Pedidos</Link>
          <h2 className="mt-2 text-lg font-semibold text-zinc-100">{p.empresa_cliente}</h2>
          <p className="text-sm text-zinc-400">{formatFechaBogota(p.fecha)} · <span className="capitalize">{p.estado}</span></p>
        </div>
        <div className="flex flex-col items-end gap-2">
          {p.estado === "borrador" && (
            <Link href={`/pedidos/${p.id}/editar`} className="text-sm text-zinc-300 hover:text-zinc-100">Editar</Link>
          )}
          <PedidoAcciones id={p.id} estado={p.estado} />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Dato label="Tela"><Link href={`/inventario/${p.tela_id}`} className="text-emerald-400 hover:underline">{p.tela_referencia}</Link></Dato>
        <Dato label="Prendas">{p.prendas_pedidas}</Dato>
        <Dato label="Metros llegados">{p.metros_llegados_planta} m</Dato>
        <Dato label="Consumo m/prenda">{p.consumo_prenda_m}</Dato>
        <Dato label="Metros consumidos">{p.metros_consumidos ?? "—"}</Dato>
        <Dato label="Saldo de tela">{saldoTxt}</Dato>
      </div>
      {p.nota && <p className="text-sm text-zinc-400">Nota: {p.nota}</p>}
    </div>
  );
}

function Dato({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
      <p className="text-xs text-zinc-500">{label}</p>
      <p className="mt-1 text-zinc-100">{children}</p>
    </div>
  );
}
