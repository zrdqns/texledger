import Link from "next/link";
import { linkSuave } from "./estilos";

export function PageHeader({
  titulo,
  subtitulo,
  volverHref,
  volverLabel,
  accion,
}: {
  titulo: string;
  subtitulo?: string;
  volverHref?: string;
  volverLabel?: string;
  accion?: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        {volverHref && (
          <Link href={volverHref} className={linkSuave}>
            ← {volverLabel ?? "Volver"}
          </Link>
        )}
        <h2 className={volverHref ? "mt-2 text-2xl font-bold tracking-tight text-texto" : "text-2xl font-bold tracking-tight text-texto"}>
          {titulo}
        </h2>
        {subtitulo && <p className="mt-1 text-sm text-texto-tenue">{subtitulo}</p>}
      </div>
      {accion}
    </div>
  );
}
