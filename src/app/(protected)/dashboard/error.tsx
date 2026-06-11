"use client";

export default function DashboardError({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="flex flex-col items-start gap-3">
      <p className="text-sm text-zinc-400">No se pudo cargar el dashboard.</p>
      <button
        onClick={reset}
        className="rounded-md bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-emerald-500"
      >
        Reintentar
      </button>
    </div>
  );
}
