import type { LucideIcon } from "lucide-react";
import { badgeOk, badgePeligro } from "./estilos";

const tonoValor = {
  ok: "mt-2 font-mono text-2xl font-semibold tabular-nums text-emerald-400",
  peligro: "mt-2 font-mono text-2xl font-semibold tabular-nums text-peligro",
  neutro: "mt-2 font-mono text-2xl font-semibold tabular-nums text-texto",
} as const;

export function StatCard({
  label,
  valor,
  tono = "neutro",
  icono: Icono,
  delta,
  deltaTono = "ok",
}: {
  label: string;
  valor: string;
  tono?: keyof typeof tonoValor;
  icono?: LucideIcon;
  delta?: string;
  deltaTono?: "ok" | "peligro";
}) {
  return (
    <div className="group relative overflow-hidden rounded-xl border border-white/10 bg-superficie-baja p-5 transition-all duration-300 hover:border-primario/40">
      <div
        className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-primario/10 blur-3xl transition-transform duration-500 group-hover:scale-125"
        aria-hidden
      />
      <div className="relative flex items-start justify-between gap-2">
        <p className="text-sm text-texto-tenue">{label}</p>
        {Icono && (
          <span className="rounded-lg border border-white/10 bg-superficie-alta p-2 text-primario-claro">
            <Icono className="h-4 w-4" aria-hidden />
          </span>
        )}
      </div>
      <p className={`relative ${tonoValor[tono]}`}>{valor}</p>
      {delta && (
        <span className={`relative mt-2 ${deltaTono === "ok" ? badgeOk : badgePeligro}`}>{delta}</span>
      )}
    </div>
  );
}
