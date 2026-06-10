import Link from "next/link";
import { listarEmpleados } from "@/modules/nomina/application/empleados-actions";
import { listarParametros } from "@/modules/nomina/application/parametros-actions";
import { LiquidacionForm } from "@/modules/nomina/presentation/liquidacion-form";

export default async function NuevaLiquidacionPage() {
  const [empleados, parametros] = await Promise.all([listarEmpleados(), listarParametros()]);
  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link href="/nomina/liquidaciones" className="text-sm text-zinc-400 hover:text-zinc-100">← Liquidaciones</Link>
        <h2 className="mt-2 text-lg font-semibold text-zinc-100">Nueva liquidación</h2>
      </div>
      <LiquidacionForm empleados={empleados} parametros={parametros} />
    </div>
  );
}
