"use client";

import { useActionState } from "react";
import type { CustomerActionState } from "@/app/customers/actions";
import { deleteVehicleAction } from "./actions";

const initialState: CustomerActionState = {};

export function DeleteVehicleForm({ vehicleId }: { vehicleId: number }) {
  const [state, action, pending] = useActionState(deleteVehicleAction, initialState);

  return (
    <form action={action}>
      <input type="hidden" name="id" value={vehicleId} />
      <button className="button-danger" disabled={pending} type="submit">
        {pending ? "Eliminando..." : "Eliminar"}
      </button>
      {state.error && <p className="feedback error" role="alert">{state.error}</p>}
      {state.success && <p className="feedback success" role="status">{state.success}</p>}
    </form>
  );
}
