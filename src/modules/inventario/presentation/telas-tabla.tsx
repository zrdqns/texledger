import Link from "next/link";
import { Layers } from "lucide-react";
import { esBajoStock } from "../domain/stock";
import { BajoStockBadge } from "./bajo-stock-badge";
import { badgeOk, filaTabla, tabla, theadFila, thCelda } from "@/components/ui/estilos";
import type { Tela } from "../domain/tipos";

export function TelasTabla({ telas }: { telas: Tela[] }) {
  if (telas.length === 0) {
    return <p className="py-3 text-sm text-texto-tenue">No hay telas registradas.</p>;
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
          <tr key={t.id} className={filaTabla}>
            <td className="py-2.5">
              <Link href={`/inventario/${t.id}`} className="flex items-center gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-superficie-alta text-texto-tenue">
                  <Layers className="h-4 w-4" aria-hidden />
                </span>
                <span className="font-medium text-primario-claro hover:underline">{t.referencia}</span>
              </Link>
            </td>
            <td className="py-2.5 text-texto-suave">{t.descripcion}</td>
            <td className="py-2.5 text-right font-mono tabular-nums text-texto">{t.stock_actual_m}</td>
            <td className="py-2.5">
              {esBajoStock(t.stock_actual_m, t.umbral_bajo_stock_m) ? <BajoStockBadge /> : <span className={badgeOk}>Óptimo</span>}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
