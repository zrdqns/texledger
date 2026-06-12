"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { previsualizarImport, confirmarImport } from "../application/import-actions";
import { btnPrimario, card } from "@/components/ui/estilos";
import type { ResultadoClasificacion } from "../application/import-classify";

export function ImportPreview() {
  const router = useRouter();
  const [preview, setPreview] = useState<ResultadoClasificacion | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onPreview(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setMsg(null);
    setPending(true);
    const res = await previsualizarImport(new FormData(e.currentTarget));
    setPending(false);
    if (!res.ok) {
      setError(res.message);
      setPreview(null);
      return;
    }
    setPreview(res.data);
  }

  async function onConfirm() {
    if (!preview) return;
    setPending(true);
    setError(null);
    const res = await confirmarImport(preview.validas);
    setPending(false);
    if (!res.ok) {
      setError(res.message);
      return;
    }
    setMsg(`Importadas ${res.data.creadas} telas.`);
    setPreview(null);
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-4">
      <form onSubmit={onPreview} className={`${card} flex items-center gap-3`}>
        <input
          name="archivo"
          type="file"
          accept=".xlsx,.xls"
          required
          className="text-sm text-texto-suave file:mr-3 file:rounded-lg file:border-0 file:bg-superficie-alta file:px-3 file:py-1.5 file:text-texto"
        />
        <button type="submit" disabled={pending} className={btnPrimario}>
          Previsualizar
        </button>
      </form>

      {error && <p className="text-sm text-peligro">{error}</p>}
      {msg && <p className="text-sm text-emerald-400">{msg}</p>}

      {preview && (
        <div className={`${card} flex flex-col gap-3`}>
          <div className="flex gap-4 text-sm">
            <span className="text-emerald-400">Válidas: {preview.validas.length}</span>
            <span className="text-acento">Duplicadas: {preview.duplicadas.length}</span>
            <span className="text-peligro">Inválidas: {preview.invalidas.length}</span>
          </div>

          {preview.duplicadas.length > 0 && (
            <p className="text-xs text-acento">
              Duplicadas: {preview.duplicadas.map((d) => `fila ${d.fila} (${d.referencia}, ${d.origen})`).join("; ")}
            </p>
          )}
          {preview.invalidas.length > 0 && (
            <p className="text-xs text-peligro">
              Inválidas: {preview.invalidas.map((d) => `fila ${d.fila}: ${d.motivo}`).join("; ")}
            </p>
          )}

          <button
            onClick={onConfirm}
            disabled={pending || preview.validas.length === 0}
            className={`self-start ${btnPrimario}`}
          >
            {pending ? "Importando…" : `Confirmar import (${preview.validas.length})`}
          </button>
        </div>
      )}
    </div>
  );
}
