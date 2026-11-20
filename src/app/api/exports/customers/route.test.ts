import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  hasPermission: vi.fn(),
  listCustomersForExport: vi.fn(),
}));

vi.mock("@/lib/authorization", () => ({
  hasPermission: mocks.hasPermission,
}));

vi.mock("@/lib/customers", () => ({
  listCustomersForExport: mocks.listCustomersForExport,
}));

import { GET } from "./route";

describe("customer CSV export route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.hasPermission.mockResolvedValue(true);
    mocks.listCustomersForExport.mockResolvedValue([
      {
        id: 1,
        nombre: 'Ana, "Ani"',
        apellido: "Pérez",
        telefono: "555",
        correo: "ana@example.com",
        fechaRegistro: new Date("2026-01-02T03:04:05.000Z"),
      },
    ]);
  });

  it("exports all records matching the query as a downloadable CSV", async () => {
    const response = await GET(
      new Request(
        "http://localhost/api/exports/customers?q=Ana&sort=nombre&direction=desc",
      ),
    );

    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toContain("text/csv");
    expect(response.headers.get("content-disposition")).toContain(
      "clientes.csv",
    );
    expect(await response.text()).toContain(
      '"1","Ana, ""Ani""","Pérez","555","ana@example.com"',
    );
    expect(mocks.listCustomersForExport).toHaveBeenCalledWith({
      search: "Ana",
      sort: "nombre",
      direction: "desc",
    });
  });

  it("rejects export requests without read permission", async () => {
    mocks.hasPermission.mockResolvedValue(false);

    const response = await GET(
      new Request("http://localhost/api/exports/customers"),
    );

    expect(response.status).toBe(403);
    expect(mocks.listCustomersForExport).not.toHaveBeenCalled();
  });
});
