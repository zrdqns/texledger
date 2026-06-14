"use client";

import { useMemo, useState } from "react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { formatCOP } from "@/shared/cop";
import type { PuntoSerie } from "../domain/tipos";

const nfCompacto = new Intl.NumberFormat("es-CO", { notation: "compact", maximumFractionDigits: 1 });
const MESES = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];

const PERIODOS = [
  { id: "3M", meses: 3 },
  { id: "6M", meses: 6 },
  { id: "Año", meses: 12 },
] as const;

function etiquetaMes(mes: string): string {
  const m = Number(mes.slice(5, 7));
  return `${MESES[m - 1] ?? mes.slice(5)} ${mes.slice(2, 4)}`;
}

function TooltipRendimiento({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { dataKey?: string | number; value?: number; payload?: { label?: string } }[];
}) {
  if (!active || !payload?.length) return null;
  const ing = Number(payload.find((p) => p.dataKey === "ingresos")?.value ?? 0);
  const egr = Number(payload.find((p) => p.dataKey === "egresos")?.value ?? 0);
  const neto = ing - egr;
  return (
    <div className="rounded-xl border border-borde bg-superficie/95 px-3.5 py-3 shadow-[0_12px_40px_rgba(0,0,0,0.5)] backdrop-blur">
      <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-texto-tenue">
        {payload[0]?.payload?.label}
      </p>
      <div className="space-y-1.5 text-sm">
        <div className="flex items-center justify-between gap-6">
          <span className="flex items-center gap-2 text-texto-suave">
            <span className="h-2 w-2 rounded-full bg-primario" />Ingresos
          </span>
          <span className="font-mono tabular-nums text-primario-claro">{formatCOP(ing)}</span>
        </div>
        <div className="flex items-center justify-between gap-6">
          <span className="flex items-center gap-2 text-texto-suave">
            <span className="h-2 w-2 rounded-full bg-acento" />Egresos
          </span>
          <span className="font-mono tabular-nums text-acento">{formatCOP(egr)}</span>
        </div>
        <div className="mt-1 flex items-center justify-between gap-6 border-t border-white/10 pt-1.5">
          <span className="text-texto-tenue">Neto</span>
          <span className={`font-mono font-semibold tabular-nums ${neto >= 0 ? "text-emerald-400" : "text-peligro"}`}>
            {formatCOP(neto)}
          </span>
        </div>
      </div>
    </div>
  );
}

export function GraficoRendimiento({ serie }: { serie: PuntoSerie[] }) {
  const [periodo, setPeriodo] = useState<(typeof PERIODOS)[number]["id"]>("6M");
  const meses = PERIODOS.find((p) => p.id === periodo)?.meses ?? 6;

  const data = useMemo(
    () => serie.slice(-meses).map((p) => ({ ...p, label: etiquetaMes(p.mes) })),
    [serie, meses],
  );

  const totalIng = data.reduce((s, p) => s + p.ingresos, 0);
  const totalEgr = data.reduce((s, p) => s + p.egresos, 0);
  const netoPeriodo = totalIng - totalEgr;

  return (
    <div className="rounded-2xl border border-white/10 bg-superficie-baja">
      <div className="flex flex-wrap items-start justify-between gap-4 px-6 pt-5">
        <div>
          <h3 className="text-base font-semibold text-texto">Rendimiento financiero</h3>
          <div className="mt-1.5 flex items-baseline gap-2">
            <span className={`font-mono text-2xl font-bold tabular-nums ${netoPeriodo >= 0 ? "text-texto" : "text-peligro"}`}>
              {formatCOP(netoPeriodo)}
            </span>
            <span className="text-xs text-texto-tenue">neto en {periodo === "Año" ? "12 meses" : periodo}</span>
          </div>
        </div>
        <div className="flex gap-1 rounded-full border border-white/10 bg-superficie p-1">
          {PERIODOS.map((p) => (
            <button
              key={p.id}
              onClick={() => setPeriodo(p.id)}
              className={
                periodo === p.id
                  ? "rounded-full bg-primario px-3.5 py-1 text-xs font-bold text-fondo shadow-[0_0_12px_rgba(91,124,250,0.4)]"
                  : "rounded-full px-3.5 py-1 text-xs font-medium text-texto-tenue transition-colors hover:text-texto"
              }
            >
              {p.id}
            </button>
          ))}
        </div>
      </div>
      <div className="h-72 w-full px-2 pb-2 pt-4">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 6, right: 18, left: 6, bottom: 0 }}>
            <defs>
              <linearGradient id="rendIngresos" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#5b7cfa" stopOpacity={0.45} />
                <stop offset="100%" stopColor="#5b7cfa" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="rendEgresos" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#d6a445" stopOpacity={0.22} />
                <stop offset="100%" stopColor="#d6a445" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#20283a" vertical={false} />
            <XAxis dataKey="label" tick={{ fill: "#7e89a4", fontSize: 12 }} axisLine={{ stroke: "#2d3850" }} tickLine={false} dy={6} />
            <YAxis
              tickFormatter={(v: number) => nfCompacto.format(v)}
              tick={{ fill: "#7e89a4", fontSize: 12 }}
              axisLine={false}
              tickLine={false}
              width={52}
            />
            <Tooltip content={<TooltipRendimiento />} cursor={{ stroke: "#5b7cfa", strokeWidth: 1, strokeDasharray: "4 4" }} />
            <Area type="monotone" dataKey="egresos" stroke="#d6a445" strokeWidth={2} fill="url(#rendEgresos)" dot={false} activeDot={{ r: 4, fill: "#e2c089", stroke: "#0b0e16", strokeWidth: 2 }} />
            <Area type="monotone" dataKey="ingresos" stroke="#5b7cfa" strokeWidth={2.6} fill="url(#rendIngresos)" dot={false} activeDot={{ r: 5, fill: "#8aa2ff", stroke: "#0b0e16", strokeWidth: 2 }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
