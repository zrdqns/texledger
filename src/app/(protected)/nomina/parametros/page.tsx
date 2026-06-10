import Link from "next/link";
import { listarParametros } from "@/modules/nomina/application/parametros-actions";
import { formatCOP } from "@/shared/cop";

export default async function ParametrosPage() {
  const parametros = await listarParametros();
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/nomina" className="text-sm text-zinc-400 hover:text-zinc-100">← Nómina</Link>
          <h2 className="mt-2 text-lg font-semibold text-zinc-100">Parámetros de nómina</h2>
        </div>
        <Link href="/nomina/parametros/nuevo" className="rounded-md bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-emerald-500">Nuevo año</Link>
      </div>
      {parametros.length === 0 ? (
        <p className="text-sm text-zinc-500">No hay parámetros configurados.</p>
      ) : (
        <table className="w-full text-sm [&_td]:pr-4 [&_th]:pr-4">
          <thead className="text-left text-zinc-400">
            <tr className="border-b border-zinc-800">
              <th className="py-2 font-medium">Año</th>
              <th className="py-2 font-medium text-right">SMMLV</th>
              <th className="py-2 font-medium text-right">Aux. transporte</th>
              <th className="py-2 font-medium text-right">Tope auxilio (SMMLV)</th>
              <th className="py-2 font-medium text-right">% Pensión</th>
              <th className="py-2 font-medium text-right">% Salud</th>
              <th className="py-2 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {parametros.map((p) => (
              <tr key={p.id} className="border-b border-zinc-900">
                <td className="py-2 text-zinc-200">{p.anio}</td>
                <td className="py-2 text-right tabular-nums text-zinc-200">{formatCOP(p.smmlv)}</td>
                <td className="py-2 text-right tabular-nums text-zinc-200">{formatCOP(p.auxilio_transporte)}</td>
                <td className="py-2 text-right tabular-nums text-zinc-300">{p.tope_auxilio_smmlv}</td>
                <td className="py-2 text-right tabular-nums text-zinc-300">{p.pct_pension}%</td>
                <td className="py-2 text-right tabular-nums text-zinc-300">{p.pct_salud}%</td>
                <td className="py-2"><Link href={`/nomina/parametros/${p.id}/editar`} className="text-zinc-400 hover:text-zinc-100">Editar</Link></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
