"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { crearCuenta } from "../application/cuentas-actions";

export function CuentaForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setPending(true);
    const fd = new FormData(e.currentTarget);
    const res = await crearCuenta({
      nombre: (fd.get("nombre") as string)?.trim(),
      banco: (fd.get("banco") as string)?.trim(),
      numero: ((fd.get("numero") as string)?.trim()) || undefined,
    });
    setPending(false);
    if (!res.ok) { setError(res.message); return; }
    (e.target as HTMLFormElement).reset();
    router.refresh();
  }

  const input = "rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-zinc-100 outline-none focus:border-zinc-500";
  return (
    <form onSubmit={onSubmit} className="flex flex-wrap items-end gap-3">
      <input name="nombre" placeholder="Nombre" required className={input} />
      <input name="banco" placeholder="Banco" required className={input} />
      <input name="numero" placeholder="N.º cuenta (opcional)" className={input} />
      <button type="submit" disabled={pending} className="rounded-md bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-500 disabled:opacity-50">
        {pending ? "Guardando…" : "Agregar cuenta"}
      </button>
      {error && <p className="w-full text-sm text-red-400">{error}</p>}
    </form>
  );
}
