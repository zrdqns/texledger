"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { crearParametro, editarParametro } from "../application/parametros-actions";
import { btnPrimario, input, labelCampo } from "@/components/ui/estilos";
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

  const field = (name: string, label: string, def?: number) => (
    <label className={labelCampo}>
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
      {error && <p className="text-sm text-peligro sm:col-span-2">{error}</p>}
      <div className="sm:col-span-2">
        <button type="submit" disabled={pending} className={btnPrimario}>
          {pending ? "Guardando…" : parametro ? "Guardar cambios" : "Crear parámetros"}
        </button>
      </div>
    </form>
  );
}
