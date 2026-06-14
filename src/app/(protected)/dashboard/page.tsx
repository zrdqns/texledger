import Link from "next/link";
import {
  AlertTriangle,
  ArrowUpRight,
  Boxes,
  ChevronRight,
  FileWarning,
  Plus,
  TrendingDown,
  TrendingUp,
  Upload,
  type LucideIcon,
} from "lucide-react";
import { requireUser } from "@/core/auth/guard";
import { obtenerResumenDashboard } from "@/modules/dashboard/application/dashboard-actions";
import { GraficoRendimiento } from "@/modules/dashboard/presentation/grafico-rendimiento";
import { MovimientosRecientes } from "@/modules/dashboard/presentation/movimientos-recientes";
import { btnPrimario, btnSecundario } from "@/components/ui/estilos";
import { formatCOP } from "@/shared/cop";
import { formatFechaBogota, hoyBogota } from "@/shared/fecha";

const nfMetros = new Intl.NumberFormat("es-CO", { maximumFractionDigits: 1 });

function deltaPct(actual: number, anterior: number | undefined): string | undefined {
  if (anterior === undefined || anterior === 0) return undefined;
  const pct = ((actual - anterior) / Math.abs(anterior)) * 100;
  const signo = pct >= 0 ? "+" : "";
  return `${signo}${pct.toFixed(1).replace(".", ",")}%`;
}

function nombreDesdeEmail(email: string): string {
  const base = email.split("@")[0]?.split(/[._-]/)[0] ?? "";
  return base ? base.charAt(0).toUpperCase() + base.slice(1) : "Bienvenido";
}

/** Mini-tarjeta estilo "portfolio": valor arriba, variación, icono + etiqueta abajo. */
function PortfolioCard({
  valor,
  delta,
  deltaPositivo,
  icono: Icono,
  label,
  href,
  acentoIcono = "text-primario-claro",
}: {
  valor: string;
  delta?: string;
  deltaPositivo?: boolean;
  icono: LucideIcon;
  label: string;
  href: string;
  acentoIcono?: string;
}) {
  return (
    <Link
      href={href}
      className="group relative flex flex-col justify-between overflow-hidden rounded-xl border border-white/10 bg-superficie-baja p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-primario/40"
    >
      <div className="flex items-start justify-between gap-2">
        <p className="font-mono text-lg font-semibold tabular-nums text-texto">{valor}</p>
        {delta && (
          <span
            className={
              deltaPositivo
                ? "rounded-md bg-emerald-500/12 px-1.5 py-0.5 text-xs font-medium text-emerald-400"
                : "rounded-md bg-peligro/12 px-1.5 py-0.5 text-xs font-medium text-peligro"
            }
          >
            {delta}
          </span>
        )}
      </div>
      <div className="mt-5 flex items-center gap-2">
        <span className={`rounded-lg border border-white/10 bg-superficie-alta p-1.5 ${acentoIcono}`}>
          <Icono className="h-4 w-4" aria-hidden />
        </span>
        <span className="text-sm text-texto-tenue">{label}</span>
      </div>
    </Link>
  );
}

