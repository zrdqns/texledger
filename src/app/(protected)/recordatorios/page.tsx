import Link from "next/link";
import { AlertTriangle, FileWarning, Package, type LucideIcon } from "lucide-react";
import { listarNotificacionesNoLeidas } from "@/modules/recordatorios/application/notificaciones-actions";
import { listarRecordatorios } from "@/modules/recordatorios/application/recordatorios-actions";
import { diasRestantes, esVencido } from "@/modules/recordatorios/domain/estado";
import type { RecordatorioConFactura } from "@/modules/recordatorios/domain/tipos";
import { TIPO_LABEL } from "@/modules/recordatorios/presentation/labels";
import { MarcarLeidaBoton, NotificacionesToolbar } from "@/modules/recordatorios/presentation/notificacion-acciones";
import { RecordatorioAcciones } from "@/modules/recordatorios/presentation/recordatorio-acciones";
import { formatFechaBogota, formatTimestampBogota, hoyBogota } from "@/shared/fecha";
import { CardTabla } from "@/components/ui/card-tabla";
import { StatCard } from "@/components/ui/stat-card";
import { badgeAcento, badgeNeutro, badgePeligro, btnPrimario, filaTabla, subtituloSeccion, tabla, theadFila, thCelda } from "@/components/ui/estilos";

const ESTILO_NOTIF: Record<string, { card: string; barra: string; iconoWrap: string; Icono: LucideIcon }> = {
  recordatorio_vencido: {
    card: "border-peligro/40 bg-peligro/5 hover:border-peligro/60",
    barra: "bg-gradient-to-b from-peligro/80 to-transparent",
    iconoWrap: "bg-peligro/15 text-peligro",
    Icono: AlertTriangle,
  },
  bajo_stock: {
    card: "border-acento/40 bg-acento/5 hover:border-acento/60",
    barra: "bg-gradient-to-b from-acento/80 to-transparent",
    iconoWrap: "bg-acento/15 text-acento",
    Icono: Package,
  },
  factura_sin_declarar: {
    card: "border-primario/40 bg-primario/5 hover:border-primario/60",
    barra: "bg-gradient-to-b from-primario/80 to-transparent",
    iconoWrap: "bg-primario/15 text-primario-claro",
    Icono: FileWarning,
  },
};

const NOTIF_DEFAULT = {
  card: "border-white/10 bg-superficie-baja hover:border-white/20",
  barra: "bg-gradient-to-b from-texto-tenue/50 to-transparent",
  iconoWrap: "bg-superficie-alta text-texto-tenue",
  Icono: AlertTriangle as LucideIcon,
};

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

  const cont = (t: string) => noLeidas.filter((n) => n.tipo === t).length;
  const pendientes = recordatorios.filter((r) => r.estado !== "cumplido" && !esVencido(r.fecha_objetivo, hoy)).length;
  const vencidos = recordatorios.filter((r) => r.estado !== "cumplido" && esVencido(r.fecha_objetivo, hoy)).length;

  return (
    <div className="flex flex-col gap-10">
      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 className={subtituloSeccion}>Notificaciones</h2>
            {noLeidas.length > 0 && <span className={badgeAcento}>{noLeidas.length} sin leer</span>}
          </div>
          <NotificacionesToolbar hayNoLeidas={noLeidas.length > 0} />
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard label="Recordatorios vencidos" valor={String(cont("recordatorio_vencido"))} icono={AlertTriangle} tono={cont("recordatorio_vencido") > 0 ? "peligro" : "neutro"} />
          <StatCard label="Telas bajo stock" valor={String(cont("bajo_stock"))} icono={Package} tono="neutro" />
          <StatCard label="Facturas sin declarar" valor={String(cont("factura_sin_declarar"))} icono={FileWarning} tono="neutro" />
        </div>

        {noLeidas.length === 0 ? (
          <p className="text-sm text-texto-tenue">No tienes notificaciones pendientes.</p>
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2">
            {noLeidas.map((n) => {
              const est = ESTILO_NOTIF[n.tipo] ?? NOTIF_DEFAULT;
              return (
                <li key={n.id} className={`group relative flex items-start justify-between gap-3 overflow-hidden rounded-xl border p-4 transition-colors duration-300 ${est.card}`}>
                  <div className={`absolute inset-y-0 left-0 w-1 ${est.barra}`} aria-hidden />
                  <div className="flex items-start gap-3">
                    <span className={`rounded-lg p-2 ${est.iconoWrap}`}>
                      <est.Icono className="h-4 w-4" aria-hidden />
                    </span>
                    <div className="min-w-0">
                      <p className="font-medium text-texto">{n.titulo}</p>
                      <p className="text-sm text-texto-tenue">{n.mensaje}</p>
                      <p className="mt-1 text-xs text-texto-tenue">{formatTimestampBogota(n.created_at)}</p>
                    </div>
                  </div>
                  <MarcarLeidaBoton id={n.id} />
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <span className={badgeNeutro}>{pendientes} pendientes</span>
          {vencidos > 0 && <span className={badgePeligro}>{vencidos} vencidos</span>}
        </div>
        <CardTabla
          titulo="Recordatorios"
          accion={<Link href="/recordatorios/nuevo" className={btnPrimario}>Nuevo recordatorio</Link>}
        >
        {recordatorios.length === 0 ? (
          <p className="py-3 text-sm text-texto-tenue">No hay recordatorios.</p>
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
                <tr key={r.id} className={filaTabla}>
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
        </CardTabla>
      </section>
    </div>
  );
}
