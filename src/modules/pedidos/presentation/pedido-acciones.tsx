"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { confirmarPedido, anularPedido, cerrarPedido } from "../application/pedidos-actions";
import type { EstadoPedido } from "../domain/tipos";

export function PedidoAcciones({ id, estado }: { id: string; estado: EstadoPedido }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function run(fn: () => Promise<{ ok: boolean; message?: string }>, confirmMsg?: string) {
    if (confirmMsg && !confirm(confirmMsg)) return;
    setError(null);
    setPending(true);
    const res = await fn();
    setPending(false);
    if (!res.ok) { setError(res.message ?? "Error"); return; }
    router.refresh();
  }

  const btn = "rounded-md px-3 py-1.5 text-sm font-medium disabled:opacity-50";

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2">
        {estado === "borrador" && (
          <button disabled={pending} onClick={() => run(() => confirmarPedido(id))} className={`${btn} bg-emerald-600 text-white hover:bg-emerald-500`}>Confirmar</button>
        )}
        {estado === "confirmado" && (
          <>
            <button disabled={pending} onClick={() => run(() => cerrarPedido(id))} className={`${btn} border border-zinc-700 text-zinc-300 hover:bg-zinc-800`}>Cerrar</button>
            <button disabled={pending} onClick={() => run(() => anularPedido(id), "¿Anular el pedido? Se revertirá el consumo al stock.")} className={`${btn} text-red-400 hover:text-red-300`}>Anular</button>
          </>
        )}
      </div>
      {error && <p className="text-sm text-red-400">{error}</p>}
    </div>
  );
}
