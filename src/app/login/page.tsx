import { LoginForm } from "@/modules/auth/presentation/login-form";

export default function LoginPage() {
  return (
    <main className="grid min-h-[100dvh] lg:grid-cols-2">
      <aside className="relative hidden flex-col justify-between overflow-hidden border-r border-white/10 bg-superficie-baja p-12 lg:flex">
        <div aria-hidden className="animate-flotar absolute -left-24 top-1/4 h-80 w-80 rounded-full bg-primario/20 blur-[110px]" />
        <div aria-hidden className="animate-flotar absolute -bottom-16 right-0 h-72 w-72 rounded-full bg-acento/15 blur-[110px] [animation-delay:1.5s]" />
        <div
          aria-hidden
          className="absolute inset-0 opacity-[0.04] [background-image:linear-gradient(rgba(91,124,250,0.6)_1px,transparent_1px),linear-gradient(90deg,rgba(91,124,250,0.6)_1px,transparent_1px)] [background-size:38px_38px]"
        />

        <div className="animate-aparecer relative flex items-center gap-3">
          <span className="animate-brillo flex h-10 w-10 items-center justify-center rounded-xl bg-primario text-lg font-bold text-fondo shadow-[0_0_25px_rgba(91,124,250,0.55)]">
            T
          </span>
          <div>
            <p className="text-lg font-bold text-texto">TexLedger</p>
            <p className="text-xs uppercase tracking-[0.2em] text-texto-tenue">Contabilidad textil</p>
          </div>
        </div>

        <div className="relative max-w-md">
          <span className="animate-aparecer inline-flex rounded-full border border-primario/30 bg-primario/10 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.2em] text-primario-claro [animation-delay:80ms]">
            Manufactura textil
          </span>
          <h1 className="animate-aparecer mt-5 text-5xl font-bold leading-[1.05] tracking-tight text-texto [animation-delay:150ms]">
            Tu taller, <span className="text-primario-claro">bajo control</span>.
          </h1>
          <p className="animate-aparecer mt-5 text-base leading-relaxed text-texto-suave [animation-delay:240ms]">
            Inventario, pedidos, nómina, contabilidad y recordatorios en un solo panel — pensado para la operación
            diaria de una empresa textil colombiana.
          </p>
        </div>

        <div className="animate-aparecer relative flex gap-12 [animation-delay:320ms]">
          <div>
            <p className="font-mono text-3xl font-bold text-primario-claro">7</p>
            <p className="mt-1 text-xs uppercase tracking-[0.2em] text-texto-tenue">Módulos</p>
          </div>
          <div>
            <p className="font-mono text-3xl font-bold text-primario-claro">COP</p>
            <p className="mt-1 text-xs uppercase tracking-[0.2em] text-texto-tenue">Pesos · Bogotá</p>
          </div>
        </div>
      </aside>

      <section className="relative flex items-center justify-center overflow-hidden px-6 py-12">
        <div aria-hidden className="animate-flotar absolute right-10 top-10 h-40 w-40 rounded-full bg-primario/10 blur-[90px] lg:hidden" />
        <div className="animate-aparecer w-full max-w-sm [animation-delay:120ms]">
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primario font-bold text-fondo shadow-[0_0_15px_rgba(91,124,250,0.45)]">
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
