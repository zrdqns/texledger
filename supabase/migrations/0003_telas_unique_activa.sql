-- La unicidad de `referencia` debe aplicar solo entre telas activas: al retirar
-- (activo = false) la referencia queda libre para reutilizarse en una tela nueva.
-- Reemplaza la restricción UNIQUE absoluta por un índice único parcial.

alter table public.telas drop constraint telas_referencia_key;

create unique index telas_referencia_activa_uniq
  on public.telas (referencia)
  where activo = true;
