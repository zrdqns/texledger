import Link from "next/link";
import { listarNotificacionesNoLeidas } from "@/modules/recordatorios/application/notificaciones-actions";
import { listarRecordatorios } from "@/modules/recordatorios/application/recordatorios-actions";
import { diasRestantes, esVencido } from "@/modules/recordatorios/domain/estado";
import type { RecordatorioConFactura } from "@/modules/recordatorios/domain/tipos";
import { TIPO_LABEL } from "@/modules/recordatorios/presentation/labels";
import { MarcarLeidaBoton, NotificacionesToolbar } from "@/modules/recordatorios/presentation/notificacion-acciones";
import { RecordatorioAcciones } from "@/modules/recordatorios/presentation/recordatorio-acciones";
import { formatFechaBogota, formatTimestampBogota, hoyBogota } from "@/shared/fecha";
import { btnPrimario, subtituloSeccion, tabla, theadFila, thCelda } from "@/components/ui/estilos";

function BadgeEstado({ r, hoy }: { r: RecordatorioConFactura; hoy: string }) {
  if (r.estado === "cumplido") return <span className="text-emerald-400">Cumplido</span>;
  if (esVencido(r.fecha_objetivo, hoy)) {
    const d = -diasRestantes(r.fecha_objetivo, hoy);
    return <span className="text-peligro">Vencido hace {d} {d === 1 ? "día" : "días"}</span>;
  }
  const d = diasRestantes(r.fecha_objetivo, hoy);
  return <span className="text-texto-suave">{d === 0 ? "Vence hoy" : `Vence en ${d} ${d === 1 ? "día" : "días"}`}</span>;
}

export default async function RecordatoriosPage() {
  const [noLeidas, recordatorios] = await Promise.all([listarNotificacionesNoLeidas(), listarRecordatorios()]);
  const hoy = hoyBogota();

  return (
    <div className="flex flex-col gap-10">
      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className={subtituloSeccion}>Notificaciones</h2>
          <NotificacionesToolbar hayNoLeidas={noLeidas.length > 0} />
        </div>
        {noLeidas.length === 0 ? (
          <p className="text-sm text-texto-tenue">No tienes notificaciones pendientes.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {noLeidas.map((n) => (
              <li key={n.id} className="flex items-start justify-between gap-4 rounded-xl border border-borde/60 bg-superficie-baja p-4">
                <div>
                  <p className="font-medium text-texto">{n.titulo}</p>
                  <p className="text-sm text-texto-tenue">{n.mensaje}</p>
                  <p className="mt-1 text-xs text-texto-tenue">{formatTimestampBogota(n.created_at)}</p>
                </div>
                <MarcarLeidaBoton id={n.id} />
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className={subtituloSeccion}>Recordatorios</h2>
          <Link href="/recordatorios/nuevo" className={btnPrimario}>Nuevo recordatorio</Link>
        </div>
        {recordatorios.length === 0 ? (
          <p className="text-sm text-texto-tenue">No hay recordatorios.</p>
        ) : (
          <table className={tabla}>
            <thead className={theadFila}>
              <tr>
                <th className={thCelda}>Tipo</th>
                <th className={thCelda}>Descripción</th>
                <th className={thCelda}>Fecha objetivo</th>
                <th className={thCelda}>Estado</th>
                <th className={thCelda}>Factura</th>
                <th className={thCelda}></th>
              </tr>
            </thead>
            <tbody>
              {recordatorios.map((r) => (
                <tr key={r.id} className="border-b border-borde/30">
                  <td className="py-2 text-texto-suave">{TIPO_LABEL[r.tipo]}</td>
                  <td className="py-2 text-texto">{r.descripcion}</td>
                  <td className="py-2 text-texto-tenue">{formatFechaBogota(r.fecha_objetivo)}</td>
                  <td className="py-2"><BadgeEstado r={r} hoy={hoy} /></td>
                  <td className="py-2 text-texto-tenue">{r.facturas ? `${r.facturas.numero} — ${r.facturas.tercero}` : "—"}</td>
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
