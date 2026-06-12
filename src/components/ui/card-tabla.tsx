/** Card contenedora de tablas/listas con header propio (patrón Stitch). */
export function CardTabla({
  titulo,
  accion,
  children,
}: {
  titulo: string;
  accion?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-superficie-baja">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-5 py-4">
        <h3 className="font-semibold text-texto">{titulo}</h3>
        {accion}
      </div>
      <div className="overflow-x-auto px-5 py-2">{children}</div>
    </div>
  );
}
