"use client";

import { useActionState } from "react";
import { createReceptionistAction, type UserActionState } from "./actions";
import { UserRoundPlus } from "lucide-react";

const initialState: UserActionState = {};

export function ReceptionistForm() {
  const [state, action, pending] = useActionState(
    createReceptionistAction,
    initialState,
  );

  return (
    <form action={action} className="form-grid">
      <label>
        Nombre
        <input autoComplete="name" name="nombre" required />
      </label>
      <label>
        Correo
        <input autoComplete="email" name="correo" required type="email" />
      </label>
      <label>
        Contraseña inicial
        <input
          autoComplete="new-password"
          minLength={8}
          name="password"
          required
          type="password"
        />
      </label>
      <button disabled={pending} type="submit">
        <UserRoundPlus aria-hidden="true" className="action-icon" />
        {pending ? "Creando cuenta..." : "Crear cuenta de Recepción"}
      </button>
      {state.error && (
        <p className="feedback error" role="alert">
          {state.error}
        </p>
      )}
      {state.success && (
        <p className="feedback success" role="status">
          {state.success}
        </p>
      )}
    </form>
  );
}
