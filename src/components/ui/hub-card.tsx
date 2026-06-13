import Link from "next/link";
import { ArrowUpRight, type LucideIcon } from "lucide-react";

/** Tarjeta de navegación rica para hubs de módulo: icono, descripción y cifra viva. */
export function HubCard({
  href,
  icono: Icono,
  titulo,
  descripcion,
  stat,
  statLabel,
}: {
  href: string;
  icono: LucideIcon;
  titulo: string;
  descripcion: string;
  stat?: string;
  statLabel?: string;
}) {
  return (
    <Link
      href={href}
      className="group relative flex flex-col overflow-hidden rounded-xl border border-white/10 bg-superficie-baja p-5 transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] hover:-translate-y-1 hover:border-primario/40"
    >
      <div
        aria-hidden
        className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-primario/10 blur-2xl transition-transform duration-500 group-hover:scale-150"
      />
      <div className="relative flex items-start justify-between">
        <span className="rounded-lg border border-white/10 bg-superficie-alta p-2.5 text-primario-claro transition-colors group-hover:border-primario/40">
          <Icono className="h-5 w-5" aria-hidden />
        </span>
        <ArrowUpRight className="h-4 w-4 text-texto-tenue transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primario-claro" aria-hidden />
      </div>
      <p className="relative mt-4 font-semibold text-texto">{titulo}</p>
      <p className="relative mt-1 text-sm leading-relaxed text-texto-tenue">{descripcion}</p>
      {stat !== undefined && (
        <p className="relative mt-4 font-mono text-xl font-semibold tabular-nums text-texto">
          {stat}
          {statLabel && <span className="ml-1.5 font-sans text-xs font-normal text-texto-tenue">{statLabel}</span>}
        </p>
      )}
    </Link>
  );
}
