"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { crearLiquidacion } from "../application/liquidaciones-actions";
import { calcularLiquidacion, type DesgloseLiquidacion } from "../domain/liquidacion";
import type { Empleado, ParametroNomina } from "../domain/tipos";
import { MESES } from "./meses";
import { formatCOP } from "@/shared/cop";
import { hoyBogota } from "@/shared/fecha";

export function LiquidacionForm({ empleados, parametros }: { empleados: Empleado[]; parametros: ParametroNomina[] }) {
  const router = useRouter();
  const hoy = hoyBogota();
  const [empleadoId, setEmpleadoId] = useState("");
  const [anio, setAnio] = useState(hoy.slice(0, 4));
  const [mes, setMes] = useState(String(Number(hoy.slice(5, 7))));
  const [dias, setDias] = useState("30");
  const [incapDias, setIncapDias] = useState("0");
  const [licDias, setLicDias] = useState("0");
  const [ajuste, setAjuste] = useState("0");
  const [libranzas, setLibranzas] = useState("0");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const empleado = empleados.find((emp) => emp.id === empleadoId);
  const parametro = parametros.find((p) => p.anio === Number(anio));
  const nDias = Number(dias);

  let preview: DesgloseLiquidacion | null = null;
  if (empleado && parametro && nDias > 0 && nDias <= 30) {
    preview = calcularLiquidacion(
      {
        sueldo_basico: empleado.sueldo_basico,
        dias_laborados: nDias,
        ajuste: Number(ajuste) || 0,
        libranzas: Number(libranzas) || 0,
        seguro_tipo: empleado.seguro_tipo,
        seguro_valor: empleado.seguro_valor,
      },
      parametro,
    );
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setPending(true);
    const res = await crearLiquidacion({
      empleado_id: empleadoId,
      periodo_anio: Number(anio),
      periodo_mes: Number(mes),
      dias_laborados: nDias,
      incapacidades_dias: Number(incapDias) || 0,
      licencias_dias: Number(licDias) || 0,
      ajuste_incap_licencia_valor: Number(ajuste) || 0,
      libranzas: Number(libranzas) || 0,
    });
    setPending(false);
    if (!res.ok) { setError(res.message); return; }
    router.push(`/nomina/liquidaciones/${res.data.id}`);
    router.refresh();
  }

  const input = "rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-zinc-100 outline-none focus:border-zinc-500";
  const label = "flex flex-col gap-1 text-sm text-zinc-400";

  return (
    <div className="grid max-w-4xl gap-8 lg:grid-cols-2">
      <form onSubmit={onSubmit} className="grid content-start gap-4 sm:grid-cols-2">
        <label className={`${label} sm:col-span-2`}>
          Empleado *
          <select required value={empleadoId} onChange={(e) => setEmpleadoId(e.target.value)} className={input}>
            <option value="">Selecciona…</option>
            {empleados.map((emp) => (
              <option key={emp.id} value={emp.id}>{emp.nombre} — {formatCOP(emp.sueldo_basico)}</option>
            ))}
          </select>
        </label>
        <label className={label}>Año *
          <input type="number" required value={anio} onChange={(e) => setAnio(e.target.value)} className={input} />
        </label>
        <label className={label}>Mes *
          <select required value={mes} onChange={(e) => setMes(e.target.value)} className={input}>
            {MESES.map((m, i) => (
              <option key={m} value={i + 1}>{m}</option>
            ))}
          </select>
        </label>
        <label className={label}>Días laborados *
          <input type="number" step="any" min="0.5" max="30" required value={dias} onChange={(e) => setDias(e.target.value)} className={input} />
        </label>
        <label className={label}>Libranzas (COP)
          <input type="number" step="any" min="0" value={libranzas} onChange={(e) => setLibranzas(e.target.value)} className={input} />
        </label>
        <label className={label}>Incapacidades (días)
          <input type="number" step="any" min="0" value={incapDias} onChange={(e) => setIncapDias(e.target.value)} className={input} />
        </label>
        <label className={label}>Licencias (días)
          <input type="number" step="any" min="0" value={licDias} onChange={(e) => setLicDias(e.target.value)} className={input} />
        </label>
        <label className={`${label} sm:col-span-2`}>
          Ajuste por incapacidades/licencias (COP, puede ser negativo)
          <input type="number" step="any" value={ajuste} onChange={(e) => setAjuste(e.target.value)} className={input} />
        </label>
        {error && <p className="text-sm text-red-400 sm:col-span-2">{error}</p>}
        <div className="sm:col-span-2">
          <button type="submit" disabled={pending || !preview} className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500 disabled:opacity-50">
            {pending ? "Guardando…" : "Crear liquidación"}
          </button>
        </div>
      </form>

      <aside className="h-fit rounded-xl border border-zinc-800 bg-zinc-900/40 p-5">
        <h3 className="text-sm font-semibold text-zinc-300">Previsualización</h3>
        {!empleado ? (
          <p className="mt-3 text-sm text-zinc-500">Selecciona un empleado.</p>
        ) : !parametro ? (
          <p className="mt-3 text-sm text-amber-400">No hay parámetros para el año {anio}: créalos en Parámetros.</p>
        ) : !preview ? (
          <p className="mt-3 text-sm text-zinc-500">Ingresa los días laborados (1 a 30).</p>
        ) : (
          <dl className="mt-3 flex flex-col gap-1 text-sm [&>div]:flex [&>div]:items-baseline [&>div]:justify-between">
            <div><dt className="text-zinc-400">Sueldo proporcional</dt><dd className="tabular-nums text-zinc-200">{formatCOP(preview.sueldo_prop)}</dd></div>
            <div><dt className="text-zinc-400">Auxilio de transporte</dt><dd className="tabular-nums text-zinc-200">{formatCOP(preview.auxilio_prop)}</dd></div>
            <div><dt className="text-zinc-400">Ajuste incap./licencias</dt><dd className="tabular-nums text-zinc-200">{formatCOP(Number(ajuste) || 0)}</dd></div>
            <div className="border-t border-zinc-800 pt-1"><dt className="text-zinc-300">Total devengado</dt><dd className="tabular-nums font-medium text-zinc-100">{formatCOP(preview.total_devengado)}</dd></div>
            <div><dt className="text-zinc-400">IBC</dt><dd className="tabular-nums text-zinc-400">{formatCOP(preview.ibc)}</dd></div>
            <div><dt className="text-zinc-400">Pensión ({parametro.pct_pension}%)</dt><dd className="tabular-nums text-zinc-200">−{formatCOP(preview.ded_pension)}</dd></div>
            <div><dt className="text-zinc-400">Salud ({parametro.pct_salud}%)</dt><dd className="tabular-nums text-zinc-200">−{formatCOP(preview.ded_salud)}</dd></div>
            <div><dt className="text-zinc-400">Seguro</dt><dd className="tabular-nums text-zinc-200">−{formatCOP(preview.ded_seguro)}</dd></div>
            <div><dt className="text-zinc-400">Libranzas</dt><dd className="tabular-nums text-zinc-200">−{formatCOP(Number(libranzas) || 0)}</dd></div>
            <div className="border-t border-zinc-800 pt-1"><dt className="text-zinc-300">Total deducido</dt><dd className="tabular-nums font-medium text-zinc-100">−{formatCOP(preview.total_deducido)}</dd></div>
            <div className="mt-2 rounded-md bg-zinc-800/60 px-3 py-2"><dt className="font-medium text-zinc-100">Neto a pagar</dt><dd className="text-lg font-semibold tabular-nums text-emerald-400">{formatCOP(preview.neto_pagado)}</dd></div>
          </dl>
        )}
      </aside>
    </div>
  );
}
