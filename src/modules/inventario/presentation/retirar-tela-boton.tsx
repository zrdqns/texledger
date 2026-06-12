"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { retirarTela } from "../application/telas-actions";
import { btnPeligroTexto } from "@/components/ui/estilos";

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
    <button onClick={onClick} disabled={pending} className={btnPeligroTexto}>
      {pending ? "Retirando…" : "Retirar"}
    </button>
  );
}
