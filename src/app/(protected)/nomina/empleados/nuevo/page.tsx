import { EmpleadoForm } from "@/modules/nomina/presentation/empleado-form";
import { PageHeader } from "@/components/ui/page-header";

export default function NuevoEmpleadoPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader titulo="Nuevo empleado" volverHref="/nomina/empleados" volverLabel="Empleados" />
      <EmpleadoForm />
    </div>
  );
}
