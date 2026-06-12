import Link from "next/link";
import { listarEmpleados } from "@/modules/nomina/application/empleados-actions";
import { formatCOP } from "@/shared/cop";
import { formatFechaBogota } from "@/shared/fecha";
import { RetirarEmpleadoBoton } from "@/modules/nomina/presentation/retirar-empleado-boton";
import { PageHeader } from "@/components/ui/page-header";
import { btnPrimario, linkSuave, tabla, theadFila, thCelda } from "@/components/ui/estilos";
import type { Empleado } from "@/modules/nomina/domain/tipos";

function seguroLabel(e: Empleado): string {
  if (e.seguro_tipo === "fijo") return formatCOP(e.seguro_valor);
  if (e.seguro_tipo === "porcentaje") return `${e.seguro_valor}% del básico`;
  return "—";
}

export default async function EmpleadosPage() {
  const empleados = await listarEmpleados();
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        titulo="Empleados"
        volverHref="/nomina"
        volverLabel="Nómina"
        accion={<Link href="/nomina/empleados/nuevo" className={btnPrimario}>Nuevo empleado</Link>}
      />
      {empleados.length === 0 ? (
        <p className="text-sm text-texto-tenue">No hay empleados activos.</p>
      ) : (
        <table className={tabla}>
          <thead className={theadFila}>
            <tr>
              <th className={thCelda}>Nombre</th>
              <th className={thCelda}>Documento</th>
              <th className={thCelda}>Cargo</th>
              <th className={`${thCelda} text-right`}>Sueldo básico</th>
              <th className={thCelda}>Seguro</th>
              <th className={thCelda}>Ingreso</th>
              <th className={thCelda}></th>
            </tr>
          </thead>
          <tbody>
            {empleados.map((e) => (
              <tr key={e.id} className="border-b border-borde/30">
                <td className="py-2 text-texto">{e.nombre}</td>
                <td className="py-2 text-texto-tenue">{e.documento ?? "—"}</td>
                <td className="py-2 text-texto-suave">{e.cargo ?? "—"}</td>
                <td className="py-2 text-right font-mono tabular-nums text-texto">{formatCOP(e.sueldo_basico)}</td>
                <td className="py-2 text-texto-suave">{seguroLabel(e)}</td>
                <td className="py-2 text-texto-tenue">{e.fecha_ingreso ? formatFechaBogota(e.fecha_ingreso) : "—"}</td>
                <td className="py-2">
                  <div className="flex gap-3">
                    <Link href={`/nomina/empleados/${e.id}/editar`} className={linkSuave}>Editar</Link>
                    <RetirarEmpleadoBoton empleadoId={e.id} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
