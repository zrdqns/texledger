import { ReceiptText, SlidersHorizontal, Users } from "lucide-react";
import { listarEmpleados } from "@/modules/nomina/application/empleados-actions";
import { listarLiquidaciones } from "@/modules/nomina/application/liquidaciones-actions";
import { listarParametros } from "@/modules/nomina/application/parametros-actions";
import { PageHeader } from "@/components/ui/page-header";
import { HubCard } from "@/components/ui/hub-card";

export default async function NominaPage() {
  const [empleados, liquidaciones, parametros] = await Promise.all([
    listarEmpleados(),
    listarLiquidaciones(),
    listarParametros(),
  ]);
  const anioVigente = parametros[0]?.anio;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader titulo="Nómina" subtitulo="Empleados, liquidaciones mensuales y parámetros legales" />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <HubCard
          href="/nomina/empleados"
          icono={Users}
          titulo="Empleados"
          descripcion="Equipo en nómina con sueldo básico, seguro y fecha de ingreso."
          stat={String(empleados.length)}
          statLabel={empleados.length === 1 ? "activo" : "activos"}
        />
        <HubCard
          href="/nomina/liquidaciones"
          icono={ReceiptText}
          titulo="Liquidaciones"
          descripcion="Cálculo mensual de devengado, deducciones y neto pagado."
          stat={String(liquidaciones.length)}
          statLabel={liquidaciones.length === 1 ? "registrada" : "registradas"}
        />
        <HubCard
          href="/nomina/parametros"
          icono={SlidersHorizontal}
          titulo="Parámetros"
          descripcion="SMMLV, auxilio de transporte y porcentajes legales por año."
          stat={anioVigente ? String(anioVigente) : "—"}
          statLabel={anioVigente ? "año vigente" : "sin configurar"}
        />
      </div>
    </div>
  );
}
