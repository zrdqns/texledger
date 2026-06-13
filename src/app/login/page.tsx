import { LoginForm } from "@/modules/auth/presentation/login-form";

export default function LoginPage() {
  return (
    <main className="grid min-h-[100dvh] lg:grid-cols-2">
      <aside className="relative hidden flex-col justify-between overflow-hidden border-r border-white/10 bg-superficie-baja p-12 lg:flex">
        <div aria-hidden className="absolute -left-24 top-1/4 h-80 w-80 rounded-full bg-primario/15 blur-[110px]" />
        <div aria-hidden className="absolute -bottom-16 right-0 h-72 w-72 rounded-full bg-acento/10 blur-[110px]" />

        <div className="relative flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primario text-lg font-bold text-white shadow-[0_0_25px_rgba(74,142,255,0.5)]">
            T
          </span>
          <div>
            <p className="text-lg font-bold text-texto">TexLedger</p>
            <p className="text-xs uppercase tracking-[0.2em] text-texto-tenue">Contabilidad textil</p>
          </div>
        </div>

        <div className="relative max-w-md">
          <span className="inline-flex rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.2em] text-texto-tenue">
            Manufactura textil
          </span>
          <h1 className="mt-5 text-4xl font-bold leading-[1.1] tracking-tight text-texto">
            Tu taller, <span className="text-primario-claro">bajo control</span>.
          </h1>
          <p className="mt-5 text-base leading-relaxed text-texto-suave">
            Inventario, pedidos, nómina, contabilidad y recordatorios en un solo panel — pensado para la operación
            diaria de una empresa textil colombiana.
          </p>
        </div>

        <div className="relative flex gap-12">
          <div>
            <p className="font-mono text-3xl font-bold text-texto">7</p>
            <p className="mt-1 text-xs uppercase tracking-[0.2em] text-texto-tenue">Módulos</p>
          </div>
          <div>
            <p className="font-mono text-3xl font-bold text-texto">COP</p>
            <p className="mt-1 text-xs uppercase tracking-[0.2em] text-texto-tenue">Pesos · Bogotá</p>
          </div>
        </div>
      </aside>

      <section className="flex items-center justify-center px-6 py-12">
        <div className="animate-aparecer w-full max-w-sm">
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primario font-bold text-white shadow-[0_0_15px_rgba(74,142,255,0.4)]">
              T
            </span>
            <p className="text-lg font-bold text-texto">TexLedger</p>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-texto">Bienvenido de nuevo</h2>
          <p className="mt-1.5 text-sm text-texto-tenue">Ingresa tus credenciales para acceder al panel.</p>
          <div className="mt-8">
            <LoginForm />
          </div>
        </div>
      </section>
    </main>
  );
}
