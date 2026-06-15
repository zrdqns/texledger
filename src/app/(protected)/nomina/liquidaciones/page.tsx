import Link from "next/link";
import { listarLiquidaciones } from "@/modules/nomina/application/liquidaciones-actions";
import { formatCOP } from "@/shared/cop";
import { formatPeriodo } from "@/modules/nomina/presentation/meses";
import { PageHeader } from "@/components/ui/page-header";
import { CardTabla } from "@/components/ui/card-tabla";
import { Avatar } from "@/components/ui/avatar";
import { btnPrimario, filaTabla, linkSuave, tabla, theadFila, thCelda } from "@/components/ui/estilos";

export default async function LiquidacionesPage() {
  const liquidaciones = await listarLiquidaciones();
  const totalNeto = liquidaciones.reduce((s, l) => s + l.neto_pagado, 0);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        titulo="Liquidaciones"
        subtitulo={`${liquidaciones.length} ${liquidaciones.length === 1 ? "liquidación" : "liquidaciones"} registradas`}
        volverHref="/nomina"
        volverLabel="Nómina"
        accion={<Link href="/nomina/liquidaciones/nueva" className={btnPrimario}>Nueva liquidación</Link>}
      />

      <div className="flex items-center gap-3 rounded-xl border-l-2 border-l-primario border-y border-r border-white/10 bg-superficie-baja px-5 py-3.5">
        <span className="text-sm text-texto-suave">Fórmula:</span>
        <code className="rounded-md bg-superficie-alta px-2.5 py-1 font-mono text-xs text-primario-claro">
          Neto = Devengado − (Pensión + Salud + Seguro + Libranzas)
        </code>
      </div>

      <CardTabla
        titulo="Historial de liquidaciones"
        accion={<span className="text-sm text-texto-tenue">Total neto: <span className="font-mono font-semibold text-emerald-400">{formatCOP(totalNeto)}</span></span>}
      >
      {liquidaciones.length === 0 ? (
        <p className="py-3 text-sm text-texto-tenue">No hay liquidaciones.</p>
      ) : (
        <table className={tabla}>
          <thead className={theadFila}>
            <tr>
              <th className={thCelda}>Empleado</th>
              <th className={thCelda}>Periodo</th>
              <th className={`${thCelda} text-right`}>Días</th>
              <th className={`${thCelda} text-right`}>Devengado</th>
              <th className={`${thCelda} text-right`}>Deducido</th>
              <th className={`${thCelda} text-right`}>Neto pagado</th>
              <th className={thCelda}></th>
            </tr>
          </thead>
          <tbody>
            {liquidaciones.map((l) => (
              <tr key={l.id} className={filaTabla}>
                <td className="py-2.5">
                  <div className="flex items-center gap-3">
                    <Avatar nombre={l.empleados?.nombre ?? "—"} src={l.empleados?.foto_url} />
                    <span className="font-medium text-texto">{l.empleados?.nombre ?? "—"}</span>
                  </div>
                </td>
                <td className="py-2.5 text-texto-suave">{formatPeriodo(l.periodo_anio, l.periodo_mes)}</td>
                <td className="py-2.5 text-right font-mono tabular-nums text-texto-suave">{l.dias_laborados}</td>
                <td className="py-2.5 text-right font-mono tabular-nums text-texto">{formatCOP(l.total_devengado)}</td>
                <td className="py-2.5 text-right font-mono tabular-nums text-peligro">−{formatCOP(l.total_deducido)}</td>
                <td className="py-2.5 text-right">
                  <span className="inline-block rounded-md bg-emerald-500/10 px-2 py-1 font-mono font-semibold tabular-nums text-emerald-400">
                    {formatCOP(l.neto_pagado)}
                  </span>
                </td>
                <td className="py-2.5"><Link href={`/nomina/liquidaciones/${l.id}`} className={linkSuave}>Ver</Link></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      </CardTabla>
    </div>
  );
}
