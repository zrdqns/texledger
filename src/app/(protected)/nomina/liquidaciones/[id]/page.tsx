import Link from "next/link";
import { notFound } from "next/navigation";
import { obtenerLiquidacion } from "@/modules/nomina/application/liquidaciones-actions";
import { formatCOP } from "@/shared/cop";
import { formatTimestampBogota } from "@/shared/fecha";
import { formatPeriodo } from "@/modules/nomina/presentation/meses";
import { ImprimirBoton } from "@/modules/nomina/presentation/imprimir-boton";
import { linkSuave } from "@/components/ui/estilos";

export default async function DesprendiblePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const liq = await obtenerLiquidacion(id);
  if (!liq) notFound();

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <div className="flex items-center justify-between print:hidden">
        <Link href="/nomina/liquidaciones" className={linkSuave}>← Liquidaciones</Link>
        <ImprimirBoton />
      </div>

      <div className="rounded-xl border border-borde/60 bg-superficie-baja p-6 print:rounded-none print:border-0 print:bg-transparent print:p-0">
        <div className="flex items-start justify-between border-b border-borde/60 pb-4">
          <div>
            <h2 className="text-lg font-semibold text-texto">Desprendible de nómina</h2>
            <p className="text-sm text-texto-tenue">
              {formatPeriodo(liq.periodo_anio, liq.periodo_mes)} · {liq.dias_laborados} días laborados
            </p>
          </div>
          <p className="text-sm text-texto-tenue">Generado: {formatTimestampBogota(liq.created_at)}</p>
        </div>

        <div className="mt-4 grid gap-1 text-sm">
          <p className="font-medium text-texto">{liq.empleados?.nombre ?? "—"}</p>
          {liq.empleados?.documento && <p className="text-texto-tenue">Documento: {liq.empleados.documento}</p>}
          {liq.empleados?.cargo && <p className="text-texto-tenue">Cargo: {liq.empleados.cargo}</p>}
          <p className="text-texto-tenue">Sueldo básico: <span className="font-mono tabular-nums">{formatCOP(liq.sueldo_basico)}</span></p>
          {(liq.incapacidades_dias > 0 || liq.licencias_dias > 0) && (
            <p className="text-texto-tenue">Incapacidades: {liq.incapacidades_dias} días · Licencias: {liq.licencias_dias} días</p>
          )}
        </div>

        <table className="mt-6 w-full text-sm [&_td]:py-1.5">
          <tbody>
            <tr><td colSpan={2} className="font-medium text-texto-suave">Devengado</td></tr>
            <tr><td className="text-texto-tenue">Sueldo proporcional</td><td className="text-right font-mono tabular-nums text-texto">{formatCOP(liq.sueldo_prop)}</td></tr>
            <tr><td className="text-texto-tenue">Auxilio de transporte</td><td className="text-right font-mono tabular-nums text-texto">{formatCOP(liq.auxilio_prop)}</td></tr>
            <tr><td className="text-texto-tenue">Ajuste incapacidades/licencias</td><td className="text-right font-mono tabular-nums text-texto">{formatCOP(liq.ajuste_incap_licencia_valor)}</td></tr>
            <tr className="border-t border-borde/60"><td className="font-medium text-texto">Total devengado</td><td className="text-right font-mono tabular-nums font-medium text-texto">{formatCOP(liq.total_devengado)}</td></tr>

            <tr><td colSpan={2} className="pt-4 font-medium text-texto-suave">Deducciones</td></tr>
            <tr><td className="text-texto-tenue">Pensión ({liq.pct_pension}% · IBC {formatCOP(liq.ibc)})</td><td className="text-right font-mono tabular-nums text-texto">−{formatCOP(liq.ded_pension)}</td></tr>
            <tr><td className="text-texto-tenue">Salud ({liq.pct_salud}% · IBC)</td><td className="text-right font-mono tabular-nums text-texto">−{formatCOP(liq.ded_salud)}</td></tr>
            <tr><td className="text-texto-tenue">Seguro{liq.seguro_tipo === "porcentaje" ? ` (${liq.seguro_valor}% del básico)` : ""}</td><td className="text-right font-mono tabular-nums text-texto">−{formatCOP(liq.ded_seguro)}</td></tr>
            <tr><td className="text-texto-tenue">Libranzas</td><td className="text-right font-mono tabular-nums text-texto">−{formatCOP(liq.libranzas)}</td></tr>
            <tr className="border-t border-borde/60"><td className="font-medium text-texto">Total deducido</td><td className="text-right font-mono tabular-nums font-medium text-texto">−{formatCOP(liq.total_deducido)}</td></tr>

            <tr className="border-t border-borde">
              <td className="pt-3 text-base font-semibold text-texto">Neto pagado</td>
              <td className="pt-3 text-right font-mono text-base font-semibold tabular-nums text-emerald-400">{formatCOP(liq.neto_pagado)}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
