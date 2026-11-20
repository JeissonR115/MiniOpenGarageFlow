import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  count: vi.fn(),
  findMany: vi.fn(),
  findUnique: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    cliente: {
      count: mocks.count,
      findMany: mocks.findMany,
      findUnique: mocks.findUnique,
    },
  },
}));

import {
  getCustomerWithVehicles,
  listCustomersForExport,
  listCustomersPage,
} from "./customers";

describe("customer list query", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("searches customer name and phone and applies stable sorting and pagination", async () => {
    mocks.count.mockResolvedValue(23);
    mocks.findMany.mockResolvedValue([{ id: 8 }]);

    await expect(
      listCustomersPage({
        search: "  Ana  ",
        page: 2,
        pageSize: 5,
        sort: "nombre",
        direction: "desc",
      }),
    ).resolves.toEqual({
      records: [{ id: 8 }],
      page: 2,
      pageSize: 5,
      totalCount: 23,
      totalPages: 5,
    });

    expect(mocks.findMany).toHaveBeenCalledWith({
      where: {
        OR: [
          { nombre: { contains: "Ana" } },
          { apellido: { contains: "Ana" } },
          { telefono: { contains: "Ana" } },
        ],
      },
      orderBy: [{ nombre: "desc" }, { id: "asc" }],
      skip: 5,
      take: 5,
    });
  });

  it("keeps an empty result on a valid page and clamps out-of-range pages", async () => {
    mocks.count.mockResolvedValue(0);
    mocks.findMany.mockResolvedValue([]);

    await expect(
      listCustomersPage({ page: 5, pageSize: 10 }),
    ).resolves.toMatchObject({
      records: [],
      page: 1,
      totalCount: 0,
      totalPages: 1,
    });
    expect(mocks.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ skip: 0, take: 10 }),
    );
  });

  it("loads a customer with all vehicles ordered by plate for the detail view", async () => {
    mocks.findUnique.mockResolvedValue({
      id: 3,
      vehiculos: [{ placa: "ABC123" }],
    });

    await expect(getCustomerWithVehicles(3)).resolves.toMatchObject({
      id: 3,
      vehiculos: [{ placa: "ABC123" }],
    });
    expect(mocks.findUnique).toHaveBeenCalledWith({
      where: { id: 3 },
      include: { vehiculos: { orderBy: { placa: "asc" } } },
    });
  });

  it("exports all matching customers without page limits", async () => {
    mocks.findMany.mockResolvedValue([]);

    await listCustomersForExport({
      search: "Ana",
      sort: "nombre",
      direction: "desc",
    });

    expect(mocks.findMany).toHaveBeenCalledWith({
      where: {
        OR: [
          { nombre: { contains: "Ana" } },
          { apellido: { contains: "Ana" } },
          { telefono: { contains: "Ana" } },
        ],
      },
      orderBy: [{ nombre: "desc" }, { id: "asc" }],
    });
    expect(mocks.findMany.mock.calls[0]?.[0]).not.toHaveProperty("take");
  });
});
