import Link from "next/link";
import { cardInteractiva } from "@/components/ui/estilos";
import { PageHeader } from "@/components/ui/page-header";

const SECCIONES = [
  { href: "/contabilidad/facturas", label: "Facturas" },
  { href: "/contabilidad/ingresos", label: "Ingresos" },
  { href: "/contabilidad/egresos", label: "Egresos" },
  { href: "/contabilidad/cuentas", label: "Cuentas bancarias" },
  { href: "/contabilidad/reportes", label: "Reportes" },
];

export default function ContabilidadPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader titulo="Contabilidad" />
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
