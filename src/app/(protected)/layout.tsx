import { requireUser } from "@/core/auth/guard";
import { Sidebar } from "@/components/ui/sidebar";
import { Campana } from "@/modules/recordatorios/presentation/campana";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser();
  const email = user.email ?? "";
  const inicial = (email[0] ?? "U").toUpperCase();

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <header className="flex h-16 items-center justify-between border-b border-white/10 px-6 print:hidden">
          <h1 className="text-sm font-medium text-texto-suave">Panel</h1>
          <div className="flex items-center gap-5">
            <Campana />
            <div className="flex items-center gap-2.5 rounded-full py-1 pl-1 pr-3 transition-colors hover:bg-white/5">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primario/20 text-sm font-semibold text-primario-claro">
                {inicial}
              </span>
              <span className="hidden text-xs text-texto-tenue sm:block">{email}</span>
            </div>
            <form action="/auth/signout" method="post">
              <button className="text-sm text-texto-tenue transition-colors hover:text-texto">
                Salir
              </button>
            </form>
          </div>
        </header>
        <main className="flex-1 p-6 print:p-0">
          <div className="animate-aparecer">{children}</div>
        </main>
      </div>
    </div>
  );
}
