import { ImportPreview } from "@/modules/inventario/presentation/import-preview";
import { PageHeader } from "@/components/ui/page-header";

export default function ImportarPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <PageHeader titulo="Importar inventario desde Excel" volverHref="/inventario" volverLabel="Inventario" />
        <p className="mt-2 text-sm text-texto-tenue">
          Columnas: referencia, descripcion, metraje_inicial_m, unidad, umbral_bajo_stock_m (requeridas);
          composicion, color, ancho_m, gramaje_gm2, proveedor, paquetes_rollos, consumo_prenda_m, lote, ubicacion (opcionales).
        </p>
      </div>
      <ImportPreview />
    </div>
  );
}
