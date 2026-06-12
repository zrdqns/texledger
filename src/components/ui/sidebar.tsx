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
    <aside className="flex w-60 flex-col gap-1 border-r border-borde/40 bg-superficie-baja p-4 print:hidden">
      <div className="mb-6 px-2">
        <p className="text-base font-bold text-texto">TexLedger</p>
        <p className="text-xs text-texto-tenue">Contabilidad textil</p>
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
                  ? "flex items-center gap-3 rounded-lg bg-primario px-3 py-2 text-sm font-medium text-white"
                  : "flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-texto-tenue hover:bg-superficie hover:text-texto"
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
