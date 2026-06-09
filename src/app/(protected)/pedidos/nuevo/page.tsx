import Link from "next/link";
import { listarTelas } from "@/modules/inventario/application/telas-actions";
import { PedidoForm } from "@/modules/pedidos/presentation/pedido-form";

export default async function NuevoPedidoPage() {
  const telas = await listarTelas(); // solo activas por defecto
  const opciones = telas.map((t) => ({
    id: t.id,
    referencia: t.referencia,
    descripcion: t.descripcion,
    consumo_prenda_m: t.consumo_prenda_m,
  }));
  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link href="/pedidos" className="text-sm text-zinc-400 hover:text-zinc-100">← Pedidos</Link>
        <h2 className="mt-2 text-lg font-semibold text-zinc-100">Nuevo pedido</h2>
      </div>
      <PedidoForm telas={opciones} />
    </div>
  );
}
