# Diseño — Fase 5: Recordatorios y Notificaciones

> Fecha: 2026-06-10 · Estado: aprobado en brainstorming · Depende de: [spec del sistema](2026-06-07-sistema-contable-textil-design.md) §4 (tablas recordatorios) y §7 (pg_cron + idempotencia)

## 1. Alcance

Recordatorios manuales (con fecha objetivo y estado) y notificaciones generadas automáticamente por un job diario: recordatorios vencidos, telas bajo stock y facturas sin declarar. Campana con badge de no-leídas en el header. Página `/recordatorios` para gestionar ambos.

## 2. Decisiones cerradas (brainstorming Fase 5)

1. **Campana en header** del layout protegido: badge con conteo de notificaciones no leídas (server-rendered con `contarNoLeidas()` en cada navegación), linkea a `/recordatorios`. **Sin dropdown** en v1.
2. **Idempotencia "una abierta por entidad":** máximo una notificación **no leída** por `(tipo, entidad_tipo, entidad_id)` — índice único parcial `where not leida` (sin componente de día). Si el usuario la marca leída y la condición persiste, el siguiente run crea otra.
3. **Facturas sin declarar:** alertan las de **venta y compra** con `declarada = false` y `fecha_emision` a **30+ días** de la fecha actual (Bogotá). Evita alertar facturas recién emitidas.
4. **Generación:** función SQL `generar_notificaciones()` agendada con **pg_cron diario a las 05:00 América/Bogotá (10:00 UTC)** + botón **"Generar ahora"** en `/recordatorios` que invoca la misma función vía service-role RPC (sirve para probar la fase y refrescar a demanda).
5. **Recordatorios sin editar y con hard delete** (v1): se crean, se marcan cumplidos o se eliminan. No hay historial dependiente, así que no aplica retiro lógico.
6. **Re-nag diario de vencidos (confirmado):** un recordatorio vencido con notificación leída pero no accionado vuelve a notificar cada día — regla uniforme con bajo stock y sin declarar. Cumplir/eliminar corta el ciclo (ver §5: resolver marca leída la alerta asociada).
7. **Estado visual derivado en render:** la columna `estado` existe para disparar notificaciones del job; la UI deriva el badge con el dominio (`cumplido` → esmeralda; si no, `esVencido(fecha_objetivo, hoy)` → rojo "vencido"; si no → zinc "pendiente"). Así no hay discrepancia entre el run de las 05:00 y lo que se ve.

## 3. Modelo de datos (migración `0007_recordatorios.sql`)

- **`recordatorios`**: id, tipo text not null check in (`'factura'`,`'pago_pendiente'`,`'factura_sin_declarar'`), descripcion text not null, fecha_objetivo date not null, estado text not null default `'pendiente'` check in (`'pendiente'`,`'cumplido'`,`'vencido'`), factura_id uuid null references facturas(id) **on delete set null**, created_at/updated_at + trigger `set_updated_at`.
- **`notificaciones`**: id, tipo text not null, titulo text not null, mensaje text not null, leida boolean not null default false, entidad_tipo text not null, entidad_id uuid not null, created_at (sin updated_at, según spec maestro).
  - **`create unique index uniq_notif_abierta on notificaciones(tipo, entidad_tipo, entidad_id) where not leida;`**
- **RLS:** select para `authenticated` en ambas tablas; escrituras solo service-role (sin políticas de escritura).
- **`generar_notificaciones()`** — `security definer`, `revoke execute from public, anon, authenticated`, `grant execute to service_role` (pg_cron corre como postgres, no le afecta el revoke):
  1. `update recordatorios set estado = 'vencido' where estado = 'pendiente' and fecha_objetivo < (now() at time zone 'America/Bogota')::date;`
  2. Inserta notificación por cada recordatorio `estado = 'vencido'` (tipo `recordatorio_vencido`, entidad `recordatorio`/id) con `on conflict (tipo, entidad_tipo, entidad_id) where not leida do nothing`.
  3. Inserta por cada tela activa con `stock_actual_m < umbral_bajo_stock_m` (tipo `bajo_stock`, entidad `tela`/id), mismo on conflict.
  4. Inserta por cada factura `declarada = false` con `fecha_emision <= (now() at time zone 'America/Bogota')::date - 30` (tipo `factura_sin_declarar`, entidad `factura`/id), mismo on conflict.
  5. **Retención:** `delete from notificaciones where leida and created_at < now() - interval '90 days';` — acota el crecimiento de la tabla en el mismo job.
  - Título/mensaje legibles en español con datos de la entidad (ej. "Bajo stock: <referencia> — quedan X m de un umbral de Y m").
