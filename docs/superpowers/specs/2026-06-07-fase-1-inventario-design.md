# Diseño — Fase 1: Inventario

> Fecha: 2026-06-07 · Estado: aprobado en brainstorming · Depende del spec del sistema: [2026-06-07-sistema-contable-textil-design.md](2026-06-07-sistema-contable-textil-design.md)

## 1. Alcance

Inventario de tela operable de forma autónoma (antes de Pedidos/Fase 2): catálogo de referencias, kardex de movimientos, entrada por rollo, salida manual (por prenda o por metros), ajuste por conteo físico, alertas de bajo stock e importación desde Excel con previsualización.

## 2. Decisiones cerradas (brainstorming Fase 1)

1. **Operaciones manuales:** entrada (rollo) + salida (manual) + ajuste (conteo físico). Kardex completo y usable sin depender de Pedidos.
2. **Unidad de salida:** por prenda (`prendas × consumo → metros`) **y** por metros directos (merma/muestra).
3. **Alertas de bajo stock:** indicador derivado en UI (badge + filtro, `stock_actual_m < umbral_bajo_stock_m`). La tabla `notificaciones` + pg_cron se mantienen para Fase 5.
4. **Import Excel:** subir → previsualizar válidas/inválidas → confirmar → asentar.
5. **Ciclo de vida de tela:** sin borrado físico (rompería el FK del kardex). Retiro suave con `activo = false`.
6. **Stock inicial:** "crear tela" registra solo metadata con `stock_actual_m = 0`. El stock entra por "registrar entrada" (manual) o por el import (bulk). No se setea stock al crear.

## 3. Modelo de datos (migración `0002_inventario.sql`)

`telas` y `movimientos_inventario` aún no existen (0001 solo creó `perfiles`). Esta migración los crea.

**`telas`** (campos del spec del sistema + `activo`):
- id (uuid pk), referencia (text, **único**), descripcion, composicion, color, ancho_m (numeric null), gramaje_gm2 (numeric null), proveedor (null), unidad (text default `metros`), **stock_actual_m (numeric not null default 0)**, paquetes_rollos (int null), umbral_bajo_stock_m (numeric not null), consumo_prenda_m (numeric null), lote (null), ubicacion (null), **activo (boolean not null default true)**, created_at, updated_at (timestamptz).

**`movimientos_inventario`** (kardex):
- id (uuid pk), tela_id (fk telas), tipo (text check ∈ {`entrada`,`salida`,`devolucion`,`ajuste`}), origen (text check ∈ {`rollo`,`pedido`,`importacion`,`manual`}), **cantidad_m (numeric not null)** — delta con signo (negativo en salidas y en ajustes a la baja), prendas (numeric null), consumo_aplicado (numeric null), pedido_id (uuid null, fk pedidos en Fase 2), **saldo_resultante_m (numeric not null)** — balance absoluto resultante tras el movimiento, nota (text null), usuario_id (uuid null), created_at (timestamptz).
- En Fase 1 se usan `tipo` ∈ {entrada, salida, ajuste} y `origen` ∈ {rollo, manual, importacion}.

**Transversal:** RLS `authenticated` en ambas tablas; trigger `updated_at` en `telas`; índices en `telas(referencia)` (único) y `movimientos_inventario(tela_id, created_at)`.

### Convención de signos del kardex (documentar en cada RPC)
- `cantidad_m`: delta con signo. Entrada `> 0`; salida `< 0`; ajuste = `stock_contado − stock_actual_m` (puede ser `< 0` o `> 0`).
- `saldo_resultante_m`: siempre el balance **absoluto** resultante (`= stock_actual_m` tras aplicar el movimiento).
- Consecuencia: `SUM(cantidad_m)` por tela = `stock_actual_m`; las queries sobre el kardex no necesitan lógica especial por tipo.

## 4. RPCs atómicas (`SECURITY DEFINER`)

Reglas comunes: `EXECUTE` revocado a `anon` y `authenticated`; las Server Actions las invocan con service role tras `getUser()` + validación Zod. `SELECT ... FOR UPDATE` sobre la tela. `stock_actual_m` se muta **solo** aquí; cada RPC inserta el movimiento con `cantidad_m` (con signo) y `saldo_resultante_m` (absoluto).

