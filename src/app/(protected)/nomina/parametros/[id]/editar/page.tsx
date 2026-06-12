import { notFound } from "next/navigation";
import { obtenerParametro } from "@/modules/nomina/application/parametros-actions";
import { ParametroForm } from "@/modules/nomina/presentation/parametro-form";
import { PageHeader } from "@/components/ui/page-header";

export default async function EditarParametroPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const parametro = await obtenerParametro(id);
  if (!parametro) notFound();
  return (
    <div className="flex flex-col gap-6">
      <PageHeader titulo={`Editar parámetros ${parametro.anio}`} volverHref="/nomina/parametros" volverLabel="Parámetros" />
      <ParametroForm parametro={parametro} />
    </div>
  );
}
