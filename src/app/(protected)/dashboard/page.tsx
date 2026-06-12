import Link from "next/link";
import { Package, TrendingDown, TrendingUp, Wallet } from "lucide-react";
import { obtenerResumenDashboard } from "@/modules/dashboard/application/dashboard-actions";
import { GraficoIngresosEgresos } from "@/modules/dashboard/presentation/grafico-ingresos-egresos";
import { StatCard } from "@/components/ui/stat-card";
import { CardTabla } from "@/components/ui/card-tabla";
import { filaTabla, tabla, theadFila, thCelda } from "@/components/ui/estilos";
import { formatCOP } from "@/shared/cop";
import { formatFechaBogota, hoyBogota } from "@/shared/fecha";

const nfMetros = new Intl.NumberFormat("es-CO", { maximumFractionDigits: 1 });

function deltaPct(actual: number, anterior: number | undefined): string | undefined {
  if (anterior === undefined || anterior === 0) return undefined;
  const pct = ((actual - anterior) / Math.abs(anterior)) * 100;
  const signo = pct >= 0 ? "+" : "";
  return `${signo}${pct.toFixed(1).replace(".", ",")}% vs mes anterior`;
}

export default async function DashboardPage() {
  const r = await obtenerResumenDashboard();
  const hoy = hoyBogota();

  const mesActual = r.serie.at(-1);
  const mesAnterior = r.serie.at(-2);
  const deltaIngresos = deltaPct(mesActual?.ingresos ?? 0, mesAnterior?.ingresos);
  const deltaEgresos = deltaPct(mesActual?.egresos ?? 0, mesAnterior?.egresos);

  const alertas = [
    { label: "Telas bajo stock", count: r.alertas.bajoStock, href: "/inventario" },
    { label: "Facturas pendientes de pago", count: r.alertas.facturasPendientes, href: "/contabilidad/facturas" },
    { label: "Sin declarar (30+ días)", count: r.alertas.facturasSinDeclarar, href: "/contabilidad/facturas" },
    { label: "Recordatorios vencidos", count: r.alertas.recordatoriosVencidos, href: "/recordatorios" },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-bold text-texto">Bienvenido</h2>
        <p className="mt-1 text-sm text-texto-tenue">Resumen del negocio al {formatFechaBogota(hoy)}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Ingresos del mes"
          valor={formatCOP(r.cards.ingresosMes)}
          tono="ok"
          icono={TrendingUp}
          delta={deltaIngresos}
          deltaTono={deltaIngresos?.startsWith("-") ? "peligro" : "ok"}
        />
        <StatCard
          label="Egresos del mes"
          valor={formatCOP(r.cards.egresosMes)}
          tono="peligro"
          icono={TrendingDown}
          delta={deltaEgresos}
          deltaTono={deltaEgresos?.startsWith("-") ? "ok" : "peligro"}
        />
        <StatCard
          label="Neto del mes"
          valor={formatCOP(r.cards.netoMes)}
          tono={r.cards.netoMes >= 0 ? "ok" : "peligro"}
          icono={Wallet}
        />
        <StatCard label="Stock total" valor={`${nfMetros.format(r.cards.stockTotalM)} m`} tono="neutro" icono={Package} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {alertas.map((a) => (
          <Link
            key={a.label}
            href={a.href}
            className="group relative overflow-hidden rounded-xl border border-white/10 bg-superficie-baja p-4 transition-colors duration-300 hover:border-acento/40"
          >
            <div
              className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-transparent via-acento/60 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
              aria-hidden
            />
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm text-texto-tenue">{a.label}</p>
              <p className={a.count > 0 ? "font-mono text-xl font-semibold tabular-nums text-acento" : "font-mono text-xl font-semibold tabular-nums text-texto-tenue"}>
                {a.count}
              </p>
            </div>
          </Link>
        ))}
      </div>

      <GraficoIngresosEgresos serie={r.serie} />

      <CardTabla titulo="Últimos movimientos">
        {r.ultimos.length === 0 ? (
          <p className="py-3 text-sm text-texto-tenue">No hay movimientos en los últimos 12 meses.</p>
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
                <tr key={`${m.tipo}-${m.id}`} className={filaTabla}>
                  <td className="py-2.5 text-texto-tenue">{formatFechaBogota(m.fecha)}</td>
                  <td className="py-2.5">
                    <span className={m.tipo === "ingreso" ? "text-emerald-400" : "text-peligro"}>
                      {m.tipo === "ingreso" ? "Ingreso" : "Egreso"}
                    </span>
                  </td>
                  <td className="py-2.5 text-texto">{m.concepto}</td>
                  <td className={m.tipo === "ingreso" ? "py-2.5 text-right font-mono tabular-nums text-emerald-400" : "py-2.5 text-right font-mono tabular-nums text-peligro"}>
                    {m.tipo === "ingreso" ? "+" : "−"}{formatCOP(m.valor)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </CardTabla>
    </div>
  );
}
