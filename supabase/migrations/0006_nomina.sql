-- ── Parámetros de nómina (por año, editables desde la UI) ──
create table public.parametros_nomina (
  id uuid primary key default gen_random_uuid(),
  anio integer not null unique,
  smmlv numeric not null,
  auxilio_transporte numeric not null,
  tope_auxilio_smmlv numeric not null default 2,
  pct_pension numeric not null default 4,
  pct_salud numeric not null default 4,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger trg_parametros_nomina_updated_at before update on public.parametros_nomina
  for each row execute function public.set_updated_at();

-- ── Empleados ──
create table public.empleados (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  documento text,
  cargo text,
  sueldo_basico numeric not null check (sueldo_basico > 0),
  seguro_tipo text not null default 'ninguno' check (seguro_tipo in ('fijo','porcentaje','ninguno')),
  seguro_valor numeric not null default 0,
  activo boolean not null default true,
  fecha_ingreso date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger trg_empleados_updated_at before update on public.empleados
  for each row execute function public.set_updated_at();

-- ── Liquidaciones (snapshot inmutable: insumos + parámetros usados + desglose) ──
create table public.liquidaciones (
  id uuid primary key default gen_random_uuid(),
  empleado_id uuid not null references public.empleados(id) on delete restrict,
  periodo_anio integer not null,
  periodo_mes integer not null check (periodo_mes between 1 and 12),
  -- insumos
  dias_laborados numeric not null,
  incapacidades_dias numeric not null default 0,
  licencias_dias numeric not null default 0,
  ajuste_incap_licencia_valor numeric not null default 0,
  libranzas numeric not null default 0,
  -- snapshot de empleado y parámetros del año
  sueldo_basico numeric not null,
  smmlv numeric not null,
  auxilio_transporte numeric not null,
  tope_auxilio_smmlv numeric not null,
  pct_pension numeric not null,
  pct_salud numeric not null,
  seguro_tipo text not null,
  seguro_valor numeric not null,
  -- desglose calculado
  sueldo_prop numeric not null,
  auxilio_prop numeric not null,
  total_devengado numeric not null,
  ibc numeric not null,
  ded_pension numeric not null,
  ded_salud numeric not null,
  ded_seguro numeric not null,
  total_deducido numeric not null,
  neto_pagado numeric not null,
  usuario_id uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (empleado_id, periodo_anio, periodo_mes)
);
create trigger trg_liquidaciones_updated_at before update on public.liquidaciones
  for each row execute function public.set_updated_at();
create index idx_liquidaciones_periodo on public.liquidaciones(periodo_anio, periodo_mes);

-- ── RLS: lectura authenticated; escritura solo service-role ──
alter table public.parametros_nomina enable row level security;
alter table public.empleados enable row level security;
alter table public.liquidaciones enable row level security;
create policy "parametros_nomina_select_auth" on public.parametros_nomina for select to authenticated using (true);
create policy "empleados_select_auth" on public.empleados for select to authenticated using (true);
create policy "liquidaciones_select_auth" on public.liquidaciones for select to authenticated using (true);

-- ── Seed 2026 ──
insert into public.parametros_nomina (anio, smmlv, auxilio_transporte, tope_auxilio_smmlv, pct_pension, pct_salud)
values (2026, 1750905, 249095, 2, 4, 4)
on conflict (anio) do nothing;
