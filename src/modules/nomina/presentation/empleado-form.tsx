"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Camera } from "lucide-react";
import { crearEmpleado, editarEmpleado } from "../application/empleados-actions";
import { Avatar } from "@/components/ui/avatar";
import { btnPrimario, btnSecundario, input, labelCampo } from "@/components/ui/estilos";
import { archivoAFotoDataUrl } from "@/shared/imagen";
import type { Empleado } from "../domain/tipos";

export function EmpleadoForm({ empleado }: { empleado?: Empleado }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [foto, setFoto] = useState<string | null>(empleado?.foto_url ?? null);
  const fileRef = useRef<HTMLInputElement>(null);

  async function onPickFoto(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    e.target.value = "";
    if (!f) return;
    setError(null);
    try {
      setFoto(await archivoAFotoDataUrl(f));
    } catch {
      setError("No se pudo cargar la imagen");
    }
  }

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
      foto_url: foto,
    };
    const res = empleado ? await editarEmpleado({ ...base, id: empleado.id }) : await crearEmpleado(base);
    setPending(false);
    if (!res.ok) { setError(res.message); return; }
    router.push("/nomina/empleados");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="grid max-w-2xl gap-4 sm:grid-cols-2">
      <div className="flex items-center gap-4 sm:col-span-2">
        <Avatar nombre={empleado?.nombre ?? "?"} src={foto} size={64} />
        <div className="flex flex-col items-start gap-1.5">
          <input ref={fileRef} type="file" accept="image/*" onChange={onPickFoto} className="hidden" />
          <button type="button" onClick={() => fileRef.current?.click()} className={btnSecundario}>
            <Camera className="h-4 w-4" aria-hidden /> {foto ? "Cambiar foto" : "Subir foto"}
          </button>
          {foto && (
            <button type="button" onClick={() => setFoto(null)} className="text-xs text-texto-tenue transition-colors hover:text-peligro">
              Quitar foto
            </button>
          )}
        </div>
      </div>
      <label className={labelCampo}>Nombre *<input name="nombre" required defaultValue={empleado?.nombre} className={input} /></label>
      <label className={labelCampo}>Documento<input name="documento" defaultValue={empleado?.documento ?? undefined} className={input} /></label>
      <label className={labelCampo}>Cargo<input name="cargo" defaultValue={empleado?.cargo ?? undefined} className={input} /></label>
      <label className={labelCampo}>Sueldo básico (COP) *<input name="sueldo_basico" type="number" step="any" min="1" required defaultValue={empleado?.sueldo_basico} className={input} /></label>
      <label className={labelCampo}>Tipo de seguro *
        <select name="seguro_tipo" defaultValue={empleado?.seguro_tipo ?? "ninguno"} className={input}>
          <option value="ninguno">Ninguno</option>
          <option value="fijo">Fijo (COP/mes)</option>
          <option value="porcentaje">% del sueldo básico</option>
        </select>
      </label>
      <label className={labelCampo}>Valor del seguro (COP o %)<input name="seguro_valor" type="number" step="any" min="0" defaultValue={empleado?.seguro_valor ?? 0} className={input} /></label>
      <label className={labelCampo}>Fecha de ingreso<input name="fecha_ingreso" type="date" defaultValue={empleado?.fecha_ingreso ?? undefined} className={input} /></label>
      {error && <p className="text-sm text-peligro sm:col-span-2">{error}</p>}
      <div className="sm:col-span-2">
        <button type="submit" disabled={pending} className={btnPrimario}>
          {pending ? "Guardando…" : empleado ? "Guardar cambios" : "Crear empleado"}
        </button>
      </div>
    </form>
  );
}