export default async function DashboardPage() {
  const [user, r] = await Promise.all([requireUser(), obtenerResumenDashboard()]);
  const nombre = nombreDesdeEmail(user.email ?? "");
  const hoy = hoyBogota();

  const mesActual = r.serie.at(-1);
  const mesAnterior = r.serie.at(-2);
  const netoActual = (mesActual?.ingresos ?? 0) - (mesActual?.egresos ?? 0);
  const netoAnterior = mesAnterior ? mesAnterior.ingresos - mesAnterior.egresos : undefined;
  const deltaNeto = deltaPct(netoActual, netoAnterior);
  const netoSube = netoActual >= (netoAnterior ?? netoActual);

  const deltaIngresos = deltaPct(mesActual?.ingresos ?? 0, mesAnterior?.ingresos);
  const deltaEgresos = deltaPct(mesActual?.egresos ?? 0, mesAnterior?.egresos);

  const max = Math.max(r.cards.ingresosMes, r.cards.egresosMes, 1);

  const alertas: { label: string; count: number; href: string; icono: LucideIcon; tono: string }[] = [
    { label: "Telas bajo stock", count: r.alertas.bajoStock, href: "/inventario", icono: Boxes, tono: "bg-acento/12 text-acento" },
    { label: "Facturas pendientes", count: r.alertas.facturasPendientes, href: "/contabilidad/facturas", icono: FileWarning, tono: "bg-primario/12 text-primario-claro" },
    { label: "Sin declarar (30+ días)", count: r.alertas.facturasSinDeclarar, href: "/contabilidad/facturas", icono: AlertTriangle, tono: "bg-primario/12 text-primario-claro" },
    { label: "Recordatorios vencidos", count: r.alertas.recordatoriosVencidos, href: "/recordatorios", icono: AlertTriangle, tono: "bg-peligro/12 text-peligro" },
  ];

  return (
    <div className="flex flex-col gap-5">
      {/* Encabezado con acciones */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-texto">Bienvenido, {nombre}</h2>
          <p className="mt-1 text-sm text-texto-tenue">Tu panorama del negocio al {formatFechaBogota(hoy)}</p>
        </div>
        <div className="flex flex-wrap gap-2.5">
          <Link href="/inventario/importar" className={btnSecundario}>
            <Upload className="h-4 w-4" aria-hidden />
            Importar Excel
          </Link>
          <Link href="/pedidos/nuevo" className={btnPrimario}>
            <Plus className="h-4 w-4" aria-hidden />
            Nuevo pedido
          </Link>
        </div>
      </div>

      {/* Hero: resultado neto + mini-cards */}
      <div className="grid gap-4 lg:grid-cols-12">
        <div className="relative overflow-hidden rounded-2xl border border-primario/20 bg-gradient-to-br from-primario/[0.12] via-superficie-baja to-superficie-baja p-6 lg:col-span-4">
          <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-primario/15 blur-3xl" aria-hidden />
          <div className="relative flex items-center justify-between">
            <p className="text-sm text-texto-suave">Resultado neto</p>
            <span className="rounded-full border border-white/10 bg-superficie/70 px-2.5 py-0.5 text-xs text-texto-tenue">
              Mes en curso
            </span>
          </div>
          <p className={`relative mt-4 font-mono text-4xl font-bold tabular-nums ${r.cards.netoMes >= 0 ? "text-texto" : "text-peligro"}`}>
            {formatCOP(r.cards.netoMes)}
          </p>
          {deltaNeto && (
            <span
              className={
                netoSube
                  ? "relative mt-3 inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2.5 py-1 text-xs font-medium text-emerald-400"
                  : "relative mt-3 inline-flex items-center gap-1 rounded-full bg-peligro/15 px-2.5 py-1 text-xs font-medium text-peligro"
              }
            >
              {netoSube ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
              {deltaNeto} vs mes anterior
            </span>
          )}
          <div className="relative mt-6 space-y-3 border-t border-white/10 pt-4">
            <div>
              <div className="flex items-baseline justify-between text-sm">
                <span className="flex items-center gap-2 text-texto-suave"><span className="h-2 w-2 rounded-full bg-emerald-400" />Ingresos</span>
                <span className="font-mono tabular-nums text-emerald-400">{formatCOP(r.cards.ingresosMes)}</span>
              </div>
              <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-superficie-alta">
                <div className="h-full rounded-full bg-emerald-400/80" style={{ width: `${(r.cards.ingresosMes / max) * 100}%` }} />
              </div>
            </div>
            <div>
              <div className="flex items-baseline justify-between text-sm">
                <span className="flex items-center gap-2 text-texto-suave"><span className="h-2 w-2 rounded-full bg-peligro" />Egresos</span>
                <span className="font-mono tabular-nums text-peligro">{formatCOP(r.cards.egresosMes)}</span>
              </div>
              <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-superficie-alta">
                <div className="h-full rounded-full bg-peligro/80" style={{ width: `${(r.cards.egresosMes / max) * 100}%` }} />
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-8">
          <div className="mb-3 flex items-center justify-between px-1">
            <p className="text-sm font-medium text-texto-suave">Indicadores del mes</p>
            <Link href="/contabilidad/reportes" className="flex items-center gap-1 text-xs text-texto-tenue transition-colors hover:text-primario-claro">
              Ver reportes <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <PortfolioCard valor={formatCOP(r.cards.ingresosMes)} delta={deltaIngresos} deltaPositivo={!deltaIngresos?.startsWith("-")} icono={TrendingUp} label="Ingresos" href="/contabilidad/ingresos" acentoIcono="text-emerald-400" />
            <PortfolioCard valor={formatCOP(r.cards.egresosMes)} delta={deltaEgresos} deltaPositivo={deltaEgresos?.startsWith("-")} icono={TrendingDown} label="Egresos" href="/contabilidad/egresos" acentoIcono="text-peligro" />
            <PortfolioCard valor={`${nfMetros.format(r.cards.stockTotalM)} m`} icono={Boxes} label="Stock total" href="/inventario" />
            <PortfolioCard valor={String(r.alertas.facturasPendientes)} icono={FileWarning} label="Facturas pendientes" href="/contabilidad/facturas" />
          </div>
        </div>
      </div>

      {/* Gráfico de rendimiento con períodos */}
      <GraficoRendimiento serie={r.serie} />

      {/* Movimientos + Alertas (watchlist) */}
      <div className="grid gap-4 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <MovimientosRecientes ultimos={r.ultimos} />
        </div>
        <div className="rounded-2xl border border-white/10 bg-superficie-baja lg:col-span-5">
          <div className="flex items-center justify-between px-5 py-4">
            <h3 className="font-semibold text-texto">Alertas y pendientes</h3>
            <Link href="/recordatorios" className="text-xs text-texto-tenue transition-colors hover:text-primario-claro">Ver todas</Link>
          </div>
          <ul className="flex flex-col px-2 pb-3">
            {alertas.map((a) => (
              <li key={a.label}>
                <Link href={a.href} className="group flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-primario/[0.04]">
                  <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${a.tono}`}>
                    <a.icono className="h-4 w-4" aria-hidden />
                  </span>
                  <span className="flex-1 text-sm text-texto-suave">{a.label}</span>
                  <span className={a.count > 0 ? "font-mono text-base font-semibold tabular-nums text-acento" : "font-mono text-base font-semibold tabular-nums text-texto-tenue"}>
                    {a.count}
                  </span>
                  <ChevronRight className="h-4 w-4 text-texto-tenue transition-transform group-hover:translate-x-0.5" aria-hidden />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
