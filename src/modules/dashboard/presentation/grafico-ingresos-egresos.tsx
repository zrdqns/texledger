"use client";

import { Area, AreaChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { formatCOP } from "@/shared/cop";
import type { PuntoSerie } from "../domain/tipos";

const nfCompacto = new Intl.NumberFormat("es-CO", { notation: "compact", maximumFractionDigits: 1 });

export function GraficoIngresosEgresos({ serie }: { serie: PuntoSerie[] }) {
  const data = serie.map((p) => ({ ...p, label: `${p.mes.slice(5)}/${p.mes.slice(2, 4)}` }));
  return (
    <div className="rounded-xl border border-white/10 bg-superficie-baja">
      <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
        <h3 className="font-semibold text-texto">Flujo de caja</h3>
        <span className="text-xs text-texto-tenue">Últimos 12 meses</span>
      </div>
      <div className="h-72 w-full p-4">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="gradIngresos" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#4a8eff" stopOpacity={0.35} />
                <stop offset="100%" stopColor="#4a8eff" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gradEgresos" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ef6719" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#ef6719" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#272a31" vertical={false} />
            <XAxis dataKey="label" tick={{ fill: "#8b90a0", fontSize: 12 }} axisLine={{ stroke: "#414754" }} tickLine={false} />
            <YAxis
              tickFormatter={(v: number) => nfCompacto.format(v)}
              tick={{ fill: "#8b90a0", fontSize: 12 }}
              axisLine={false}
              tickLine={false}
              width={56}
            />
            <Tooltip
              cursor={{ stroke: "#414754", strokeDasharray: "3 3" }}
              contentStyle={{ backgroundColor: "#1d2026", border: "1px solid #414754", borderRadius: 8 }}
              labelStyle={{ color: "#8b90a0" }}
              formatter={(value, name) => [formatCOP(Number(value)), name === "ingresos" ? "Ingresos" : "Egresos"]}
            />
            <Legend
              formatter={(value: string) => (
                <span style={{ color: "#c1c6d7", fontSize: 12 }}>{value === "ingresos" ? "Ingresos" : "Egresos"}</span>
              )}
            />
            <Area type="monotone" dataKey="ingresos" stroke="#4a8eff" strokeWidth={2.5} fill="url(#gradIngresos)" dot={false} activeDot={{ r: 4, fill: "#adc7ff" }} />
            <Area type="monotone" dataKey="egresos" stroke="#ef6719" strokeWidth={2.5} fill="url(#gradEgresos)" dot={false} activeDot={{ r: 4, fill: "#ffb695" }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
