import type { Pedido } from "../domain/tipos";

export function SaldoBadge({ pedido }: { pedido: Pedido }) {
  if (pedido.saldo_tela_m == null) return <span className="text-xs text-zinc-500">—</span>;
  const s = pedido.saldo_tela_m;
  if (s > 0) return <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-xs text-emerald-400">Queda {s} m</span>;
  if (s === 0) return <span className="rounded-full bg-zinc-500/15 px-2 py-0.5 text-xs text-zinc-300">Exacto</span>;
  return <span className="rounded-full bg-red-500/15 px-2 py-0.5 text-xs text-red-400">Déficit {Math.abs(s)} m</span>;
}
