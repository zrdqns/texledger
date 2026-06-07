export default function DashboardPage() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {["Inventario", "Pedidos", "Ingresos", "Egresos"].map((t) => (
        <div
          key={t}
          className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-5"
        >
          <p className="text-sm text-zinc-400">{t}</p>
          <p className="mt-2 text-2xl font-semibold text-zinc-100">—</p>
        </div>
      ))}
    </div>
  );
}
