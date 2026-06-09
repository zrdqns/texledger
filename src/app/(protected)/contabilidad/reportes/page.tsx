import Link from "next/link";
import { consultarReporte } from "@/modules/contabilidad/application/reporte-actions";
import { formatCOP } from "@/shared/cop";
import { formatFechaBogota, hoyBogota } from "@/shared/fecha";

const RE = /^\d{4}-\d{2}-\d{2}$/;

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

  const input = "rounded-md border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-sm text-zinc-100 outline-none focus:border-zinc-500";
  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link href="/contabilidad" className="text-sm text-zinc-400 hover:text-zinc-100">← Contabilidad</Link>
        <h2 className="mt-2 text-lg font-semibold text-zinc-100">Reportes</h2>
      </div>

      <form className="flex flex-wrap items-end gap-3">
        <label className="flex flex-col gap-1 text-sm text-zinc-400">Desde
          <input name="desde" type="date" defaultValue={desde} className={input} />
        </label>
        <label className="flex flex-col gap-1 text-sm text-zinc-400">Hasta
          <input name="hasta" type="date" defaultValue={hasta} className={input} />
        </label>
        <button type="submit" className="rounded-md border border-zinc-700 px-3 py-1.5 text-sm text-zinc-300 hover:bg-zinc-800">Consultar</button>
      </form>

      <div className="grid gap-4 sm:grid-cols-3">
        <Tot label="Ingresos" valor={totales.totalIngresos} color="text-emerald-400" />
        <Tot label="Egresos" valor={totales.totalEgresos} color="text-red-400" />
        <Tot label="Neto" valor={totales.neto} color={totales.neto >= 0 ? "text-emerald-400" : "text-red-400"} />
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <Seccion titulo="Ingresos" filas={ingresos.map((i) => ({ id: i.id, fecha: i.fecha, concepto: i.concepto, valor: i.valor }))} color="text-emerald-400" />
        <Seccion titulo="Egresos" filas={egresos.map((e) => ({ id: e.id, fecha: e.fecha_pago, concepto: e.concepto, valor: e.valor }))} color="text-red-400" />
      </div>
    </div>
  );
}

function Tot({ label, valor, color }: { label: string; valor: number; color: string }) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
      <p className="text-xs text-zinc-500">{label}</p>
      <p className={`mt-1 text-xl font-semibold ${color}`}>{formatCOP(valor)}</p>
    </div>
  );
}

function Seccion({ titulo, filas, color }: { titulo: string; filas: { id: string; fecha: string; concepto: string; valor: number }[]; color: string }) {
  return (
    <div>
      <h3 className="mb-2 text-sm font-medium text-zinc-300">{titulo}</h3>
      {filas.length === 0 ? <p className="text-sm text-zinc-500">Sin movimientos.</p> : (
        <table className="w-full text-sm">
          <tbody>
            {filas.map((f) => (
              <tr key={f.id} className="border-b border-zinc-900">
                <td className="py-2 text-zinc-400">{formatFechaBogota(f.fecha)}</td>
                <td className="py-2 text-zinc-300">{f.concepto}</td>
                <td className={`py-2 text-right tabular-nums ${color}`}>{formatCOP(f.valor)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
