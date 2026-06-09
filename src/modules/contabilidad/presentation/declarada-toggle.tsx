"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { alternarDeclarada } from "../application/facturas-actions";

export function DeclaradaToggle({ id, declarada }: { id: string; declarada: boolean }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  async function toggle() {
    setPending(true);
    await alternarDeclarada(id, !declarada);
    setPending(false);
    router.refresh();
  }
  return (
    <button onClick={toggle} disabled={pending} className={`rounded-full px-2 py-0.5 text-xs ${declarada ? "bg-emerald-500/15 text-emerald-400" : "bg-amber-500/15 text-amber-400"}`}>
      {declarada ? "Declarada" : "Sin declarar"}
    </button>
  );
}
