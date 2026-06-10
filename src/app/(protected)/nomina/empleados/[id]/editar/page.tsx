import Link from "next/link";
import { notFound } from "next/navigation";
import { obtenerEmpleado } from "@/modules/nomina/application/empleados-actions";
import { EmpleadoForm } from "@/modules/nomina/presentation/empleado-form";

export default async function EditarEmpleadoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const empleado = await obtenerEmpleado(id);
  if (!empleado) notFound();
  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link href="/nomina/empleados" className="text-sm text-zinc-400 hover:text-zinc-100">← Empleados</Link>
        <h2 className="mt-2 text-lg font-semibold text-zinc-100">Editar {empleado.nombre}</h2>
      </div>
      <EmpleadoForm empleado={empleado} />
    </div>
  );
}
