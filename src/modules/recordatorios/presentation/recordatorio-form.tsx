"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { crearRecordatorio } from "../application/recordatorios-actions";
import { TIPO_LABEL } from "./labels";
import { btnPrimario, input, labelCampo } from "@/components/ui/estilos";
import type { RecordatorioTipo } from "../domain/tipos";

type FacturaOpcion = { id: string; numero: string; tercero: string };

export function RecordatorioForm({ facturas }: { facturas: FacturaOpcion[] }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setPending(true);
    const fd = new FormData(e.currentTarget);
    const facturaId = (fd.get("factura_id") as string) || undefined;
    const res = await crearRecordatorio({
      tipo: fd.get("tipo") as RecordatorioTipo,
      descripcion: (fd.get("descripcion") as string)?.trim(),
      fecha_objetivo: fd.get("fecha_objetivo") as string,
      factura_id: facturaId,
    });
    setPending(false);
    if (!res.ok) { setError(res.message); return; }
    router.push("/recordatorios");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="grid max-w-2xl gap-4 sm:grid-cols-2">
      <label className={labelCampo}>Tipo *
        <select name="tipo" required defaultValue="pago_pendiente" className={input}>
          {(Object.keys(TIPO_LABEL) as RecordatorioTipo[]).map((t) => (
            <option key={t} value={t}>{TIPO_LABEL[t]}</option>
          ))}
        </select>
      </label>
      <label className={labelCampo}>Fecha objetivo *
        <input name="fecha_objetivo" type="date" required className={input} />
      </label>
      <label className={`${labelCampo} sm:col-span-2`}>Descripción *
        <input name="descripcion" required className={input} />
      </label>
      <label className={`${labelCampo} sm:col-span-2`}>Factura (opcional)
        <select name="factura_id" defaultValue="" className={input}>
          <option value="">Ninguna</option>
          {facturas.map((f) => (
            <option key={f.id} value={f.id}>{f.numero} — {f.tercero}</option>
          ))}
        </select>
      </label>
      {error && <p className="text-sm text-peligro sm:col-span-2">{error}</p>}
      <div className="sm:col-span-2">
        <button type="submit" disabled={pending} className={btnPrimario}>
          {pending ? "Guardando…" : "Crear recordatorio"}
        </button>
      </div>
    </form>
  );
}
