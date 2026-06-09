# Diseño — Fase 4: Nómina

> Fecha: 2026-06-09 · Estado: aprobado en brainstorming · Depende de: [spec del sistema](2026-06-07-sistema-contable-textil-design.md) §6 (fórmulas de nómina)

## 1. Alcance

Empleados y liquidación de nómina colombiana: devengado (sueldo proporcional + auxilio de transporte), deducciones (pensión, salud, seguro, libranzas) y neto pagado. Parámetros legales configurables por año. Cada liquidación es un **snapshot inmutable**. Desprendible imprimible por liquidación.

## 2. Decisiones cerradas (brainstorming Fase 4)

1. **Snapshot inmutable:** la liquidación guarda los insumos, los parámetros/valores usados y el desglose calculado. Cambiar parámetros después NO altera liquidaciones pasadas.
2. **Parámetros editables por año** desde la UI (2026 viene precargado por seed).
3. **Desprendible imprimible** por liquidación (`window.print()` sobre una vista con el desglose).
4. **Incapacidades/licencias:** campo único de **ajuste manual** (v1). Se registran días (informativo) y un valor de ajuste que el usuario calcula. No se automatiza el efecto legal.
5. **Base de `ded_seguro`:** el **sueldo básico completo del mes** (no proporcional a días). El seguro voluntario es una prima mensual pactada, independiente de los días trabajados. *(Si en algún caso debe prorratearse, es cambiar `sueldo_basico` por `sueldo_prop` en una línea del dominio.)*

## 3. Modelo de datos (migración `0006_nomina.sql`)

- **`parametros_nomina`**: id, **anio integer not null unique**, smmlv numeric not null, auxilio_transporte numeric not null, tope_auxilio_smmlv numeric not null default 2, pct_pension numeric not null default 4, pct_salud numeric not null default 4, created_at/updated_at. Trigger `updated_at`. **Seed 2026:** smmlv = 1750905, auxilio_transporte = 249095, tope_auxilio_smmlv = 2, pct_pension = 4, pct_salud = 4.
- **`empleados`**: id, nombre not null, documento text, cargo text, sueldo_basico numeric not null check (> 0), seguro_tipo text not null default 'ninguno' check in ('fijo','porcentaje','ninguno'), seguro_valor numeric not null default 0, activo boolean not null default true, fecha_ingreso date, created_at/updated_at. Trigger `updated_at`.
- **`liquidaciones`** (snapshot inmutable):
  - id, empleado_id uuid not null references empleados(id) on delete restrict,
  - periodo_anio integer not null, **periodo_mes integer not null check (periodo_mes between 1 and 12)**,
  - **insumos:** dias_laborados numeric not null, incapacidades_dias numeric not null default 0, licencias_dias numeric not null default 0, ajuste_incap_licencia_valor numeric not null default 0, libranzas numeric not null default 0,
  - **snapshot:** sueldo_basico numeric not null, smmlv numeric not null, auxilio_transporte numeric not null, tope_auxilio_smmlv numeric not null, pct_pension numeric not null, pct_salud numeric not null, seguro_tipo text not null, seguro_valor numeric not null,
  - **calculado:** sueldo_prop numeric not null, auxilio_prop numeric not null, total_devengado numeric not null, ibc numeric not null, ded_pension numeric not null, ded_salud numeric not null, ded_seguro numeric not null, total_deducido numeric not null, neto_pagado numeric not null,
  - usuario_id uuid references auth.users(id) on delete set null, created_at/updated_at. Trigger `updated_at`.
  - **UNIQUE (empleado_id, periodo_anio, periodo_mes)** (una liquidación por empleado/mes).
- **RLS:** select `authenticated` en las 3 tablas. Escrituras solo vía service-role.

## 4. Dominio puro (TDD — pieza crítica, `src/modules/nomina/domain/`)

`calcularLiquidacion(insumos, parametros)` con las fórmulas del spec §6 y **redondeo COP half-up por concepto** (reutiliza el patrón de `formatCOP`; el redondeo es `Math.round`):

