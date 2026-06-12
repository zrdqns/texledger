# Diseño — Fase 7: Pulido visual "TexLedger"

> Fecha: 2026-06-11 · Estado: aprobado en brainstorming · Depende de: [spec del sistema](2026-06-07-sistema-contable-textil-design.md) §8 (Fase 7: pasada final) · Referencia: proyecto Stitch "Sistema Contable Textil Integral" (`projects/4323820784519610208`, 5 pantallas exportadas en `stitch-export/`, gitignorado)

## 1. Alcance

Rediseño visual completo de las 30 rutas a partir del design system y los patrones de las 5 pantallas de Stitch. **Solo presentación**: cero cambios en dominio, actions, esquemas, migraciones o comportamiento. Los 86 tests existentes quedan intactos y verdes.

## 2. Decisiones cerradas (brainstorming Fase 7)

1. **Enfoque design system + patrones** (no pixel-perfect): tokens del `designTheme` de Stitch + patrones de layout de las pantallas, aplicados coherentemente a toda la app — incluyendo pedidos, forms y subpáginas que Stitch no diseñó.
2. **Branding TexLedger**: sidebar (logo + subtítulo "Contabilidad textil"), login y `<title>`/metadata.
3. **Alcance total**: shell, login y los 6 módulos con todas sus subpáginas, incluido el desprendible imprimible.
4. **Tailwind v4 — clases literales obligatorias (restricción dura):** toda const de `estilos.ts` y todo `className` es un **string completo y literal**. Prohibida la concatenación dinámica de fragmentos de clase (`"bg-" + color`, template strings que armen nombres de clase): el scanner de Tailwind solo incluye clases que aparecen literales en el código. Las variantes se definen como **consts separadas completas** (`btnPrimario`, `btnSecundario`, …); la composición permitida es concatenar consts ya literales (`` `${card} ${otra}` ``), nunca fabricar nombres.
5. **Iconos: lucide-react** (única dependencia nueva; tree-shakeable). No se agregan elementos sin funcionalidad real: la búsqueda global y las secciones Support/Settings del diseño Stitch **no** se implementan (no existen esas rutas).
6. **Fuentes vía `next/font`**: Inter (UI) y JetBrains Mono (cifras/datos tabulares), expuestas como variables CSS conectadas al `@theme`.
7. **Gráfico recharts re-tematizado**: ingresos azul primario `#4a8eff`, egresos naranja acento `#ef6719`; grid/ejes con los tokens nuevos. El rojo `error` queda para estados negativos/peligro (badges, deltas, botón eliminar). El **verde semántico** (positivo/éxito/badges OK) se mantiene con emerald de Tailwind (la paleta Material de Stitch no trae verde).
8. `stitch-export/` (HTML + PNG de las 5 pantallas) queda **gitignorado** como referencia local de implementación.

## 3. Tokens (`src/app/globals.css`, bloque `@theme` de Tailwind v4)

| Token | Valor | Uso |
|---|---|---|
| `--color-fondo` | `#10131a` | body |
| `--color-superficie-baja` | `#191c22` | cards de página |
| `--color-superficie` | `#1d2026` | cards principales / sidebar items hover |
| `--color-superficie-alta` | `#272a31` | inputs, hover, tooltip |
| `--color-borde` | `#414754` | bordes de cards/inputs/tablas |
| `--color-texto` | `#e1e2eb` | texto principal |
| `--color-texto-suave` | `#c1c6d7` | texto secundario |
| `--color-texto-tenue` | `#8b90a0` | labels, placeholders |
| `--color-primario` | `#4a8eff` | botón primario, ítem activo, links de acción |
| `--color-primario-claro` | `#adc7ff` | acentos sobre superficies, hover de links |
| `--color-acento` | `#ef6719` | alertas operativas, egresos en gráfico |
| `--color-peligro` | `#ffb4ab` | errores, deltas negativos, eliminar |

Radius base 8px (`rounded-lg` como default de componentes; cards `rounded-xl`). Las clases generadas (`bg-superficie`, `text-texto-tenue`, `border-borde`, …) reemplazan los `zinc-*`/`emerald-*` actuales en todas las rutas. Fuentes: `--font-sans` → Inter, `--font-mono` → JetBrains Mono (cifras con `font-mono tabular-nums`).

## 4. Shell y primitivas

