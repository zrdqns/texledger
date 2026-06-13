"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AlertTriangle, Bell, FileWarning, Package, type LucideIcon } from "lucide-react";
import { formatTimestampBogota } from "@/shared/fecha";
import type { Notificacion } from "../domain/tipos";

const ICONO: Record<string, { Icono: LucideIcon; clase: string }> = {
  recordatorio_vencido: { Icono: AlertTriangle, clase: "bg-peligro/15 text-peligro" },
  bajo_stock: { Icono: Package, clase: "bg-acento/15 text-acento" },
  factura_sin_declarar: { Icono: FileWarning, clase: "bg-primario/15 text-primario-claro" },
};

export function CampanaMenu({ notificaciones }: { notificaciones: Notificacion[] }) {
  const [abierto, setAbierto] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const n = notificaciones.length;

  useEffect(() => {
    if (!abierto) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setAbierto(false);
    };
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setAbierto(false);
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onEsc);
    };
  }, [abierto]);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setAbierto((v) => !v)}
        aria-label="Notificaciones"
        aria-expanded={abierto}
        className="relative text-texto-tenue transition-colors hover:text-texto"
      >
        <Bell className="h-5 w-5" aria-hidden />
        {n > 0 && (
          <span className="absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-acento px-1 text-[10px] font-semibold text-fondo">
            {n > 99 ? "99+" : n}
          </span>
        )}
      </button>

      {abierto && (
        <div className="animate-aparecer absolute right-0 top-full z-50 mt-3 w-80 overflow-hidden rounded-xl border border-white/10 bg-superficie-baja shadow-2xl">
          <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
            <p className="text-sm font-semibold text-texto">Notificaciones</p>
            {n > 0 && (
              <span className="rounded-full bg-acento/15 px-2 py-0.5 text-xs font-medium text-acento">{n} sin leer</span>
            )}
          </div>

          {n === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-texto-tenue">Sin notificaciones pendientes.</p>
          ) : (
            <ul className="max-h-80 overflow-y-auto">
              {notificaciones.slice(0, 6).map((notif) => {
                const ic = ICONO[notif.tipo] ?? { Icono: Bell, clase: "bg-superficie-alta text-texto-tenue" };
                return (
                  <li key={notif.id}>
                    <Link
                      href="/recordatorios"
                      onClick={() => setAbierto(false)}
                      className="flex items-start gap-3 border-b border-white/5 px-4 py-3 transition-colors hover:bg-white/5"
                    >
                      <span className={`mt-0.5 shrink-0 rounded-lg p-1.5 ${ic.clase}`}>
                        <ic.Icono className="h-3.5 w-3.5" aria-hidden />
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-medium text-texto">{notif.titulo}</span>
                        <span className="block truncate text-xs text-texto-tenue">{notif.mensaje}</span>
                        <span className="mt-0.5 block text-[10px] text-texto-tenue">{formatTimestampBogota(notif.created_at)}</span>
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}

          <Link
            href="/recordatorios"
            onClick={() => setAbierto(false)}
            className="block border-t border-white/10 px-4 py-2.5 text-center text-sm font-medium text-primario-claro transition-colors hover:bg-white/5"
          >
            Ver todas
          </Link>
        </div>
      )}
    </div>
  );
}
