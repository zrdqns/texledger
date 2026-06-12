import { listarCuentas } from "@/modules/contabilidad/application/cuentas-actions";
import { CuentaForm } from "@/modules/contabilidad/presentation/cuenta-form";
import { PageHeader } from "@/components/ui/page-header";

export default async function CuentasPage() {
  const cuentas = await listarCuentas();
  return (
    <div className="flex flex-col gap-6">
      <PageHeader titulo="Cuentas bancarias" volverHref="/contabilidad" volverLabel="Contabilidad" />
      <CuentaForm />
      {cuentas.length === 0 ? (
        <p className="text-sm text-texto-tenue">No hay cuentas.</p>
      ) : (
        <ul className="divide-y divide-borde/30">
          {cuentas.map((c) => (
            <li key={c.id} className="flex justify-between py-2 text-sm">
              <span className="text-texto">{c.nombre}</span>
              <span className="text-texto-tenue">{c.banco}{c.numero ? ` · ${c.numero}` : ""}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
