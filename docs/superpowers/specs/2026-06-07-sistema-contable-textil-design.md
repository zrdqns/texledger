# Diseño — Sistema de gestión contable y operativa textil

> Fecha: 2026-06-07 · Estado: aprobado en brainstorming · Moneda: COP · TZ: America/Bogota · UI: español

## 1. Contexto y objetivo

Sistema web de gestión contable y operativa para una empresa de manufactura textil colombiana, construido desde cero. Dashboard oscuro tipo fintech. Módulos: auth, inventario, pedidos, contabilidad, nómina, recordatorios, dashboard.

## 2. Decisiones cerradas (brainstorming)

1. **Consumo de tela por prenda:** fijo por modelo/referencia (default), con **override por pedido**.
2. **Usuarios:** **usuario único** (cuenta con acceso total). Tabla `perfiles` con `rol` queda lista por si se agregan roles después.
3. **Valuación de inventario:** **solo control de cantidades** (metros/unidades). Sin costeo (ni promedio ponderado ni PEPS) por ahora.
4. **Notificaciones:** **solo in-app** (pg_cron + tabla `notificaciones`). Email queda como mejora posterior.
5. **Facturación electrónica DIAN:** **excluida por completo del alcance.** La empresa ya factura electrónicamente por fuera; no se integra (ni en fase posterior).
6. **Valores legales nómina:** **parámetros configurables**, no hardcoded. Defaults Colombia 2026 (sección 6).
7. **Excel de inventario:** formato propuesto y aprobado (sección 5).
8. **Flujo Pedido↔Inventario:** los metros llegados **salen del stock de bodega**; el **sobrante regresa automáticamente** al stock como devolución (el inventario siempre cuadra con lo físico).

## 3. Stack y arquitectura (fijados por el prompt maestro)

- **Framework:** Next.js 16 (App Router, Server Components, Server Actions) + TypeScript strict.
- **Backend/datos:** Supabase — Postgres + Auth (email/password) + Storage (comprobantes/facturas) + RLS.
- **Operaciones atómicas:** funciones Postgres (RPC `SECURITY DEFINER`).
- **Validación:** Zod (cliente + servidor). **Formularios:** react-hook-form + Zod. **Estado/datos cliente:** TanStack Query.
- **UI:** Tailwind + shadcn/ui; recharts; tema oscuro fintech.
- **Import Excel:** SheetJS (`xlsx`) en Server Action, validado fila a fila con Zod.
- **Tests:** Vitest (TDD) + Playwright (e2e flujos críticos). **CI:** GitHub Actions (lint + typecheck + tests por PR).

**Estructura:** monolito modular DDD. Cada módulo en `src/modules/<modulo>/` con `domain/` (entidades + reglas puras, sin framework), `application/` (casos de uso/Server Actions), `infrastructure/` (acceso Supabase/RPC), `presentation/` (componentes + páginas). `src/shared/`, `src/core/`, `src/components/ui/`. SQL versionado en `supabase/migrations/` y `supabase/seed/`.

## 4. Modelo de datos

**auth**
- `perfiles`: id (FK auth.users), nombre, rol (default `admin`), created_at, updated_at.

**inventario**
- `telas`: id, referencia (única), descripcion, composicion, color, ancho_m, gramaje_gm2, proveedor, unidad (default `metros`), stock_actual_m (derivado del kardex; se muta solo vía RPC), paquetes_rollos, umbral_bajo_stock_m, consumo_prenda_m (nullable, default del modelo), lote, ubicacion, created_at, updated_at.
- `movimientos_inventario` (kardex): id, tela_id (FK), tipo (`entrada`/`salida`/`devolucion`/`ajuste`), origen (`rollo`/`pedido`/`importacion`/`manual`), cantidad_m, prendas (nullable), consumo_aplicado (nullable), pedido_id (nullable FK), saldo_resultante_m, nota, usuario_id, created_at.

**pedidos**
- `pedidos`: id, empresa_cliente, fecha, tela_id (FK), metros_llegados_planta, prendas_pedidas, consumo_prenda_m (override), metros_consumidos, saldo_tela_m, estado (`borrador`/`confirmado`/`cerrado`), nota, created_at, updated_at, usuario_id.

**contabilidad**
- `cuentas_bancarias`: id, nombre, banco, numero (nullable), created_at, updated_at.
- `facturas`: id, tipo (`venta`/`compra`), numero, tercero, fecha_emision (date), valor, declarada (bool), estado (`pendiente`/`pagada`), archivo_url (nullable), nota, created_at, updated_at. Unicidad: índices parciales `UNIQUE(numero) WHERE tipo='venta'` y `UNIQUE(tercero, numero) WHERE tipo='compra'`.
- `ingresos`: id, fecha (date), concepto, valor, numero_comprobante, comprobante_url (nullable), factura_id (nullable FK), cuenta_bancaria_id (nullable FK), created_at, updated_at.
- `egresos`: id, fecha_pago (date), cuenta_bancaria_id (FK, banco), valor, concepto, numero_comprobante, comprobante_url (nullable), factura_id (nullable FK), created_at, updated_at.

