"use client";

export function ImprimirBoton() {
  return (
    <button
      onClick={() => window.print()}
      className="rounded-md bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-emerald-500"
    >
      Imprimir
    </button>
  );
}
