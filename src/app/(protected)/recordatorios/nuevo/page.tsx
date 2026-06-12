import { listarFacturas } from "@/modules/contabilidad/application/facturas-actions";
import { RecordatorioForm } from "@/modules/recordatorios/presentation/recordatorio-form";
import { PageHeader } from "@/components/ui/page-header";

export default async function NuevoRecordatorioPage() {
  const facturas = await listarFacturas();
  return (
    <div className="flex flex-col gap-6">
      <PageHeader titulo="Nuevo recordatorio" volverHref="/recordatorios" volverLabel="Recordatorios" />
      <RecordatorioForm facturas={facturas.map((f) => ({ id: f.id, numero: f.numero, tercero: f.tercero }))} />
    </div>
  );
}
