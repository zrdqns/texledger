"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { crearTela, editarTela } from "../application/telas-actions";
import type { Tela } from "../domain/tipos";

export function TelaForm({ tela }: { tela?: Tela }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setPending(true);
    const fd = new FormData(e.currentTarget);
    const str = (k: string) => {
      const v = (fd.get(k) as string)?.trim();
      return v ? v : undefined;
    };
    const num = (k: string) => {
      const v = (fd.get(k) as string)?.trim();
      return v ? Number(v) : undefined;
    };
    const base = {
      referencia: str("referencia"),
      descripcion: str("descripcion"),
      composicion: str("composicion"),
      color: str("color"),
      ancho_m: num("ancho_m"),
      gramaje_gm2: num("gramaje_gm2"),
      proveedor: str("proveedor"),
      unidad: str("unidad") ?? "metros",
      paquetes_rollos: num("paquetes_rollos"),
      umbral_bajo_stock_m: num("umbral_bajo_stock_m"),
      consumo_prenda_m: num("consumo_prenda_m"),
      lote: str("lote"),
      ubicacion: str("ubicacion"),
    };

    const res = tela ? await editarTela({ ...base, id: tela.id }) : await crearTela(base);
    setPending(false);
    if (!res.ok) {
      setError(res.message);
      return;
    }
    router.push(tela ? `/inventario/${tela.id}` : "/inventario");
    router.refresh();
  }

  const input = "rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-zinc-100 outline-none focus:border-zinc-500";
  const field = (name: string, label: string, opts: { type?: string; required?: boolean; def?: string | number | null } = {}) => (
    <label className="flex flex-col gap-1 text-sm text-zinc-400">
      {label}{opts.required ? " *" : ""}
      <input
        name={name}
        type={opts.type ?? "text"}
        step={opts.type === "number" ? "any" : undefined}
        required={opts.required}
        defaultValue={opts.def ?? undefined}
        className={input}
      />
    </label>
  );

  return (
    <form onSubmit={onSubmit} className="grid max-w-2xl gap-4 sm:grid-cols-2">
      {field("referencia", "Referencia", { required: true, def: tela?.referencia })}
      {field("descripcion", "Descripción", { required: true, def: tela?.descripcion })}
      {field("umbral_bajo_stock_m", "Umbral bajo stock (m)", { type: "number", required: true, def: tela?.umbral_bajo_stock_m })}
      {field("unidad", "Unidad", { def: tela?.unidad ?? "metros" })}
      {field("consumo_prenda_m", "Consumo m/prenda", { type: "number", def: tela?.consumo_prenda_m })}
      {field("composicion", "Composición", { def: tela?.composicion })}
      {field("color", "Color", { def: tela?.color })}
      {field("ancho_m", "Ancho (m)", { type: "number", def: tela?.ancho_m })}
      {field("gramaje_gm2", "Gramaje (g/m²)", { type: "number", def: tela?.gramaje_gm2 })}
      {field("proveedor", "Proveedor", { def: tela?.proveedor })}
      {field("paquetes_rollos", "Paquetes/rollos", { type: "number", def: tela?.paquetes_rollos })}
      {field("lote", "Lote", { def: tela?.lote })}
      {field("ubicacion", "Ubicación", { def: tela?.ubicacion })}
      {error && <p className="text-sm text-red-400 sm:col-span-2">{error}</p>}
      <div className="sm:col-span-2">
        <button type="submit" disabled={pending} className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500 disabled:opacity-50">
          {pending ? "Guardando…" : tela ? "Guardar cambios" : "Crear tela"}
        </button>
      </div>
    </form>
  );
}
