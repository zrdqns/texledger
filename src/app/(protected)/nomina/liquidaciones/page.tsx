import Link from "next/link";
import { listarLiquidaciones } from "@/modules/nomina/application/liquidaciones-actions";
import { formatCOP } from "@/shared/cop";
import { formatPeriodo } from "@/modules/nomina/presentation/meses";

export default async function LiquidacionesPage() {
  const liquidaciones = await listarLiquidaciones();
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/nomina" className="text-sm text-zinc-400 hover:text-zinc-100">← Nómina</Link>
          <h2 className="mt-2 text-lg font-semibold text-zinc-100">Liquidaciones</h2>
        </div>
        <Link href="/nomina/liquidaciones/nueva" className="rounded-md bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-emerald-500">Nueva liquidación</Link>
      </div>
      {liquidaciones.length === 0 ? (
        <p className="text-sm text-zinc-500">No hay liquidaciones.</p>
      ) : (
        <table className="w-full text-sm [&_td]:pr-4 [&_th]:pr-4">
          <thead className="text-left text-zinc-400">
            <tr className="border-b border-zinc-800">
              <th className="py-2 font-medium">Periodo</th>
              <th className="py-2 font-medium">Empleado</th>
              <th className="py-2 font-medium text-right">Días</th>
              <th className="py-2 font-medium text-right">Devengado</th>
              <th className="py-2 font-medium text-right">Deducido</th>
              <th className="py-2 font-medium text-right">Neto</th>
              <th className="py-2 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {liquidaciones.map((l) => (
              <tr key={l.id} className="border-b border-zinc-900">
                <td className="py-2 text-zinc-300">{formatPeriodo(l.periodo_anio, l.periodo_mes)}</td>
                <td className="py-2 text-zinc-200">{l.empleados?.nombre ?? "—"}</td>
                <td className="py-2 text-right tabular-nums text-zinc-300">{l.dias_laborados}</td>
                <td className="py-2 text-right tabular-nums text-zinc-200">{formatCOP(l.total_devengado)}</td>
                <td className="py-2 text-right tabular-nums text-zinc-200">{formatCOP(l.total_deducido)}</td>
                <td className="py-2 text-right tabular-nums font-medium text-emerald-400">{formatCOP(l.neto_pagado)}</td>
                <td className="py-2"><Link href={`/nomina/liquidaciones/${l.id}`} className="text-zinc-400 hover:text-zinc-100">Ver</Link></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
