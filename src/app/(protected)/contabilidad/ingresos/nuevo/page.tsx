import Link from "next/link";
import { listarCuentas } from "@/modules/contabilidad/application/cuentas-actions";
import { listarFacturas } from "@/modules/contabilidad/application/facturas-actions";
import { MovimientoForm } from "@/modules/contabilidad/presentation/movimiento-form";

export default async function NuevoIngresoPage() {
  const [cuentas, facturas] = await Promise.all([
    listarCuentas(),
    listarFacturas({ tipo: "venta", estado: "pendiente" }),
  ]);
  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link href="/contabilidad/ingresos" className="text-sm text-zinc-400 hover:text-zinc-100">← Ingresos</Link>
        <h2 className="mt-2 text-lg font-semibold text-zinc-100">Nuevo ingreso</h2>
      </div>
      <MovimientoForm
        tipo="ingreso"
        cuentas={cuentas.map((c) => ({ id: c.id, label: `${c.banco} · ${c.nombre}` }))}
        facturas={facturas.map((f) => ({ id: f.id, label: `${f.numero} — ${f.tercero}` }))}
      />
    </div>
  );
}
