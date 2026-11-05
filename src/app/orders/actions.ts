"use server";

import { revalidatePath } from "next/cache";
import {
  createOrder,
  deleteOrder,
  OrderNotFoundError,
  OrderVehicleNotFoundError,
  updateOrder,
} from "@/lib/orders";
import { orderSchema, orderUpdateSchema } from "@/lib/validations/order";
import type { CustomerActionState } from "@/app/customers/actions";

function orderFields(formData: FormData) {
  return {
    vehiculoId: formData.get("vehiculoId"),
    descripcion: formData.get("descripcion"),
    estado: formData.get("estado"),
  };
}

function orderErrorMessage(error: unknown): string {
  if (error instanceof OrderNotFoundError || error instanceof OrderVehicleNotFoundError) {
    return error.message;
  }
  throw error;
}

export async function saveOrderAction(
  _previousState: CustomerActionState,
  formData: FormData,
): Promise<CustomerActionState> {
  const rawId = formData.get("id");
  try {
    if (rawId) {
      const parsed = orderUpdateSchema.safeParse({ ...orderFields(formData), id: rawId });
      if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Datos inválidos." };
      await updateOrder(parsed.data);
    } else {
      const parsed = orderSchema.safeParse(orderFields(formData));
      if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Datos inválidos." };
      await createOrder(parsed.data);
    }

    revalidatePath("/orders");
    revalidatePath("/");
    revalidatePath("/vehicles");
    return { success: rawId ? "Pedido actualizado." : "Pedido registrado." };
  } catch (error) {
    return { error: orderErrorMessage(error) };
  }
}

export async function deleteOrderAction(
  _previousState: CustomerActionState,
  formData: FormData,
): Promise<CustomerActionState> {
  const id = Number(formData.get("id"));
  if (!Number.isInteger(id) || id < 1) return { error: "El identificador del pedido no es válido." };

  try {
    await deleteOrder(id);
    revalidatePath("/orders");
    revalidatePath("/");
    revalidatePath("/vehicles");
    return { success: "Pedido eliminado." };
  } catch (error) {
    return { error: orderErrorMessage(error) };
  }
}
