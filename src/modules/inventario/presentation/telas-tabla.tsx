import Link from "next/link";
import { esBajoStock } from "../domain/stock";
import { BajoStockBadge } from "./bajo-stock-badge";
import { tabla, theadFila, thCelda } from "@/components/ui/estilos";
import type { Tela } from "../domain/tipos";

export function TelasTabla({ telas }: { telas: Tela[] }) {
  if (telas.length === 0) {
    return <p className="text-sm text-texto-tenue">No hay telas registradas.</p>;
  }
  return (
    <table className={tabla}>
      <thead className={theadFila}>
        <tr>
          <th className={thCelda}>Referencia</th>
          <th className={thCelda}>Descripción</th>
          <th className={`${thCelda} text-right`}>Stock (m)</th>
          <th className={thCelda}>Estado</th>
        </tr>
      </thead>
      <tbody>
        {telas.map((t) => (
          <tr key={t.id} className="border-b border-borde/30 hover:bg-superficie">
            <td className="py-2">
              <Link href={`/inventario/${t.id}`} className="text-primario-claro hover:underline">
                {t.referencia}
              </Link>
            </td>
            <td className="py-2 text-texto-suave">{t.descripcion}</td>
            <td className="py-2 text-right font-mono tabular-nums text-texto">{t.stock_actual_m}</td>
            <td className="py-2">{esBajoStock(t.stock_actual_m, t.umbral_bajo_stock_m) && <BajoStockBadge />}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
