"use client";

import { useState } from "react";
import { obtenerUrlArchivo } from "../application/archivos-actions";

export function VerArchivo({ path }: { path: string | null }) {
  const [pending, setPending] = useState(false);
  if (!path) return <span className="text-texto-tenue">—</span>;
  async function abrir() {
    setPending(true);
    const res = await obtenerUrlArchivo(path!);
    setPending(false);
    if (res.ok) window.open(res.data.url, "_blank");
  }
  return (
    <button onClick={abrir} disabled={pending} className="text-primario-claro hover:underline disabled:opacity-50">
      {pending ? "…" : "Ver"}
    </button>
  );
}
