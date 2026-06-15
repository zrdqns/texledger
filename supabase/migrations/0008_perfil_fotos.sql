-- 0008: fotos de perfil.
-- Empleados: columna foto_url con la imagen comprimida como data URL (base64),
-- así no hace falta configurar buckets de Storage. La foto del usuario logueado
-- se guarda aparte en auth.users (user_metadata.avatar_url), sin tocar tablas.
alter table public.empleados add column if not exists foto_url text;