- **`registrar_entrada_tela(p_tela_id uuid, p_metros numeric, p_nota text)`**: valida `p_metros > 0`; `cantidad_m = +p_metros`, tipo `entrada`, origen `rollo`; sube stock; retorna nuevo stock.
- **`registrar_salida_tela(p_tela_id uuid, p_modo text, p_prendas numeric, p_consumo numeric, p_metros numeric, p_nota text)`**: si `p_modo='prenda'` → `metros = p_prendas × p_consumo` (exige ambos > 0); si `p_modo='metros'` → `metros = p_metros` (> 0). Valida `metros ≤ stock_actual_m` (**rechaza** si no alcanza; sin negativos). `cantidad_m = −metros`, tipo `salida`, origen `manual`; guarda `prendas`/`consumo_aplicado` cuando aplique; baja stock.
- **`registrar_ajuste_tela(p_tela_id uuid, p_stock_contado numeric, p_nota text)`**: valida `p_stock_contado ≥ 0`; `delta = p_stock_contado − stock_actual_m`; `cantidad_m = delta` (con signo), tipo `ajuste`, origen `manual`; setea `stock_actual_m = p_stock_contado`; `saldo_resultante_m = p_stock_contado`.
- **`importar_inventario(p_filas jsonb)`**: por fila crea `tela` (stock 0) e inserta entrada(`importacion`) con `metraje_inicial_m` (`cantidad_m = +metraje`, sube stock). **Rechaza** la transacción completa si alguna `referencia` ya existe (segunda línea de defensa; la dedup principal ocurre en la Server Action). Retorna resumen (creadas, metros totales).

## 5. Dominio puro (TDD con Vitest, en `src/modules/inventario/domain/`)

- `calcularMetrosSalida(modo: 'prenda'|'metros', args)`: `prenda` → `prendas × consumo`; `metros` → `metros`. Lanza/retorna error si faltan datos o ≤ 0.
- `esBajoStock(stock: number, umbral: number): boolean` → `stock < umbral`.
- Estas funciones se testean aisladas. La lógica SQL de las RPCs se verifica manualmente contra Supabase (no hay Postgres en CI todavía); el invariante `stock == SUM(cantidad_m)` queda garantizado por construcción (mutación solo vía RPC). Un test de invariante con Postgres en CI queda como mejora posterior.

## 6. Aplicación (Server Actions, `src/modules/inventario/application/`)

- **Telas:** `crearTela` (metadata, stock 0), `editarTela` (metadata/umbral/consumo), `retirarTela` (**UPDATE directo** `telas SET activo=false` con service role + `getUser()`; sin RPC, sin efecto en stock/kardex).
- **Movimientos:** `registrarEntrada`, `registrarSalida`, `registrarAjuste` → validan con Zod, hacen `getUser()`, llaman la RPC correspondiente con service role.
- **Import:** `previsualizarImport(file)` → parsea Excel con SheetJS, valida estructura/tipos fila a fila con Zod, y **consulta referencias existentes** (`SELECT referencia FROM telas WHERE referencia = ANY(...)`) para marcar duplicados; retorna { válidas, inválidas (con motivo), duplicadas }. `confirmarImport(filasValidas)` → llama `importar_inventario` (que igual rebota duplicados como defensa).

## 7. Presentación (`src/modules/inventario/presentation/` + rutas)

- **`/inventario`** (protegida): tabla de telas (referencia, descripción, stock, unidad, estado), **badge "bajo stock"** cuando `esBajoStock`, filtro "solo bajo stock", búsqueda por referencia/descripción, filtro activo/retiradas.
- **Detalle de tela** `/inventario/[id]`: ficha + kardex (lista de movimientos con tipo, cantidad con signo, saldo, fecha) + acciones entrada/salida/ajuste (modales con react-hook-form + Zod).
- **Import** `/inventario/importar`: subir Excel → tabla de previsualización (válidas/duplicadas/ inválidas con motivo) → botón confirmar (solo si hay válidas).
- Datos cliente con TanStack Query; revalidación tras mutaciones. Estética oscura; el look fino vendrá de los exports de Stitch.

## 8. Entrega

Rama propia `fase-1-inventario` → TDD (dominio) + migración + RPCs + Server Actions + UI → `/code-review` + `/simplify` → `/security-review` (RLS en telas/movimientos, `EXECUTE` revocado en RPCs, validación del Excel) → merge a `main` → `finishing-a-development-branch`.
