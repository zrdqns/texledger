import { requireUser } from "@/core/auth/guard";
import { Sidebar } from "@/components/ui/sidebar";

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
        <header className="flex h-14 items-center justify-between border-b border-zinc-800 px-6 print:hidden">
          <h1 className="text-sm font-medium text-zinc-200">Panel</h1>
          <form action="/auth/signout" method="post">
            <button className="text-sm text-zinc-400 hover:text-zinc-100">
              Salir
            </button>
          </form>
        </header>
        <main className="flex-1 p-6 print:p-0">{children}</main>
      </div>
    </div>
  );
}
