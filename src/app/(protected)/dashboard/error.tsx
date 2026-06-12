"use client";

import { btnPrimario } from "@/components/ui/estilos";

export default function DashboardError({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="flex flex-col items-start gap-3">
      <p className="text-sm text-texto-tenue">No se pudo cargar el dashboard.</p>
      <button onClick={reset} className={btnPrimario}>
        Reintentar
      </button>
    </div>
  );
}
