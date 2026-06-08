import Link from "next/link";
import { listarTelas } from "@/modules/inventario/application/telas-actions";
import { TelasTabla } from "@/modules/inventario/presentation/telas-tabla";

export default async function InventarioPage({
  searchParams,
}: {
  searchParams: Promise<{ bajo?: string; q?: string; retiradas?: string }>;
}) {
  const { bajo, q, retiradas } = await searchParams;
  const soloBajo = bajo === "1";
  const verRetiradas = retiradas === "1";
  const telas = await listarTelas({ soloBajoStock: soloBajo, q, incluirRetiradas: verRetiradas });

  const toggleHref = (cambios: Record<string, string | undefined>) => {
    const p = new URLSearchParams();
    if (q) p.set("q", q);
    if (soloBajo) p.set("bajo", "1");
    if (verRetiradas) p.set("retiradas", "1");
    for (const [k, v] of Object.entries(cambios)) {
      if (v === undefined) p.delete(k);
      else p.set(k, v);
    }
    const s = p.toString();
    return s ? `/inventario?${s}` : "/inventario";
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-zinc-100">Inventario de tela</h2>
        <div className="flex gap-2">
          <Link href="/inventario/nueva" className="rounded-md border border-zinc-700 px-3 py-1.5 text-sm text-zinc-300 hover:bg-zinc-800">Nueva tela</Link>
          <Link href="/inventario/importar" className="rounded-md bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-emerald-500">Importar Excel</Link>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <form className="flex gap-2">
          {soloBajo && <input type="hidden" name="bajo" value="1" />}
          {verRetiradas && <input type="hidden" name="retiradas" value="1" />}
          <input
            name="q"
            defaultValue={q ?? ""}
            placeholder="Buscar referencia o descripción"
            className="rounded-md border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-sm text-zinc-100 outline-none focus:border-zinc-500"
          />
          <button type="submit" className="rounded-md border border-zinc-700 px-3 py-1.5 text-sm text-zinc-300 hover:bg-zinc-800">Buscar</button>
        </form>
        <Link href={toggleHref({ bajo: soloBajo ? undefined : "1" })} className={`rounded-md px-3 py-1.5 text-sm ${soloBajo ? "bg-zinc-700 text-white" : "border border-zinc-700 text-zinc-300 hover:bg-zinc-800"}`}>Solo bajo stock</Link>
        <Link href={toggleHref({ retiradas: verRetiradas ? undefined : "1" })} className={`rounded-md px-3 py-1.5 text-sm ${verRetiradas ? "bg-zinc-700 text-white" : "border border-zinc-700 text-zinc-300 hover:bg-zinc-800"}`}>Ver retiradas</Link>
      </div>

      <TelasTabla telas={telas} />
    </div>
  );
}
