import Link from "next/link";
import { formatFechaBogota } from "@/shared/fecha";
import { SaldoBadge } from "./saldo-badge";
import { Avatar } from "@/components/ui/avatar";
import { filaTabla, tabla, theadFila, thCelda } from "@/components/ui/estilos";
import type { PedidoConTela } from "../domain/tipos";

export function PedidosTabla({ pedidos }: { pedidos: PedidoConTela[] }) {
  if (pedidos.length === 0) return <p className="py-3 text-sm text-texto-tenue">No hay pedidos.</p>;
  return (
    <table className={tabla}>
      <thead className={theadFila}>
        <tr>
          <th className={thCelda}>Fecha</th>
          <th className={thCelda}>Empresa/Cliente</th>
          <th className={thCelda}>Tela</th>
          <th className={thCelda}>Estado</th>
          <th className={thCelda}>Saldo</th>
        </tr>
      </thead>
      <tbody>
        {pedidos.map((p) => (
          <tr key={p.id} className={filaTabla}>
            <td className="py-2.5 text-texto-tenue">{formatFechaBogota(p.fecha)}</td>
            <td className="py-2.5">
              <Link href={`/pedidos/${p.id}`} className="flex items-center gap-3">
                <Avatar nombre={p.empresa_cliente} />
                <span className="font-medium text-texto group-hover:text-primario-claro hover:text-primario-claro hover:underline">{p.empresa_cliente}</span>
              </Link>
            </td>
            <td className="py-2.5 text-texto-suave">{p.tela_referencia}</td>
            <td className="py-2.5 capitalize text-texto-suave">{p.estado}</td>
            <td className="py-2.5"><SaldoBadge pedido={p} /></td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
