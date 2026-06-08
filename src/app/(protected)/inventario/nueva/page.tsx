import Link from "next/link";
import { TelaForm } from "@/modules/inventario/presentation/tela-form";

export default function NuevaTelaPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link href="/inventario" className="text-sm text-zinc-400 hover:text-zinc-100">← Inventario</Link>
        <h2 className="mt-2 text-lg font-semibold text-zinc-100">Nueva tela</h2>
      </div>
      <TelaForm />
    </div>
  );
}
