import Link from "next/link";
import { listarEgresos } from "@/modules/contabilidad/application/movimientos-actions";
import { formatCOP } from "@/shared/cop";
import { formatFechaBogota } from "@/shared/fecha";
import { VerArchivo } from "@/modules/contabilidad/presentation/ver-archivo";
import { PageHeader } from "@/components/ui/page-header";
import { CardTabla } from "@/components/ui/card-tabla";
import { btnPrimario, filaTabla, tabla, theadFila, thCelda } from "@/components/ui/estilos";

export default async function EgresosPage() {
  const egresos = await listarEgresos();
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        titulo="Egresos"
        volverHref="/contabilidad"
        volverLabel="Contabilidad"
        accion={<Link href="/contabilidad/egresos/nuevo" className={btnPrimario}>Nuevo egreso</Link>}
      />
      <CardTabla titulo="Egresos registrados">
        {egresos.length === 0 ? <p className="py-3 text-sm text-texto-tenue">No hay egresos.</p> : (
          <table className={tabla}>
            <thead className={theadFila}><tr>
              <th className={thCelda}>Fecha pago</th><th className={thCelda}>Concepto</th>
              <th className={`${thCelda} text-right`}>Valor</th><th className={thCelda}>Comprobante</th>
            </tr></thead>
            <tbody>
              {egresos.map((e) => (
                <tr key={e.id} className={filaTabla}>
                  <td className="py-2.5 text-texto-tenue">{formatFechaBogota(e.fecha_pago)}</td>
                  <td className="py-2.5 text-texto-suave">{e.concepto}</td>
                  <td className="py-2.5 text-right font-mono tabular-nums text-peligro">{formatCOP(e.valor)}</td>
                  <td className="py-2.5"><VerArchivo path={e.comprobante_url} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </CardTabla>
    </div>
  );
}
