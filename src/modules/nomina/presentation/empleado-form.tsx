"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { crearEmpleado, editarEmpleado } from "../application/empleados-actions";
import type { Empleado } from "../domain/tipos";

export function EmpleadoForm({ empleado }: { empleado?: Empleado }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setPending(true);
    const fd = new FormData(e.currentTarget);
    const str = (k: string) => {
      const v = (fd.get(k) as string)?.trim();
      return v ? v : undefined;
    };
    const base = {
      nombre: str("nombre") ?? "",
      documento: str("documento"),
      cargo: str("cargo"),
      sueldo_basico: Number(fd.get("sueldo_basico")),
      seguro_tipo: fd.get("seguro_tipo") as "fijo" | "porcentaje" | "ninguno",
      seguro_valor: Number(fd.get("seguro_valor")) || 0,
      fecha_ingreso: str("fecha_ingreso"),
    };
    const res = empleado ? await editarEmpleado({ ...base, id: empleado.id }) : await crearEmpleado(base);
    setPending(false);
    if (!res.ok) { setError(res.message); return; }
    router.push("/nomina/empleados");
    router.refresh();
  }

  const input = "rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-zinc-100 outline-none focus:border-zinc-500";
  const label = "flex flex-col gap-1 text-sm text-zinc-400";

  return (
    <form onSubmit={onSubmit} className="grid max-w-2xl gap-4 sm:grid-cols-2">
      <label className={label}>Nombre *<input name="nombre" required defaultValue={empleado?.nombre} className={input} /></label>
      <label className={label}>Documento<input name="documento" defaultValue={empleado?.documento ?? undefined} className={input} /></label>
      <label className={label}>Cargo<input name="cargo" defaultValue={empleado?.cargo ?? undefined} className={input} /></label>
      <label className={label}>Sueldo básico (COP) *<input name="sueldo_basico" type="number" step="any" min="1" required defaultValue={empleado?.sueldo_basico} className={input} /></label>
      <label className={label}>Tipo de seguro *
        <select name="seguro_tipo" defaultValue={empleado?.seguro_tipo ?? "ninguno"} className={input}>
          <option value="ninguno">Ninguno</option>
          <option value="fijo">Fijo (COP/mes)</option>
          <option value="porcentaje">% del sueldo básico</option>
        </select>
      </label>
      <label className={label}>Valor del seguro (COP o %)<input name="seguro_valor" type="number" step="any" min="0" defaultValue={empleado?.seguro_valor ?? 0} className={input} /></label>
      <label className={label}>Fecha de ingreso<input name="fecha_ingreso" type="date" defaultValue={empleado?.fecha_ingreso ?? undefined} className={input} /></label>
      {error && <p className="text-sm text-red-400 sm:col-span-2">{error}</p>}
      <div className="sm:col-span-2">
        <button type="submit" disabled={pending} className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500 disabled:opacity-50">
          {pending ? "Guardando…" : empleado ? "Guardar cambios" : "Crear empleado"}
        </button>
      </div>
    </form>
  );
}
