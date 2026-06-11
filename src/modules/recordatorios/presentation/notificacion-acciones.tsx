"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { marcarLeida, marcarTodasLeidas, generarNotificacionesAhora } from "../application/notificaciones-actions";

export function MarcarLeidaBoton({ id }: { id: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function onClick() {
    setPending(true);
    const res = await marcarLeida(id);
    setPending(false);
    if (!res.ok) { alert(res.message); return; }
    router.refresh();
  }

  return (
    <button onClick={onClick} disabled={pending} className="text-sm text-zinc-400 hover:text-zinc-100 disabled:opacity-50">
      {pending ? "…" : "Marcar leída"}
    </button>
  );
}

export function NotificacionesToolbar({ hayNoLeidas }: { hayNoLeidas: boolean }) {
  const router = useRouter();
  const [pending, setPending] = useState<"generar" | "todas" | null>(null);

  async function onGenerar() {
    setPending("generar");
    const res = await generarNotificacionesAhora();
    setPending(null);
    if (!res.ok) { alert(res.message); return; }
    router.refresh();
  }

  async function onTodas() {
    setPending("todas");
    const res = await marcarTodasLeidas();
    setPending(null);
    if (!res.ok) { alert(res.message); return; }
    router.refresh();
  }

  return (
    <div className="flex gap-3">
      <button onClick={onGenerar} disabled={pending !== null} className="rounded-md border border-zinc-700 px-3 py-1.5 text-sm text-zinc-300 hover:bg-zinc-800 disabled:opacity-50">
        {pending === "generar" ? "Generando…" : "Generar ahora"}
      </button>
      {hayNoLeidas && (
        <button onClick={onTodas} disabled={pending !== null} className="rounded-md border border-zinc-700 px-3 py-1.5 text-sm text-zinc-300 hover:bg-zinc-800 disabled:opacity-50">
          {pending === "todas" ? "Marcando…" : "Marcar todas leídas"}
        </button>
      )}
    </div>
  );
}
