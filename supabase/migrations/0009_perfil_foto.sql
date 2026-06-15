-- 0009: foto del usuario en la tabla perfiles (existente desde 0001), como data
-- URL comprimida (base64). NO se guarda en auth.users/user_metadata porque eso
-- infla el JWT de sesión (cookies) y rompe el request (HTTP 431 / pantalla blanca).
alter table public.perfiles add column if not exists foto_url text;
