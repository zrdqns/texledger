"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { crearPedido } from "../application/pedidos-actions";
import { calcularConciliacion } from "../domain/conciliacion";
import { hoyBogota } from "@/shared/fecha";

type TelaOpcion = { id: string; referencia: string; descripcion: string; consumo_prenda_m: number | null };

export function PedidoForm({ telas }: { telas: TelaOpcion[] }) {
  const router = useRouter();
  const [telaId, setTelaId] = useState("");
  const [prendas, setPrendas] = useState("");
  const [metros, setMetros] = useState("");
  const [consumo, setConsumo] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const onTela = (id: string) => {
    setTelaId(id);
    const t = telas.find((x) => x.id === id);
    setConsumo(t?.consumo_prenda_m != null ? String(t.consumo_prenda_m) : "");
  };

  const nP = Number(prendas), nM = Number(metros), nC = Number(consumo);
  const previo = prendas && metros && consumo && nP > 0 && nC > 0
    ? calcularConciliacion(nM, nP, nC)
    : null;

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setPending(true);
    const fd = new FormData(e.currentTarget);
    const res = await crearPedido({
      empresa_cliente: (fd.get("empresa_cliente") as string)?.trim(),
      fecha: fd.get("fecha") as string,
      tela_id: telaId,
      metros_llegados_planta: nM,
      prendas_pedidas: nP,
      consumo_prenda_m: nC,
      nota: ((fd.get("nota") as string)?.trim()) || undefined,
    });
    setPending(false);
    if (!res.ok) { setError(res.message); return; }
    router.push(`/pedidos/${res.data.id}`);
    router.refresh();
  }

  const input = "rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-zinc-100 outline-none focus:border-zinc-500";

  return (
    <form onSubmit={onSubmit} className="grid max-w-2xl gap-4 sm:grid-cols-2">
      <label className="flex flex-col gap-1 text-sm text-zinc-400">Empresa/Cliente *
        <input name="empresa_cliente" required className={input} />
      </label>
      <label className="flex flex-col gap-1 text-sm text-zinc-400">Fecha *
        <input name="fecha" type="date" required defaultValue={hoyBogota()} className={input} />
      </label>
      <label className="flex flex-col gap-1 text-sm text-zinc-400 sm:col-span-2">Tela *
        <select required value={telaId} onChange={(e) => onTela(e.target.value)} className={input}>
          <option value="">Selecciona…</option>
          {telas.map((t) => (
            <option key={t.id} value={t.id}>{t.referencia} — {t.descripcion}</option>
          ))}
        </select>
      </label>
      <label className="flex flex-col gap-1 text-sm text-zinc-400">Prendas pedidas *
        <input type="number" min="1" step="1" value={prendas} onChange={(e) => setPrendas(e.target.value)} required className={input} />
      </label>
      <label className="flex flex-col gap-1 text-sm text-zinc-400">Metros llegados a planta *
        <input type="number" min="0" step="any" value={metros} onChange={(e) => setMetros(e.target.value)} required className={input} />
      </label>
      <label className="flex flex-col gap-1 text-sm text-zinc-400">Consumo m/prenda *
        <input type="number" min="0" step="any" value={consumo} onChange={(e) => setConsumo(e.target.value)} required className={input} />
      </label>
      <label className="flex flex-col gap-1 text-sm text-zinc-400">Nota
        <input name="nota" className={input} />
      </label>

      {previo && (
        <div className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-3 text-sm sm:col-span-2">
          Consumo: <span className="text-zinc-200">{previo.metrosConsumidos} m</span> · Saldo:{" "}
          <span className={previo.estado === "deficit" ? "text-red-400" : previo.estado === "queda" ? "text-emerald-400" : "text-zinc-300"}>
            {previo.saldo} m ({previo.estado})
          </span>
        </div>
      )}

      {error && <p className="text-sm text-red-400 sm:col-span-2">{error}</p>}
      <div className="sm:col-span-2">
        <button type="submit" disabled={pending} className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500 disabled:opacity-50">
          {pending ? "Guardando…" : "Crear borrador"}
        </button>
      </div>
    </form>
  );
}
