import Link from "next/link";
import { listarLiquidaciones } from "@/modules/nomina/application/liquidaciones-actions";
import { formatCOP } from "@/shared/cop";
import { formatPeriodo } from "@/modules/nomina/presentation/meses";
import { PageHeader } from "@/components/ui/page-header";
import { btnPrimario, linkSuave, tabla, theadFila, thCelda } from "@/components/ui/estilos";

export default async function LiquidacionesPage() {
  const liquidaciones = await listarLiquidaciones();
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        titulo="Liquidaciones"
        volverHref="/nomina"
        volverLabel="Nómina"
        accion={<Link href="/nomina/liquidaciones/nueva" className={btnPrimario}>Nueva liquidación</Link>}
      />
      {liquidaciones.length === 0 ? (
        <p className="text-sm text-texto-tenue">No hay liquidaciones.</p>
      ) : (
        <table className={tabla}>
          <thead className={theadFila}>
            <tr>
              <th className={thCelda}>Periodo</th>
              <th className={thCelda}>Empleado</th>
              <th className={`${thCelda} text-right`}>Días</th>
              <th className={`${thCelda} text-right`}>Devengado</th>
              <th className={`${thCelda} text-right`}>Deducido</th>
              <th className={`${thCelda} text-right`}>Neto</th>
              <th className={thCelda}></th>
            </tr>
          </thead>
          <tbody>
            {liquidaciones.map((l) => (
              <tr key={l.id} className="border-b border-borde/30">
                <td className="py-2 text-texto-suave">{formatPeriodo(l.periodo_anio, l.periodo_mes)}</td>
                <td className="py-2 text-texto">{l.empleados?.nombre ?? "—"}</td>
                <td className="py-2 text-right font-mono tabular-nums text-texto-suave">{l.dias_laborados}</td>
                <td className="py-2 text-right font-mono tabular-nums text-texto">{formatCOP(l.total_devengado)}</td>
                <td className="py-2 text-right font-mono tabular-nums text-texto">{formatCOP(l.total_deducido)}</td>
                <td className="py-2 text-right font-mono tabular-nums font-medium text-emerald-400">{formatCOP(l.neto_pagado)}</td>
                <td className="py-2"><Link href={`/nomina/liquidaciones/${l.id}`} className={linkSuave}>Ver</Link></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
