"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { alternarDeclarada } from "../application/facturas-actions";
import { badgeAcento, badgeOk } from "@/components/ui/estilos";

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
    <button onClick={toggle} disabled={pending} className={declarada ? badgeOk : badgeAcento}>
      {declarada ? "Declarada" : "Sin declarar"}
    </button>
  );
}
