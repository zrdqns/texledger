"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { crearFactura } from "../application/facturas-actions";
import { hoyBogota } from "@/shared/fecha";

export function FacturaForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setPending(true);
    const res = await crearFactura(new FormData(e.currentTarget));
    setPending(false);
    if (!res.ok) { setError(res.message); return; }
    router.push("/contabilidad/facturas");
    router.refresh();
  }

  const input = "rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-zinc-100 outline-none focus:border-zinc-500";
  return (
    <form onSubmit={onSubmit} className="grid max-w-2xl gap-4 sm:grid-cols-2">
      <label className="flex flex-col gap-1 text-sm text-zinc-400">Tipo *
        <select name="tipo" required className={input}><option value="venta">Venta</option><option value="compra">Compra</option></select>
      </label>
      <label className="flex flex-col gap-1 text-sm text-zinc-400">Número *
        <input name="numero" required className={input} />
      </label>
      <label className="flex flex-col gap-1 text-sm text-zinc-400">Tercero (cliente/proveedor) *
        <input name="tercero" required className={input} />
      </label>
      <label className="flex flex-col gap-1 text-sm text-zinc-400">Fecha emisión *
        <input name="fecha_emision" type="date" required defaultValue={hoyBogota()} className={input} />
      </label>
      <label className="flex flex-col gap-1 text-sm text-zinc-400">Valor (COP) *
        <input name="valor" type="number" min="0" step="any" required className={input} />
      </label>
      <label className="flex flex-col gap-1 text-sm text-zinc-400">Archivo (PDF/imagen)
        <input name="archivo" type="file" accept=".pdf,image/*" className="text-sm text-zinc-300 file:mr-3 file:rounded-md file:border-0 file:bg-zinc-700 file:px-3 file:py-1.5 file:text-zinc-100" />
      </label>
      <label className="flex flex-col gap-1 text-sm text-zinc-400 sm:col-span-2">Nota
        <input name="nota" className={input} />
      </label>
      {error && <p className="text-sm text-red-400 sm:col-span-2">{error}</p>}
      <div className="sm:col-span-2">
        <button type="submit" disabled={pending} className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500 disabled:opacity-50">
          {pending ? "Guardando…" : "Crear factura"}
        </button>
      </div>
    </form>
  );
}
