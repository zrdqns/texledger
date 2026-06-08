"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { retirarTela } from "../application/telas-actions";

export function RetirarTelaBoton({ telaId }: { telaId: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function onClick() {
    if (!confirm("¿Retirar esta tela del catálogo? No se borra su historial.")) return;
    setPending(true);
    const res = await retirarTela(telaId);
    setPending(false);
    if (!res.ok) {
      alert(res.message);
      return;
    }
    router.push("/inventario");
    router.refresh();
  }

  return (
    <button onClick={onClick} disabled={pending} className="text-sm text-red-400 hover:text-red-300 disabled:opacity-50">
      {pending ? "Retirando…" : "Retirar"}
    </button>
  );
}
