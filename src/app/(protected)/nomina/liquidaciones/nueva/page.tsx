import { listarEmpleados } from "@/modules/nomina/application/empleados-actions";
import { listarParametros } from "@/modules/nomina/application/parametros-actions";
import { LiquidacionForm } from "@/modules/nomina/presentation/liquidacion-form";
import { PageHeader } from "@/components/ui/page-header";

export default async function NuevaLiquidacionPage() {
  const [empleados, parametros] = await Promise.all([listarEmpleados(), listarParametros()]);
  return (
    <div className="flex flex-col gap-6">
      <PageHeader titulo="Nueva liquidación" volverHref="/nomina/liquidaciones" volverLabel="Liquidaciones" />
      <LiquidacionForm empleados={empleados} parametros={parametros} />
    </div>
  );
}
