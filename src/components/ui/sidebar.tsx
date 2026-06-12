"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, LayoutDashboard, Layers, ShoppingCart, Users, Wallet } from "lucide-react";

const items = [
  { href: "/dashboard", label: "Dashboard", icono: LayoutDashboard },
  { href: "/inventario", label: "Inventario", icono: Layers },
  { href: "/pedidos", label: "Pedidos", icono: ShoppingCart },
  { href: "/contabilidad", label: "Contabilidad", icono: Wallet },
  { href: "/nomina", label: "Nómina", icono: Users },
  { href: "/recordatorios", label: "Recordatorios", icono: Bell },
];

export function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="flex w-60 flex-col gap-1 border-r border-white/5 bg-superficie-baja p-4 shadow-xl print:hidden">
      <div className="mb-6 flex items-center gap-3 px-2">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primario font-bold text-white shadow-[0_0_15px_rgba(74,142,255,0.4)]">
          T
        </span>
        <div>
          <p className="text-base font-bold text-texto">TexLedger</p>
          <p className="text-xs text-texto-tenue">Contabilidad textil</p>
        </div>
      </div>
      <p className="mb-1 px-2 text-[11px] font-semibold tracking-widest text-texto-tenue">MENÚ</p>
      <nav className="flex flex-col gap-1">
        {items.map((it) => {
          const activo = pathname === it.href || pathname.startsWith(it.href + "/");
          return (
            <Link
              key={it.href}
              href={it.href}
              className={
                activo
                  ? "flex items-center gap-3 rounded-lg bg-primario px-3 py-2.5 text-sm font-bold text-white shadow-[0_0_15px_rgba(74,142,255,0.3)] transition-all duration-200"
                  : "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-texto-tenue transition-all duration-200 hover:bg-white/5 hover:text-texto"
              }
            >
              <it.icono className="h-4 w-4" aria-hidden />
              {it.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
