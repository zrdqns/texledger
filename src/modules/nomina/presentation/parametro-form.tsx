"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { crearParametro, editarParametro } from "../application/parametros-actions";
import type { ParametroNomina } from "../domain/tipos";

export function ParametroForm({ parametro }: { parametro?: ParametroNomina }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setPending(true);
    const fd = new FormData(e.currentTarget);
    const num = (k: string) => Number(fd.get(k));
    const base = {
      anio: num("anio"),
      smmlv: num("smmlv"),
      auxilio_transporte: num("auxilio_transporte"),
      tope_auxilio_smmlv: num("tope_auxilio_smmlv"),
      pct_pension: num("pct_pension"),
      pct_salud: num("pct_salud"),
    };
    const res = parametro ? await editarParametro({ ...base, id: parametro.id }) : await crearParametro(base);
    setPending(false);
    if (!res.ok) { setError(res.message); return; }
    router.push("/nomina/parametros");
    router.refresh();
  }

  const input = "rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-zinc-100 outline-none focus:border-zinc-500";
  const field = (name: string, label: string, def?: number) => (
    <label className="flex flex-col gap-1 text-sm text-zinc-400">
      {label} *
      <input name={name} type="number" step="any" required defaultValue={def} className={input} />
    </label>
  );

  return (
    <form onSubmit={onSubmit} className="grid max-w-2xl gap-4 sm:grid-cols-2">
      {field("anio", "Año", parametro?.anio)}
      {field("smmlv", "SMMLV (COP)", parametro?.smmlv)}
      {field("auxilio_transporte", "Auxilio de transporte (COP)", parametro?.auxilio_transporte)}
      {field("tope_auxilio_smmlv", "Tope auxilio (SMMLV)", parametro?.tope_auxilio_smmlv)}
      {field("pct_pension", "% Pensión", parametro?.pct_pension)}
      {field("pct_salud", "% Salud", parametro?.pct_salud)}
      {error && <p className="text-sm text-red-400 sm:col-span-2">{error}</p>}
      <div className="sm:col-span-2">
        <button type="submit" disabled={pending} className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500 disabled:opacity-50">
          {pending ? "Guardando…" : parametro ? "Guardar cambios" : "Crear parámetros"}
        </button>
      </div>
    </form>
  );
}
