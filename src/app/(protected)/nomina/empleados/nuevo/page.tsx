import Link from "next/link";
import { EmpleadoForm } from "@/modules/nomina/presentation/empleado-form";

export default function NuevoEmpleadoPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link href="/nomina/empleados" className="text-sm text-zinc-400 hover:text-zinc-100">← Empleados</Link>
        <h2 className="mt-2 text-lg font-semibold text-zinc-100">Nuevo empleado</h2>
      </div>
      <EmpleadoForm />
    </div>
  );
}
