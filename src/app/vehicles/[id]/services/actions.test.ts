import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  createService: vi.fn(),
  deleteService: vi.fn(),
  hasPermission: vi.fn(),
  revalidatePath: vi.fn(),
  updateService: vi.fn(),
}));

vi.mock("next/cache", () => ({
  revalidatePath: mocks.revalidatePath,
}));

vi.mock("@/lib/authorization", () => ({
  hasPermission: mocks.hasPermission,
}));

vi.mock("@/lib/services", () => ({
  createService: mocks.createService,
  deleteService: mocks.deleteService,
  updateService: mocks.updateService,
  ServiceNotFoundError: class ServiceNotFoundError extends Error {},
  ServiceVehicleNotFoundError: class ServiceVehicleNotFoundError extends Error {},
}));

import { deleteServiceAction, saveServiceAction } from "./actions";

function serviceForm({
  id,
  vehiculoId = "2",
  fecha = "2026-03-10",
  descripcion = "Revisión general",
  costo = "120.50",
}: {
  id?: string;
  vehiculoId?: string;
  fecha?: string;
  descripcion?: string;
  costo?: string;
} = {}) {
  const formData = new FormData();
  if (id) formData.set("id", id);
  formData.set("vehiculoId", vehiculoId);
  formData.set("fecha", fecha);
  formData.set("descripcion", descripcion);
  formData.set("costo", costo);
  return formData;
}

describe("vehicle service actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.hasPermission.mockResolvedValue(true);
    mocks.createService.mockResolvedValue({ vehiculoId: 2 });
    mocks.updateService.mockResolvedValue({ vehiculoId: 2 });
    mocks.deleteService.mockResolvedValue({ vehiculoId: 2 });
  });

  it("creates and updates validated service records", async () => {
    await expect(saveServiceAction({}, serviceForm())).resolves.toEqual({
      success: "Servicio registrado.",
    });
    expect(mocks.createService).toHaveBeenCalledWith({
      vehiculoId: 2,
      fecha: new Date("2026-03-10"),
      descripcion: "Revisión general",
      costo: 120.5,
    });

    await expect(
      saveServiceAction({}, serviceForm({ id: "4" })),
    ).resolves.toEqual({
      success: "Servicio actualizado.",
    });
    expect(mocks.updateService).toHaveBeenCalledWith({
      id: 4,
      vehiculoId: 2,
      fecha: new Date("2026-03-10"),
      descripcion: "Revisión general",
      costo: 120.5,
    });
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/vehicles/2/services");
  });

  it("revalidates the original vehicle path when an update submits a different vehicle id", async () => {
    await saveServiceAction({}, serviceForm({ id: "4", vehiculoId: "9999" }));

    expect(mocks.updateService).toHaveBeenCalledWith({
      id: 4,
      vehiculoId: 9999,
      fecha: new Date("2026-03-10"),
      descripcion: "Revisión general",
      costo: 120.5,
    });
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/vehicles/2/services");
  });

  it("rejects invalid input before writing", async () => {
    await expect(
      saveServiceAction({}, serviceForm({ costo: "-1" })),
    ).resolves.toHaveProperty("error");
    await expect(
      saveServiceAction({}, serviceForm({ fecha: "" })),
    ).resolves.toHaveProperty("error");
    await expect(
      saveServiceAction({}, serviceForm({ descripcion: " " })),
    ).resolves.toHaveProperty("error");
    expect(mocks.createService).not.toHaveBeenCalled();
    expect(mocks.updateService).not.toHaveBeenCalled();
  });

  it("deletes a service and revalidates its vehicle history", async () => {
    const formData = new FormData();
    formData.set("id", "7");

    await expect(deleteServiceAction({}, formData)).resolves.toEqual({
      success: "Servicio eliminado.",
    });
    expect(mocks.deleteService).toHaveBeenCalledWith(7);
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/vehicles/2/services");
  });

  it("allows reception to create but rejects direct update and delete requests", async () => {
    mocks.hasPermission.mockImplementation(
      async (permission: string) => permission === "create",
    );

    await expect(saveServiceAction({}, serviceForm())).resolves.toEqual({
      success: "Servicio registrado.",
    });
    await expect(
      saveServiceAction({}, serviceForm({ id: "4" })),
    ).resolves.toHaveProperty("error");

    const formData = new FormData();
    formData.set("id", "7");
    await expect(deleteServiceAction({}, formData)).resolves.toHaveProperty(
      "error",
    );
    expect(mocks.createService).toHaveBeenCalledTimes(1);
    expect(mocks.updateService).not.toHaveBeenCalled();
    expect(mocks.deleteService).not.toHaveBeenCalled();
  });
});
