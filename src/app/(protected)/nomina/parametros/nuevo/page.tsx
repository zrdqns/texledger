import { ParametroForm } from "@/modules/nomina/presentation/parametro-form";
import { PageHeader } from "@/components/ui/page-header";

export default function NuevoParametroPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader titulo="Nuevos parámetros de año" volverHref="/nomina/parametros" volverLabel="Parámetros" />
      <ParametroForm />
    </div>
  );
}
