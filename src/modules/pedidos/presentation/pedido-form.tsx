"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { crearPedido, editarPedido } from "../application/pedidos-actions";
import { calcularConciliacion } from "../domain/conciliacion";
import { hoyBogota } from "@/shared/fecha";
import { btnPrimario, input, labelCampo } from "@/components/ui/estilos";

type TelaOpcion = { id: string; referencia: string; descripcion: string; consumo_prenda_m: number | null };
type PedidoInicial = {
  id: string;
  empresa_cliente: string;
  fecha: string;
  tela_id: string;
  metros_llegados_planta: number;
  prendas_pedidas: number;
  consumo_prenda_m: number;
  nota: string | null;
};

export function PedidoForm({ telas, pedido }: { telas: TelaOpcion[]; pedido?: PedidoInicial }) {
  const router = useRouter();
  const [telaId, setTelaId] = useState(pedido?.tela_id ?? "");
  const [prendas, setPrendas] = useState(pedido ? String(pedido.prendas_pedidas) : "");
  const [metros, setMetros] = useState(pedido ? String(pedido.metros_llegados_planta) : "");
  const [consumo, setConsumo] = useState(pedido ? String(pedido.consumo_prenda_m) : "");
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
    const payload = {
      empresa_cliente: (fd.get("empresa_cliente") as string)?.trim(),
      fecha: fd.get("fecha") as string,
      tela_id: telaId,
      metros_llegados_planta: nM,
      prendas_pedidas: nP,
      consumo_prenda_m: nC,
      nota: ((fd.get("nota") as string)?.trim()) || undefined,
    };
    if (pedido) {
      const res = await editarPedido({ ...payload, id: pedido.id });
      setPending(false);
      if (!res.ok) { setError(res.message); return; }
      router.push(`/pedidos/${pedido.id}`);
    } else {
      const res = await crearPedido(payload);
      setPending(false);
      if (!res.ok) { setError(res.message); return; }
      router.push(`/pedidos/${res.data.id}`);
    }
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="grid max-w-2xl gap-4 sm:grid-cols-2">
      <label className={labelCampo}>Empresa/Cliente *
        <input name="empresa_cliente" required defaultValue={pedido?.empresa_cliente} className={input} />
      </label>
      <label className={labelCampo}>Fecha *
        <input name="fecha" type="date" required defaultValue={pedido?.fecha ?? hoyBogota()} className={input} />
      </label>
      <label className={`${labelCampo} sm:col-span-2`}>Tela *
        <select required value={telaId} onChange={(e) => onTela(e.target.value)} className={input}>
          <option value="">Selecciona…</option>
          {telas.map((t) => (
            <option key={t.id} value={t.id}>{t.referencia} — {t.descripcion}</option>
          ))}
        </select>
      </label>
      <label className={labelCampo}>Prendas pedidas *
        <input type="number" min="1" step="1" value={prendas} onChange={(e) => setPrendas(e.target.value)} required className={input} />
      </label>
      <label className={labelCampo}>Metros llegados a planta *
        <input type="number" min="0" step="any" value={metros} onChange={(e) => setMetros(e.target.value)} required className={input} />
      </label>
      <label className={labelCampo}>Consumo m/prenda *
        <input type="number" min="0" step="any" value={consumo} onChange={(e) => setConsumo(e.target.value)} required className={input} />
      </label>
      <label className={labelCampo}>Nota
        <input name="nota" defaultValue={pedido?.nota ?? undefined} className={input} />
      </label>

      {previo && (
        <div className="rounded-lg border border-borde/60 bg-superficie-baja p-3 text-sm sm:col-span-2">
          Consumo: <span className="text-texto">{previo.metrosConsumidos} m</span> · Saldo:{" "}
          <span className={previo.estado === "deficit" ? "text-peligro" : previo.estado === "queda" ? "text-emerald-400" : "text-texto-suave"}>
            {previo.saldo} m ({previo.estado})
          </span>
        </div>
      )}

      {error && <p className="text-sm text-peligro sm:col-span-2">{error}</p>}
      <div className="sm:col-span-2">
        <button type="submit" disabled={pending} className={btnPrimario}>
          {pending ? "Guardando…" : pedido ? "Guardar cambios" : "Crear borrador"}
        </button>
      </div>
    </form>
  );
}
