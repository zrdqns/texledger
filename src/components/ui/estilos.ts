/**
 * Primitivas de estilo TexLedger (Fase 7 · paleta industrial ámbar).
 * REGLA DURA (spec §2.4): cada const es un string de clases COMPLETO y LITERAL.
 * Nunca construir nombres de clase dinámicamente ("bg-" + x). Las variantes son
 * consts separadas; la única composición permitida es concatenar consts enteras.
 */
export const btnPrimario =
  "inline-flex items-center justify-center gap-2 rounded-lg bg-primario px-4 py-2 text-sm font-semibold text-fondo shadow-[0_0_18px_rgba(245,165,36,0.35)] transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] hover:brightness-110 active:scale-95 disabled:opacity-50";
export const btnSecundario =
  "inline-flex items-center justify-center gap-2 rounded-lg border border-white/15 bg-superficie px-4 py-2 text-sm font-medium text-texto-suave transition-colors hover:border-primario/40 hover:bg-white/5 hover:text-texto disabled:opacity-50";
export const btnPeligroTexto = "text-sm text-peligro transition-opacity hover:opacity-80 disabled:opacity-50";
export const input =
  "rounded-lg border border-white/15 bg-superficie-alta px-3 py-2 text-texto outline-none transition-colors placeholder:text-texto-tenue focus:border-primario focus:ring-1 focus:ring-primario";
export const labelCampo = "flex flex-col gap-1 text-sm text-texto-tenue";
export const card = "rounded-xl border border-white/10 bg-superficie-baja p-5";
export const cardInteractiva =
  "group relative overflow-hidden rounded-xl border border-white/10 bg-superficie-baja p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-primario/40 hover:bg-superficie";
export const badgeOk =
  "inline-flex items-center rounded-full bg-emerald-500/15 px-2 py-0.5 text-xs font-medium text-emerald-400";
export const badgePeligro =
  "inline-flex items-center rounded-full bg-peligro/15 px-2 py-0.5 text-xs font-medium text-peligro";
export const badgeAcento =
  "inline-flex items-center rounded-full bg-acento/15 px-2 py-0.5 text-xs font-medium text-acento";
export const badgeNeutro =
  "inline-flex items-center rounded-full bg-superficie-alta px-2 py-0.5 text-xs font-medium text-texto-suave";
export const tabla = "w-full text-sm [&_td]:pr-4 [&_th]:pr-4";
export const theadFila = "border-b border-white/10 text-left text-texto-tenue";
export const thCelda = "py-2.5 text-xs font-semibold uppercase tracking-wider";
export const tdBase = "py-2.5";
export const filaTabla = "border-b border-white/5 transition-colors hover:bg-primario/[0.04]";
export const linkSuave = "text-sm text-texto-tenue transition-colors hover:text-texto";
export const subtituloSeccion = "text-lg font-semibold text-texto";
export const pillActiva =
  "rounded-full bg-primario px-3.5 py-1.5 text-sm font-bold text-fondo shadow-[0_0_12px_rgba(245,165,36,0.4)]";
export const pillInactiva =
  "rounded-full border border-white/10 bg-superficie px-3.5 py-1.5 text-sm text-texto-suave transition-colors hover:border-primario/40 hover:text-texto";
