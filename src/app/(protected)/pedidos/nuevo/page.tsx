import { listarTelas } from "@/modules/inventario/application/telas-actions";
import { PedidoForm } from "@/modules/pedidos/presentation/pedido-form";
import { PageHeader } from "@/components/ui/page-header";

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
      <PageHeader titulo="Nuevo pedido" volverHref="/pedidos" volverLabel="Pedidos" />
      <PedidoForm telas={opciones} />
    </div>
  );
}
