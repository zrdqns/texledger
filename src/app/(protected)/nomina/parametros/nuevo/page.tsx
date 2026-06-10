import Link from "next/link";
import { ParametroForm } from "@/modules/nomina/presentation/parametro-form";

export default function NuevoParametroPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link href="/nomina/parametros" className="text-sm text-zinc-400 hover:text-zinc-100">← Parámetros</Link>
        <h2 className="mt-2 text-lg font-semibold text-zinc-100">Nuevos parámetros de año</h2>
      </div>
      <ParametroForm />
    </div>
  );
}