```
insumos    = { sueldo_basico, dias_laborados, ajuste, libranzas, seguro_tipo, seguro_valor }
parametros = { smmlv, auxilio_transporte, tope_auxilio_smmlv, pct_pension, pct_salud }

sueldo_prop      = round(sueldo_basico × dias_laborados / 30)
aplica_auxilio   = sueldo_basico ≤ tope_auxilio_smmlv × smmlv
auxilio_prop     = aplica_auxilio ? round(auxilio_transporte × dias_laborados / 30) : 0
total_devengado  = sueldo_prop + auxilio_prop + ajuste
ibc              = total_devengado − auxilio_prop
ded_pension      = round(ibc × pct_pension / 100)
ded_salud        = round(ibc × pct_salud / 100)
ded_seguro       = seguro_tipo='fijo'       ? round(seguro_valor)
                 : seguro_tipo='porcentaje' ? round(sueldo_basico × seguro_valor / 100)   // base = sueldo básico completo
                 : 0
total_deducido   = ded_pension + ded_salud + ded_seguro + libranzas
neto_pagado      = total_devengado − total_deducido
```

Devuelve `{ sueldo_prop, auxilio_prop, total_devengado, ibc, ded_pension, ded_salud, ded_seguro, total_deducido, neto_pagado }`. Lanza si `dias_laborados <= 0` o `sueldo_basico <= 0`.

**Tests:** auxilio aplica vs no aplica (sueldo > 2 SMMLV); seguro fijo / porcentaje / ninguno; mes parcial (días < 30); ajuste y libranzas; redondeo.

**Simplificación documentada (v1):** `ajuste_incap_licencia_valor` es manual. No se automatiza que el auxilio no se paga en días de incapacidad ni el piso de IBC de 1 SMMLV proporcional; es responsabilidad del usuario.

## 5. Aplicación (Server Actions, `src/modules/nomina/application/`)

Escritura directa con service-role (sin RPC; no hay stock). `ActionResult` + Zod.
- **Parámetros:** `listarParametros`, `crearParametro` (por año), `editarParametro`. Esquema Zod.
- **Empleados:** `crearEmpleado`, `editarEmpleado`, `retirarEmpleado` (activo=false), `listarEmpleados`, `obtenerEmpleado`.
- **Liquidaciones:** `crearLiquidacion` (lee empleado + parámetros del año → `calcularLiquidacion` → inserta snapshot; `usuario_id` desde `getUser()`; mapea UNIQUE 23505 a BUSINESS "ya existe liquidación para ese empleado y mes"), `listarLiquidaciones`, `obtenerLiquidacion`. Si no hay parámetros para el año → BUSINESS "configura los parámetros del año".

## 6. Presentación (`src/modules/nomina/presentation/` + rutas)

- **`/nomina`**: hub (Empleados, Liquidaciones, Parámetros).
- **`/nomina/empleados`**: lista + **nuevo/editar** (nombre, documento, cargo, sueldo_basico, seguro_tipo/valor, fecha_ingreso).
- **`/nomina/liquidaciones`**: lista (empleado, periodo, neto). **`/nueva`**: selecciona empleado (carga sueldo_basico/seguro), ingresa periodo (año/mes), días laborados, incap./lic. (días + ajuste), libranzas, con **previsualización en vivo** del desglose (usa `calcularLiquidacion` importado en cliente, con los parámetros del año pasados desde el server).
- **`/nomina/liquidaciones/[id]`**: **desprendible imprimible** — desglose completo (devengado, deducciones, neto) en COP, con botón **Imprimir** (`window.print()`); estilos de impresión que oculten la navegación.
- **`/nomina/parametros`**: lista por año + **editar/crear año** (SMMLV, auxilio, tope, % pensión, % salud).
- Estética oscura; look fino con Stitch después.

## 7. Entrega

Rama `fase-4-nomina` → TDD (dominio `calcularLiquidacion`) + migración 0006 + Server Actions + UI → `/code-review` + `/simplify` → `/security-review` (RLS, validación, service-role solo servidor) → merge a `main` → `finishing-a-development-branch`. Paso manual del usuario: aplicar `0006_nomina.sql` en Supabase. Verificar contra cifras oficiales 2026 antes de operar en real.
