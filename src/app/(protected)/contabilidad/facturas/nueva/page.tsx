import { FacturaForm } from "@/modules/contabilidad/presentation/factura-form";
import { PageHeader } from "@/components/ui/page-header";

export default function NuevaFacturaPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader titulo="Nueva factura" volverHref="/contabilidad/facturas" volverLabel="Facturas" />
      <FacturaForm />
    </div>
  );
}