**nomina**
- `parametros_nomina`: id, anio (único), smmlv, auxilio_transporte, tope_auxilio_smmlv, pct_pension, pct_salud, created_at, updated_at.
- `empleados`: id, nombre, documento, cargo, sueldo_basico, seguro_tipo (`fijo`/`porcentaje`/`ninguno`), seguro_valor, activo (bool), fecha_ingreso, created_at, updated_at.
- `liquidaciones`: id, empleado_id (FK), periodo_anio, periodo_mes, dias_laborados, incapacidades_dias, licencias_dias, ajuste_incap_licencia_valor, sueldo_prop, auxilio_prop, total_devengado, ded_pension, ded_salud, ded_seguro, libranzas, total_deducido, neto_pagado, created_at, updated_at.

**recordatorios**
- `recordatorios`: id, tipo (`factura`/`pago_pendiente`/`factura_sin_declarar`), descripcion, fecha_objetivo (date), estado (`pendiente`/`cumplido`/`vencido`), factura_id (nullable FK), created_at, updated_at.
- `notificaciones`: id, tipo, titulo, mensaje, leida (bool), entidad_tipo, entidad_id, created_at.

**dashboard:** sin tablas propias; vistas/consultas de agregación.

## 5. Formato Excel de inventario (import)

| Columna | Tipo | Requerido | Notas |
|---|---|---|---|
| `referencia` | texto | sí | SKU único |
| `descripcion` | texto | sí | Nombre/tipo de tela |
| `composicion` | texto | no | Ej. "95% algodón, 5% spandex" |
| `color` | texto | no | |
| `ancho_m` | número | no | Ancho del rollo (m) |
| `gramaje_gm2` | número | no | g/m² |
| `proveedor` | texto | no | |
| `metraje_inicial_m` | número | sí | Stock inicial en metros |
| `paquetes_rollos` | entero | no | |
| `unidad` | texto | sí | Default "metros" |
| `umbral_bajo_stock_m` | número | sí | Dispara alerta |
| `consumo_prenda_m` | número | no | m/prenda por defecto |
| `lote` | texto | no | Trazabilidad |
| `ubicacion` | texto | no | Bodega/estante |

Validación Zod fila a fila en Server Action. Filas inválidas se reportan; no se confía en el archivo. El import **siembra el kardex** (movimiento `entrada`/`importacion` por cada fila) y el stock se ajusta vía RPC; nunca escribe `stock_actual_m` directo. **Re-import de una `referencia` existente se rechaza** y se reporta como fila inválida (el alta inicial no pisa stock vivo).

## 6. Fórmulas de dominio (puras y testeadas en `domain/`)

**Inventario — salida por prenda:** `metros = prendas × consumo_prenda_m`

**Pedido (sale de bodega, sobrante regresa):**
- `metros_consumidos = prendas_pedidas × consumo_prenda_m`
- `saldo_tela_m = metros_llegados_planta − metros_consumidos`
- Al confirmar (RPC atómica): kardex registra **salida** de `metros_llegados_planta` + **devolución** de `saldo_tela_m`. Efecto neto en stock = `−metros_consumidos`.
- "Queda sobrante" si `saldo_tela_m > 0` (indicar cuánto); "no queda" si `= 0`; déficit si `< 0` (alerta).
- **Consumo efectivo:** si el override del pedido y el `consumo_prenda_m` de la tela son ambos `null`, no se puede calcular `metros_consumidos`; Zod/RPC rechazan la confirmación.
- **Stock disponible:** la RPC rechaza confirmar si `metros_llegados_planta > stock_actual_m` (no se permite stock negativo).

**Nómina** (parámetros desde `parametros_nomina` del año):
- `sueldo_prop = sueldo_basico × (dias_laborados / 30)`
- `aplica_auxilio = sueldo_basico ≤ tope_auxilio_smmlv × smmlv` → `auxilio_prop = auxilio_transporte × (dias_laborados / 30)`, si no `auxilio_prop = 0`
- `total_devengado = sueldo_prop + auxilio_prop + ajuste_incap_licencia_valor`
- `IBC = total_devengado − auxilio_prop` (el auxilio no es factor salarial)
- `ded_pension = IBC × pct_pension / 100`
- `ded_salud = IBC × pct_salud / 100`
- `ded_seguro = (seguro_tipo = 'fijo') ? seguro_valor : (seguro_tipo = 'porcentaje') ? sueldo_basico × seguro_valor / 100 : 0` — **base = sueldo básico**
- `total_deducido = ded_pension + ded_salud + ded_seguro + libranzas`
- `neto_pagado = total_devengado − total_deducido`
- **Redondeo COP:** cada devengado y cada deducción se redondea al peso (half-up) dentro de `domain/` antes de sumar; resultados sin decimales.
- **Simplificación documentada (v1):** `ajuste_incap_licencia_valor` es un único campo manual. No automatiza que el auxilio no se paga en días de incapacidad ni el piso de IBC de 1 SMMLV proporcional; es responsabilidad del usuario. Verificar los defaults 2026 contra cifras oficiales antes de operar.

