import Link from "next/link";
import { linkSuave } from "./estilos";

export function PageHeader({
  titulo,
  volverHref,
  volverLabel,
  accion,
}: {
  titulo: string;
  volverHref?: string;
  volverLabel?: string;
  accion?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        {volverHref && (
          <Link href={volverHref} className={linkSuave}>
            ← {volverLabel ?? "Volver"}
          </Link>
        )}
        <h2 className={volverHref ? "mt-2 text-xl font-bold text-texto" : "text-xl font-bold text-texto"}>
          {titulo}
        </h2>
      </div>
      {accion}
    </div>
  );
}
