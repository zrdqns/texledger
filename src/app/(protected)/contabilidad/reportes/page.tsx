import { consultarReporte } from "@/modules/contabilidad/application/reporte-actions";
import { formatCOP } from "@/shared/cop";
import { formatFechaBogota, hoyBogota } from "@/shared/fecha";
import { PageHeader } from "@/components/ui/page-header";
import { btnSecundario, labelCampo } from "@/components/ui/estilos";

const RE = /^\d{4}-\d{2}-\d{2}$/;

const inputFecha =
  "rounded-lg border border-borde bg-superficie-alta px-3 py-1.5 text-sm text-texto outline-none focus:border-primario";

export default async function ReportesPage({
  searchParams,
}: {
  searchParams: Promise<{ desde?: string; hasta?: string }>;
}) {
  const sp = await searchParams;
  const hoy = hoyBogota();
  const desde = sp.desde && RE.test(sp.desde) ? sp.desde : `${hoy.slice(0, 7)}-01`;
  const hasta = sp.hasta && RE.test(sp.hasta) ? sp.hasta : hoy;

  const { ingresos, egresos, totales } = await consultarReporte(desde, hasta);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader titulo="Reportes" volverHref="/contabilidad" volverLabel="Contabilidad" />

      <form className="flex flex-wrap items-end gap-3">
        <label className={labelCampo}>Desde
          <input name="desde" type="date" defaultValue={desde} className={inputFecha} />
        </label>
        <label className={labelCampo}>Hasta
          <input name="hasta" type="date" defaultValue={hasta} className={inputFecha} />
        </label>
        <button type="submit" className={btnSecundario}>Consultar</button>
      </form>

      <div className="grid gap-4 sm:grid-cols-3">
        <Tot label="Ingresos" valor={totales.totalIngresos} tono="ok" />
        <Tot label="Egresos" valor={totales.totalEgresos} tono="peligro" />
        <Tot label="Neto" valor={totales.neto} tono={totales.neto >= 0 ? "ok" : "peligro"} />
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <Seccion titulo="Ingresos" filas={ingresos.map((i) => ({ id: i.id, fecha: i.fecha, concepto: i.concepto, valor: i.valor }))} tono="ok" />
        <Seccion titulo="Egresos" filas={egresos.map((e) => ({ id: e.id, fecha: e.fecha_pago, concepto: e.concepto, valor: e.valor }))} tono="peligro" />
      </div>
    </div>
  );
}

const tonoTexto = {
  ok: "text-emerald-400",
  peligro: "text-peligro",
} as const;

function Tot({ label, valor, tono }: { label: string; valor: number; tono: keyof typeof tonoTexto }) {
  return (
    <div className="rounded-xl border border-borde/60 bg-superficie-baja p-4">
      <p className="text-xs text-texto-tenue">{label}</p>
      <p className={`mt-1 font-mono text-xl font-semibold tabular-nums ${tonoTexto[tono]}`}>{formatCOP(valor)}</p>
    </div>
  );
}

function Seccion({ titulo, filas, tono }: { titulo: string; filas: { id: string; fecha: string; concepto: string; valor: number }[]; tono: keyof typeof tonoTexto }) {
  return (
    <div>
      <h3 className="mb-2 text-sm font-medium text-texto-suave">{titulo}</h3>
      {filas.length === 0 ? <p className="text-sm text-texto-tenue">Sin movimientos.</p> : (
        <table className="w-full text-sm">
          <tbody>
            {filas.map((f) => (
              <tr key={f.id} className="border-b border-borde/30">
                <td className="py-2 text-texto-tenue">{formatFechaBogota(f.fecha)}</td>
                <td className="py-2 text-texto-suave">{f.concepto}</td>
                <td className={`py-2 text-right font-mono tabular-nums ${tonoTexto[tono]}`}>{formatCOP(f.valor)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
