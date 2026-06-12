import Link from "next/link";
import { notFound } from "next/navigation";
import { obtenerPedido } from "@/modules/pedidos/application/pedidos-actions";
import { PedidoAcciones } from "@/modules/pedidos/presentation/pedido-acciones";
import { formatFechaBogota } from "@/shared/fecha";
import { linkSuave } from "@/components/ui/estilos";

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
          <Link href="/pedidos" className={linkSuave}>← Pedidos</Link>
          <h2 className="mt-2 text-xl font-bold text-texto">{p.empresa_cliente}</h2>
          <p className="text-sm text-texto-tenue">{formatFechaBogota(p.fecha)} · <span className="capitalize">{p.estado}</span></p>
        </div>
        <div className="flex flex-col items-end gap-2">
          {p.estado === "borrador" && (
            <Link href={`/pedidos/${p.id}/editar`} className={linkSuave}>Editar</Link>
          )}
          <PedidoAcciones id={p.id} estado={p.estado} />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Dato label="Tela"><Link href={`/inventario/${p.tela_id}`} className="text-primario-claro hover:underline">{p.tela_referencia}</Link></Dato>
        <Dato label="Prendas">{p.prendas_pedidas}</Dato>
        <Dato label="Metros llegados">{p.metros_llegados_planta} m</Dato>
        <Dato label="Consumo m/prenda">{p.consumo_prenda_m}</Dato>
        <Dato label="Metros consumidos">{p.metros_consumidos ?? "—"}</Dato>
        <Dato label="Saldo de tela">{saldoTxt}</Dato>
      </div>
      {p.nota && <p className="text-sm text-texto-tenue">Nota: {p.nota}</p>}
    </div>
  );
}

function Dato({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-borde/60 bg-superficie-baja p-4">
      <p className="text-xs text-texto-tenue">{label}</p>
      <p className="mt-1 text-texto">{children}</p>
    </div>
  );
}
