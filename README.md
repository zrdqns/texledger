# TexLedger — Textile accounting system

Web platform for the accounting and operations of a Colombian textile manufacturing
company: fabric inventory, production orders, accounting, payroll and reminders, in
a single dashboard.

> **Portfolio project.** The code is visible for evaluation, but its use is
> restricted. See [LICENSE](LICENSE): *All rights reserved*.

## Modules

- **Dashboard** — net result for the month, indicators, performance chart and recent transactions.
- **Inventory** — fabrics by roll/length, low-stock alerts, import from Excel.
- **Orders** — fabric reconciliation per production order (consumption vs. balance).
- **Accounting** — income, expenses, invoices, accounts and reports.
- **Payroll** — employees, per-year parameters and payslips with a printable pay stub.
- **Reminders and notifications** — invoice due dates, low stock and pending items.

## Stack

Next.js (App Router) · React · TypeScript · Tailwind CSS · Supabase (Postgres + Auth + RLS) · Zod · Recharts · Vitest.

Module-based architecture (`domain` / `application` / `presentation`), business
logic covered by tests and security rules at the database level (RLS).

## Status

Working system, in use. This repository is shared as a work sample.

## Running

> ⚠️ This project **does not work just by cloning it**: it requires your own
> Supabase instance and private credentials that are **not included** in the
> repository. Without them, the application does not start.

A self-hosted install needs a `.env.local` file (see
[`.env.local.example`](.env.local.example)) with the keys of a Supabase
project, the migrations in `supabase/migrations/` applied, and then:

```bash
npm install
npm run dev
```

## Author

Daniel Vanegas — 2026. All rights reserved.
