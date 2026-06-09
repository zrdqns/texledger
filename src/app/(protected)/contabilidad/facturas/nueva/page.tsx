import Link from "next/link";
import { FacturaForm } from "@/modules/contabilidad/presentation/factura-form";

export default function NuevaFacturaPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link href="/contabilidad/facturas" className="text-sm text-zinc-400 hover:text-zinc-100">← Facturas</Link>
        <h2 className="mt-2 text-lg font-semibold text-zinc-100">Nueva factura</h2>
      </div>
      <FacturaForm />
    </div>
  );
}
