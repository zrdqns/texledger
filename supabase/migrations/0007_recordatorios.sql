-- ── Recordatorios manuales ──
create table public.recordatorios (
  id uuid primary key default gen_random_uuid(),
  tipo text not null check (tipo in ('factura','pago_pendiente','factura_sin_declarar')),
  descripcion text not null,
  fecha_objetivo date not null,
  estado text not null default 'pendiente' check (estado in ('pendiente','cumplido','vencido')),
  factura_id uuid references public.facturas(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger trg_recordatorios_updated_at before update on public.recordatorios
  for each row execute function public.set_updated_at();

-- ── Notificaciones generadas ──
create table public.notificaciones (
  id uuid primary key default gen_random_uuid(),
  tipo text not null,
  titulo text not null,
  mensaje text not null,
  leida boolean not null default false,
  entidad_tipo text not null,
  entidad_id uuid not null,
  created_at timestamptz not null default now()
);
-- Idempotencia: máximo una notificación NO LEÍDA por (tipo, entidad). Mientras siga
-- sin leer, el job diario no duplica; leída y persistiendo la condición, se crea otra.
create unique index uniq_notif_abierta on public.notificaciones(tipo, entidad_tipo, entidad_id) where not leida;
create index idx_notif_leida_created on public.notificaciones(leida, created_at);

-- ── RLS: lectura authenticated; escritura solo service-role ──
alter table public.recordatorios enable row level security;
alter table public.notificaciones enable row level security;
create policy "recordatorios_select_auth" on public.recordatorios for select to authenticated using (true);
create policy "notificaciones_select_auth" on public.notificaciones for select to authenticated using (true);

-- ── Generación diaria (vencidos + bajo stock + sin declarar) ──
create or replace function public.generar_notificaciones() returns void
language plpgsql
security definer
set search_path = public
as $$
declare v_hoy date := (now() at time zone 'America/Bogota')::date;
begin
  -- 1. Vencer recordatorios pendientes con fecha pasada
  update recordatorios set estado = 'vencido'
  where estado = 'pendiente' and fecha_objetivo < v_hoy;

  -- 2. Notificar recordatorios vencidos (re-nag diario mientras sigan vencidos)
  insert into notificaciones (tipo, titulo, mensaje, entidad_tipo, entidad_id)
  select 'recordatorio_vencido',
         'Recordatorio vencido',
         r.descripcion || ' (vencía el ' || to_char(r.fecha_objetivo, 'DD/MM/YYYY') || ')',
         'recordatorio', r.id
  from recordatorios r
  where r.estado = 'vencido'
  on conflict (tipo, entidad_tipo, entidad_id) where not leida do nothing;

  -- 3. Telas activas bajo stock
  insert into notificaciones (tipo, titulo, mensaje, entidad_tipo, entidad_id)
  select 'bajo_stock',
         'Bajo stock: ' || t.referencia,
         'Quedan ' || t.stock_actual_m || ' m (umbral ' || t.umbral_bajo_stock_m || ' m)',
         'tela', t.id
  from telas t
  where t.activo and t.stock_actual_m < t.umbral_bajo_stock_m
  on conflict (tipo, entidad_tipo, entidad_id) where not leida do nothing;

  -- 4. Facturas sin declarar con 30+ días de emitidas
  insert into notificaciones (tipo, titulo, mensaje, entidad_tipo, entidad_id)
  select 'factura_sin_declarar',
         'Factura sin declarar: ' || f.numero,
         f.tercero || ' — emitida el ' || to_char(f.fecha_emision, 'DD/MM/YYYY'),
         'factura', f.id
  from facturas f
  where not f.declarada and f.fecha_emision <= v_hoy - 30
  on conflict (tipo, entidad_tipo, entidad_id) where not leida do nothing;

  -- 5. Retención: borra leídas con 90+ días
  delete from notificaciones where leida and created_at < now() - interval '90 days';
end;
$$;
revoke execute on function public.generar_notificaciones() from public, anon, authenticated;
grant execute on function public.generar_notificaciones() to service_role;

-- ── pg_cron: diario a las 10:00 UTC (05:00 America/Bogota, sin DST) ──
create extension if not exists pg_cron;
select cron.schedule('generar-notificaciones-diarias', '0 10 * * *', $$select public.generar_notificaciones()$$);
