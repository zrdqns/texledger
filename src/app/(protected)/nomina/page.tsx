import Link from "next/link";
import { cardInteractiva } from "@/components/ui/estilos";
import { PageHeader } from "@/components/ui/page-header";

const SECCIONES = [
  { href: "/nomina/empleados", label: "Empleados" },
  { href: "/nomina/liquidaciones", label: "Liquidaciones" },
  { href: "/nomina/parametros", label: "Parámetros" },
];

export default function NominaPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader titulo="Nómina" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {SECCIONES.map((s) => (
          <Link key={s.href} href={s.href} className={cardInteractiva}>
            <p className="font-medium text-texto">{s.label}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
