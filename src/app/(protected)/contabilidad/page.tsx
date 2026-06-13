import { BarChart3, FileText, Landmark, TrendingDown, TrendingUp } from "lucide-react";
import { listarFacturas } from "@/modules/contabilidad/application/facturas-actions";
import { listarIngresos, listarEgresos } from "@/modules/contabilidad/application/movimientos-actions";
import { listarCuentas } from "@/modules/contabilidad/application/cuentas-actions";
import { PageHeader } from "@/components/ui/page-header";
import { HubCard } from "@/components/ui/hub-card";
import { StatCard } from "@/components/ui/stat-card";
import { formatCOP } from "@/shared/cop";
import { hoyBogota } from "@/shared/fecha";

export default async function ContabilidadPage() {
  const mes = hoyBogota().slice(0, 7);
  const [facturas, ingresos, egresos, cuentas] = await Promise.all([
    listarFacturas(),
    listarIngresos(),
    listarEgresos(),
    listarCuentas(),
  ]);

  const facturasPendientes = facturas.filter((f) => f.estado === "pendiente").length;
  const ingresosMes = ingresos.filter((i) => i.fecha.startsWith(mes)).reduce((s, i) => s + i.valor, 0);
  const egresosMes = egresos.filter((e) => e.fecha_pago.startsWith(mes)).reduce((s, e) => s + e.valor, 0);
  const neto = ingresosMes - egresosMes;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader titulo="Contabilidad" subtitulo="Facturas, movimientos de caja y reportes del periodo" />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Ingresos del mes" valor={formatCOP(ingresosMes)} tono="ok" icono={TrendingUp} />
        <StatCard label="Egresos del mes" valor={formatCOP(egresosMes)} tono="peligro" icono={TrendingDown} />
        <StatCard label="Neto del mes" valor={formatCOP(neto)} tono={neto >= 0 ? "ok" : "peligro"} icono={BarChart3} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <HubCard
          href="/contabilidad/facturas"
          icono={FileText}
          titulo="Facturas"
          descripcion="Ventas y compras, declaración DIAN y estado de pago."
          stat={String(facturas.length)}
          statLabel={`facturas · ${facturasPendientes} pendientes`}
        />
        <HubCard
          href="/contabilidad/ingresos"
          icono={TrendingUp}
          titulo="Ingresos"
          descripcion="Pagos recibidos con comprobante y cuenta de destino."
          stat={formatCOP(ingresosMes)}
          statLabel="este mes"
        />
        <HubCard
          href="/contabilidad/egresos"
          icono={TrendingDown}
          titulo="Egresos"
          descripcion="Pagos realizados desde tus cuentas bancarias."
          stat={formatCOP(egresosMes)}
          statLabel="este mes"
        />
        <HubCard
          href="/contabilidad/cuentas"
          icono={Landmark}
          titulo="Cuentas bancarias"
          descripcion="Cuentas desde las que entran y salen los movimientos."
          stat={String(cuentas.length)}
          statLabel={cuentas.length === 1 ? "cuenta" : "cuentas"}
        />
        <HubCard
          href="/contabilidad/reportes"
          icono={BarChart3}
          titulo="Reportes"
          descripcion="Ingresos vs egresos filtrables por rango de fechas."
        />
      </div>
    </div>
  );
}
