import Link from "next/link";
import { notFound } from "next/navigation";
import { obtenerTela } from "@/modules/inventario/application/telas-actions";
import { listarKardex } from "@/modules/inventario/application/movimientos-actions";
import { MovimientoModal } from "@/modules/inventario/presentation/movimiento-modal";
import { RetirarTelaBoton } from "@/modules/inventario/presentation/retirar-tela-boton";
import { formatFechaBogota } from "@/shared/fecha";
import { CardTabla } from "@/components/ui/card-tabla";
import { filaTabla, linkSuave, tabla, theadFila, thCelda } from "@/components/ui/estilos";

export default async function TelaDetallePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const tela = await obtenerTela(id);
  if (!tela) notFound();
  const kardex = await listarKardex(id);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-bold text-texto">{tela.referencia}</h2>
          <p className="text-sm text-texto-tenue">{tela.descripcion}</p>
          <p className="mt-2 font-mono text-2xl font-semibold tabular-nums text-texto">
            {tela.stock_actual_m} <span className="font-sans text-sm font-normal text-texto-tenue">{tela.unidad}</span>
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link href={`/inventario/${tela.id}/editar`} className={linkSuave}>Editar</Link>
          <RetirarTelaBoton telaId={tela.id} />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <CardTabla titulo="Kardex">
          {kardex.length === 0 ? (
            <p className="py-3 text-sm text-texto-tenue">Sin movimientos.</p>
          ) : (
            <table className={tabla}>
              <thead className={theadFila}>
                <tr>
                  <th className={thCelda}>Fecha</th>
                  <th className={thCelda}>Tipo</th>
                  <th className={`${thCelda} text-right`}>Cantidad</th>
                  <th className={`${thCelda} text-right`}>Saldo</th>
                </tr>
              </thead>
              <tbody>
                {kardex.map((m) => (
                  <tr key={m.id} className={filaTabla}>
                    <td className="py-2.5 text-texto-tenue">{formatFechaBogota(m.created_at.slice(0, 10))}</td>
                    <td className="py-2.5 capitalize text-texto-suave">{m.tipo}</td>
                    <td className={m.cantidad_m < 0 ? "py-2.5 text-right font-mono tabular-nums text-peligro" : "py-2.5 text-right font-mono tabular-nums text-emerald-400"}>
                      {m.cantidad_m > 0 ? "+" : ""}{m.cantidad_m}
                    </td>
                    <td className="py-2.5 text-right font-mono tabular-nums text-texto">{m.saldo_resultante_m}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardTabla>
        <MovimientoModal telaId={tela.id} consumoDefault={tela.consumo_prenda_m} />
      </div>
    </div>
  );
}
