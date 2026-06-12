import { requireUser } from "@/core/auth/guard";
import { Sidebar } from "@/components/ui/sidebar";
import { Campana } from "@/modules/recordatorios/presentation/campana";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireUser();
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <header className="flex h-14 items-center justify-between border-b border-borde/40 px-6 print:hidden">
          <h1 className="text-sm font-medium text-texto-suave">Panel</h1>
          <div className="flex items-center gap-5">
            <Campana />
            <form action="/auth/signout" method="post">
              <button className="text-sm text-texto-tenue hover:text-texto">
                Salir
              </button>
            </form>
          </div>
        </header>
        <main className="flex-1 p-6 print:p-0">{children}</main>
      </div>
    </div>
  );
}
