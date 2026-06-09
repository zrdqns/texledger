import Link from "next/link";
import { formatFechaBogota } from "@/shared/fecha";
import { SaldoBadge } from "./saldo-badge";
import type { PedidoConTela } from "../domain/tipos";

export function PedidosTabla({ pedidos }: { pedidos: PedidoConTela[] }) {
  if (pedidos.length === 0) return <p className="text-sm text-zinc-500">No hay pedidos.</p>;
  return (
    <table className="w-full text-sm">
      <thead className="text-left text-zinc-400">
        <tr className="border-b border-zinc-800">
          <th className="py-2 font-medium">Fecha</th>
          <th className="py-2 font-medium">Empresa/Cliente</th>
          <th className="py-2 font-medium">Tela</th>
          <th className="py-2 font-medium">Estado</th>
          <th className="py-2 font-medium">Saldo</th>
        </tr>
      </thead>
      <tbody>
        {pedidos.map((p) => (
          <tr key={p.id} className="border-b border-zinc-900 hover:bg-zinc-900/40">
            <td className="py-2 text-zinc-400">{formatFechaBogota(p.fecha)}</td>
            <td className="py-2">
              <Link href={`/pedidos/${p.id}`} className="text-emerald-400 hover:underline">{p.empresa_cliente}</Link>
            </td>
            <td className="py-2 text-zinc-300">{p.tela_referencia}</td>
            <td className="py-2 capitalize text-zinc-300">{p.estado}</td>
            <td className="py-2"><SaldoBadge pedido={p} /></td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
