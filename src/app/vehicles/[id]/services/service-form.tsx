"use client";

import { useActionState } from "react";
import { deleteServiceAction, saveServiceAction } from "./actions";
import type { ServiceActionState } from "./actions";
import { Save, Trash2, Wrench } from "lucide-react";

type ServiceFormProps = {
  vehicleId: number;
  service?: {
    id: number;
    fecha: Date;
    descripcion: string;
    costo: number;
  };
};

const initialState: ServiceActionState = {};

export function ServiceForm({ vehicleId, service }: ServiceFormProps) {
  const [state, action, pending] = useActionState(
    saveServiceAction,
    initialState,
  );
  const ActionIcon = service ? Save : Wrench;

  return (
    <form action={action} className="form-grid">
      {service && <input name="id" type="hidden" value={service.id} />}
      <input name="vehiculoId" type="hidden" value={vehicleId} />
      <label>
        Fecha
        <input
          defaultValue={service?.fecha.toISOString().slice(0, 10)}
          name="fecha"
          required
          type="date"
        />
      </label>
      <label>
        Descripción
        <input
          defaultValue={service?.descripcion}
          name="descripcion"
          required
        />
      </label>
      <label>
        Costo
        <input
          defaultValue={service?.costo}
          min="0"
          name="costo"
          required
          step="0.01"
          type="number"
        />
      </label>
      <button disabled={pending} type="submit">
        <ActionIcon aria-hidden="true" className="action-icon" />
        {pending
          ? "Guardando..."
          : service
            ? "Guardar cambios"
            : "Registrar servicio"}
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

export function DeleteServiceForm({ serviceId }: { serviceId: number }) {
  const [state, action, pending] = useActionState(
    deleteServiceAction,
    initialState,
  );

  return (
    <form action={action}>
      <input name="id" type="hidden" value={serviceId} />
      <button className="button-danger" disabled={pending} type="submit">
        <Trash2 aria-hidden="true" className="action-icon" />
        {pending ? "Eliminando..." : "Eliminar servicio"}
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
