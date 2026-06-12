import { card } from "./estilos";

const tonoValor = {
  ok: "mt-2 font-mono text-2xl font-semibold tabular-nums text-emerald-400",
  peligro: "mt-2 font-mono text-2xl font-semibold tabular-nums text-peligro",
  neutro: "mt-2 font-mono text-2xl font-semibold tabular-nums text-texto",
} as const;

export function StatCard({
  label,
  valor,
  tono = "neutro",
}: {
  label: string;
  valor: string;
  tono?: keyof typeof tonoValor;
}) {
  return (
    <div className={card}>
      <p className="text-sm text-texto-tenue">{label}</p>
      <p className={tonoValor[tono]}>{valor}</p>
    </div>
  );
}
