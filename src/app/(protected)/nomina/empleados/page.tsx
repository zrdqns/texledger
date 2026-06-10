import Link from "next/link";
import { listarEmpleados } from "@/modules/nomina/application/empleados-actions";
import { formatCOP } from "@/shared/cop";
import { formatFechaBogota } from "@/shared/fecha";
import { RetirarEmpleadoBoton } from "@/modules/nomina/presentation/retirar-empleado-boton";
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
      <div className="flex items-center justify-between">
        <div>
          <Link href="/nomina" className="text-sm text-zinc-400 hover:text-zinc-100">← Nómina</Link>
          <h2 className="mt-2 text-lg font-semibold text-zinc-100">Empleados</h2>
        </div>
        <Link href="/nomina/empleados/nuevo" className="rounded-md bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-emerald-500">Nuevo empleado</Link>
      </div>
      {empleados.length === 0 ? (
        <p className="text-sm text-zinc-500">No hay empleados activos.</p>
      ) : (
        <table className="w-full text-sm [&_td]:pr-4 [&_th]:pr-4">
          <thead className="text-left text-zinc-400">
            <tr className="border-b border-zinc-800">
              <th className="py-2 font-medium">Nombre</th>
              <th className="py-2 font-medium">Documento</th>
              <th className="py-2 font-medium">Cargo</th>
              <th className="py-2 font-medium text-right">Sueldo básico</th>
              <th className="py-2 font-medium">Seguro</th>
              <th className="py-2 font-medium">Ingreso</th>
              <th className="py-2 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {empleados.map((e) => (
              <tr key={e.id} className="border-b border-zinc-900">
                <td className="py-2 text-zinc-200">{e.nombre}</td>
                <td className="py-2 text-zinc-400">{e.documento ?? "—"}</td>
                <td className="py-2 text-zinc-300">{e.cargo ?? "—"}</td>
                <td className="py-2 text-right tabular-nums text-zinc-200">{formatCOP(e.sueldo_basico)}</td>
                <td className="py-2 text-zinc-300">{seguroLabel(e)}</td>
                <td className="py-2 text-zinc-400">{e.fecha_ingreso ? formatFechaBogota(e.fecha_ingreso) : "—"}</td>
                <td className="py-2">
                  <div className="flex gap-3">
                    <Link href={`/nomina/empleados/${e.id}/editar`} className="text-zinc-400 hover:text-zinc-100">Editar</Link>
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
