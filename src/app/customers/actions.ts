"use server";

import { revalidatePath } from "next/cache";
import {
  createCustomer,
  CustomerHasVehiclesError,
  deleteCustomer,
  updateCustomer,
} from "@/lib/customers";
import { customerSchema, customerUpdateSchema } from "@/lib/validations/customer";

export type CustomerActionState = {
  error?: string;
  success?: string;
};

function customerFields(formData: FormData) {
  return {
    nombre: formData.get("nombre"),
    apellido: formData.get("apellido"),
    telefono: formData.get("telefono"),
    correo: formData.get("correo"),
  };
}

export async function saveCustomerAction(
  _previousState: CustomerActionState,
  formData: FormData,
): Promise<CustomerActionState> {
  const rawId = formData.get("id");
  if (rawId) {
    const parsed = customerUpdateSchema.safeParse({
      ...customerFields(formData),
      id: rawId,
    });
    if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Datos inválidos." };

    await updateCustomer(parsed.data);
    revalidatePath("/customers");
    return { success: "Cliente actualizado." };
  }

  const parsed = customerSchema.safeParse(customerFields(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Datos inválidos." };

  await createCustomer(parsed.data);
  revalidatePath("/customers");
  return { success: "Cliente registrado." };
}

export async function deleteCustomerAction(
  _previousState: CustomerActionState,
  formData: FormData,
): Promise<CustomerActionState> {
  const id = Number(formData.get("id"));
  if (!Number.isInteger(id) || id < 1) return { error: "El identificador del cliente no es válido." };

  try {
    await deleteCustomer(id);
    revalidatePath("/customers");
    return { success: "Cliente eliminado." };
  } catch (error) {
    if (error instanceof CustomerHasVehiclesError) return { error: error.message };
    throw error;
  }
}
