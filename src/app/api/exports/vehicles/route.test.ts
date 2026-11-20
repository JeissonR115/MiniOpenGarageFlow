import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  hasPermission: vi.fn(),
  listVehiclesForExport: vi.fn(),
}));

vi.mock("@/lib/authorization", () => ({
  hasPermission: mocks.hasPermission,
}));

vi.mock("@/lib/vehicles", () => ({
  listVehiclesForExport: mocks.listVehiclesForExport,
}));

import { GET } from "./route";

describe("vehicle CSV export route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.hasPermission.mockResolvedValue(true);
    mocks.listVehiclesForExport.mockResolvedValue([
      {
        id: 1,
        placa: "ABC123",
        marca: "Toyota",
        modelo: "Corolla",
        anio: 2020,
        color: null,
        cliente: { nombre: "Ana", apellido: "Pérez", telefono: "555" },
      },
    ]);
  });

  it("exports every matching vehicle with owner data and no page parameter", async () => {
    const response = await GET(
      new Request(
        "http://localhost/api/exports/vehicles?q=Ana&marca=Toyota&clienteId=7",
      ),
    );

    expect(response.status).toBe(200);
    expect(await response.text()).toContain(
      '"1","ABC123","Toyota","Corolla","2020","","Ana Pérez","555"',
    );
    expect(mocks.listVehiclesForExport).toHaveBeenCalledWith({
      search: "Ana",
      marca: "Toyota",
      clienteId: 7,
      sort: undefined,
      direction: "asc",
    });
  });

  it("rejects export requests without read permission", async () => {
    mocks.hasPermission.mockResolvedValue(false);

    const response = await GET(
      new Request("http://localhost/api/exports/vehicles"),
    );

    expect(response.status).toBe(403);
    expect(mocks.listVehiclesForExport).not.toHaveBeenCalled();
  });
});
