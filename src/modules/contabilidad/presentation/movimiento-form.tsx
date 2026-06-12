"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { crearIngreso, crearEgreso } from "../application/movimientos-actions";
import { hoyBogota } from "@/shared/fecha";
import { btnPrimario, input, labelCampo } from "@/components/ui/estilos";

type Opcion = { id: string; label: string };

const inputArchivo =
  "text-sm text-texto-suave file:mr-3 file:rounded-lg file:border-0 file:bg-superficie-alta file:px-3 file:py-1.5 file:text-texto";

export function MovimientoForm({
  tipo, cuentas, facturas,
}: {
  tipo: "ingreso" | "egreso";
  cuentas: Opcion[];
  facturas: Opcion[];
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const esEgreso = tipo === "egreso";

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setPending(true);
    const res = esEgreso ? await crearEgreso(new FormData(e.currentTarget)) : await crearIngreso(new FormData(e.currentTarget));
    setPending(false);
    if (!res.ok) { setError(res.message); return; }
    router.push(`/contabilidad/${tipo}s`);
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="grid max-w-2xl gap-4 sm:grid-cols-2">
      <label className={labelCampo}>{esEgreso ? "Fecha de pago *" : "Fecha *"}
        <input name={esEgreso ? "fecha_pago" : "fecha"} type="date" required defaultValue={hoyBogota()} className={input} />
      </label>
      <label className={labelCampo}>Valor (COP) *
        <input name="valor" type="number" min="0" step="any" required className={input} />
      </label>
      <label className={`${labelCampo} sm:col-span-2`}>Concepto *
        <input name="concepto" required className={input} />
      </label>
      <label className={labelCampo}>{esEgreso ? "Banco/Cuenta *" : "Banco/Cuenta"}
        <select name="cuenta_bancaria_id" required={esEgreso} defaultValue="" className={input}>
          <option value="">{esEgreso ? "Selecciona…" : "(ninguna)"}</option>
          {cuentas.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
        </select>
      </label>
      <label className={labelCampo}>Factura (opcional)
        <select name="factura_id" defaultValue="" className={input}>
          <option value="">(ninguna)</option>
          {facturas.map((f) => <option key={f.id} value={f.id}>{f.label}</option>)}
        </select>
      </label>
      <label className={labelCampo}>N.º comprobante
        <input name="numero_comprobante" className={input} />
      </label>
      <label className={labelCampo}>Comprobante (PDF/imagen)
        <input name="archivo" type="file" accept=".pdf,image/*" className={inputArchivo} />
      </label>
      {error && <p className="text-sm text-peligro sm:col-span-2">{error}</p>}
      <div className="sm:col-span-2">
        <button type="submit" disabled={pending} className={btnPrimario}>
          {pending ? "Guardando…" : esEgreso ? "Registrar egreso" : "Registrar ingreso"}
        </button>
      </div>
    </form>
  );
}
