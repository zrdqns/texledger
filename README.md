# TexLedger — Sistema contable textil

Plataforma web para la gestión contable y operativa de una empresa de manufactura
textil colombiana: inventario de telas, pedidos de producción, contabilidad,
nómina y recordatorios, en un solo panel.

> **Proyecto de portafolio.** El código es visible para evaluación, pero su uso
> está restringido. Ver [LICENSE](LICENSE): *Todos los derechos reservados*.

## Módulos

- **Dashboard** — resultado neto del mes, indicadores, gráfico de rendimiento y movimientos recientes.
- **Inventario** — telas por rollos/metraje, alertas de bajo stock, importación desde Excel.
- **Pedidos** — conciliación de tela por pedido de producción (consumo vs. saldo).
- **Contabilidad** — ingresos, egresos, facturas, cuentas y reportes.
- **Nómina** — empleados, parámetros por año y liquidaciones con desprendible imprimible.
- **Recordatorios y notificaciones** — vencimientos de facturas, bajo stock y pendientes.

## Stack

Next.js (App Router) · React · TypeScript · Tailwind CSS · Supabase (Postgres + Auth + RLS) · Zod · Recharts · Vitest.

Arquitectura por módulos (`domain` / `application` / `presentation`), lógica de
negocio cubierta con tests y reglas de seguridad a nivel de base de datos (RLS).

## Estado

Sistema funcional y en uso. Este repositorio se comparte como muestra de trabajo.

## Ejecución

> ⚠️ Este proyecto **no funciona con solo clonarlo**: requiere una instancia
> propia de Supabase y credenciales privadas que **no se incluyen** en el
> repositorio. Sin ellas, la aplicación no arranca.

Para una instalación propia se necesita un archivo `.env.local` (ver
[`.env.local.example`](.env.local.example)) con las claves de un proyecto
Supabase, aplicar las migraciones de `supabase/migrations/` y luego:

```bash
npm install
npm run dev
```

## Autor

Daniel Vanegas — 2026. Todos los derechos reservados.
