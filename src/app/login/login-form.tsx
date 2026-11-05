"use client";

import { useActionState } from "react";
import { loginAction } from "@/app/auth-actions";

export function LoginForm() {
  const [state, formAction, isPending] = useActionState(loginAction, {});

  return (
    <form action={formAction} className="login-form">
      <label>
        Correo electrónico
        <input
          autoComplete="username"
          autoFocus
          name="correo"
          required
          type="email"
        />
      </label>
      <label>
        Contraseña
        <input
          autoComplete="current-password"
          name="password"
          required
          type="password"
        />
      </label>
      {state.error && <p aria-live="polite" className="feedback error">{state.error}</p>}
      <button disabled={isPending} type="submit">
        {isPending ? "Ingresando…" : "Iniciar sesión"}
      </button>
    </form>
  );
}
