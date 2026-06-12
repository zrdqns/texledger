import Link from "next/link";
import { listarIngresos } from "@/modules/contabilidad/application/movimientos-actions";
import { formatCOP } from "@/shared/cop";
import { formatFechaBogota } from "@/shared/fecha";
import { VerArchivo } from "@/modules/contabilidad/presentation/ver-archivo";
import { PageHeader } from "@/components/ui/page-header";
import { btnPrimario, tabla, theadFila, thCelda } from "@/components/ui/estilos";

export default async function IngresosPage() {
  const ingresos = await listarIngresos();
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        titulo="Ingresos"
        volverHref="/contabilidad"
        volverLabel="Contabilidad"
        accion={<Link href="/contabilidad/ingresos/nuevo" className={btnPrimario}>Nuevo ingreso</Link>}
      />
      {ingresos.length === 0 ? <p className="text-sm text-texto-tenue">No hay ingresos.</p> : (
        <table className={tabla}>
          <thead className={theadFila}><tr>
            <th className={thCelda}>Fecha</th><th className={thCelda}>Concepto</th>
            <th className={`${thCelda} text-right`}>Valor</th><th className={thCelda}>Comprobante</th>
          </tr></thead>
          <tbody>
            {ingresos.map((i) => (
              <tr key={i.id} className="border-b border-borde/30">
                <td className="py-2 text-texto-tenue">{formatFechaBogota(i.fecha)}</td>
                <td className="py-2 text-texto-suave">{i.concepto}</td>
                <td className="py-2 text-right font-mono tabular-nums text-emerald-400">{formatCOP(i.valor)}</td>
                <td className="py-2"><VerArchivo path={i.comprobante_url} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
