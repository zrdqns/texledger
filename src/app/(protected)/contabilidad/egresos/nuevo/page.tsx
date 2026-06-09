import Link from "next/link";
import { listarCuentas } from "@/modules/contabilidad/application/cuentas-actions";
import { listarFacturas } from "@/modules/contabilidad/application/facturas-actions";
import { MovimientoForm } from "@/modules/contabilidad/presentation/movimiento-form";

export default async function NuevoEgresoPage() {
  const [cuentas, facturas] = await Promise.all([
    listarCuentas(),
    listarFacturas({ tipo: "compra", estado: "pendiente" }),
  ]);
  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link href="/contabilidad/egresos" className="text-sm text-zinc-400 hover:text-zinc-100">← Egresos</Link>
        <h2 className="mt-2 text-lg font-semibold text-zinc-100">Nuevo egreso</h2>
      </div>
      <MovimientoForm
        tipo="egreso"
        cuentas={cuentas.map((c) => ({ id: c.id, label: `${c.banco} · ${c.nombre}` }))}
        facturas={facturas.map((f) => ({ id: f.id, label: `${f.numero} — ${f.tercero}` }))}
      />
    </div>
  );
}
