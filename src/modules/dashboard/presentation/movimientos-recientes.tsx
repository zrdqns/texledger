"use client";

import { useState } from "react";
import { ArrowDownLeft, ArrowUpRight } from "lucide-react";
import { formatCOP } from "@/shared/cop";
import { formatFechaBogota } from "@/shared/fecha";
import type { MovimientoReciente } from "../domain/tipos";

const TABS = [
  { id: "todos", label: "Todos" },
  { id: "ingreso", label: "Ingresos" },
  { id: "egreso", label: "Egresos" },
] as const;

export function MovimientosRecientes({ ultimos }: { ultimos: MovimientoReciente[] }) {
  const [tab, setTab] = useState<(typeof TABS)[number]["id"]>("todos");
  const filtrados = tab === "todos" ? ultimos : ultimos.filter((m) => m.tipo === tab);

  return (
    <div className="rounded-2xl border border-white/10 bg-superficie-baja">
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
        <h3 className="font-semibold text-texto">Movimientos recientes</h3>
        <div className="flex gap-1 rounded-full border border-white/10 bg-superficie p-1">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={
                tab === t.id
                  ? "rounded-full bg-primario px-3 py-1 text-xs font-bold text-fondo"
                  : "rounded-full px-3 py-1 text-xs font-medium text-texto-tenue transition-colors hover:text-texto"
              }
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>
      <div className="px-2 pb-2">
        {filtrados.length === 0 ? (
          <p className="px-3 py-6 text-sm text-texto-tenue">Sin movimientos en esta vista.</p>
        ) : (
          <ul className="flex flex-col">
            {filtrados.map((m) => {
              const ingreso = m.tipo === "ingreso";
              return (
                <li
                  key={`${m.tipo}-${m.id}`}
                  className="flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-primario/[0.04]"
                >
                  <span
                    className={
                      ingreso
                        ? "flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-500/12 text-emerald-400"
                        : "flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-peligro/12 text-peligro"
                    }
                  >
                    {ingreso ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownLeft className="h-4 w-4" />}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-texto">{m.concepto}</p>
                    <p className="text-xs text-texto-tenue">{formatFechaBogota(m.fecha)}</p>
                  </div>
                  <span
                    className={
                      ingreso
                        ? "font-mono text-sm font-semibold tabular-nums text-emerald-400"
                        : "font-mono text-sm font-semibold tabular-nums text-peligro"
                    }
                  >
                    {ingreso ? "+" : "−"}
                    {formatCOP(m.valor)}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
