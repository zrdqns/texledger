const PALETA = [
  "bg-primario/20 text-primario-claro",
  "bg-acento/20 text-acento",
  "bg-emerald-500/20 text-emerald-300",
  "bg-violet-500/20 text-violet-300",
  "bg-rose-500/20 text-rose-300",
  "bg-cyan-500/20 text-cyan-300",
] as const;

function iniciales(nombre: string): string {
  const partes = nombre.trim().split(/\s+/).filter(Boolean);
  if (partes.length === 0) return "—";
  if (partes.length === 1) return partes[0]!.slice(0, 2).toUpperCase();
  return (partes[0]![0]! + partes[1]![0]!).toUpperCase();
}

function colorDe(nombre: string): string {
  let h = 0;
  for (const c of nombre) h = (h * 31 + c.charCodeAt(0)) | 0;
  return PALETA[Math.abs(h) % PALETA.length]!;
}

export function Avatar({ nombre, src, size = 36 }: { nombre: string; src?: string | null; size?: number }) {
  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- data URL en BD; next/image no aporta aquí
      <img
        src={src}
        alt={nombre}
        width={size}
        height={size}
        style={{ width: size, height: size }}
        className="shrink-0 rounded-full object-cover ring-1 ring-white/10"
      />
    );
  }
  return (
    <span
      style={{ width: size, height: size, fontSize: Math.round(size * 0.34) }}
      className={`flex shrink-0 items-center justify-center rounded-full font-semibold ${colorDe(nombre)}`}
      aria-hidden
    >
      {iniciales(nombre)}
    </span>
  );
}
