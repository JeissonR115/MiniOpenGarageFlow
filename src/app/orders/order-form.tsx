"use client";

import { useActionState } from "react";
import { saveOrderAction } from "./actions";
import { ClipboardPlus, Save } from "lucide-react";

type OrderFormProps = {
  vehicles: {
    id: number;
    placa: string;
    marca: string;
    modelo: string;
    cliente: { nombre: string; apellido: string };
  }[];
  order?: {
    id: number;
    vehiculoId: number;
    descripcion: string;
    estado: string;
  };
};

const orderStates = [
  { value: "pendiente", label: "Pendiente" },
  { value: "en_proceso", label: "En proceso" },
  { value: "terminado", label: "Terminado" },
];

export function OrderForm({ vehicles, order }: OrderFormProps) {
  const [state, formAction, isPending] = useActionState(saveOrderAction, {});
  const ActionIcon = order ? Save : ClipboardPlus;

  return (
    <form action={formAction} className="form-grid">
      {order && <input name="id" type="hidden" value={order.id} />}
      <label>
        Vehículo
        <select
          defaultValue={order?.vehiculoId ?? ""}
          name="vehiculoId"
          required
        >
          <option disabled value="">
            Selecciona un vehículo
          </option>
          {vehicles.map((vehicle) => (
            <option key={vehicle.id} value={vehicle.id}>
              {vehicle.placa} · {vehicle.marca} {vehicle.modelo} —{" "}
              {vehicle.cliente.nombre} {vehicle.cliente.apellido}
            </option>
          ))}
        </select>
      </label>
      <label>
        Descripción del trabajo
        <input
          defaultValue={order?.descripcion ?? ""}
          maxLength={2000}
          name="descripcion"
          required
        />
      </label>
      <label>
        Estado
        <select
          defaultValue={order?.estado ?? "pendiente"}
          name="estado"
          required
        >
          {orderStates.map((status) => (
            <option key={status.value} value={status.value}>
              {status.label}
            </option>
          ))}
        </select>
      </label>
      <button disabled={isPending || vehicles.length === 0} type="submit">
        <ActionIcon aria-hidden="true" className="action-icon" />
        {isPending ? "Guardando…" : order ? "Guardar cambios" : "Crear pedido"}
      </button>
      {state.error && (
        <p aria-live="polite" className="feedback error">
          {state.error}
        </p>
      )}
      {state.success && (
        <p aria-live="polite" className="feedback success">
          {state.success}
        </p>
      )}
    </form>
  );
}
