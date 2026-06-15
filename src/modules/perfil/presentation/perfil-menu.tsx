"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Camera, ChevronDown, LogOut, Trash2 } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { btnPrimario, input, labelCampo } from "@/components/ui/estilos";
import { archivoAFotoDataUrl } from "@/shared/imagen";
import { actualizarPerfil } from "../application/perfil-actions";

export function PerfilMenu({
  nombre: nombreInicial,
  email,
  fotoUrl,
}: {
  nombre: string;
  email: string;
  fotoUrl: string | null;
}) {
  const router = useRouter();
  const ref = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [abierto, setAbierto] = useState(false);
  const [nombre, setNombre] = useState(nombreInicial);
  const [foto, setFoto] = useState<string | null>(fotoUrl);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!abierto) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setAbierto(false);
    };
    const onEsc = (e: KeyboardEvent) => e.key === "Escape" && setAbierto(false);
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onEsc);
    };
  }, [abierto]);

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

  async function onGuardar() {
    setError(null);
    setPending(true);
    const res = await actualizarPerfil({ nombre, foto_url: foto });
    setPending(false);
    if (!res.ok) {
      setError(res.message);
      return;
    }
    setAbierto(false);
    router.refresh();
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setAbierto((v) => !v)}
        aria-expanded={abierto}
        className="flex items-center gap-2.5 rounded-full py-1 pl-1 pr-2.5 transition-colors hover:bg-white/5"
      >
        <Avatar nombre={nombre} src={foto} size={32} />
        <span className="hidden text-left sm:block">
          <span className="block text-sm font-medium leading-tight text-texto">{nombre}</span>
          <span className="block text-[11px] leading-tight text-texto-tenue">{email}</span>
        </span>
        <ChevronDown className={`h-4 w-4 text-texto-tenue transition-transform ${abierto ? "rotate-180" : ""}`} aria-hidden />
      </button>

      {abierto && (
        <div className="animate-aparecer absolute right-0 top-full z-50 mt-3 w-72 overflow-hidden rounded-xl border border-white/10 bg-superficie-baja shadow-2xl">
          <div className="flex flex-col items-center gap-3 border-b border-white/10 px-5 py-5">
            <div className="relative">
              <Avatar nombre={nombre} src={foto} size={72} />
              <button
                onClick={() => fileRef.current?.click()}
                aria-label="Cambiar foto"
                className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full border border-white/15 bg-superficie-alta text-primario-claro transition-colors hover:bg-superficie"
              >
                <Camera className="h-3.5 w-3.5" aria-hidden />
              </button>
              <input ref={fileRef} type="file" accept="image/*" onChange={onPickFoto} className="hidden" />
            </div>
            {foto && (
              <button
                onClick={() => setFoto(null)}
                className="flex items-center gap-1 text-xs text-texto-tenue transition-colors hover:text-peligro"
              >
                <Trash2 className="h-3 w-3" aria-hidden /> Quitar foto
              </button>
            )}
          </div>

          <div className="px-5 py-4">
            <label className={labelCampo}>
              Nombre
              <input value={nombre} onChange={(e) => setNombre(e.target.value)} className={input} />
            </label>
            {error && <p className="mt-2 text-xs text-peligro">{error}</p>}
            <button onClick={onGuardar} disabled={pending} className={`${btnPrimario} mt-3 w-full`}>
              {pending ? "Guardando…" : "Guardar cambios"}
            </button>
          </div>

          <form action="/auth/signout" method="post" className="border-t border-white/10">
            <button className="flex w-full items-center gap-2 px-5 py-3 text-sm text-texto-tenue transition-colors hover:bg-white/5 hover:text-texto">
              <LogOut className="h-4 w-4" aria-hidden /> Cerrar sesión
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
