import { LoginForm } from "@/modules/auth/presentation/login-form";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-fondo px-4">
      <div className="flex w-full max-w-sm flex-col items-center gap-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-texto">TexLedger</h1>
          <p className="mt-1 text-sm text-texto-tenue">Contabilidad textil</p>
        </div>
        <div className="w-full rounded-xl border border-borde/60 bg-superficie-baja p-6">
          <LoginForm />
        </div>
      </div>
    </main>
  );
}
