import Link from "next/link";

const items = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/inventario", label: "Inventario" },
  { href: "/pedidos", label: "Pedidos" },
  { href: "/contabilidad", label: "Contabilidad" },
  { href: "/nomina", label: "Nómina" },
  { href: "/recordatorios", label: "Recordatorios" },
];

export function Sidebar() {
  return (
    <aside className="flex w-60 flex-col gap-1 border-r border-zinc-800 bg-zinc-900/40 p-4">
      <div className="mb-6 px-2 text-sm font-semibold text-zinc-300">
        Contable Textil
      </div>
      <nav className="flex flex-col gap-1">
        {items.map((it) => (
          <Link
            key={it.href}
            href={it.href}
            className="rounded-md px-3 py-2 text-sm text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100"
          >
            {it.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
