import Link from "next/link";
import { listarParametros } from "@/modules/nomina/application/parametros-actions";
import { formatCOP } from "@/shared/cop";
import { PageHeader } from "@/components/ui/page-header";
import { CardTabla } from "@/components/ui/card-tabla";
import { btnPrimario, filaTabla, linkSuave, tabla, theadFila, thCelda } from "@/components/ui/estilos";

export default async function ParametrosPage() {
  const parametros = await listarParametros();
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        titulo="Parámetros de nómina"
        volverHref="/nomina"
        volverLabel="Nómina"
        accion={<Link href="/nomina/parametros/nuevo" className={btnPrimario}>Nuevo año</Link>}
      />
      <CardTabla titulo="Parámetros legales por año">
      {parametros.length === 0 ? (
        <p className="py-3 text-sm text-texto-tenue">No hay parámetros configurados.</p>
      ) : (
        <table className={tabla}>
          <thead className={theadFila}>
            <tr>
              <th className={thCelda}>Año</th>
              <th className={`${thCelda} text-right`}>SMMLV</th>
              <th className={`${thCelda} text-right`}>Aux. transporte</th>
              <th className={`${thCelda} text-right`}>Tope auxilio (SMMLV)</th>
              <th className={`${thCelda} text-right`}>% Pensión</th>
              <th className={`${thCelda} text-right`}>% Salud</th>
              <th className={thCelda}></th>
            </tr>
          </thead>
          <tbody>
            {parametros.map((p) => (
              <tr key={p.id} className={filaTabla}>
                <td className="py-2 text-texto">{p.anio}</td>
                <td className="py-2 text-right font-mono tabular-nums text-texto">{formatCOP(p.smmlv)}</td>
                <td className="py-2 text-right font-mono tabular-nums text-texto">{formatCOP(p.auxilio_transporte)}</td>
                <td className="py-2 text-right font-mono tabular-nums text-texto-suave">{p.tope_auxilio_smmlv}</td>
                <td className="py-2 text-right font-mono tabular-nums text-texto-suave">{p.pct_pension}%</td>
                <td className="py-2 text-right font-mono tabular-nums text-texto-suave">{p.pct_salud}%</td>
                <td className="py-2"><Link href={`/nomina/parametros/${p.id}/editar`} className={linkSuave}>Editar</Link></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      </CardTabla>
    </div>
  );
}
