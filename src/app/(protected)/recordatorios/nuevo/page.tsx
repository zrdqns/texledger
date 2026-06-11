import Link from "next/link";
import { listarFacturas } from "@/modules/contabilidad/application/facturas-actions";
import { RecordatorioForm } from "@/modules/recordatorios/presentation/recordatorio-form";

export default async function NuevoRecordatorioPage() {
  const facturas = await listarFacturas();
  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link href="/recordatorios" className="text-sm text-zinc-400 hover:text-zinc-100">← Recordatorios</Link>
        <h2 className="mt-2 text-lg font-semibold text-zinc-100">Nuevo recordatorio</h2>
      </div>
      <RecordatorioForm facturas={facturas.map((f) => ({ id: f.id, numero: f.numero, tercero: f.tercero }))} />
    </div>
  );
}
