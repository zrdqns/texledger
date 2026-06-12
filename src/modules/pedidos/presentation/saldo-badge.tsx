import { badgeNeutro, badgeOk, badgePeligro } from "@/components/ui/estilos";
import type { Pedido } from "../domain/tipos";

export function SaldoBadge({ pedido }: { pedido: Pedido }) {
  if (pedido.saldo_tela_m == null) return <span className="text-xs text-texto-tenue">—</span>;
  const s = pedido.saldo_tela_m;
  if (s > 0) return <span className={badgeOk}>Queda {s} m</span>;
  if (s === 0) return <span className={badgeNeutro}>Exacto</span>;
  return <span className={badgePeligro}>Déficit {Math.abs(s)} m</span>;
}