**Defaults seed `parametros_nomina` 2026:** smmlv = 1.750.905 · auxilio_transporte = 249.095 · tope_auxilio_smmlv = 2 · pct_pension = 4 · pct_salud = 4. (Confirmados como estándar Colombia; se adaptarán a los valores reales de la empresa cuando estén disponibles.)

## 7. Seguridad y transversal

- **RLS activado** en todas las tablas. Usuario único → políticas para rol `authenticated` (owner). Estructura lista para roles futuros.
- **RPC `SECURITY DEFINER`** para toda escritura transaccional: entrada de tela (rollo), confirmar pedido (salida + devolución), import Excel (bulk), registrar ingreso/egreso. **`EXECUTE` revocado a `anon` y `authenticated`.** Las Server Actions las invocan con service role tras `getUser()` + validación Zod. El cliente nunca llama RPC ni actualiza stock directamente.
- **Storage privado:** comprobantes y facturas en bucket **privado** + RLS sobre `storage.objects`; acceso vía URLs firmadas de vida corta. Nunca bucket público.
- Autenticación en guards de servidor con `getUser()` (no `getSession()`). Rate limiting de login con el limitador integrado de Supabase Auth (sin infra extra); si algún endpoint sensible adicional lo requiere, limitador respaldado en tabla Postgres.
- Triggers `updated_at` en todas las tablas mutables. **Fechas de negocio** (`fecha`, `fecha_emision`, `fecha_pago`, `fecha_objetivo`, `periodo_anio`/`periodo_mes`) como `date`/enteros; `timestamptz` (UTC) solo para `created_at`/`updated_at` y eventos del kardex, mostrados en America/Bogota. COP entero (sin decimales).
- pg_cron diario: recordatorios vencidos + bajo stock + facturas sin declarar → inserta en `notificaciones`, con **clave de idempotencia** (índice único parcial sobre no-leídas por `tipo + entidad_tipo + entidad_id + día`) para no duplicar alertas.
- `remotePatterns` y config de Supabase parametrizados por entorno.
- `/security-review` obligatorio antes de cada merge a `main`.

## 7.1 Invariantes transaccionales (resolver antes de migraciones)

- **`stock_actual_m` derivado:** se muta **solo** dentro de RPC. Test de CI que afirme `stock_actual_m == SUM(cantidad_m con signo de movimientos_inventario)` por tela.
- **`confirmar_pedido` (RPC, una transacción):** `SELECT ... FOR UPDATE` sobre la tela; exige `estado='borrador'` (idempotencia: reintento sobre `confirmado` no duplica); valida consumo efectivo y `metros_llegados_planta ≤ stock_actual_m` (rechaza si no alcanza); asienta `salida` + `devolucion`; transiciona a `confirmado`.
- **Pedido `cerrado`:** transición manual `confirmado → cerrado` por el usuario (cierre administrativo); sin efecto en stock.

## 8. Fases de entrega

- **Fase 0 — Cimientos:** scaffold Next.js + TS strict, estructura DDD, Supabase, CI, git/GitHub, auth (login email/password), shell del dashboard oscuro.
- **Fase 1 — Inventario:** telas, stock, entrada por rollo, salida por unidad, alertas de bajo stock, import Excel.
- **Fase 2 — Pedidos:** historial + conciliación de saldo (consume/devuelve inventario).
- **Fase 3 — Contabilidad:** ingresos, egresos, comprobantes, facturas, banco, fechas; reportes filtrables por rango.
- **Fase 4 — Nómina:** empleados + liquidación con las fórmulas de la sección 6.
- **Fase 5 — Recordatorios:** facturas, pagos pendientes, sin declarar + notificaciones (pg_cron).
- **Fase 6 — Dashboard:** métricas, gráficos (recharts) y tablas con datos reales.
- **Fase 7 — Pulido visual:** pasada final (high-end-visual-design).

Cada fase: rama propia (worktree) → TDD → `/code-review` + `/simplify` → `/security-review` → merge → finishing-a-development-branch.
