"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { formatCOP } from "@/shared/cop";
import type { PuntoSerie } from "../domain/tipos";

const nfCompacto = new Intl.NumberFormat("es-CO", { notation: "compact", maximumFractionDigits: 1 });

export function GraficoIngresosEgresos({ serie }: { serie: PuntoSerie[] }) {
  const data = serie.map((p) => ({ ...p, label: `${p.mes.slice(5)}/${p.mes.slice(2, 4)}` }));
  return (
    <div className="h-72 w-full rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
          <XAxis dataKey="label" tick={{ fill: "#a1a1aa", fontSize: 12 }} axisLine={{ stroke: "#3f3f46" }} tickLine={false} />
          <YAxis
            tickFormatter={(v: number) => nfCompacto.format(v)}
            tick={{ fill: "#a1a1aa", fontSize: 12 }}
            axisLine={false}
            tickLine={false}
            width={56}
          />
          <Tooltip
            cursor={{ fill: "#27272a", opacity: 0.4 }}
            contentStyle={{ backgroundColor: "#18181b", border: "1px solid #3f3f46", borderRadius: 8 }}
            labelStyle={{ color: "#a1a1aa" }}
            formatter={(value, name) => [formatCOP(Number(value)), name === "ingresos" ? "Ingresos" : "Egresos"]}
          />
          <Bar dataKey="ingresos" fill="#10b981" radius={[3, 3, 0, 0]} />
          <Bar dataKey="egresos" fill="#ef4444" radius={[3, 3, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
