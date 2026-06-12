/**
 * Primitivas de estilo TexLedger (Fase 7).
 * REGLA DURA (spec §2.4): cada const es un string de clases COMPLETO y LITERAL.
 * Nunca construir nombres de clase dinámicamente ("bg-" + x). Las variantes son
 * consts separadas; la única composición permitida es concatenar consts enteras.
 */
export const btnPrimario =
  "rounded-lg bg-primario px-4 py-2 text-sm font-medium text-white hover:bg-primario/85 disabled:opacity-50";
export const btnSecundario =
  "rounded-lg border border-borde bg-superficie px-4 py-2 text-sm font-medium text-texto-suave hover:bg-superficie-alta disabled:opacity-50";
export const btnPeligroTexto = "text-sm text-peligro hover:opacity-80 disabled:opacity-50";
export const input =
  "rounded-lg border border-borde bg-superficie-alta px-3 py-2 text-texto outline-none placeholder:text-texto-tenue focus:border-primario";
export const labelCampo = "flex flex-col gap-1 text-sm text-texto-tenue";
export const card = "rounded-xl border border-borde/60 bg-superficie-baja p-5";
export const cardInteractiva =
  "rounded-xl border border-borde/60 bg-superficie-baja p-5 transition-colors hover:bg-superficie";
export const badgeOk =
  "inline-flex items-center rounded-md bg-emerald-500/15 px-2 py-0.5 text-xs font-medium text-emerald-400";
export const badgePeligro =
  "inline-flex items-center rounded-md bg-peligro/15 px-2 py-0.5 text-xs font-medium text-peligro";
export const badgeAcento =
  "inline-flex items-center rounded-md bg-acento/15 px-2 py-0.5 text-xs font-medium text-acento";
export const badgeNeutro =
  "inline-flex items-center rounded-md bg-superficie-alta px-2 py-0.5 text-xs font-medium text-texto-suave";
export const tabla = "w-full text-sm [&_td]:pr-4 [&_th]:pr-4";
export const theadFila = "border-b border-borde/60 text-left text-texto-tenue";
export const thCelda = "py-2 font-medium";
export const tdBase = "py-2";
export const linkSuave = "text-sm text-texto-tenue hover:text-texto";
export const subtituloSeccion = "text-lg font-semibold text-texto";
export const pillActiva = "rounded-lg bg-superficie-alta px-3 py-1.5 text-sm text-texto";
export const pillInactiva =
  "rounded-lg border border-borde px-3 py-1.5 text-sm text-texto-suave hover:bg-superficie-alta";
