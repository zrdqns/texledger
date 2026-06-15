import { requireUser } from "@/core/auth/guard";
import { Sidebar } from "@/components/ui/sidebar";
import { Campana } from "@/modules/recordatorios/presentation/campana";
import { PerfilMenu } from "@/modules/perfil/presentation/perfil-menu";
import { obtenerPerfilActual } from "@/modules/perfil/application/perfil-actions";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser();
  const email = user.email ?? "";
  const perfil = await obtenerPerfilActual();
  const nombre = perfil?.nombre?.trim() || email.split("@")[0] || "Usuario";
  const fotoUrl = perfil?.foto_url ?? null;

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <header className="flex h-16 items-center justify-between border-b border-white/10 px-6 print:hidden">
          <h1 className="text-sm font-medium text-texto-suave">Panel</h1>
          <div className="flex items-center gap-4">
            <Campana />
            <PerfilMenu nombre={nombre} email={email} fotoUrl={fotoUrl} />
          </div>
        </header>
        <main className="flex-1 p-6 print:p-0">
          <div className="animate-aparecer">{children}</div>
        </main>
      </div>
    </div>
  );
}
