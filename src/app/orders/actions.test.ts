import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  createOrder: vi.fn(),
  deleteOrder: vi.fn(),
  revalidatePath: vi.fn(),
  updateOrder: vi.fn(),
}));

vi.mock("next/cache", () => ({
  revalidatePath: mocks.revalidatePath,
}));

vi.mock("@/lib/orders", () => ({
  createOrder: mocks.createOrder,
  deleteOrder: mocks.deleteOrder,
  updateOrder: mocks.updateOrder,
  OrderNotFoundError: class OrderNotFoundError extends Error {},
  OrderVehicleNotFoundError: class OrderVehicleNotFoundError extends Error {},
}));

import { deleteOrderAction, saveOrderAction } from "./actions";

function orderForm({
  id,
  vehiculoId = "2",
  descripcion = "Revisión general",
  estado = "pendiente",
}: {
  id?: string;
  vehiculoId?: string;
  descripcion?: string;
  estado?: string;
} = {}) {
  const formData = new FormData();
  if (id) formData.set("id", id);
  formData.set("vehiculoId", vehiculoId);
  formData.set("descripcion", descripcion);
  formData.set("estado", estado);
  return formData;
}

describe("work order actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates and updates orders after validation", async () => {
    await expect(saveOrderAction({}, orderForm())).resolves.toEqual({
      success: "Pedido registrado.",
    });
    expect(mocks.createOrder).toHaveBeenCalledWith({
      vehiculoId: 2,
      descripcion: "Revisión general",
      estado: "pendiente",
    });

    await expect(saveOrderAction({}, orderForm({ id: "4", estado: "terminado" }))).resolves.toEqual({
      success: "Pedido actualizado.",
    });
    expect(mocks.updateOrder).toHaveBeenCalledWith({
      id: 4,
      vehiculoId: 2,
      descripcion: "Revisión general",
      estado: "terminado",
    });
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/");
  });

  it("rejects invalid order input before writing", async () => {
    await expect(saveOrderAction({}, orderForm({ estado: "otro" }))).resolves.toHaveProperty("error");
    await expect(saveOrderAction({}, orderForm({ descripcion: " " }))).resolves.toHaveProperty("error");
    expect(mocks.createOrder).not.toHaveBeenCalled();
    expect(mocks.updateOrder).not.toHaveBeenCalled();
  });

  it("deletes orders and rejects invalid identifiers", async () => {
    const formData = new FormData();
    formData.set("id", "7");
    await expect(deleteOrderAction({}, formData)).resolves.toEqual({ success: "Pedido eliminado." });
    expect(mocks.deleteOrder).toHaveBeenCalledWith(7);

    formData.set("id", "0");
    await expect(deleteOrderAction({}, formData)).resolves.toHaveProperty("error");
    expect(mocks.deleteOrder).toHaveBeenCalledTimes(1);
  });
});
