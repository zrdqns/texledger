"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { marcarCumplido, eliminarRecordatorio } from "../application/recordatorios-actions";
import type { ActionResult } from "@/shared/action-result";

export function RecordatorioAcciones({ id, cumplido }: { id: string; cumplido: boolean }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function accion(fn: (id: string) => Promise<ActionResult>, confirmMsg?: string) {
    if (confirmMsg && !confirm(confirmMsg)) return;
    setPending(true);
    const res = await fn(id);
    setPending(false);
    if (!res.ok) { alert(res.message); return; }
    router.refresh();
  }

  return (
    <div className="flex gap-3">
      {!cumplido && (
        <button onClick={() => accion(marcarCumplido)} disabled={pending} className="text-sm text-emerald-400 hover:text-emerald-300 disabled:opacity-50">
          Cumplir
        </button>
      )}
      <button onClick={() => accion(eliminarRecordatorio, "¿Eliminar este recordatorio? Esta acción no se puede deshacer.")} disabled={pending} className="text-sm text-red-400 hover:text-red-300 disabled:opacity-50">
        Eliminar
      </button>
    </div>
  );
}
