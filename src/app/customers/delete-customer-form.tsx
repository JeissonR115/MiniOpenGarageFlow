"use client";

import { useActionState } from "react";
import { CustomerActionState, deleteCustomerAction } from "./actions";

const initialState: CustomerActionState = {};

export function DeleteCustomerForm({ customerId }: { customerId: number }) {
  const [state, action, pending] = useActionState(deleteCustomerAction, initialState);

  return (
    <form action={action}>
      <input type="hidden" name="id" value={customerId} />
      <button className="button-danger" disabled={pending} type="submit">
        {pending ? "Eliminando..." : "Eliminar"}
      </button>
      {state.error && <p className="feedback error" role="alert">{state.error}</p>}
      {state.success && <p className="feedback success" role="status">{state.success}</p>}
    </form>
  );
}
