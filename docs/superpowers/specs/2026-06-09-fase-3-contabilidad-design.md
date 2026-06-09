# Diseño — Fase 3: Contabilidad

> Fecha: 2026-06-09 · Estado: aprobado en brainstorming · Depende de: [spec del sistema](2026-06-07-sistema-contable-textil-design.md)

## 1. Alcance

Ingresos, egresos, comprobantes y facturas. Egreso = fecha de pago + banco + valor. Un pago salda una factura (1:1). Subida de archivos (comprobantes/facturas) a bucket privado con URLs firmadas. Reportes filtrables por rango de fechas con totales.

## 2. Decisiones cerradas (brainstorming Fase 3)

1. **Archivos:** subida real a **bucket privado** de Supabase; acceso por **URL firmada** de vida corta.
2. **Factura ↔ pago:** un movimiento salda una factura (ingreso si `venta`, egreso si `compra`). Sin pagos parciales. Garantizado por `UNIQUE(factura_id)` en cada tabla de pago.
3. **Estado de factura:** automático (`pagada` si existe un pago que la referencia, si no `pendiente`), mantenido por trigger.
4. **Reportes:** tabla filtrable por rango + totales (ingresos, egresos, neto) en pantalla. Sin export por ahora.

## 3. Modelo de datos (migración `0005_contabilidad.sql`)

- **`cuentas_bancarias`**: id, nombre (not null), banco (not null), numero (nullable), activo (bool not null default true), created_at/updated_at. Trigger `updated_at`.
- **`facturas`**: id, tipo (text check in ('venta','compra')), numero (not null), tercero (not null), fecha_emision (date not null), valor (numeric not null check > 0), declarada (bool not null default false), **estado (text not null default 'pendiente' check in ('pendiente','pagada'))**, archivo_url (text null) — path en el bucket, nota (text), created_at/updated_at. Trigger `updated_at`.
  - Unicidad: `create unique index uniq_factura_venta on facturas(numero) where tipo='venta'`; `create unique index uniq_factura_compra on facturas(tercero, numero) where tipo='compra'`.
- **`ingresos`**: id, fecha (date not null default current_date), concepto (not null), valor (numeric not null check > 0), numero_comprobante (text null), comprobante_url (text null), factura_id (uuid null references facturas(id)), cuenta_bancaria_id (uuid null references cuentas_bancarias(id)), created_at/updated_at. Trigger `updated_at`.
- **`egresos`**: id, fecha_pago (date not null default current_date), cuenta_bancaria_id (uuid **not null** references cuentas_bancarias(id)) — el banco, valor (numeric not null check > 0), concepto (not null), numero_comprobante (text null), comprobante_url (text null), factura_id (uuid null references facturas(id)), created_at/updated_at. Trigger `updated_at`.

**Unicidad de pago (1:1):**
```sql
create unique index uniq_ingresos_factura on ingresos(factura_id) where factura_id is not null;
create unique index uniq_egresos_factura on egresos(factura_id) where factura_id is not null;
```

**Índices para reportes (evitan full scan por rango):**
```sql
create index idx_ingresos_fecha on ingresos(fecha);
create index idx_egresos_fecha_pago on egresos(fecha_pago);
```

**Trigger `sync_factura_estado`** (consulta **ambas** tablas, independientemente de cuál disparó):
```sql
create or replace function public.sync_factura_estado() returns trigger
language plpgsql as $$
declare v_fid uuid;
begin
  v_fid := coalesce(new.factura_id, old.factura_id);
  if v_fid is not null then
    update facturas set estado = case
      when exists(select 1 from ingresos where factura_id = v_fid)
        or exists(select 1 from egresos where factura_id = v_fid)
      then 'pagada' else 'pendiente' end
    where id = v_fid;
  end if;
  return null;
end;
$$;
create trigger trg_sync_factura_ingresos after insert or update or delete on ingresos
  for each row execute function public.sync_factura_estado();
create trigger trg_sync_factura_egresos after insert or update or delete on egresos
  for each row execute function public.sync_factura_estado();
```
> El `EXISTS` contra ingresos **y** egresos garantiza que un DELETE en una tabla corrija el estado aunque el pago original estuviera en la otra.
>
> **Nota para fases futuras:** este trigger maneja correctamente INSERT y DELETE. En Fase 3 no existe `editarIngreso`/`editarEgreso`, así que `factura_id` nunca cambia en un UPDATE. Si una fase posterior agrega edición de pagos, el trigger debe recalcular **tanto** `old.factura_id` **como** `new.factura_id` cuando `old.factura_id IS DISTINCT FROM new.factura_id` (si no, la factura vieja quedaría `pagada` incorrectamente).

