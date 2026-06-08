# Diseño — Fase 2: Pedidos

> Fecha: 2026-06-08 · Estado: aprobado en brainstorming · Depende de: [spec del sistema](2026-06-07-sistema-contable-textil-design.md) y [Fase 1 Inventario](2026-06-07-fase-1-inventario-design.md)

## 1. Alcance

Historial de pedidos con conciliación de saldo de tela. Cada pedido consume tela del inventario: los metros llegados a planta salen de bodega y el sobrante regresa (kardex auditable). Flujo borrador → confirmado, con anulación reversible.

## 2. Decisiones cerradas (brainstorming Fase 2)

1. **Estados:** `borrador` → `confirmado` → (`cerrado` manual) ; `anulado` desde `confirmado`. El borrador no toca stock.
2. **Anulación:** un pedido `confirmado` se puede anular; genera un movimiento compensatorio que restaura el stock; pasa a `anulado`.
3. **Consumo por prenda:** al crear el pedido se precarga el `consumo_prenda_m` de la tela y es editable en el pedido.
4. **Conciliación:** `saldo = metros_llegados − metros_consumidos`; "queda" si `> 0`, "exacto" si `= 0`, "déficit" si `< 0`.
5. **Confirmar (dos movimientos):** salida bruta de `metros_llegados` + devolución de `saldo` (cuando `saldo > 0`). Efecto neto en stock = `−metros_consumidos`. Kardex auditable.

## 3. Modelo de datos (migración `0004_pedidos.sql`)

**`pedidos`**:
- id (uuid pk default gen_random_uuid()), empresa_cliente (text not null), fecha (date not null default current_date), tela_id (uuid not null references telas(id) on delete restrict), metros_llegados_planta (numeric not null check > 0), prendas_pedidas (integer not null check > 0), consumo_prenda_m (numeric not null check > 0), metros_consumidos (numeric), saldo_tela_m (numeric) — **sin CHECK ≥ 0** (puede ser negativo en déficit), estado (text not null default 'borrador' check in ('borrador','confirmado','cerrado','anulado')), nota (text), usuario_id (uuid **not null references auth.users(id)**), created_at/updated_at (timestamptz). Trigger `updated_at`.
- `metros_consumidos` y `saldo_tela_m` quedan null mientras `borrador`; se calculan al confirmar.

**FK diferido de Fase 1:**
```sql
alter table public.movimientos_inventario
  add constraint fk_pedido foreign key (pedido_id) references public.pedidos (id);
```

**RLS:** `pedidos` select para `authenticated`.

## 4. RPCs atómicas (`SECURITY DEFINER`; `revoke ... from public, anon, authenticated`; `grant ... to service_role`; `set search_path = public`)

### `confirmar_pedido(p_pedido_id uuid)`
Idempotente y con guardas de estado:
- Lee el pedido `for update` (y la tela `for update`).
- **Si estado = `confirmado`:** retorna éxito silencioso (no-op). *(idempotencia: la segunda llamada es segura.)*
- **Si estado ∈ {`cerrado`,`anulado`}:** `raise exception 'estado invalido'`.
- **Si estado = `borrador`:** procede:
  - Valida `consumo_prenda_m > 0` y `prendas_pedidas > 0`.
  - `metros_consumidos = prendas_pedidas × consumo_prenda_m`; `saldo = metros_llegados_planta − metros_consumidos`.
  - Valida `metros_llegados_planta ≤ stock_actual_m` (si no, `raise exception 'stock insuficiente'`).
  - Asienta **salida** `cantidad_m = −metros_llegados_planta`, origen `pedido`, `pedido_id`, actualiza stock y `saldo_resultante_m`.
  - Si `saldo > 0`: asienta **devolución** `cantidad_m = +saldo`, origen `pedido`, `pedido_id`, actualiza stock y `saldo_resultante_m`.
  - Actualiza el pedido: `estado='confirmado'`, `metros_consumidos`, `saldo_tela_m = saldo`.

### `anular_pedido(p_pedido_id uuid)`
- Lee pedido + tela `for update`. Exige estado = `confirmado` (otro estado → `raise exception 'estado invalido'`).
- Movimiento compensatorio: `cantidad_m = +(metros_llegados_planta − greatest(saldo_tela_m, 0))` (= metros realmente consumidos del stock), tipo `devolucion`, origen `pedido`, `pedido_id`, nota 'Anulación'. Actualiza stock y `saldo_resultante_m`.
- Pasa el pedido a `estado='anulado'`.

> Crear/editar borrador y `cerrar` (confirmado→cerrado) son escrituras directas con service-role; sin efecto en stock. Editar solo permitido en `borrador`.

## 5. Dominio puro (TDD, `src/modules/pedidos/domain/`)

- `calcularConciliacion(metros_llegados: number, prendas: number, consumo: number)` → `{ metros_consumidos, saldo, estado: 'queda' | 'exacto' | 'deficit' }`. Lanza si `prendas <= 0` o `consumo <= 0`.

## 6. Aplicación (Server Actions, `src/modules/pedidos/application/`)

Usan el contrato `ActionResult<T>` de `src/shared/action-result.ts` y `mapRpcError` (de Fase 1).
- `crearPedido` (Zod; inserta borrador vía service-role; setea `usuario_id` desde `getUser()`).
- `editarPedido` (solo si `borrador`; valida estado antes de actualizar).
- `confirmarPedido` / `anularPedido` (RPC vía service-role; `mapRpcError`).
- `cerrarPedido` (directo: `confirmado → cerrado`).
- `listarPedidos`, `obtenerPedido` (lectura vía cliente authenticated).
- Esquemas Zod: `crearPedidoSchema` (empresa_cliente, fecha, tela_id, metros_llegados_planta > 0, prendas_pedidas int > 0, consumo_prenda_m > 0, nota?), `editarPedidoSchema` (+ id).

## 7. Presentación (`src/modules/pedidos/presentation/` + rutas)

- **`/pedidos`**: lista (empresa, fecha, tela.referencia, estado, badge de saldo: "Queda X m" / "Exacto" / "Déficit X m"). Filtro por estado.
- **`/pedidos/nuevo`**: form (select de tela **activa**, prendas, metros llegados, consumo precargado de la tela y editable) con **previsualización en vivo** de la conciliación (usando `calcularConciliacion`). Guarda como borrador.
- **`/pedidos/[id]`**: detalle con la conciliación, botón **Confirmar** (si `borrador`), **Anular** (si `confirmado`), **Cerrar** (si `confirmado`), y enlace a la tela. Tras confirmar, muestra los movimientos generados.
- Estética oscura; look fino con Stitch después.

## 8. Entrega

Rama `fase-2-pedidos` → TDD (dominio) + migración 0004 + RPCs + Server Actions + UI → `/code-review` + `/simplify` → `/security-review` (RLS, grants RPC, validación) → merge a `main` → `finishing-a-development-branch`. Paso manual del usuario: aplicar `0004_pedidos.sql` en Supabase.
