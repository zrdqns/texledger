"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { crearIngreso, crearEgreso } from "../application/movimientos-actions";
import { hoyBogota } from "@/shared/fecha";

type Opcion = { id: string; label: string };

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

  const input = "rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-zinc-100 outline-none focus:border-zinc-500";
  return (
    <form onSubmit={onSubmit} className="grid max-w-2xl gap-4 sm:grid-cols-2">
      <label className="flex flex-col gap-1 text-sm text-zinc-400">{esEgreso ? "Fecha de pago *" : "Fecha *"}
        <input name={esEgreso ? "fecha_pago" : "fecha"} type="date" required defaultValue={hoyBogota()} className={input} />
      </label>
      <label className="flex flex-col gap-1 text-sm text-zinc-400">Valor (COP) *
        <input name="valor" type="number" min="0" step="any" required className={input} />
      </label>
      <label className="flex flex-col gap-1 text-sm text-zinc-400 sm:col-span-2">Concepto *
        <input name="concepto" required className={input} />
      </label>
      <label className="flex flex-col gap-1 text-sm text-zinc-400">{esEgreso ? "Banco/Cuenta *" : "Banco/Cuenta"}
        <select name="cuenta_bancaria_id" required={esEgreso} defaultValue="" className={input}>
          <option value="">{esEgreso ? "Selecciona…" : "(ninguna)"}</option>
          {cuentas.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
        </select>
      </label>
      <label className="flex flex-col gap-1 text-sm text-zinc-400">Factura (opcional)
        <select name="factura_id" defaultValue="" className={input}>
          <option value="">(ninguna)</option>
          {facturas.map((f) => <option key={f.id} value={f.id}>{f.label}</option>)}
        </select>
      </label>
      <label className="flex flex-col gap-1 text-sm text-zinc-400">N.º comprobante
        <input name="numero_comprobante" className={input} />
      </label>
      <label className="flex flex-col gap-1 text-sm text-zinc-400">Comprobante (PDF/imagen)
        <input name="archivo" type="file" accept=".pdf,image/*" className="text-sm text-zinc-300 file:mr-3 file:rounded-md file:border-0 file:bg-zinc-700 file:px-3 file:py-1.5 file:text-zinc-100" />
      </label>
      {error && <p className="text-sm text-red-400 sm:col-span-2">{error}</p>}
      <div className="sm:col-span-2">
        <button type="submit" disabled={pending} className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500 disabled:opacity-50">
          {pending ? "Guardando…" : esEgreso ? "Registrar egreso" : "Registrar ingreso"}
        </button>
      </div>
    </form>
  );
}
