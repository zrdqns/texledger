import Link from "next/link";

const SECCIONES = [
  { href: "/nomina/empleados", label: "Empleados" },
  { href: "/nomina/liquidaciones", label: "Liquidaciones" },
  { href: "/nomina/parametros", label: "Parámetros" },
];

export default function NominaPage() {
  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-lg font-semibold text-zinc-100">Nómina</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {SECCIONES.map((s) => (
          <Link key={s.href} href={s.href} className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-5 hover:bg-zinc-900">
            <p className="font-medium text-zinc-100">{s.label}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
