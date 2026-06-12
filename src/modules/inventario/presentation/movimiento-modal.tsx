"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  registrarEntrada,
  registrarSalida,
  registrarAjuste,
} from "../application/movimientos-actions";
import { btnPrimario, card, input, pillActiva, pillInactiva } from "@/components/ui/estilos";

type Tipo = "entrada" | "salida" | "ajuste";

const tipoPillActiva = "rounded-lg bg-primario px-3 py-1.5 text-sm capitalize text-white";

export function MovimientoModal({ telaId, consumoDefault }: { telaId: string; consumoDefault: number | null }) {
  const router = useRouter();
  const [tipo, setTipo] = useState<Tipo>("entrada");
  const [modo, setModo] = useState<"prenda" | "metros">("metros");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setPending(true);
    const fd = new FormData(e.currentTarget);
    const num = (k: string) => {
      const v = fd.get(k);
      return v === null || v === "" ? undefined : Number(v);
    };
    const nota = (fd.get("nota") as string) || undefined;

    let res;
    if (tipo === "entrada") {
      res = await registrarEntrada({ tela_id: telaId, metros: num("metros"), nota });
    } else if (tipo === "salida") {
      res = await registrarSalida({
        tela_id: telaId,
        modo,
        prendas: modo === "prenda" ? num("prendas") : undefined,
        consumo: modo === "prenda" ? num("consumo") : undefined,
        metros: modo === "metros" ? num("metros") : undefined,
        nota,
      });
    } else {
      res = await registrarAjuste({ tela_id: telaId, stock_contado: num("stock_contado"), nota });
    }

    setPending(false);
    if (!res.ok) {
      setError(res.message);
      return;
    }
    (e.target as HTMLFormElement).reset();
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className={`${card} flex flex-col gap-3`}>
      <div className="flex gap-2">
        {(["entrada", "salida", "ajuste"] as Tipo[]).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTipo(t)}
            className={tipo === t ? tipoPillActiva : `${pillInactiva} capitalize`}
          >
            {t}
          </button>
        ))}
      </div>

      {tipo === "entrada" && (
        <input name="metros" type="number" step="any" min="0" placeholder="Metros (rollo)" required className={input} />
      )}

      {tipo === "salida" && (
        <>
          <div className="flex gap-2">
            <button type="button" onClick={() => setModo("metros")} className={modo === "metros" ? pillActiva : pillInactiva}>Por metros</button>
            <button type="button" onClick={() => setModo("prenda")} className={modo === "prenda" ? pillActiva : pillInactiva}>Por prenda</button>
          </div>
          {modo === "metros" ? (
            <input name="metros" type="number" step="any" min="0" placeholder="Metros" required className={input} />
          ) : (
            <div className="flex gap-2">
              <input name="prendas" type="number" min="1" step="1" placeholder="Prendas" required className={`${input} flex-1`} />
              <input name="consumo" type="number" step="any" min="0" defaultValue={consumoDefault ?? undefined} placeholder="Consumo m/prenda" required className={`${input} flex-1`} />
            </div>
          )}
        </>
      )}

      {tipo === "ajuste" && (
        <input name="stock_contado" type="number" step="any" min="0" placeholder="Stock contado (m)" required className={input} />
      )}

      <input name="nota" type="text" placeholder="Nota (opcional)" className={input} />
      {error && <p className="text-sm text-peligro">{error}</p>}
      <button type="submit" disabled={pending} className={btnPrimario}>
        {pending ? "Guardando…" : "Registrar movimiento"}
      </button>
    </form>
  );
}
