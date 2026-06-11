import Link from "next/link";
import { notFound } from "next/navigation";
import { obtenerLiquidacion } from "@/modules/nomina/application/liquidaciones-actions";
import { formatCOP } from "@/shared/cop";
import { formatTimestampBogota } from "@/shared/fecha";
import { formatPeriodo } from "@/modules/nomina/presentation/meses";
import { ImprimirBoton } from "@/modules/nomina/presentation/imprimir-boton";

export default async function DesprendiblePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const liq = await obtenerLiquidacion(id);
  if (!liq) notFound();

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <div className="flex items-center justify-between print:hidden">
        <Link href="/nomina/liquidaciones" className="text-sm text-zinc-400 hover:text-zinc-100">← Liquidaciones</Link>
        <ImprimirBoton />
      </div>

      <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-6 print:rounded-none print:border-0 print:bg-transparent print:p-0">
        <div className="flex items-start justify-between border-b border-zinc-800 pb-4">
          <div>
            <h2 className="text-lg font-semibold text-zinc-100">Desprendible de nómina</h2>
            <p className="text-sm text-zinc-400">
              {formatPeriodo(liq.periodo_anio, liq.periodo_mes)} · {liq.dias_laborados} días laborados
            </p>
          </div>
          <p className="text-sm text-zinc-400">Generado: {formatTimestampBogota(liq.created_at)}</p>
        </div>

        <div className="mt-4 grid gap-1 text-sm">
          <p className="font-medium text-zinc-100">{liq.empleados?.nombre ?? "—"}</p>
          {liq.empleados?.documento && <p className="text-zinc-400">Documento: {liq.empleados.documento}</p>}
          {liq.empleados?.cargo && <p className="text-zinc-400">Cargo: {liq.empleados.cargo}</p>}
          <p className="text-zinc-400">Sueldo básico: <span className="tabular-nums">{formatCOP(liq.sueldo_basico)}</span></p>
          {(liq.incapacidades_dias > 0 || liq.licencias_dias > 0) && (
            <p className="text-zinc-400">Incapacidades: {liq.incapacidades_dias} días · Licencias: {liq.licencias_dias} días</p>
          )}
        </div>

        <table className="mt-6 w-full text-sm [&_td]:py-1.5">
          <tbody>
            <tr><td colSpan={2} className="font-medium text-zinc-300">Devengado</td></tr>
            <tr><td className="text-zinc-400">Sueldo proporcional</td><td className="text-right tabular-nums text-zinc-200">{formatCOP(liq.sueldo_prop)}</td></tr>
            <tr><td className="text-zinc-400">Auxilio de transporte</td><td className="text-right tabular-nums text-zinc-200">{formatCOP(liq.auxilio_prop)}</td></tr>
            <tr><td className="text-zinc-400">Ajuste incapacidades/licencias</td><td className="text-right tabular-nums text-zinc-200">{formatCOP(liq.ajuste_incap_licencia_valor)}</td></tr>
            <tr className="border-t border-zinc-800"><td className="font-medium text-zinc-200">Total devengado</td><td className="text-right tabular-nums font-medium text-zinc-100">{formatCOP(liq.total_devengado)}</td></tr>

            <tr><td colSpan={2} className="pt-4 font-medium text-zinc-300">Deducciones</td></tr>
            <tr><td className="text-zinc-400">Pensión ({liq.pct_pension}% · IBC {formatCOP(liq.ibc)})</td><td className="text-right tabular-nums text-zinc-200">−{formatCOP(liq.ded_pension)}</td></tr>
            <tr><td className="text-zinc-400">Salud ({liq.pct_salud}% · IBC)</td><td className="text-right tabular-nums text-zinc-200">−{formatCOP(liq.ded_salud)}</td></tr>
            <tr><td className="text-zinc-400">Seguro{liq.seguro_tipo === "porcentaje" ? ` (${liq.seguro_valor}% del básico)` : ""}</td><td className="text-right tabular-nums text-zinc-200">−{formatCOP(liq.ded_seguro)}</td></tr>
            <tr><td className="text-zinc-400">Libranzas</td><td className="text-right tabular-nums text-zinc-200">−{formatCOP(liq.libranzas)}</td></tr>
            <tr className="border-t border-zinc-800"><td className="font-medium text-zinc-200">Total deducido</td><td className="text-right tabular-nums font-medium text-zinc-100">−{formatCOP(liq.total_deducido)}</td></tr>

            <tr className="border-t border-zinc-700">
              <td className="pt-3 text-base font-semibold text-zinc-100">Neto pagado</td>
              <td className="pt-3 text-right text-base font-semibold tabular-nums text-emerald-400">{formatCOP(liq.neto_pagado)}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
