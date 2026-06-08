import Link from "next/link";
import { notFound } from "next/navigation";
import { obtenerTela } from "@/modules/inventario/application/telas-actions";
import { TelaForm } from "@/modules/inventario/presentation/tela-form";

export default async function EditarTelaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const tela = await obtenerTela(id);
  if (!tela) notFound();
  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link href={`/inventario/${id}`} className="text-sm text-zinc-400 hover:text-zinc-100">← Volver</Link>
        <h2 className="mt-2 text-lg font-semibold text-zinc-100">Editar {tela.referencia}</h2>
      </div>
      <TelaForm tela={tela} />
    </div>
  );
}
