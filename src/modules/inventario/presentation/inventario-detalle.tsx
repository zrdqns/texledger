"use client";

import { useState } from "react";
import Link from "next/link";
import { Layers, MoreVertical, Pencil, Search } from "lucide-react";
import { esBajoStock } from "../domain/stock";
import { badgeNeutro, badgeOk, badgePeligro, filaTabla, tabla, theadFila, thCelda } from "@/components/ui/estilos";
import type { Tela } from "../domain/tipos";

const nf = new Intl.NumberFormat("es-CO", { maximumFractionDigits: 1 });

const TABS = [
  { id: "todos", label: "Todos" },
  { id: "optimo", label: "Óptimo" },
  { id: "critico", label: "Crítico" },
  { id: "retiradas", label: "Retiradas" },
] as const;

function EstadoBadge({ tela }: { tela: Tela }) {
  if (!tela.activo) return <span className={badgeNeutro}>Retirada</span>;
  return esBajoStock(tela.stock_actual_m, tela.umbral_bajo_stock_m) ? (
    <span className={badgePeligro}>Crítico</span>
  ) : (
    <span className={badgeOk}>Óptimo</span>
  );
}

export function InventarioDetalle({ telas }: { telas: Tela[] }) {
  const [tab, setTab] = useState<(typeof TABS)[number]["id"]>("todos");
  const [q, setQ] = useState("");

  const query = q.trim().toLowerCase();
  const filtradas = telas.filter((t) => {
    const bajo = esBajoStock(t.stock_actual_m, t.umbral_bajo_stock_m);
    const okTab =
      tab === "todos" ? t.activo : tab === "optimo" ? t.activo && !bajo : tab === "critico" ? t.activo && bajo : !t.activo;
    if (!okTab) return false;
    if (!query) return true;
    return t.referencia.toLowerCase().includes(query) || t.descripcion.toLowerCase().includes(query);
  });

  return (
    <div className="rounded-2xl border border-white/10 bg-superficie-baja">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-5 py-4">
        <div className="flex flex-wrap items-center gap-3">
          <h3 className="font-semibold text-texto">Detalle de inventario</h3>
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
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-texto-tenue" aria-hidden />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar referencia…"
            className="w-64 rounded-full border border-white/15 bg-superficie-alta py-2 pl-9 pr-3 text-sm text-texto outline-none transition-colors placeholder:text-texto-tenue focus:border-primario focus:ring-1 focus:ring-primario"
          />
        </div>
      </div>

      <div className="overflow-x-auto px-5 py-2">
        {filtradas.length === 0 ? (
          <p className="py-6 text-sm text-texto-tenue">No hay telas en esta vista.</p>
        ) : (
          <table className={tabla}>
            <thead className={theadFila}>
              <tr>
                <th className={thCelda}>Referencia / Tela</th>
                <th className={thCelda}>Lote / Paquete</th>
                <th className={`${thCelda} text-right`}>Cantidad (Rollos)</th>
                <th className={`${thCelda} text-right`}>Metraje Total (m)</th>
                <th className={thCelda}>Estado</th>
                <th className={`${thCelda} text-right`}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtradas.map((t) => (
                <tr key={t.id} className={filaTabla}>
                  <td className="py-2.5">
                    <Link href={`/inventario/${t.id}`} className="flex items-center gap-3">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-superficie-alta text-primario-claro">
                        <Layers className="h-4 w-4" aria-hidden />
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate font-medium text-texto hover:text-primario-claro">{t.descripcion}</span>
                        <span className="block font-mono text-xs text-texto-tenue">{t.referencia}</span>
                      </span>
                    </Link>
                  </td>
                  <td className="py-2.5 text-texto-suave">{t.lote ?? "—"}</td>
                  <td className="py-2.5 text-right font-mono tabular-nums text-texto-suave">{t.paquetes_rollos ?? "—"}</td>
                  <td className="py-2.5 text-right font-mono tabular-nums text-texto">{nf.format(t.stock_actual_m)}</td>
                  <td className="py-2.5"><EstadoBadge tela={t} /></td>
                  <td className="py-2.5">
                    <div className="flex items-center justify-end gap-1">
                      <Link
                        href={`/inventario/${t.id}/editar`}
                        aria-label="Editar"
                        className="rounded-lg p-1.5 text-texto-tenue transition-colors hover:bg-white/5 hover:text-primario-claro"
                      >
                        <Pencil className="h-4 w-4" aria-hidden />
                      </Link>
                      <Link
                        href={`/inventario/${t.id}`}
                        aria-label="Ver detalle"
                        className="rounded-lg p-1.5 text-texto-tenue transition-colors hover:bg-white/5 hover:text-texto"
                      >
                        <MoreVertical className="h-4 w-4" aria-hidden />
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
