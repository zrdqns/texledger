-- ── Telas (catálogo de referencias) ──
create table public.telas (
  id uuid primary key default gen_random_uuid(),
  referencia text not null unique,
  descripcion text not null,
  composicion text,
  color text,
  ancho_m numeric,
  gramaje_gm2 numeric,
  proveedor text,
  unidad text not null default 'metros',
  stock_actual_m numeric not null default 0,
  paquetes_rollos integer,
  umbral_bajo_stock_m numeric not null,
  consumo_prenda_m numeric,
  lote text,
  ubicacion text,
  activo boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger trg_telas_updated_at
before update on public.telas
for each row execute function public.set_updated_at();

-- ── Kardex de movimientos ──
create table public.movimientos_inventario (
  id uuid primary key default gen_random_uuid(),
  tela_id uuid not null references public.telas (id) on delete restrict,
  tipo text not null check (tipo in ('entrada','salida','devolucion','ajuste')),
  origen text not null check (origen in ('rollo','pedido','importacion','manual')),
  cantidad_m numeric not null,                       -- delta con signo
  prendas integer check (prendas is null or prendas > 0),
  consumo_aplicado numeric,
  pedido_id uuid,                                    -- FK se agrega en 0003_pedidos.sql
  saldo_resultante_m numeric not null,               -- balance absoluto tras el movimiento
  nota text,
  usuario_id uuid,
  created_at timestamptz not null default now()
);

create index idx_movimientos_tela_fecha
  on public.movimientos_inventario (tela_id, created_at desc);

-- ── RLS: lectura para authenticated; escrituras solo vía service-role (RPC/directo) ──
alter table public.telas enable row level security;
alter table public.movimientos_inventario enable row level security;

create policy "telas_select_auth"
  on public.telas for select to authenticated using (true);

create policy "movimientos_select_auth"
  on public.movimientos_inventario for select to authenticated using (true);

-- ── RPC: entrada por rollo ──
create or replace function public.registrar_entrada_tela(
  p_tela_id uuid, p_metros numeric, p_nota text default null
) returns numeric
language plpgsql security definer set search_path = public
as $$
declare v_stock numeric;
begin
  if p_metros is null or p_metros <= 0 then raise exception 'metros invalido'; end if;
  select stock_actual_m into v_stock from telas where id = p_tela_id for update;
  if not found then raise exception 'tela no existe'; end if;
  v_stock := v_stock + p_metros;
  update telas set stock_actual_m = v_stock where id = p_tela_id;
  insert into movimientos_inventario (tela_id, tipo, origen, cantidad_m, saldo_resultante_m, nota)
  values (p_tela_id, 'entrada', 'rollo', p_metros, v_stock, p_nota);
  return v_stock;
end;
$$;
revoke execute on function public.registrar_entrada_tela(uuid, numeric, text) from public, anon, authenticated;
grant execute on function public.registrar_entrada_tela(uuid, numeric, text) to service_role;

-- ── RPC: salida manual (por prenda o por metros) ──
create or replace function public.registrar_salida_tela(
  p_tela_id uuid, p_modo text, p_prendas integer default null,
  p_consumo numeric default null, p_metros numeric default null, p_nota text default null
) returns numeric
language plpgsql security definer set search_path = public
as $$
declare v_stock numeric; v_metros numeric;
begin
  if p_modo = 'prenda' then
    if p_prendas is null or p_prendas <= 0 or p_consumo is null or p_consumo <= 0 then
      raise exception 'prendas y consumo requeridos';
    end if;
    v_metros := p_prendas * p_consumo;
  elsif p_modo = 'metros' then
    if p_metros is null or p_metros <= 0 then raise exception 'metros invalido'; end if;
    v_metros := p_metros;
  else
    raise exception 'modo invalido';
  end if;

  select stock_actual_m into v_stock from telas where id = p_tela_id for update;
  if not found then raise exception 'tela no existe'; end if;
  if v_metros > v_stock then raise exception 'stock insuficiente'; end if;

  v_stock := v_stock - v_metros;
  update telas set stock_actual_m = v_stock where id = p_tela_id;
  insert into movimientos_inventario
    (tela_id, tipo, origen, cantidad_m, prendas, consumo_aplicado, saldo_resultante_m, nota)
  values (p_tela_id, 'salida', 'manual', -v_metros,
          case when p_modo = 'prenda' then p_prendas end,
          case when p_modo = 'prenda' then p_consumo end,
          v_stock, p_nota);
  return v_stock;
end;
$$;
revoke execute on function public.registrar_salida_tela(uuid, text, integer, numeric, numeric, text) from public, anon, authenticated;
grant execute on function public.registrar_salida_tela(uuid, text, integer, numeric, numeric, text) to service_role;

-- ── RPC: ajuste por conteo físico ──
create or replace function public.registrar_ajuste_tela(
  p_tela_id uuid, p_stock_contado numeric, p_nota text default null
) returns numeric
language plpgsql security definer set search_path = public
as $$
declare v_stock numeric; v_delta numeric;
begin
  if p_stock_contado is null or p_stock_contado < 0 then raise exception 'stock contado invalido'; end if;
  select stock_actual_m into v_stock from telas where id = p_tela_id for update;
  if not found then raise exception 'tela no existe'; end if;
  v_delta := p_stock_contado - v_stock;
  if v_delta = 0 then raise exception 'sin diferencia'; end if;
  update telas set stock_actual_m = p_stock_contado where id = p_tela_id;
  insert into movimientos_inventario (tela_id, tipo, origen, cantidad_m, saldo_resultante_m, nota)
  values (p_tela_id, 'ajuste', 'manual', v_delta, p_stock_contado, p_nota);
  return p_stock_contado;
end;
$$;
revoke execute on function public.registrar_ajuste_tela(uuid, numeric, text) from public, anon, authenticated;
grant execute on function public.registrar_ajuste_tela(uuid, numeric, text) to service_role;

-- ── RPC: import bulk (crea telas + asienta entrada importacion) ──
create or replace function public.importar_inventario(p_filas jsonb)
returns jsonb
language plpgsql security definer set search_path = public
as $$
declare v_fila jsonb; v_tela_id uuid; v_metros numeric;
        v_creadas integer := 0; v_total numeric := 0;
begin
  for v_fila in select * from jsonb_array_elements(p_filas)
  loop
    v_metros := coalesce((v_fila->>'metraje_inicial_m')::numeric, 0);
    insert into telas (referencia, descripcion, composicion, color, ancho_m, gramaje_gm2,
                       proveedor, unidad, umbral_bajo_stock_m, consumo_prenda_m, lote,
                       ubicacion, paquetes_rollos, stock_actual_m)
    values (v_fila->>'referencia', v_fila->>'descripcion', v_fila->>'composicion',
            v_fila->>'color', (v_fila->>'ancho_m')::numeric, (v_fila->>'gramaje_gm2')::numeric,
            v_fila->>'proveedor', coalesce(v_fila->>'unidad','metros'),
            (v_fila->>'umbral_bajo_stock_m')::numeric, (v_fila->>'consumo_prenda_m')::numeric,
            v_fila->>'lote', v_fila->>'ubicacion', (v_fila->>'paquetes_rollos')::integer, v_metros)
    returning id into v_tela_id;

    if v_metros > 0 then
      insert into movimientos_inventario (tela_id, tipo, origen, cantidad_m, saldo_resultante_m, nota)
      values (v_tela_id, 'entrada', 'importacion', v_metros, v_metros, 'Importación inicial');
    end if;

    v_creadas := v_creadas + 1;
    v_total := v_total + v_metros;
  end loop;
  return jsonb_build_object('creadas', v_creadas, 'total_metros', v_total);
exception
  when unique_violation then raise exception 'referencia duplicada';
end;
$$;
revoke execute on function public.importar_inventario(jsonb) from public, anon, authenticated;
grant execute on function public.importar_inventario(jsonb) to service_role;
