import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  createVehicle: vi.fn(),
  deleteVehicle: vi.fn(),
  hasPermission: vi.fn(),
  revalidatePath: vi.fn(),
  updateVehicle: vi.fn(),
  VehicleHasServicesError: class VehicleHasServicesError extends Error {
    constructor() {
      super(
        "No se puede eliminar el vehículo mientras tenga servicios asociados.",
      );
    }
  },
}));

vi.mock("next/cache", () => ({
  revalidatePath: mocks.revalidatePath,
}));

vi.mock("@/lib/authorization", () => ({
  hasPermission: mocks.hasPermission,
}));

vi.mock("@/lib/vehicles", () => ({
  createVehicle: mocks.createVehicle,
  deleteVehicle: mocks.deleteVehicle,
  updateVehicle: mocks.updateVehicle,
  VehicleCustomerNotFoundError: class VehicleCustomerNotFoundError extends Error {},
  VehicleHasOrdersError: class VehicleHasOrdersError extends Error {},
  VehicleHasServicesError: mocks.VehicleHasServicesError,
  VehiclePlateConflictError: class VehiclePlateConflictError extends Error {},
}));

import { deleteVehicleAction, saveVehicleAction } from "./actions";

function vehicleForm(id?: string) {
  const formData = new FormData();
  if (id) formData.set("id", id);
  formData.set("clienteId", "1");
  formData.set("placa", "ABC123");
  formData.set("marca", "Toyota");
  formData.set("modelo", "Corolla");
  formData.set("anio", "2020");
  formData.set("color", "");
  return formData;
}

describe("vehicle actions authorization", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("allows reception to create but rejects direct update and delete requests", async () => {
    mocks.hasPermission.mockImplementation(
      async (permission: string) => permission === "create",
    );

    await expect(saveVehicleAction({}, vehicleForm())).resolves.toEqual({
      success: "Vehículo registrado.",
    });
    await expect(
      saveVehicleAction({}, vehicleForm("1")),
    ).resolves.toHaveProperty("error");
    await expect(
      deleteVehicleAction({}, vehicleForm("1")),
    ).resolves.toHaveProperty("error");

    expect(mocks.createVehicle).toHaveBeenCalledTimes(1);
    expect(mocks.updateVehicle).not.toHaveBeenCalled();
    expect(mocks.deleteVehicle).not.toHaveBeenCalled();
  });

  it("rejects creation when the caller has no permission", async () => {
    mocks.hasPermission.mockResolvedValue(false);

    await expect(saveVehicleAction({}, vehicleForm())).resolves.toHaveProperty(
      "error",
    );
    expect(mocks.createVehicle).not.toHaveBeenCalled();
  });

  it("reports when a vehicle cannot be deleted because it has service history", async () => {
    mocks.hasPermission.mockResolvedValue(true);
    mocks.deleteVehicle.mockRejectedValue(new mocks.VehicleHasServicesError());

    await expect(deleteVehicleAction({}, vehicleForm("1"))).resolves.toEqual({
      error:
        "No se puede eliminar el vehículo mientras tenga servicios asociados.",
    });
  });
});
