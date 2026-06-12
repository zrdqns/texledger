import { LoginForm } from "@/modules/auth/presentation/login-form";

export default function LoginPage() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-fondo px-4">
      <div className="absolute left-1/2 top-1/3 h-72 w-72 -translate-x-1/2 rounded-full bg-primario/10 blur-3xl" aria-hidden />
      <div className="animate-aparecer relative flex w-full max-w-sm flex-col items-center gap-8">
        <div className="flex flex-col items-center gap-3 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primario text-xl font-bold text-white shadow-[0_0_25px_rgba(74,142,255,0.5)]">
            T
          </span>
          <div>
            <h1 className="text-2xl font-bold text-texto">TexLedger</h1>
            <p className="mt-1 text-sm text-texto-tenue">Contabilidad textil</p>
          </div>
        </div>
        <div className="w-full rounded-xl border border-white/10 bg-superficie-baja/80 p-6 shadow-2xl backdrop-blur">
          <LoginForm />
        </div>
      </div>
    </main>
  );
}
