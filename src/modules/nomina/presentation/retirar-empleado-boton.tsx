"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { retirarEmpleado } from "../application/empleados-actions";

export function RetirarEmpleadoBoton({ empleadoId }: { empleadoId: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function onClick() {
    if (!confirm("¿Retirar a este empleado? Sus liquidaciones pasadas no se borran.")) return;
    setPending(true);
    const res = await retirarEmpleado(empleadoId);
    setPending(false);
    if (!res.ok) {
      alert(res.message);
      return;
    }
    router.refresh();
  }

  return (
    <button onClick={onClick} disabled={pending} className="text-sm text-red-400 hover:text-red-300 disabled:opacity-50">
      {pending ? "Retirando…" : "Retirar"}
    </button>
  );
}
