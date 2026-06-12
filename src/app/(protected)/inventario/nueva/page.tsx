import { TelaForm } from "@/modules/inventario/presentation/tela-form";
import { PageHeader } from "@/components/ui/page-header";

export default function NuevaTelaPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader titulo="Nueva tela" volverHref="/inventario" volverLabel="Inventario" />
      <TelaForm />
    </div>
  );
}
