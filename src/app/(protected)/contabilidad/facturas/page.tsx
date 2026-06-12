import Link from "next/link";
import { listarFacturas } from "@/modules/contabilidad/application/facturas-actions";
import { formatCOP } from "@/shared/cop";
import { formatFechaBogota } from "@/shared/fecha";
import { DeclaradaToggle } from "@/modules/contabilidad/presentation/declarada-toggle";
import { VerArchivo } from "@/modules/contabilidad/presentation/ver-archivo";
import { PageHeader } from "@/components/ui/page-header";
import { btnPrimario, tabla, theadFila, thCelda } from "@/components/ui/estilos";

export default async function FacturasPage() {
  const facturas = await listarFacturas();
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        titulo="Facturas"
        volverHref="/contabilidad"
        volverLabel="Contabilidad"
        accion={<Link href="/contabilidad/facturas/nueva" className={btnPrimario}>Nueva factura</Link>}
      />
      {facturas.length === 0 ? (
        <p className="text-sm text-texto-tenue">No hay facturas.</p>
      ) : (
        <table className={tabla}>
          <thead className={theadFila}>
            <tr>
              <th className={thCelda}>Fecha</th><th className={thCelda}>Tipo</th>
              <th className={thCelda}>Número</th><th className={thCelda}>Tercero</th>
              <th className={`${thCelda} text-right`}>Valor</th><th className={thCelda}>Estado</th>
              <th className={thCelda}>Declarada</th><th className={thCelda}>Archivo</th>
            </tr>
          </thead>
          <tbody>
            {facturas.map((f) => (
              <tr key={f.id} className="border-b border-borde/30">
                <td className="py-2 text-texto-tenue">{formatFechaBogota(f.fecha_emision)}</td>
                <td className="py-2 capitalize text-texto-suave">{f.tipo}</td>
                <td className="py-2 text-texto">{f.numero}</td>
                <td className="py-2 text-texto-suave">{f.tercero}</td>
                <td className="py-2 text-right font-mono tabular-nums text-texto">{formatCOP(f.valor)}</td>
                <td className="py-2 capitalize text-texto-suave">{f.estado}</td>
                <td className="py-2"><DeclaradaToggle id={f.id} declarada={f.declarada} /></td>
                <td className="py-2"><VerArchivo path={f.archivo_url} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
