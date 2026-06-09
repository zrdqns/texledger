import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { obtenerPedido } from "@/modules/pedidos/application/pedidos-actions";
import { listarTelas } from "@/modules/inventario/application/telas-actions";
import { PedidoForm } from "@/modules/pedidos/presentation/pedido-form";

export default async function EditarPedidoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const p = await obtenerPedido(id);
  if (!p) notFound();
  if (p.estado !== "borrador") redirect(`/pedidos/${id}`); // solo se edita un borrador

  const telas = await listarTelas();
  const opciones = telas.map((t) => ({
    id: t.id,
    referencia: t.referencia,
    descripcion: t.descripcion,
    consumo_prenda_m: t.consumo_prenda_m,
  }));

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link href={`/pedidos/${id}`} className="text-sm text-zinc-400 hover:text-zinc-100">← Volver</Link>
        <h2 className="mt-2 text-lg font-semibold text-zinc-100">Editar pedido</h2>
      </div>
      <PedidoForm
        telas={opciones}
        pedido={{
          id: p.id,
          empresa_cliente: p.empresa_cliente,
          fecha: p.fecha,
          tela_id: p.tela_id,
          metros_llegados_planta: p.metros_llegados_planta,
          prendas_pedidas: p.prendas_pedidas,
          consumo_prenda_m: p.consumo_prenda_m,
          nota: p.nota,
        }}
      />
    </div>
  );
}
