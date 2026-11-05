"use server";

import { revalidatePath } from "next/cache";
import {
  createVehicle,
  deleteVehicle,
  updateVehicle,
  VehicleCustomerNotFoundError,
  VehiclePlateConflictError,
} from "@/lib/vehicles";
import { vehicleSchema, vehicleUpdateSchema } from "@/lib/validations/vehicle";
import type { CustomerActionState } from "@/app/customers/actions";

function vehicleFields(formData: FormData) {
  return {
    clienteId: formData.get("clienteId"),
    placa: formData.get("placa"),
    marca: formData.get("marca"),
    modelo: formData.get("modelo"),
    anio: formData.get("anio"),
    color: formData.get("color"),
  };
}

function errorMessage(error: unknown): string {
  if (error instanceof VehiclePlateConflictError || error instanceof VehicleCustomerNotFoundError) {
    return error.message;
  }
  throw error;
}

export async function saveVehicleAction(
  _previousState: CustomerActionState,
  formData: FormData,
): Promise<CustomerActionState> {
  const rawId = formData.get("id");
  try {
    if (rawId) {
      const parsed = vehicleUpdateSchema.safeParse({ ...vehicleFields(formData), id: rawId });
      if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Datos inválidos." };
      await updateVehicle(parsed.data);
    } else {
      const parsed = vehicleSchema.safeParse(vehicleFields(formData));
      if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Datos inválidos." };
      await createVehicle(parsed.data);
    }
    revalidatePath("/vehicles");
    revalidatePath("/customers");
    return { success: rawId ? "Vehículo actualizado." : "Vehículo registrado." };
  } catch (error) {
    return { error: errorMessage(error) };
  }
}

export async function deleteVehicleAction(
  _previousState: CustomerActionState,
  formData: FormData,
): Promise<CustomerActionState> {
  const id = Number(formData.get("id"));
  if (!Number.isInteger(id) || id < 1) return { error: "El identificador del vehículo no es válido." };

  await deleteVehicle(id);
  revalidatePath("/vehicles");
  revalidatePath("/customers");
  return { success: "Vehículo eliminado." };
}
