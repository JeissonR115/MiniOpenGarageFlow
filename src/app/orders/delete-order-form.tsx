"use client";

import { useActionState } from "react";
import { deleteOrderAction } from "./actions";

export function DeleteOrderForm({ orderId }: { orderId: number }) {
  const [state, formAction, isPending] = useActionState(deleteOrderAction, {});

  return (
    <form action={formAction}>
      <input name="id" type="hidden" value={orderId} />
      <button className="button-danger" disabled={isPending} type="submit">
        {isPending ? "Eliminando…" : "Eliminar pedido"}
      </button>
      {state.error && <p aria-live="polite" className="feedback error">{state.error}</p>}
    </form>
  );
}
