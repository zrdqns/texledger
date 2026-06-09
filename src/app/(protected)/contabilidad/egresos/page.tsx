import Link from "next/link";
import { listarEgresos } from "@/modules/contabilidad/application/movimientos-actions";
import { formatCOP } from "@/shared/cop";
import { formatFechaBogota } from "@/shared/fecha";
import { VerArchivo } from "@/modules/contabilidad/presentation/ver-archivo";

export default async function EgresosPage() {
  const egresos = await listarEgresos();
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/contabilidad" className="text-sm text-zinc-400 hover:text-zinc-100">← Contabilidad</Link>
          <h2 className="mt-2 text-lg font-semibold text-zinc-100">Egresos</h2>
        </div>
        <Link href="/contabilidad/egresos/nuevo" className="rounded-md bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-emerald-500">Nuevo egreso</Link>
      </div>
      {egresos.length === 0 ? <p className="text-sm text-zinc-500">No hay egresos.</p> : (
        <table className="w-full text-sm">
          <thead className="text-left text-zinc-400"><tr className="border-b border-zinc-800">
            <th className="py-2 font-medium">Fecha pago</th><th className="py-2 font-medium">Concepto</th>
            <th className="py-2 font-medium text-right">Valor</th><th className="py-2 font-medium">Comprobante</th>
          </tr></thead>
          <tbody>
            {egresos.map((e) => (
              <tr key={e.id} className="border-b border-zinc-900">
                <td className="py-2 text-zinc-400">{formatFechaBogota(e.fecha_pago)}</td>
                <td className="py-2 text-zinc-300">{e.concepto}</td>
                <td className="py-2 text-right tabular-nums text-red-400">{formatCOP(e.valor)}</td>
                <td className="py-2"><VerArchivo path={e.comprobante_url} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
