"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { crearFactura } from "../application/facturas-actions";
import { hoyBogota } from "@/shared/fecha";
import { btnPrimario, input, labelCampo } from "@/components/ui/estilos";

const inputArchivo =
  "text-sm text-texto-suave file:mr-3 file:rounded-lg file:border-0 file:bg-superficie-alta file:px-3 file:py-1.5 file:text-texto";

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

  return (
    <form onSubmit={onSubmit} className="grid max-w-2xl gap-4 sm:grid-cols-2">
      <label className={labelCampo}>Tipo *
        <select name="tipo" required className={input}><option value="venta">Venta</option><option value="compra">Compra</option></select>
      </label>
      <label className={labelCampo}>Número *
        <input name="numero" required className={input} />
      </label>
      <label className={labelCampo}>Tercero (cliente/proveedor) *
        <input name="tercero" required className={input} />
      </label>
      <label className={labelCampo}>Fecha emisión *
        <input name="fecha_emision" type="date" required defaultValue={hoyBogota()} className={input} />
      </label>
      <label className={labelCampo}>Valor (COP) *
        <input name="valor" type="number" min="0" step="any" required className={input} />
      </label>
      <label className={labelCampo}>Archivo (PDF/imagen)
        <input name="archivo" type="file" accept=".pdf,image/*" className={inputArchivo} />
      </label>
      <label className={`${labelCampo} sm:col-span-2`}>Nota
        <input name="nota" className={input} />
      </label>
      {error && <p className="text-sm text-peligro sm:col-span-2">{error}</p>}
      <div className="sm:col-span-2">
        <button type="submit" disabled={pending} className={btnPrimario}>
          {pending ? "Guardando…" : "Crear factura"}
        </button>
      </div>
    </form>
  );
}
