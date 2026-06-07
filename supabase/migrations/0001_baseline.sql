-- Helper: trigger genérico para updated_at
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Perfiles: 1:1 con auth.users (usuario único; rol listo para el futuro)
create table public.perfiles (
  id uuid primary key references auth.users (id) on delete cascade,
  nombre text not null default '',
  rol text not null default 'admin',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger trg_perfiles_updated_at
before update on public.perfiles
for each row execute function public.set_updated_at();

-- RLS: cada usuario solo ve/edita su propio perfil
alter table public.perfiles enable row level security;

create policy "perfiles_select_propio"
  on public.perfiles for select
  to authenticated
  using (id = auth.uid());

create policy "perfiles_update_propio"
  on public.perfiles for update
  to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

-- Crear perfil automáticamente al registrarse un usuario
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.perfiles (id, nombre)
  values (new.id, coalesce(new.raw_user_meta_data->>'nombre', ''));
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- Seguridad: revocar EXECUTE a roles cliente sobre la función SECURITY DEFINER
revoke execute on function public.handle_new_user() from anon, authenticated;
