"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { formatCOP } from "@/shared/cop";
import type { PuntoSerie } from "../domain/tipos";

const nfCompacto = new Intl.NumberFormat("es-CO", { notation: "compact", maximumFractionDigits: 1 });

export function GraficoIngresosEgresos({ serie }: { serie: PuntoSerie[] }) {
  const data = serie.map((p) => ({ ...p, label: `${p.mes.slice(5)}/${p.mes.slice(2, 4)}` }));
  return (
    <div className="h-72 w-full rounded-xl border border-borde/60 bg-superficie-baja p-4">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
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
            cursor={{ fill: "#272a31", opacity: 0.4 }}
            contentStyle={{ backgroundColor: "#1d2026", border: "1px solid #414754", borderRadius: 8 }}
            labelStyle={{ color: "#8b90a0" }}
            formatter={(value, name) => [formatCOP(Number(value)), name === "ingresos" ? "Ingresos" : "Egresos"]}
          />
          <Bar dataKey="ingresos" fill="#4a8eff" radius={[3, 3, 0, 0]} />
          <Bar dataKey="egresos" fill="#ef6719" radius={[3, 3, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
