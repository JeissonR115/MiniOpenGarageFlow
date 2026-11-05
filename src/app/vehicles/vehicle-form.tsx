"use client";

import { useActionState } from "react";
import type { CustomerActionState } from "@/app/customers/actions";
import { saveVehicleAction } from "./actions";

type VehicleFormProps = {
  customers: Array<{ id: number; nombre: string; apellido: string }>;
  vehicle?: {
    id: number;
    clienteId: number;
    placa: string;
    marca: string;
    modelo: string;
    anio: number | null;
    color: string | null;
  };
};

const initialState: CustomerActionState = {};

export function VehicleForm({ customers, vehicle }: VehicleFormProps) {
  const [state, action, pending] = useActionState(saveVehicleAction, initialState);

  return (
    <form action={action} className="form-grid">
      {vehicle && <input type="hidden" name="id" value={vehicle.id} />}
      <label>
        Propietario
        <select name="clienteId" required defaultValue={vehicle?.clienteId ?? ""}>
          <option value="" disabled>Selecciona un cliente</option>
          {customers.map((customer) => (
            <option key={customer.id} value={customer.id}>
              {customer.nombre} {customer.apellido}
            </option>
          ))}
        </select>
      </label>
      <label>
        Placa
        <input name="placa" required defaultValue={vehicle?.placa} />
      </label>
      <label>
        Marca
        <input name="marca" required defaultValue={vehicle?.marca} />
      </label>
      <label>
        Modelo
        <input name="modelo" required defaultValue={vehicle?.modelo} />
      </label>
      <label>
        Año (opcional)
        <input name="anio" type="number" min="1886" max={new Date().getFullYear() + 1} defaultValue={vehicle?.anio ?? ""} />
      </label>
      <label>
        Color (opcional)
        <input name="color" defaultValue={vehicle?.color ?? ""} />
      </label>
      <button disabled={pending || customers.length === 0} type="submit">
        {pending ? "Guardando..." : vehicle ? "Guardar cambios" : "Registrar vehículo"}
      </button>
      {state.error && <p className="feedback error" role="alert">{state.error}</p>}
      {state.success && <p className="feedback success" role="status">{state.success}</p>}
    </form>
  );
}
