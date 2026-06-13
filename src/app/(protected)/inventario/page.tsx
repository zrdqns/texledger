import Link from "next/link";
import { AlertTriangle, Layers, Package } from "lucide-react";
import { listarTelas } from "@/modules/inventario/application/telas-actions";
import { esBajoStock } from "@/modules/inventario/domain/stock";
import { TelasTabla } from "@/modules/inventario/presentation/telas-tabla";
import { PageHeader } from "@/components/ui/page-header";
import { CardTabla } from "@/components/ui/card-tabla";
import { StatCard } from "@/components/ui/stat-card";
import { btnPrimario, btnSecundario, pillActiva, pillInactiva } from "@/components/ui/estilos";

const nf = new Intl.NumberFormat("es-CO", { maximumFractionDigits: 1 });

export default async function InventarioPage({
  searchParams,
}: {
  searchParams: Promise<{ bajo?: string; q?: string; retiradas?: string }>;
}) {
  const { bajo, q, retiradas } = await searchParams;
  const soloBajo = bajo === "1";
  const verRetiradas = retiradas === "1";
  const [telas, base] = await Promise.all([
    listarTelas({ soloBajoStock: soloBajo, q, incluirRetiradas: verRetiradas }),
    listarTelas({}),
  ]);

  const totalMetraje = base.reduce((s, t) => s + t.stock_actual_m, 0);
  const bajoStock = base.filter((t) => esBajoStock(t.stock_actual_m, t.umbral_bajo_stock_m));

  const toggleHref = (cambios: Record<string, string | undefined>) => {
    const p = new URLSearchParams();
    if (q) p.set("q", q);
    if (soloBajo) p.set("bajo", "1");
    if (verRetiradas) p.set("retiradas", "1");
    for (const [k, v] of Object.entries(cambios)) {
      if (v === undefined) p.delete(k);
      else p.set(k, v);
    }
    const s = p.toString();
    return s ? `/inventario?${s}` : "/inventario";
  };

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        titulo="Inventario de tela"
        subtitulo={`${base.length} referencias activas · gestión de rollos y stock`}
        accion={
          <div className="flex gap-2">
            <Link href="/inventario/nueva" className={btnSecundario}>Nueva tela</Link>
            <Link href="/inventario/importar" className={btnPrimario}>Importar Excel</Link>
          </div>
        }
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <StatCard label="Metraje total" valor={`${nf.format(totalMetraje)} m`} tono="neutro" icono={Package} />
        <StatCard label="Referencias activas" valor={String(base.length)} tono="neutro" icono={Layers} />
        <Link
          href={bajoStock.length > 0 ? "/inventario?bajo=1" : "/inventario"}
          className={
            bajoStock.length > 0
              ? "group relative overflow-hidden rounded-xl border border-acento/40 bg-acento/5 p-5 transition-colors hover:bg-acento/10"
              : "group relative overflow-hidden rounded-xl border border-white/10 bg-superficie-baja p-5"
          }
        >
          <div className="flex items-start gap-3">
            <span className={bajoStock.length > 0 ? "rounded-lg bg-acento/20 p-2 text-acento" : "rounded-lg bg-superficie-alta p-2 text-texto-tenue"}>
              <AlertTriangle className="h-4 w-4" aria-hidden />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-texto">
                {bajoStock.length > 0 ? `${bajoStock.length} ${bajoStock.length === 1 ? "referencia" : "referencias"} bajo stock` : "Stock saludable"}
              </p>
              <p className="mt-1 truncate text-xs text-texto-tenue">
                {bajoStock.length > 0 ? bajoStock.slice(0, 3).map((t) => t.referencia).join(" · ") : "Ninguna referencia bajo el umbral"}
              </p>
            </div>
          </div>
        </Link>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <form className="flex gap-2">
          {soloBajo && <input type="hidden" name="bajo" value="1" />}
          {verRetiradas && <input type="hidden" name="retiradas" value="1" />}
          <input
            name="q"
            defaultValue={q ?? ""}
            placeholder="Buscar referencia o descripción"
            className="rounded-full border border-white/15 bg-superficie-alta px-4 py-1.5 text-sm text-texto outline-none transition-colors placeholder:text-texto-tenue focus:border-primario focus:ring-1 focus:ring-primario"
          />
          <button type="submit" className={pillInactiva}>Buscar</button>
        </form>
        <Link href={toggleHref({ bajo: soloBajo ? undefined : "1" })} className={soloBajo ? pillActiva : pillInactiva}>Solo bajo stock</Link>
        <Link href={toggleHref({ retiradas: verRetiradas ? undefined : "1" })} className={verRetiradas ? pillActiva : pillInactiva}>Ver retiradas</Link>
      </div>

      <CardTabla titulo="Detalle de inventario">
        <TelasTabla telas={telas} />
      </CardTabla>
    </div>
  );
}