- **pg_cron:** `create extension if not exists pg_cron;` + `select cron.schedule('generar-notificaciones-diarias', '0 10 * * *', $$select public.generar_notificaciones()$$);` — con jobname fijo es idempotente (pg_cron ≥ 1.4, el de Supabase, hace upsert por nombre).

## 4. Dominio puro (TDD, `src/modules/recordatorios/domain/`)

- `diasRestantes(fechaObjetivo: string, hoy: string): number` — diferencia en días calendario (fechas YYYY-MM-DD, sin TZ).
- `esVencido(fechaObjetivo: string, hoy: string): boolean` — `fechaObjetivo < hoy`.
- Usados por la UI para badges ("vence en N días" / "vencido hace N días"). Tests: hoy, futuro, pasado, cruces de mes/año.

## 5. Aplicación (Server Actions, `src/modules/recordatorios/application/`)

`ActionResult` + Zod; lecturas `createClient` (RLS), escrituras `createAdminClient`. **Toda acción — lecturas y mutaciones — abre con `await requireUser()`** antes de tocar el admin client (gate de sesión sobre cada escritura service-role, incluidas `eliminarRecordatorio` y `generarNotificacionesAhora`). Sin RPC salvo `generar_notificaciones`.

- **Recordatorios:** `listarRecordatorios()` (order fecha_objetivo asc), `crearRecordatorio` (schema: tipo enum, descripcion min 1, fecha_objetivo YYYY-MM-DD, factura_id uuid opcional), `marcarCumplido(id)` (estado='cumplido'), `eliminarRecordatorio(id)` (delete). **`marcarCumplido` y `eliminarRecordatorio` además marcan `leida = true` la notificación `recordatorio_vencido` abierta de ese recordatorio** (`entidad_tipo='recordatorio' and entidad_id=<id> and not leida`) en la misma acción — sin alertas huérfanas apuntando a recordatorios resueltos o borrados.
- **Notificaciones:** `listarNotificaciones()` (no leídas primero, luego por created_at desc, límite 50, **sin paginación en v1**), `contarNoLeidas()` (count head), `marcarLeida(id)`, `marcarTodasLeidas()`.
- **`generarNotificacionesAhora()`**: `admin.rpc("generar_notificaciones")` → revalida `/recordatorios`.

## 6. Presentación (`src/modules/recordatorios/presentation/` + rutas)

- **Header (layout protegido):** campana 🔔 con badge rojo del conteo (oculta el badge si 0), `Link` a `/recordatorios`. Server component (se actualiza al navegar).
- **`/recordatorios`**: dos secciones.
  - **Notificaciones:** lista de no leídas (título, mensaje, fecha) con "Marcar leída" por ítem y "Marcar todas"; botón **"Generar ahora"**; vacío → "No tienes notificaciones pendientes".
  - **Recordatorios:** tabla (tipo, descripción, fecha objetivo con `formatFechaBogota`, **badge derivado en render** según decisión 7 con `diasRestantes`/`esVencido` del dominio, factura vinculada si hay, acciones Cumplir/Eliminar con confirm) + link a **`/recordatorios/nuevo`**.
- **`/recordatorios/nuevo`**: form (tipo select, descripción, fecha objetivo date, factura opcional: select de **todas** las facturas etiquetadas "número — tercero").
- Estética oscura; tablas con `[&_td]:pr-4 [&_th]:pr-4`.

## 7. Entrega

Rama `fase-5-recordatorios` → TDD (dominio + schemas) + migración 0007 + Server Actions + UI → `/code-review` + `/simplify` → `/security-review` → **paso manual del usuario:** aplicar `0007_recordatorios.sql` en Supabase (habilitar pg_cron si el plan lo requiere) y probar con "Generar ahora" → merge a `main`.
