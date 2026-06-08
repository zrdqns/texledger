-- ── Pedidos ──
create table public.pedidos (
  id uuid primary key default gen_random_uuid(),
  empresa_cliente text not null,
  fecha date not null default current_date,
  tela_id uuid not null references public.telas (id) on delete restrict,
  metros_llegados_planta numeric not null check (metros_llegados_planta > 0),
  prendas_pedidas integer not null check (prendas_pedidas > 0),
  consumo_prenda_m numeric not null check (consumo_prenda_m > 0),
  metros_consumidos numeric,
  saldo_tela_m numeric,                                  -- sin CHECK: puede ser negativo (déficit)
  estado text not null default 'borrador'
    check (estado in ('borrador','confirmado','cerrado','anulado')),
  nota text,
  usuario_id uuid not null references auth.users (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger trg_pedidos_updated_at
before update on public.pedidos
for each row execute function public.set_updated_at();

create index idx_pedidos_estado_fecha on public.pedidos (estado, fecha desc);

-- FK diferido de Fase 1
alter table public.movimientos_inventario
  add constraint fk_pedido foreign key (pedido_id) references public.pedidos (id);

-- RLS
alter table public.pedidos enable row level security;
create policy "pedidos_select_auth" on public.pedidos for select to authenticated using (true);

-- ── RPC: confirmar pedido (idempotente, dos movimientos) ──
create or replace function public.confirmar_pedido(p_pedido_id uuid)
returns void
language plpgsql security definer set search_path = public
as $$
declare v_p pedidos%rowtype; v_stock numeric; v_consumidos numeric; v_saldo numeric;
begin
  select * into v_p from pedidos where id = p_pedido_id for update;
  if not found then raise exception 'pedido no existe'; end if;

  if v_p.estado = 'confirmado' then return; end if;                 -- idempotente: no-op
  if v_p.estado in ('cerrado','anulado') then raise exception 'estado invalido'; end if;
  -- estado = 'borrador'
  if v_p.consumo_prenda_m <= 0 or v_p.prendas_pedidas <= 0 then
    raise exception 'consumo y prendas deben ser > 0';
  end if;

  v_consumidos := v_p.prendas_pedidas * v_p.consumo_prenda_m;
  v_saldo := v_p.metros_llegados_planta - v_consumidos;

  select stock_actual_m into v_stock from telas where id = v_p.tela_id for update;
  if not found then raise exception 'tela no existe'; end if;
  if v_p.metros_llegados_planta > v_stock then raise exception 'stock insuficiente'; end if;

  -- salida bruta de lo que llega a planta
  v_stock := v_stock - v_p.metros_llegados_planta;
  update telas set stock_actual_m = v_stock where id = v_p.tela_id;
  insert into movimientos_inventario (tela_id, tipo, origen, cantidad_m, pedido_id, saldo_resultante_m, nota)
  values (v_p.tela_id, 'salida', 'pedido', -v_p.metros_llegados_planta, p_pedido_id, v_stock, 'Pedido: salida a planta');

  -- devolución del sobrante
  if v_saldo > 0 then
    v_stock := v_stock + v_saldo;
    update telas set stock_actual_m = v_stock where id = v_p.tela_id;
    insert into movimientos_inventario (tela_id, tipo, origen, cantidad_m, pedido_id, saldo_resultante_m, nota)
    values (v_p.tela_id, 'devolucion', 'pedido', v_saldo, p_pedido_id, v_stock, 'Pedido: devolución sobrante');
  end if;

  update pedidos set estado = 'confirmado', metros_consumidos = v_consumidos, saldo_tela_m = v_saldo
  where id = p_pedido_id;
end;
$$;
revoke execute on function public.confirmar_pedido(uuid) from public, anon, authenticated;
grant execute on function public.confirmar_pedido(uuid) to service_role;

-- ── RPC: anular pedido (reverso al kardex) ──
create or replace function public.anular_pedido(p_pedido_id uuid)
returns void
language plpgsql security definer set search_path = public
as $$
declare v_p pedidos%rowtype; v_stock numeric; v_restaura numeric;
begin
  select * into v_p from pedidos where id = p_pedido_id for update;
  if not found then raise exception 'pedido no existe'; end if;
  if v_p.estado <> 'confirmado' then raise exception 'estado invalido'; end if;

  -- metros realmente consumidos del stock = llegados - max(saldo,0)
  v_restaura := v_p.metros_llegados_planta - greatest(coalesce(v_p.saldo_tela_m, 0), 0);

  select stock_actual_m into v_stock from telas where id = v_p.tela_id for update;
  if not found then raise exception 'tela no existe'; end if;
  v_stock := v_stock + v_restaura;
  update telas set stock_actual_m = v_stock where id = v_p.tela_id;
  insert into movimientos_inventario (tela_id, tipo, origen, cantidad_m, pedido_id, saldo_resultante_m, nota)
  values (v_p.tela_id, 'devolucion', 'pedido', v_restaura, p_pedido_id, v_stock, 'Anulación pedido');

  update pedidos set estado = 'anulado' where id = p_pedido_id;
end;
$$;
revoke execute on function public.anular_pedido(uuid) from public, anon, authenticated;
grant execute on function public.anular_pedido(uuid) to service_role;
