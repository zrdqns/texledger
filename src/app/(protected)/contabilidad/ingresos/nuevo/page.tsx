import { listarCuentas } from "@/modules/contabilidad/application/cuentas-actions";
import { listarFacturas } from "@/modules/contabilidad/application/facturas-actions";
import { MovimientoForm } from "@/modules/contabilidad/presentation/movimiento-form";
import { PageHeader } from "@/components/ui/page-header";

export default async function NuevoIngresoPage() {
  const [cuentas, facturas] = await Promise.all([
    listarCuentas(),
    listarFacturas({ tipo: "venta", estado: "pendiente" }),
  ]);
  return (
    <div className="flex flex-col gap-6">
      <PageHeader titulo="Nuevo ingreso" volverHref="/contabilidad/ingresos" volverLabel="Ingresos" />
      <MovimientoForm
        tipo="ingreso"
        cuentas={cuentas.map((c) => ({ id: c.id, label: `${c.banco} · ${c.nombre}` }))}
        facturas={facturas.map((f) => ({ id: f.id, label: `${f.numero} — ${f.tercero}` }))}
      />
    </div>
  );
}
