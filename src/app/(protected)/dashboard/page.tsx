import Link from "next/link";
import { obtenerResumenDashboard } from "@/modules/dashboard/application/dashboard-actions";
import { GraficoIngresosEgresos } from "@/modules/dashboard/presentation/grafico-ingresos-egresos";
import { StatCard } from "@/components/ui/stat-card";
import { cardInteractiva, subtituloSeccion, tabla, theadFila, thCelda } from "@/components/ui/estilos";
import { formatCOP } from "@/shared/cop";
import { formatFechaBogota } from "@/shared/fecha";

const nfMetros = new Intl.NumberFormat("es-CO", { maximumFractionDigits: 1 });

export default async function DashboardPage() {
  const r = await obtenerResumenDashboard();

  const alertas = [
    { label: "Telas bajo stock", count: r.alertas.bajoStock, href: "/inventario" },
    { label: "Facturas pendientes de pago", count: r.alertas.facturasPendientes, href: "/contabilidad/facturas" },
    { label: "Sin declarar (30+ días)", count: r.alertas.facturasSinDeclarar, href: "/contabilidad/facturas" },
    { label: "Recordatorios vencidos", count: r.alertas.recordatoriosVencidos, href: "/recordatorios" },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Ingresos del mes" valor={formatCOP(r.cards.ingresosMes)} tono="ok" />
        <StatCard label="Egresos del mes" valor={formatCOP(r.cards.egresosMes)} tono="peligro" />
        <StatCard label="Neto del mes" valor={formatCOP(r.cards.netoMes)} tono={r.cards.netoMes >= 0 ? "ok" : "peligro"} />
        <StatCard label="Stock total" valor={`${nfMetros.format(r.cards.stockTotalM)} m`} tono="neutro" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {alertas.map((a) => (
          <Link key={a.label} href={a.href} className={`${cardInteractiva} flex items-center justify-between gap-3`}>
            <p className="text-sm text-texto-tenue">{a.label}</p>
            <p className={a.count > 0 ? "font-mono text-xl font-semibold tabular-nums text-acento" : "font-mono text-xl font-semibold tabular-nums text-texto-tenue"}>
              {a.count}
            </p>
          </Link>
        ))}
      </div>

      <GraficoIngresosEgresos serie={r.serie} />

      <section className="flex flex-col gap-3">
        <h2 className={subtituloSeccion}>Últimos movimientos</h2>
        {r.ultimos.length === 0 ? (
          <p className="text-sm text-texto-tenue">No hay movimientos en los últimos 12 meses.</p>
        ) : (
          <table className={tabla}>
            <thead className={theadFila}>
              <tr>
                <th className={thCelda}>Fecha</th>
                <th className={thCelda}>Tipo</th>
                <th className={thCelda}>Concepto</th>
                <th className={`${thCelda} text-right`}>Valor</th>
              </tr>
            </thead>
            <tbody>
              {r.ultimos.map((m) => (
                <tr key={`${m.tipo}-${m.id}`} className="border-b border-borde/30">
                  <td className="py-2 text-texto-tenue">{formatFechaBogota(m.fecha)}</td>
                  <td className="py-2">
                    <span className={m.tipo === "ingreso" ? "text-emerald-400" : "text-peligro"}>
                      {m.tipo === "ingreso" ? "Ingreso" : "Egreso"}
                    </span>
                  </td>
                  <td className="py-2 text-texto">{m.concepto}</td>
                  <td className={m.tipo === "ingreso" ? "py-2 text-right font-mono tabular-nums text-emerald-400" : "py-2 text-right font-mono tabular-nums text-peligro"}>
                    {m.tipo === "ingreso" ? "+" : "−"}{formatCOP(m.valor)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}
