"use client";

import { useActionState } from "react";
import { ArrowRight, Lock, Mail } from "lucide-react";
import { loginAction, type LoginState } from "../application/login-action";

const initial: LoginState = { error: null };

const inputConIcono =
  "w-full rounded-lg border border-white/15 bg-superficie-alta py-2.5 pl-10 pr-3 text-texto outline-none transition-colors placeholder:text-texto-tenue/70 focus:border-primario focus:ring-1 focus:ring-primario";

export function LoginForm() {
  const [state, action, pending] = useActionState(loginAction, initial);

  return (
    <form action={action} className="flex w-full flex-col gap-5">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="email" className="text-xs font-medium uppercase tracking-wider text-texto-tenue">
          Correo
        </label>
        <div className="relative">
          <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-texto-tenue" aria-hidden />
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="tu@empresa.com"
            className={inputConIcono}
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="password" className="text-xs font-medium uppercase tracking-wider text-texto-tenue">
          Contraseña
        </label>
        <div className="relative">
          <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-texto-tenue" aria-hidden />
          <input
            id="password"
            name="password"
            type="password"
            required
            autoComplete="current-password"
            placeholder="••••••••"
            className={inputConIcono}
          />
        </div>
      </div>

      {state.error && (
        <p className="rounded-lg border border-peligro/30 bg-peligro/10 px-3 py-2 text-sm text-peligro">{state.error}</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="group mt-1 flex items-center justify-center gap-2 rounded-lg bg-primario py-2.5 text-sm font-semibold text-fondo shadow-[0_0_20px_rgba(245,165,36,0.4)] transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] hover:brightness-110 active:scale-[0.98] disabled:opacity-50"
      >
        {pending ? "Ingresando…" : "Ingresar al panel"}
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-fondo/20 transition-transform duration-300 group-hover:translate-x-0.5">
          <ArrowRight className="h-3 w-3" aria-hidden />
        </span>
      </button>
    </form>
  );
}
