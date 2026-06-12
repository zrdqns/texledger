"use client";

import { btnPrimario } from "@/components/ui/estilos";

export function ImprimirBoton() {
  return (
    <button onClick={() => window.print()} className={btnPrimario}>
      Imprimir
    </button>
  );
}
