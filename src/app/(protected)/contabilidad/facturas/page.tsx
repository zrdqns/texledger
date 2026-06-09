import Link from "next/link";
import { listarFacturas } from "@/modules/contabilidad/application/facturas-actions";
import { formatCOP } from "@/shared/cop";
import { formatFechaBogota } from "@/shared/fecha";
import { DeclaradaToggle } from "@/modules/contabilidad/presentation/declarada-toggle";
import { VerArchivo } from "@/modules/contabilidad/presentation/ver-archivo";

export default async function FacturasPage() {
  const facturas = await listarFacturas();
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/contabilidad" className="text-sm text-zinc-400 hover:text-zinc-100">← Contabilidad</Link>
          <h2 className="mt-2 text-lg font-semibold text-zinc-100">Facturas</h2>
        </div>
        <Link href="/contabilidad/facturas/nueva" className="rounded-md bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-emerald-500">Nueva factura</Link>
      </div>
      {facturas.length === 0 ? (
        <p className="text-sm text-zinc-500">No hay facturas.</p>
      ) : (
        <table className="w-full text-sm [&_td]:pr-4 [&_th]:pr-4">
          <thead className="text-left text-zinc-400">
            <tr className="border-b border-zinc-800">
              <th className="py-2 font-medium">Fecha</th><th className="py-2 font-medium">Tipo</th>
              <th className="py-2 font-medium">Número</th><th className="py-2 font-medium">Tercero</th>
              <th className="py-2 font-medium text-right">Valor</th><th className="py-2 font-medium">Estado</th>
              <th className="py-2 font-medium">Declarada</th><th className="py-2 font-medium">Archivo</th>
            </tr>
          </thead>
          <tbody>
            {facturas.map((f) => (
              <tr key={f.id} className="border-b border-zinc-900">
                <td className="py-2 text-zinc-400">{formatFechaBogota(f.fecha_emision)}</td>
                <td className="py-2 capitalize text-zinc-300">{f.tipo}</td>
                <td className="py-2 text-zinc-200">{f.numero}</td>
                <td className="py-2 text-zinc-300">{f.tercero}</td>
                <td className="py-2 text-right tabular-nums text-zinc-200">{formatCOP(f.valor)}</td>
                <td className="py-2 capitalize text-zinc-300">{f.estado}</td>
                <td className="py-2"><DeclaradaToggle id={f.id} declarada={f.declarada} /></td>
                <td className="py-2"><VerArchivo path={f.archivo_url} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
