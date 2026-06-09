import Link from "next/link";
import { esBajoStock } from "../domain/stock";
import { BajoStockBadge } from "./bajo-stock-badge";
import type { Tela } from "../domain/tipos";

export function TelasTabla({ telas }: { telas: Tela[] }) {
  if (telas.length === 0) {
    return <p className="text-sm text-zinc-500">No hay telas registradas.</p>;
  }
  return (
    <table className="w-full text-sm [&_td]:pr-4 [&_th]:pr-4">
      <thead className="text-left text-zinc-400">
        <tr className="border-b border-zinc-800">
          <th className="py-2 font-medium">Referencia</th>
          <th className="py-2 font-medium">Descripción</th>
          <th className="py-2 font-medium text-right">Stock (m)</th>
          <th className="py-2 font-medium">Estado</th>
        </tr>
      </thead>
      <tbody>
        {telas.map((t) => (
          <tr key={t.id} className="border-b border-zinc-900 hover:bg-zinc-900/40">
            <td className="py-2">
              <Link href={`/inventario/${t.id}`} className="text-emerald-400 hover:underline">
                {t.referencia}
              </Link>
            </td>
            <td className="py-2 text-zinc-300">{t.descripcion}</td>
            <td className="py-2 text-right tabular-nums text-zinc-200">{t.stock_actual_m}</td>
            <td className="py-2">{esBajoStock(t.stock_actual_m, t.umbral_bajo_stock_m) && <BajoStockBadge />}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
