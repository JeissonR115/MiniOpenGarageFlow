"use client";

import { useActionState } from "react";
import { CustomerActionState, saveCustomerAction } from "./actions";

type CustomerFormProps = {
  customer?: {
    id: number;
    nombre: string;
    apellido: string;
    telefono: string;
    correo: string | null;
  };
};

const initialState: CustomerActionState = {};

export function CustomerForm({ customer }: CustomerFormProps) {
  const [state, action, pending] = useActionState(saveCustomerAction, initialState);

  return (
    <form action={action} className="form-grid">
      {customer && <input type="hidden" name="id" value={customer.id} />}
      <label>
        Nombre
        <input name="nombre" required defaultValue={customer?.nombre} />
      </label>
      <label>
        Apellido
        <input name="apellido" required defaultValue={customer?.apellido} />
      </label>
      <label>
        Teléfono
        <input name="telefono" required defaultValue={customer?.telefono} />
      </label>
      <label>
        Correo (opcional)
        <input name="correo" type="email" defaultValue={customer?.correo ?? ""} />
      </label>
      <button disabled={pending} type="submit">
        {pending ? "Guardando..." : customer ? "Guardar cambios" : "Registrar cliente"}
      </button>
      {state.error && <p className="feedback error" role="alert">{state.error}</p>}
      {state.success && <p className="feedback success" role="status">{state.success}</p>}
    </form>
  );
}
