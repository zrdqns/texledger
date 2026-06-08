"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { previsualizarImport, confirmarImport } from "../application/import-actions";
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

  const card = "rounded-xl border border-zinc-800 bg-zinc-900/40 p-4";

  return (
    <div className="flex flex-col gap-4">
      <form onSubmit={onPreview} className={`${card} flex items-center gap-3`}>
        <input
          name="archivo"
          type="file"
          accept=".xlsx,.xls"
          required
          className="text-sm text-zinc-300 file:mr-3 file:rounded-md file:border-0 file:bg-zinc-700 file:px-3 file:py-1.5 file:text-zinc-100"
        />
        <button type="submit" disabled={pending} className="rounded-md bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-emerald-500 disabled:opacity-50">
          Previsualizar
        </button>
      </form>

      {error && <p className="text-sm text-red-400">{error}</p>}
      {msg && <p className="text-sm text-emerald-400">{msg}</p>}

      {preview && (
        <div className={`${card} flex flex-col gap-3`}>
          <div className="flex gap-4 text-sm">
            <span className="text-emerald-400">Válidas: {preview.validas.length}</span>
            <span className="text-amber-400">Duplicadas: {preview.duplicadas.length}</span>
            <span className="text-red-400">Inválidas: {preview.invalidas.length}</span>
          </div>

          {preview.duplicadas.length > 0 && (
            <p className="text-xs text-amber-400">
              Duplicadas: {preview.duplicadas.map((d) => `fila ${d.fila} (${d.referencia}, ${d.origen})`).join("; ")}
            </p>
          )}
          {preview.invalidas.length > 0 && (
            <p className="text-xs text-red-400">
              Inválidas: {preview.invalidas.map((d) => `fila ${d.fila}: ${d.motivo}`).join("; ")}
            </p>
          )}

          <button
            onClick={onConfirm}
            disabled={pending || preview.validas.length === 0}
            className="self-start rounded-md bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-500 disabled:opacity-50"
          >
            {pending ? "Importando…" : `Confirmar import (${preview.validas.length})`}
          </button>
        </div>
      )}
    </div>
  );
}
