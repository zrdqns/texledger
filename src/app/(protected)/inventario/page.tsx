import Link from "next/link";
import { AlertTriangle, CheckCircle2, Layers, Package, Plus, Upload } from "lucide-react";
import { listarTelas } from "@/modules/inventario/application/telas-actions";
import { esBajoStock } from "@/modules/inventario/domain/stock";
import { InventarioDetalle } from "@/modules/inventario/presentation/inventario-detalle";
import { PageHeader } from "@/components/ui/page-header";
import { btnPrimario, btnSecundario } from "@/components/ui/estilos";

const nf = new Intl.NumberFormat("es-CO", { maximumFractionDigits: 1 });
const nfEntero = new Intl.NumberFormat("es-CO");

export default async function InventarioPage() {
  const todas = await listarTelas({ incluirRetiradas: true });
  const activas = todas.filter((t) => t.activo);

  const totalMetraje = activas.reduce((s, t) => s + t.stock_actual_m, 0);
  const totalRollos = activas.reduce((s, t) => s + (t.paquetes_rollos ?? 0), 0);
  const bajoStock = activas.filter((t) => esBajoStock(t.stock_actual_m, t.umbral_bajo_stock_m));

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        titulo="Inventario de Telas"
        subtitulo="Gestión de rollos, metraje y alertas de stock."
        accion={
          <div className="flex gap-2">
            <Link href="/inventario/importar" className={btnSecundario}>
              <Upload className="h-4 w-4" aria-hidden />
              Importar Excel
            </Link>
            <Link href="/inventario/nueva" className={btnPrimario}>
              <Plus className="h-4 w-4" aria-hidden />
              Agregar Tela
            </Link>
          </div>
        }
      />

      <div className="grid gap-4 lg:grid-cols-4">
        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-superficie-baja p-5">
          <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-primario/10 blur-3xl" aria-hidden />
          <div className="relative flex items-center justify-between">
            <p className="text-sm text-texto-tenue">Total Metraje</p>
            <span className="rounded-lg border border-white/10 bg-superficie-alta p-2 text-primario-claro">
              <Package className="h-4 w-4" aria-hidden />
            </span>
          </div>
          <p className="relative mt-3 font-mono text-3xl font-bold tabular-nums text-texto">{nf.format(totalMetraje)} m</p>
          <p className="relative mt-1 text-xs text-texto-tenue">En {activas.length} referencias activas</p>
        </div>

        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-superficie-baja p-5">
          <div className="relative flex items-center justify-between">
            <p className="text-sm text-texto-tenue">Rollos Activos</p>
            <span className="rounded-lg border border-white/10 bg-superficie-alta p-2 text-primario-claro">
              <Layers className="h-4 w-4" aria-hidden />
            </span>
          </div>
          <p className="relative mt-3 font-mono text-3xl font-bold tabular-nums text-texto">{nfEntero.format(totalRollos)}</p>
          <p className="relative mt-1 text-xs text-texto-tenue">Distribuidos en {activas.length} referencias</p>
        </div>

        {bajoStock.length > 0 ? (
          <div className="relative overflow-hidden rounded-2xl border border-acento/30 bg-gradient-to-r from-acento/[0.08] via-superficie-baja to-superficie-baja p-5 lg:col-span-2">
            <div className="absolute inset-y-0 left-0 w-1 bg-acento" aria-hidden />
            <div className="flex items-start gap-4 pl-2">
              <span className="shrink-0 rounded-xl bg-acento/15 p-2.5 text-acento">
                <AlertTriangle className="h-5 w-5" aria-hidden />
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-texto">Alertas de bajo metraje</p>
                <p className="mt-0.5 text-sm text-texto-tenue">
                  {bajoStock.length} {bajoStock.length === 1 ? "referencia está" : "referencias están"} por debajo del umbral crítico.
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {bajoStock.slice(0, 4).map((t) => (
                    <Link
                      key={t.id}
                      href={`/inventario/${t.id}`}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-superficie px-2.5 py-1 text-xs text-texto-suave transition-colors hover:border-acento/40 hover:text-texto"
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-acento" aria-hidden />
                      {t.referencia} · {nf.format(t.stock_actual_m)} m
                    </Link>
                  ))}
                  {bajoStock.length > 4 && (
                    <span className="inline-flex items-center rounded-lg px-2 py-1 text-xs text-texto-tenue">
                      +{bajoStock.length - 4} más
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="relative overflow-hidden rounded-2xl border border-emerald-500/20 bg-gradient-to-r from-emerald-500/[0.06] via-superficie-baja to-superficie-baja p-5 lg:col-span-2">
            <div className="flex items-start gap-4">
              <span className="shrink-0 rounded-xl bg-emerald-500/15 p-2.5 text-emerald-400">
                <CheckCircle2 className="h-5 w-5" aria-hidden />
              </span>
              <div>
                <p className="font-semibold text-texto">Stock saludable</p>
                <p className="mt-0.5 text-sm text-texto-tenue">Ninguna referencia por debajo de su umbral crítico.</p>
              </div>
            </div>
          </div>
        )}
      </div>

      <InventarioDetalle telas={todas} />
    </div>
  );
}
