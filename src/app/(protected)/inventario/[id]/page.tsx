import Link from "next/link";
import { notFound } from "next/navigation";
import { obtenerTela } from "@/modules/inventario/application/telas-actions";
import { listarKardex } from "@/modules/inventario/application/movimientos-actions";
import { MovimientoModal } from "@/modules/inventario/presentation/movimiento-modal";
import { RetirarTelaBoton } from "@/modules/inventario/presentation/retirar-tela-boton";
import { formatFechaBogota } from "@/shared/fecha";

export default async function TelaDetallePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const tela = await obtenerTela(id);
  if (!tela) notFound();
  const kardex = await listarKardex(id);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-lg font-semibold text-zinc-100">{tela.referencia}</h2>
          <p className="text-sm text-zinc-400">{tela.descripcion}</p>
          <p className="mt-2 text-2xl font-semibold text-zinc-100">
            {tela.stock_actual_m} <span className="text-sm font-normal text-zinc-500">{tela.unidad}</span>
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link href={`/inventario/${tela.id}/editar`} className="text-sm text-zinc-300 hover:text-zinc-100">Editar</Link>
          <RetirarTelaBoton telaId={tela.id} />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div>
          <h3 className="mb-2 text-sm font-medium text-zinc-300">Kardex</h3>
          {kardex.length === 0 ? (
            <p className="text-sm text-zinc-500">Sin movimientos.</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="text-left text-zinc-400">
                <tr className="border-b border-zinc-800">
                  <th className="py-2 font-medium">Fecha</th>
                  <th className="py-2 font-medium">Tipo</th>
                  <th className="py-2 font-medium text-right">Cantidad</th>
                  <th className="py-2 font-medium text-right">Saldo</th>
                </tr>
              </thead>
              <tbody>
                {kardex.map((m) => (
                  <tr key={m.id} className="border-b border-zinc-900">
                    <td className="py-2 text-zinc-400">{formatFechaBogota(m.created_at.slice(0, 10))}</td>
                    <td className="py-2 capitalize text-zinc-300">{m.tipo}</td>
                    <td className={`py-2 text-right tabular-nums ${m.cantidad_m < 0 ? "text-red-400" : "text-emerald-400"}`}>
                      {m.cantidad_m > 0 ? "+" : ""}{m.cantidad_m}
                    </td>
                    <td className="py-2 text-right tabular-nums text-zinc-200">{m.saldo_resultante_m}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        <MovimientoModal telaId={tela.id} consumoDefault={tela.consumo_prenda_m} />
      </div>
    </div>
  );
}
