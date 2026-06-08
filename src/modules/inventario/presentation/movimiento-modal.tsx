"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  registrarEntrada,
  registrarSalida,
  registrarAjuste,
} from "../application/movimientos-actions";

type Tipo = "entrada" | "salida" | "ajuste";

export function MovimientoModal({ telaId, consumoDefault }: { telaId: string; consumoDefault: number | null }) {
  const router = useRouter();
  const [tipo, setTipo] = useState<Tipo>("entrada");
  const [modo, setModo] = useState<"prenda" | "metros">("metros");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setPending(true);
    const fd = new FormData(e.currentTarget);
    const num = (k: string) => {
      const v = fd.get(k);
      return v === null || v === "" ? undefined : Number(v);
    };
    const nota = (fd.get("nota") as string) || undefined;

    let res;
    if (tipo === "entrada") {
      res = await registrarEntrada({ tela_id: telaId, metros: num("metros"), nota });
    } else if (tipo === "salida") {
      res = await registrarSalida({
        tela_id: telaId,
        modo,
        prendas: modo === "prenda" ? num("prendas") : undefined,
        consumo: modo === "prenda" ? num("consumo") : undefined,
        metros: modo === "metros" ? num("metros") : undefined,
        nota,
      });
    } else {
      res = await registrarAjuste({ tela_id: telaId, stock_contado: num("stock_contado"), nota });
    }

    setPending(false);
    if (!res.ok) {
      setError(res.message);
      return;
    }
    (e.target as HTMLFormElement).reset();
    router.refresh();
  }

  const input = "rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-zinc-100 outline-none focus:border-zinc-500";

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-3 rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
      <div className="flex gap-2">
        {(["entrada", "salida", "ajuste"] as Tipo[]).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTipo(t)}
            className={`rounded-md px-3 py-1.5 text-sm capitalize ${
              tipo === t ? "bg-emerald-600 text-white" : "border border-zinc-700 text-zinc-300"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tipo === "entrada" && (
        <input name="metros" type="number" step="any" min="0" placeholder="Metros (rollo)" required className={input} />
      )}

      {tipo === "salida" && (
        <>
          <div className="flex gap-2">
            <button type="button" onClick={() => setModo("metros")} className={`rounded-md px-3 py-1.5 text-sm ${modo === "metros" ? "bg-zinc-700 text-white" : "border border-zinc-700 text-zinc-300"}`}>Por metros</button>
            <button type="button" onClick={() => setModo("prenda")} className={`rounded-md px-3 py-1.5 text-sm ${modo === "prenda" ? "bg-zinc-700 text-white" : "border border-zinc-700 text-zinc-300"}`}>Por prenda</button>
          </div>
          {modo === "metros" ? (
            <input name="metros" type="number" step="any" min="0" placeholder="Metros" required className={input} />
          ) : (
            <div className="flex gap-2">
              <input name="prendas" type="number" min="1" step="1" placeholder="Prendas" required className={`${input} flex-1`} />
              <input name="consumo" type="number" step="any" min="0" defaultValue={consumoDefault ?? undefined} placeholder="Consumo m/prenda" required className={`${input} flex-1`} />
            </div>
          )}
        </>
      )}

      {tipo === "ajuste" && (
        <input name="stock_contado" type="number" step="any" min="0" placeholder="Stock contado (m)" required className={input} />
      )}

      <input name="nota" type="text" placeholder="Nota (opcional)" className={input} />
      {error && <p className="text-sm text-red-400">{error}</p>}
      <button type="submit" disabled={pending} className="rounded-md bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-500 disabled:opacity-50">
        {pending ? "Guardando…" : "Registrar movimiento"}
      </button>
    </form>
  );
}