- **`src/components/ui/sidebar.tsx`** (pasa a client component): logo TexLedger + subtítulo, label de sección "MENÚ", ítems con icono lucide (LayoutDashboard, Layers, ShoppingCart, Wallet, Users, Bell) y **estado activo** (pill `bg-primario` texto blanco) con el patrón exacto `pathname === href || pathname.startsWith(href + "/")` (evita falsos positivos tipo `/contabilidad-extra`); `print:hidden` se conserva.
- **Header** (`(protected)/layout.tsx`): mismos elementos actuales (título, Campana, Salir) con los estilos nuevos; sin búsqueda global (decisión 5).
- **`src/components/ui/estilos.ts`** — consts literales completas compartidas: `btnPrimario`, `btnSecundario`, `btnPeligroTexto`, `input`, `labelCampo`, `card`, `cardInteractiva`, `badgeOk`, `badgePeligro`, `badgeAcento`, `badgeNeutro`, `tabla`, `theadFila`, `thCelda`, `tdBase`, `linkSuave`, `subtituloSeccion`. Sustituyen los className repetidos en las ~30 rutas y forms. El estilo del título de página vive **dentro de PageHeader** (no se exporta una const `tituloPagina` — evita que se use suelta y genere inconsistencia); `subtituloSeccion` sí es pública porque los headers de sección intra-página (p. ej. "Notificaciones", "Últimos movimientos") no usan PageHeader. **No hay variante de botón destructivo relleno:** todas las acciones destructivas existentes son botones de texto con `confirm()` nativo (retirar tela/empleado, eliminar recordatorio); si algún día aparece un modal de confirmación propio, se agrega `btnPeligro` como const nueva (YAGNI hoy).
- **Componentes estructurales (solo 2):** `PageHeader` (`{ titulo, volverHref?, volverLabel?, accion? (ReactNode) }` — patrón back-link + h2 + botón que hoy se repite en todas las páginas) y `StatCard` (`{ label, valor, tono?: "ok" | "peligro" | "neutro" }` — cards de cifra del dashboard e inventario; cada tono mapea a una const literal completa, sin armar clases dinámicamente). Nada más (YAGNI).

## 5. Aplicación por módulo (referencia Stitch → rutas)

| Referencia | Rutas | Patrones clave |
|---|---|---|
| `login.png/html` | `/login` | card centrada, logo TexLedger, inputs y CTA nuevos |
| `dashboard.png/html` | `/dashboard` | saludo, StatCards con delta, gráfico re-tematizado, tabla en card |
| `inventario.png/html` | `/inventario/**` | StatCards arriba, tabla en card con búsqueda existente, badges Óptimo/Crítico para stock vs umbral |
| `nomina.png/html` | `/nomina/**` | tablas en card, desprendible re-estilizado conservando `@media print` |
| `finanzas-recordatorios.png/html` | `/contabilidad/**`, `/recordatorios/**` | tabs/listas en cards, badges de estado, alertas con acento naranja |
| (patrones generales) | `/pedidos/**` y todos los forms `nuevo`/`editar` | mismos tokens y primitivas |

Los HTML de Stitch se consultan como referencia de estructura/espaciado durante la implementación; no se copian (usan Material Symbols y markup estático ajenos al stack).

## 6. Restricciones duras

- Archivos tocables: `globals.css`, `layout.tsx` (raíz y protegido), `page.tsx` de rutas, componentes en `*/presentation/` y `src/components/ui/`. **Prohibido tocar** `domain/`, `application/`, `supabase/`, esquemas y tests.
- Clases Tailwind siempre literales (decisión 4).
- `@media print` del desprendible se preserva y se verifica tras el re-estilizado (fondo blanco, texto negro, sin navegación).
- Suite completa verde tras cada módulo; commit por módulo.

## 7. Entrega

Rama `fase-7-pulido-visual` → orden: ① tokens + fuentes + lucide-react ② shell ③ `estilos.ts` + PageHeader/StatCard ④ login ⑤ dashboard ⑥ inventario ⑦ pedidos ⑧ contabilidad ⑨ nómina (incl. desprendible/print) ⑩ recordatorios ⑪ verificación final → `/code-review` + `/simplify` → `/security-review` → **prueba visual del usuario módulo por módulo** en dev → merge a `main`. Sin migración.
