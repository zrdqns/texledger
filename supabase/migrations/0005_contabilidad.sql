-- ── Cuentas bancarias ──
create table public.cuentas_bancarias (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  banco text not null,
  numero text,
  activo boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger trg_cuentas_updated_at before update on public.cuentas_bancarias
  for each row execute function public.set_updated_at();

-- ── Facturas ──
create table public.facturas (
  id uuid primary key default gen_random_uuid(),
  tipo text not null check (tipo in ('venta','compra')),
  numero text not null,
  tercero text not null,
  fecha_emision date not null,
  valor numeric not null check (valor > 0),
  declarada boolean not null default false,
  estado text not null default 'pendiente' check (estado in ('pendiente','pagada')),
  archivo_url text,
  nota text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger trg_facturas_updated_at before update on public.facturas
  for each row execute function public.set_updated_at();
create unique index uniq_factura_venta on public.facturas(numero) where tipo = 'venta';
create unique index uniq_factura_compra on public.facturas(tercero, numero) where tipo = 'compra';

-- ── Ingresos ──
create table public.ingresos (
  id uuid primary key default gen_random_uuid(),
  fecha date not null default current_date,
  concepto text not null,
  valor numeric not null check (valor > 0),
  numero_comprobante text,
  comprobante_url text,
  factura_id uuid references public.facturas(id),
  cuenta_bancaria_id uuid references public.cuentas_bancarias(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger trg_ingresos_updated_at before update on public.ingresos
  for each row execute function public.set_updated_at();
create unique index uniq_ingresos_factura on public.ingresos(factura_id) where factura_id is not null;
create index idx_ingresos_fecha on public.ingresos(fecha);

-- ── Egresos ──
create table public.egresos (
  id uuid primary key default gen_random_uuid(),
  fecha_pago date not null default current_date,
  cuenta_bancaria_id uuid not null references public.cuentas_bancarias(id),
  valor numeric not null check (valor > 0),
  concepto text not null,
  numero_comprobante text,
  comprobante_url text,
  factura_id uuid references public.facturas(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger trg_egresos_updated_at before update on public.egresos
  for each row execute function public.set_updated_at();
create unique index uniq_egresos_factura on public.egresos(factura_id) where factura_id is not null;
create index idx_egresos_fecha_pago on public.egresos(fecha_pago);

-- ── Trigger: estado de factura (consulta ambas tablas) ──
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
create trigger trg_sync_factura_ingresos after insert or update or delete on public.ingresos
  for each row execute function public.sync_factura_estado();
create trigger trg_sync_factura_egresos after insert or update or delete on public.egresos
  for each row execute function public.sync_factura_estado();

-- ── RLS: lectura authenticated; escritura solo service-role ──
alter table public.cuentas_bancarias enable row level security;
alter table public.facturas enable row level security;
alter table public.ingresos enable row level security;
alter table public.egresos enable row level security;
create policy "cuentas_select_auth" on public.cuentas_bancarias for select to authenticated using (true);
create policy "facturas_select_auth" on public.facturas for select to authenticated using (true);
create policy "ingresos_select_auth" on public.ingresos for select to authenticated using (true);
create policy "egresos_select_auth" on public.egresos for select to authenticated using (true);

-- ── Storage: bucket privado ──
-- Seguridad: bucket PRIVADO. NO se agregan policies a storage.objects a propósito:
-- todo el acceso es server-side con service-role (upload + signed URLs); el cliente
-- nunca toca Storage directo, así que storage.objects queda en default-deny.
insert into storage.buckets (id, name, public) values ('contabilidad', 'contabilidad', false)
on conflict (id) do nothing;
