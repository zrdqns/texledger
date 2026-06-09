import Link from "next/link";
import { listarCuentas } from "@/modules/contabilidad/application/cuentas-actions";
import { CuentaForm } from "@/modules/contabilidad/presentation/cuenta-form";

export default async function CuentasPage() {
  const cuentas = await listarCuentas();
  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link href="/contabilidad" className="text-sm text-zinc-400 hover:text-zinc-100">← Contabilidad</Link>
        <h2 className="mt-2 text-lg font-semibold text-zinc-100">Cuentas bancarias</h2>
      </div>
      <CuentaForm />
      {cuentas.length === 0 ? (
        <p className="text-sm text-zinc-500">No hay cuentas.</p>
      ) : (
        <ul className="divide-y divide-zinc-900">
          {cuentas.map((c) => (
            <li key={c.id} className="flex justify-between py-2 text-sm">
              <span className="text-zinc-200">{c.nombre}</span>
              <span className="text-zinc-400">{c.banco}{c.numero ? ` · ${c.numero}` : ""}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
