# Diseño — Fase 6: Dashboard

> Fecha: 2026-06-10 · Estado: aprobado en brainstorming · Depende de: [spec del sistema](2026-06-07-sistema-contable-textil-design.md) §8 (Fase 6: métricas, recharts, datos reales; dashboard sin tablas propias)

## 1. Alcance

Reemplazar el placeholder de `/dashboard` por datos reales: 4 cards del mes actual, 4 alertas operativas con link, gráfico de ingresos vs egresos de los últimos 12 meses (recharts) y tabla de últimos 10 movimientos. **Solo lecturas** (cliente authenticated + RLS); sin tablas nuevas, sin RPC, **sin migración** — no hay paso manual en Supabase.

## 2. Decisiones cerradas (brainstorming Fase 6)

1. **Agregación en TypeScript**, no vistas SQL: las actions leen filas del periodo y un **dominio puro (TDD)** agrega por mes. Con volúmenes de empresa pequeña, traer las filas es trivial y mantiene la lógica testeable con Vitest.
2. **Widgets:** cards del mes actual (ingresos, egresos, neto, stock total en metros) · alertas (telas bajo stock, facturas pendientes de pago, facturas sin declarar 30+ días, recordatorios vencidos) · gráfico 12 meses · últimos 10 movimientos.
3. **`requireUser()` una sola vez al inicio** de `obtenerResumenDashboard()`, antes del `Promise.all`; si no hay sesión, corta sin disparar las queries paralelas.
4. **Bajo stock cuenta solo telas activas:** la query incluye `.eq('activo', true)` explícito; el conteo TS aplica `stock_actual_m < umbral_bajo_stock_m` (comparación columna-columna que PostgREST no soporta en filtros).
5. **Criterio exacto de "sin declarar 30+ días" (contrato del dominio/test):** facturas con **`declarada = false`** y **`fecha_emision <= hoyBogotá − 30 días`**, de **ambos tipos** (`venta` y `compra`), **independiente de `estado`**. Nota: `declarada` es el booleano de declaración (DIAN); `estado` (`pendiente`/`pagada`) rastrea el **pago** y no participa en este criterio. Es el mismo predicado de `generar_notificaciones()` (migración 0007), de modo que la alerta del dashboard y las notificaciones nunca discrepan.
6. **"Facturas pendientes de pago"** = count de facturas con `estado = 'pendiente'` (ambos tipos).
7. **"Recordatorios vencidos"** = estado **derivado** (consistente con Fase 5 decisión 7): `estado = 'vencido'` **o** (`estado = 'pendiente'` y `fecha_objetivo < hoyBogotá`), vía `.or(...)` de PostgREST con count head.
8. **Mes actual** = mes calendario América/Bogotá (`hoyBogota()`).
9. **recharts se instala en esta fase** (`npm install recharts`); etiquetas del eje X en formato `MM/yy`.
10. El dominio trabaja con un shape normalizado `{ fecha, valor, ... }`; la **action normaliza** `fecha_pago → fecha` en egresos antes de llamar al dominio.

## 3. Dominio puro (TDD, `src/modules/dashboard/domain/`)

- `ultimosMeses(hoy: string, n: number): string[]` — claves `YYYY-MM` de los últimos n meses incluyendo el actual, viejo→nuevo. Tests: n=12 cruzando año.
- `agregarPorMes(ingresos: { fecha: string; valor: number }[], egresos: { fecha: string; valor: number }[], meses: string[]): { mes: string; ingresos: number; egresos: number }[]` — serie con **zero-fill** de meses sin datos; ignora filas cuyo `YYYY-MM` no esté en `meses`. Tests: zero-fill, suma por mes, orden, descarte fuera de rango.
- `mezclarMovimientos(ingresos: Movimiento[], egresos: Movimiento[], n: number)` con `Movimiento = { id, fecha, concepto, valor, created_at }` — devuelve `{ tipo: 'ingreso' | 'egreso', ...Movimiento }[]` ordenado por `fecha` desc (desempate `created_at` desc), primeros n. Tests: mezcla, orden, desempate, límite.
- `restarDias(fecha: string, n: number): string` — resta n días a una fecha `YYYY-MM-DD` (para el límite de 30 días). Tests: cruce de mes y de año.
- `contarBajoStock(telas: { stock_actual_m: number; umbral_bajo_stock_m: number }[]): number` — count de `stock < umbral`. Test directo.
- Cards del mes: reusa **`calcularTotalesReporte`** (dominio contabilidad) con las filas filtradas al mes actual; stock total = suma de `stock_actual_m` de las telas activas ya traídas.

## 4. Aplicación (`src/modules/dashboard/application/dashboard-actions.ts`)

`obtenerResumenDashboard(): Promise<ResumenDashboard>` (lectura directa, sin `ActionResult`, como los `listar*`):

1. `await requireUser()` — una sola vez, primero.
2. `hoy = hoyBogota()`; `meses = ultimosMeses(hoy, 12)`; `inicio = meses[0] + "-01"`; `limite30 = restarDias(hoy, 30)`.
3. `Promise.all` (cliente authenticated/RLS):
   - ingresos: `select id, fecha, concepto, valor, created_at` con `fecha >= inicio`.
   - egresos: `select id, fecha_pago, concepto, valor, created_at` con `fecha_pago >= inicio`.
   - telas: `select stock_actual_m, umbral_bajo_stock_m` con `.eq('activo', true)`.
   - count head facturas `estado = 'pendiente'`.
   - count head facturas `declarada = false` y `fecha_emision <= limite30`.
   - count head recordatorios `.or('estado.eq.vencido,and(estado.eq.pendiente,fecha_objetivo.lt.<hoy>)')`.
4. Normaliza egresos (`fecha_pago → fecha`), llama al dominio y arma `ResumenDashboard` (tipado en `domain/tipos.ts`): `{ cards: { ingresosMes, egresosMes, netoMes, stockTotalM }, serie, ultimos, alertas: { bajoStock, facturasPendientes, facturasSinDeclarar, recordatoriosVencidos } }`.

## 5. Presentación

- **`/dashboard` (`page.tsx`, server):** reemplaza el placeholder — fila de 4 cards (valores `formatCOP`; stock en `m` con `tabular-nums`) → fila de 4 alertas como mini-cards con `Link` y conteo (conteo > 0 resaltado en ámbar) → `<GraficoIngresosEgresos serie={...} />` → tabla de últimos movimientos (badge Ingreso esmeralda / Egreso rojo, `formatFechaBogota`, concepto, valor con signo). Tablas con `[&_td]:pr-4 [&_th]:pr-4`.
- **`src/modules/dashboard/presentation/grafico-ingresos-egresos.tsx`** (`"use client"`): recharts `BarChart` + `ResponsiveContainer` (altura ~280), barras `#10b981` (ingresos) y `#ef4444` (egresos), eje X `MM/yy`, eje Y compacto (`Intl` notación abreviada), `Tooltip` con fondo oscuro y `formatCOP`. Links de alertas: bajo stock → `/inventario`, pendientes y sin declarar → `/contabilidad/facturas`, vencidos → `/recordatorios`.
- Estética oscura actual; pulido fino en Fase 7.

## 6. Entrega

Rama `fase-6-dashboard` → `npm install recharts` → TDD dominio → action → UI → `/code-review` + `/simplify` → `/security-review` → merge a `main`. Sin migración: el usuario solo prueba `/dashboard` con sus datos reales.