**RLS:** select `authenticated` en las 4 tablas. Escrituras solo vía service-role (Server Actions).

## 4. Storage (bucket privado)

En la misma migración:
```sql
insert into storage.buckets (id, name, public) values ('contabilidad', 'contabilidad', false)
on conflict (id) do nothing;
```
**Decisión de seguridad documentada:** el bucket es **privado** y **no se añaden policies a `storage.objects` a propósito**. Todo el acceso es server-side con **service-role** (que ignora RLS): subida con `admin.storage.upload`, lectura con `admin.storage.createSignedUrl(path, 60)`. El cliente nunca toca Storage directo; `storage.objects` queda en **default-deny** para `anon`/`authenticated`. (Si en el futuro se quisiera acceso directo del cliente, ahí sí se agregarían policies.)

Se guarda el **path** (`carpeta/archivo`) en `archivo_url`/`comprobante_url`, no una URL pública. Rutas: `facturas/{id}/{archivo}`, `ingresos/{id}/{archivo}`, `egresos/{id}/{archivo}`.

## 5. Dominio puro (TDD, `src/modules/contabilidad/domain/`)

- `calcularTotalesReporte(ingresos: {valor:number}[], egresos: {valor:number}[])` → `{ totalIngresos, totalEgresos, neto }` (neto = ingresos − egresos).

## 6. Aplicación (Server Actions, `src/modules/contabilidad/application/`)

Escritura directa con service-role (no hay operaciones de stock → sin RPC). Contrato `ActionResult`; validación Zod.
- **Cuentas:** `crearCuenta`, `editarCuenta`, `retirarCuenta` (activo=false), `listarCuentas`.
- **Facturas:** `crearFactura` (con archivo opcional), `editarFactura`, `listarFacturas` (filtro tipo/estado/declarada), `obtenerFactura`, `alternarDeclarada`.
  - **Inmutabilidad post-pago:** si `estado = 'pagada'`, `editarFactura` **rechaza** cambios a `tipo`, `numero`, `tercero`, `valor` y `fecha_emision` (devuelve `BUSINESS`: "no se puede editar una factura pagada"); solo `nota` y `archivo` quedan editables. (`declarada` se cambia por su propia acción.)
- **Ingresos / Egresos:** `crearIngreso` / `crearEgreso` (FormData con archivo opcional + factura opcional), `listarIngresos` / `listarEgresos`.
- **Reporte:** `consultarReporte(desde, hasta)` → `{ ingresos, egresos, totales }` (usa `calcularTotalesReporte`).
- **Archivos:** helper `subirArchivo(file, carpeta, id)` → path; `urlFirmada(path)` → signed URL (60s). Mapean errores a `ActionResult`.
- Unicidad de factura (índices parciales) → error 23505 mapeado a `BUSINESS` ("número de factura duplicado" / "factura ya tiene pago").

## 7. Presentación (`src/modules/contabilidad/presentation/` + rutas)

- **`/contabilidad`**: hub con accesos (Facturas, Ingresos, Egresos, Cuentas, Reportes) y un resumen breve.
- **`/contabilidad/facturas`**: lista (tipo, número, tercero, valor COP, estado, declarada con toggle) + **`/nueva`** (form con archivo).
- **`/contabilidad/ingresos`** y **`/contabilidad/egresos`**: lista + **`/nuevo`** (form: cuenta/banco, valor, fecha, concepto, comprobante archivo, factura opcional). Egreso exige banco.
- **`/contabilidad/cuentas`**: lista + nueva.
- **`/contabilidad/reportes`**: filtro por rango (desde/hasta) → tabla de movimientos + **totales (ingresos, egresos, neto)** en COP (`formatCOP`).
- Los archivos se muestran como enlace "Ver" que abre la URL firmada (acción servidor). Estética oscura; look fino con Stitch después.

## 8. Entrega

Rama `fase-3-contabilidad` → TDD (dominio) + migración 0005 + Server Actions + Storage + UI → `/code-review` + `/simplify` → `/security-review` (RLS, bucket privado default-deny, validación, service-role solo servidor) → merge a `main` → `finishing-a-development-branch`. Paso manual del usuario: aplicar `0005_contabilidad.sql` en Supabase.
