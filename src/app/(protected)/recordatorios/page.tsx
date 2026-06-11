import Link from "next/link";
import { listarNotificacionesNoLeidas } from "@/modules/recordatorios/application/notificaciones-actions";
import { listarRecordatorios } from "@/modules/recordatorios/application/recordatorios-actions";
import { diasRestantes, esVencido } from "@/modules/recordatorios/domain/estado";
import type { RecordatorioConFactura } from "@/modules/recordatorios/domain/tipos";
import { TIPO_LABEL } from "@/modules/recordatorios/presentation/labels";
import { MarcarLeidaBoton, NotificacionesToolbar } from "@/modules/recordatorios/presentation/notificacion-acciones";
import { RecordatorioAcciones } from "@/modules/recordatorios/presentation/recordatorio-acciones";
import { formatFechaBogota, hoyBogota, TZ_BOGOTA } from "@/shared/fecha";

const fmtCreada = new Intl.DateTimeFormat("es-CO", {
  timeZone: TZ_BOGOTA,
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

function BadgeEstado({ r, hoy }: { r: RecordatorioConFactura; hoy: string }) {
  if (r.estado === "cumplido") return <span className="text-emerald-400">Cumplido</span>;
  if (esVencido(r.fecha_objetivo, hoy)) {
    const d = -diasRestantes(r.fecha_objetivo, hoy);
    return <span className="text-red-400">Vencido hace {d} {d === 1 ? "día" : "días"}</span>;
  }
  const d = diasRestantes(r.fecha_objetivo, hoy);
  return <span className="text-zinc-300">{d === 0 ? "Vence hoy" : `Vence en ${d} ${d === 1 ? "día" : "días"}`}</span>;
}

export default async function RecordatoriosPage() {
  const [noLeidas, recordatorios] = await Promise.all([listarNotificacionesNoLeidas(), listarRecordatorios()]);
  const hoy = hoyBogota();

  return (
    <div className="flex flex-col gap-10">
      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-zinc-100">Notificaciones</h2>
          <NotificacionesToolbar hayNoLeidas={noLeidas.length > 0} />
        </div>
        {noLeidas.length === 0 ? (
          <p className="text-sm text-zinc-500">No tienes notificaciones pendientes.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {noLeidas.map((n) => (
              <li key={n.id} className="flex items-start justify-between gap-4 rounded-lg border border-zinc-800 bg-zinc-900/40 p-4">
                <div>
                  <p className="font-medium text-zinc-100">{n.titulo}</p>
                  <p className="text-sm text-zinc-400">{n.mensaje}</p>
                  <p className="mt-1 text-xs text-zinc-500">{fmtCreada.format(new Date(n.created_at))}</p>
                </div>
                <MarcarLeidaBoton id={n.id} />
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-zinc-100">Recordatorios</h2>
          <Link href="/recordatorios/nuevo" className="rounded-md bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-emerald-500">Nuevo recordatorio</Link>
        </div>
        {recordatorios.length === 0 ? (
          <p className="text-sm text-zinc-500">No hay recordatorios.</p>
        ) : (
          <table className="w-full text-sm [&_td]:pr-4 [&_th]:pr-4">
            <thead className="text-left text-zinc-400">
              <tr className="border-b border-zinc-800">
                <th className="py-2 font-medium">Tipo</th>
                <th className="py-2 font-medium">Descripción</th>
                <th className="py-2 font-medium">Fecha objetivo</th>
                <th className="py-2 font-medium">Estado</th>
                <th className="py-2 font-medium">Factura</th>
                <th className="py-2 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {recordatorios.map((r) => (
                <tr key={r.id} className="border-b border-zinc-900">
                  <td className="py-2 text-zinc-300">{TIPO_LABEL[r.tipo]}</td>
                  <td className="py-2 text-zinc-200">{r.descripcion}</td>
                  <td className="py-2 text-zinc-400">{formatFechaBogota(r.fecha_objetivo)}</td>
                  <td className="py-2"><BadgeEstado r={r} hoy={hoy} /></td>
                  <td className="py-2 text-zinc-400">{r.facturas ? `${r.facturas.numero} — ${r.facturas.tercero}` : "—"}</td>
                  <td className="py-2"><RecordatorioAcciones id={r.id} cumplido={r.estado === "cumplido"} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}
