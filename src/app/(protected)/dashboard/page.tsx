import Link from "next/link";
import { obtenerResumenDashboard } from "@/modules/dashboard/application/dashboard-actions";
import { GraficoIngresosEgresos } from "@/modules/dashboard/presentation/grafico-ingresos-egresos";
import { formatCOP } from "@/shared/cop";
import { formatFechaBogota } from "@/shared/fecha";

const nfMetros = new Intl.NumberFormat("es-CO", { maximumFractionDigits: 1 });

export default async function DashboardPage() {
  const r = await obtenerResumenDashboard();

  const cards = [
    { label: "Ingresos del mes", valor: formatCOP(r.cards.ingresosMes), color: "text-emerald-400" },
    { label: "Egresos del mes", valor: formatCOP(r.cards.egresosMes), color: "text-red-400" },
    { label: "Neto del mes", valor: formatCOP(r.cards.netoMes), color: r.cards.netoMes >= 0 ? "text-emerald-400" : "text-red-400" },
    { label: "Stock total", valor: `${nfMetros.format(r.cards.stockTotalM)} m`, color: "text-zinc-100" },
  ];
  const alertas = [
    { label: "Telas bajo stock", count: r.alertas.bajoStock, href: "/inventario" },
    { label: "Facturas pendientes de pago", count: r.alertas.facturasPendientes, href: "/contabilidad/facturas" },
    { label: "Sin declarar (30+ días)", count: r.alertas.facturasSinDeclarar, href: "/contabilidad/facturas" },
    { label: "Recordatorios vencidos", count: r.alertas.recordatoriosVencidos, href: "/recordatorios" },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <div key={c.label} className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-5">
            <p className="text-sm text-zinc-400">{c.label}</p>
            <p className={`mt-2 text-2xl font-semibold tabular-nums ${c.color}`}>{c.valor}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {alertas.map((a) => (
          <Link
            key={a.label}
            href={a.href}
            className="flex items-center justify-between gap-3 rounded-xl border border-zinc-800 bg-zinc-900/40 p-4 hover:bg-zinc-900"
          >
            <p className="text-sm text-zinc-400">{a.label}</p>
            <p className={`text-xl font-semibold tabular-nums ${a.count > 0 ? "text-amber-400" : "text-zinc-500"}`}>{a.count}</p>
          </Link>
        ))}
      </div>

      <GraficoIngresosEgresos serie={r.serie} />

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold text-zinc-100">Últimos movimientos</h2>
        {r.ultimos.length === 0 ? (
          <p className="text-sm text-zinc-500">No hay movimientos en los últimos 12 meses.</p>
        ) : (
          <table className="w-full text-sm [&_td]:pr-4 [&_th]:pr-4">
            <thead className="text-left text-zinc-400">
              <tr className="border-b border-zinc-800">
                <th className="py-2 font-medium">Fecha</th>
                <th className="py-2 font-medium">Tipo</th>
                <th className="py-2 font-medium">Concepto</th>
                <th className="py-2 font-medium text-right">Valor</th>
              </tr>
            </thead>
            <tbody>
              {r.ultimos.map((m) => (
                <tr key={`${m.tipo}-${m.id}`} className="border-b border-zinc-900">
                  <td className="py-2 text-zinc-400">{formatFechaBogota(m.fecha)}</td>
                  <td className="py-2">
                    <span className={m.tipo === "ingreso" ? "text-emerald-400" : "text-red-400"}>
                      {m.tipo === "ingreso" ? "Ingreso" : "Egreso"}
                    </span>
                  </td>
                  <td className="py-2 text-zinc-200">{m.concepto}</td>
                  <td className={`py-2 text-right tabular-nums ${m.tipo === "ingreso" ? "text-emerald-400" : "text-red-400"}`}>
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
