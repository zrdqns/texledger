import Link from "next/link";
import { ImportPreview } from "@/modules/inventario/presentation/import-preview";

export default function ImportarPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link href="/inventario" className="text-sm text-zinc-400 hover:text-zinc-100">← Inventario</Link>
        <h2 className="mt-2 text-lg font-semibold text-zinc-100">Importar inventario desde Excel</h2>
        <p className="text-sm text-zinc-400">
          Columnas: referencia, descripcion, metraje_inicial_m, unidad, umbral_bajo_stock_m (requeridas);
          composicion, color, ancho_m, gramaje_gm2, proveedor, paquetes_rollos, consumo_prenda_m, lote, ubicacion (opcionales).
        </p>
      </div>
      <ImportPreview />
    </div>
  );
}
