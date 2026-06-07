import { LoginForm } from "@/modules/auth/presentation/login-form";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-950 px-4">
      <div className="flex flex-col items-center gap-8">
        <h1 className="text-xl font-semibold text-zinc-100">Sistema Contable Textil</h1>
        <LoginForm />
      </div>
    </main>
  );
}
