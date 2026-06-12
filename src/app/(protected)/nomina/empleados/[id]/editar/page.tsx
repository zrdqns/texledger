import { notFound } from "next/navigation";
import { obtenerEmpleado } from "@/modules/nomina/application/empleados-actions";
import { EmpleadoForm } from "@/modules/nomina/presentation/empleado-form";
import { PageHeader } from "@/components/ui/page-header";

export default async function EditarEmpleadoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const empleado = await obtenerEmpleado(id);
  if (!empleado) notFound();
  return (
    <div className="flex flex-col gap-6">
      <PageHeader titulo={`Editar ${empleado.nombre}`} volverHref="/nomina/empleados" volverLabel="Empleados" />
      <EmpleadoForm empleado={empleado} />
    </div>
  );
}
