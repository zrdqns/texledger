import Link from "next/link";
import { notFound } from "next/navigation";
import { obtenerParametro } from "@/modules/nomina/application/parametros-actions";
import { ParametroForm } from "@/modules/nomina/presentation/parametro-form";

export default async function EditarParametroPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const parametro = await obtenerParametro(id);
  if (!parametro) notFound();
  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link href="/nomina/parametros" className="text-sm text-zinc-400 hover:text-zinc-100">← Parámetros</Link>
        <h2 className="mt-2 text-lg font-semibold text-zinc-100">Editar parámetros {parametro.anio}</h2>
      </div>
      <ParametroForm parametro={parametro} />
    </div>
  );
}
