"use client";

import { useActionState } from "react";
import { loginAction, type LoginState } from "../application/login-action";
import { btnPrimario, input } from "@/components/ui/estilos";

const initial: LoginState = { error: null };

export function LoginForm() {
  const [state, action, pending] = useActionState(loginAction, initial);

  return (
    <form action={action} className="flex w-full flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="email" className="text-sm text-texto-tenue">
          Correo
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          className={input}
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="password" className="text-sm text-texto-tenue">
          Contraseña
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className={input}
        />
      </div>
      {state.error && <p className="text-sm text-peligro">{state.error}</p>}
      <button type="submit" disabled={pending} className={`mt-2 w-full ${btnPrimario}`}>
        {pending ? "Ingresando…" : "Ingresar"}
      </button>
    </form>
  );
}
