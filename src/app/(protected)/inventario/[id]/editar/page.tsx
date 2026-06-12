import { notFound } from "next/navigation";
import { obtenerTela } from "@/modules/inventario/application/telas-actions";
import { TelaForm } from "@/modules/inventario/presentation/tela-form";
import { PageHeader } from "@/components/ui/page-header";

export default async function EditarTelaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const tela = await obtenerTela(id);
  if (!tela) notFound();
  return (
    <div className="flex flex-col gap-6">
      <PageHeader titulo={`Editar ${tela.referencia}`} volverHref={`/inventario/${id}`} volverLabel="Volver" />
      <TelaForm tela={tela} />
    </div>
  );
}
