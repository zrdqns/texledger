import Link from "next/link";
import { listarTelas } from "@/modules/inventario/application/telas-actions";
import { TelasTabla } from "@/modules/inventario/presentation/telas-tabla";
import { PageHeader } from "@/components/ui/page-header";
import { btnPrimario, btnSecundario } from "@/components/ui/estilos";

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

  const pillActiva = "rounded-lg bg-superficie-alta px-3 py-1.5 text-sm text-texto";
  const pillInactiva = "rounded-lg border border-borde px-3 py-1.5 text-sm text-texto-suave hover:bg-superficie-alta";

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        titulo="Inventario de tela"
        accion={
          <div className="flex gap-2">
            <Link href="/inventario/nueva" className={btnSecundario}>Nueva tela</Link>
            <Link href="/inventario/importar" className={btnPrimario}>Importar Excel</Link>
          </div>
        }
      />

      <div className="flex flex-wrap items-center gap-2">
        <form className="flex gap-2">
          {soloBajo && <input type="hidden" name="bajo" value="1" />}
          {verRetiradas && <input type="hidden" name="retiradas" value="1" />}
          <input
            name="q"
            defaultValue={q ?? ""}
            placeholder="Buscar referencia o descripción"
            className="rounded-lg border border-borde bg-superficie-alta px-3 py-1.5 text-sm text-texto outline-none placeholder:text-texto-tenue focus:border-primario"
          />
          <button type="submit" className={pillInactiva}>Buscar</button>
        </form>
        <Link href={toggleHref({ bajo: soloBajo ? undefined : "1" })} className={soloBajo ? pillActiva : pillInactiva}>Solo bajo stock</Link>
        <Link href={toggleHref({ retiradas: verRetiradas ? undefined : "1" })} className={verRetiradas ? pillActiva : pillInactiva}>Ver retiradas</Link>
      </div>

      <TelasTabla telas={telas} />
    </div>
  );
}
