"use server";

import { revalidatePath } from "next/cache";
import { hasPermission } from "@/lib/authorization";
import {
  createService,
  deleteService,
  ServiceNotFoundError,
  ServiceVehicleNotFoundError,
  updateService,
} from "@/lib/services";
import { serviceSchema, serviceUpdateSchema } from "@/lib/validations/service";

export type ServiceActionState = {
  error?: string;
  success?: string;
};

function serviceFields(formData: FormData) {
  return {
    vehiculoId: formData.get("vehiculoId"),
    fecha: formData.get("fecha"),
    descripcion: formData.get("descripcion"),
    costo: formData.get("costo"),
  };
}

function serviceErrorMessage(error: unknown): string {
  if (
    error instanceof ServiceNotFoundError ||
    error instanceof ServiceVehicleNotFoundError
  ) {
    return error.message;
  }
  throw error;
}

export async function saveServiceAction(
  _previousState: ServiceActionState,
  formData: FormData,
): Promise<ServiceActionState> {
  const rawId = formData.get("id");
  if (!(await hasPermission(rawId ? "update" : "create"))) {
    return { error: "No tienes permiso para realizar esta acción." };
  }

  try {
    let savedService;
    if (rawId) {
      const parsed = serviceUpdateSchema.safeParse({
        ...serviceFields(formData),
        id: rawId,
      });
      if (!parsed.success)
        return { error: parsed.error.issues[0]?.message ?? "Datos inválidos." };
      savedService = await updateService(parsed.data);
    } else {
      const parsed = serviceSchema.safeParse(serviceFields(formData));
      if (!parsed.success)
        return { error: parsed.error.issues[0]?.message ?? "Datos inválidos." };
      savedService = await createService(parsed.data);
    }

    revalidatePath(`/vehicles/${savedService.vehiculoId}/services`);
    return {
      success: rawId ? "Servicio actualizado." : "Servicio registrado.",
    };
  } catch (error) {
    return { error: serviceErrorMessage(error) };
  }
}

export async function deleteServiceAction(
  _previousState: ServiceActionState,
  formData: FormData,
): Promise<ServiceActionState> {
  if (!(await hasPermission("delete"))) {
    return { error: "No tienes permiso para realizar esta acción." };
  }

  const id = Number(formData.get("id"));
  if (!Number.isSafeInteger(id) || id < 1) {
    return { error: "El identificador del servicio no es válido." };
  }

  try {
    const deleted = await deleteService(id);
    revalidatePath(`/vehicles/${deleted.vehiculoId}/services`);
    return { success: "Servicio eliminado." };
  } catch (error) {
    return { error: serviceErrorMessage(error) };
  }
}
