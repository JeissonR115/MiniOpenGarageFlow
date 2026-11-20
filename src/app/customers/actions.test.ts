import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  createCustomer: vi.fn(),
  deleteCustomer: vi.fn(),
  hasPermission: vi.fn(),
  revalidatePath: vi.fn(),
  updateCustomer: vi.fn(),
}));

vi.mock("next/cache", () => ({
  revalidatePath: mocks.revalidatePath,
}));

vi.mock("@/lib/authorization", () => ({
  hasPermission: mocks.hasPermission,
}));

vi.mock("@/lib/customers", () => ({
  createCustomer: mocks.createCustomer,
  deleteCustomer: mocks.deleteCustomer,
  updateCustomer: mocks.updateCustomer,
  CustomerHasVehiclesError: class CustomerHasVehiclesError extends Error {},
}));

import { deleteCustomerAction, saveCustomerAction } from "./actions";

function customerForm(id?: string) {
  const formData = new FormData();
  if (id) formData.set("id", id);
  formData.set("nombre", "Ana");
  formData.set("apellido", "García");
  formData.set("telefono", "555123");
  formData.set("correo", "");
  return formData;
}

describe("customer actions authorization", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("allows reception to create but rejects direct update and delete requests", async () => {
    mocks.hasPermission.mockImplementation(
      async (permission: string) => permission === "create",
    );

    await expect(saveCustomerAction({}, customerForm())).resolves.toEqual({
      success: "Cliente registrado.",
    });
    await expect(
      saveCustomerAction({}, customerForm("1")),
    ).resolves.toHaveProperty("error");
    await expect(
      deleteCustomerAction({}, customerForm("1")),
    ).resolves.toHaveProperty("error");

    expect(mocks.createCustomer).toHaveBeenCalledTimes(1);
    expect(mocks.updateCustomer).not.toHaveBeenCalled();
    expect(mocks.deleteCustomer).not.toHaveBeenCalled();
  });

  it("rejects creation when the caller has no permission", async () => {
    mocks.hasPermission.mockResolvedValue(false);

    await expect(
      saveCustomerAction({}, customerForm()),
    ).resolves.toHaveProperty("error");
    expect(mocks.createCustomer).not.toHaveBeenCalled();
  });
});
