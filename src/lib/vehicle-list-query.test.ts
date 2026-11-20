import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  count: vi.fn(),
  findMany: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    vehiculo: {
      count: mocks.count,
      findMany: mocks.findMany,
    },
  },
}));

import {
  listVehicleBrands,
  listVehiclesForExport,
  listVehiclesPage,
} from "./vehicles";

describe("vehicle list query", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("combines search, brand and owner filters before stable pagination", async () => {
    mocks.count.mockResolvedValue(12);
    mocks.findMany.mockResolvedValue([{ id: 3 }]);

    await expect(
      listVehiclesPage({
        search: " Toyota ",
        marca: " Toyota ",
        clienteId: 7,
        page: 2,
        pageSize: 5,
        sort: "cliente",
        direction: "desc",
      }),
    ).resolves.toMatchObject({
      page: 2,
      pageSize: 5,
      totalCount: 12,
      totalPages: 3,
    });

    expect(mocks.findMany).toHaveBeenCalledWith({
      where: {
        marca: "Toyota",
        clienteId: 7,
        OR: [
          { placa: { contains: "Toyota" } },
          { marca: { contains: "Toyota" } },
          { modelo: { contains: "Toyota" } },
          {
            cliente: {
              is: {
                OR: [
                  { nombre: { contains: "Toyota" } },
                  { apellido: { contains: "Toyota" } },
                ],
              },
            },
          },
        ],
      },
      include: { cliente: { select: { nombre: true, apellido: true } } },
      orderBy: [
        { cliente: { apellido: "desc" } },
        { cliente: { nombre: "desc" } },
        { placa: "asc" },
        { id: "asc" },
      ],
      skip: 5,
      take: 5,
    });
  });

  it("ignores invalid owner and page values and returns empty results", async () => {
    mocks.count.mockResolvedValue(0);
    mocks.findMany.mockResolvedValue([]);

    await expect(
      listVehiclesPage({ clienteId: -1, page: 0, pageSize: 0, sort: "placa" }),
    ).resolves.toMatchObject({
      records: [],
      page: 1,
      pageSize: 10,
      totalCount: 0,
    });

    expect(mocks.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: {}, skip: 0, take: 10 }),
    );
  });

  it("loads distinct brands in display order for vehicle filters", async () => {
    mocks.findMany.mockResolvedValue([{ marca: "Honda" }, { marca: "Toyota" }]);

    await expect(listVehicleBrands()).resolves.toEqual([
      { marca: "Honda" },
      { marca: "Toyota" },
    ]);
    expect(mocks.findMany).toHaveBeenCalledWith({
      distinct: ["marca"],
      select: { marca: true },
      orderBy: { marca: "asc" },
    });
  });

  it("exports every vehicle matching the active search and filters with owner details", async () => {
    mocks.findMany.mockResolvedValue([]);

    await listVehiclesForExport({
      search: "Ana",
      marca: "Toyota",
      clienteId: 7,
      sort: "placa",
      direction: "desc",
    });

    expect(mocks.findMany).toHaveBeenCalledWith({
      where: {
        marca: "Toyota",
        clienteId: 7,
        OR: [
          { placa: { contains: "Ana" } },
          { marca: { contains: "Ana" } },
          { modelo: { contains: "Ana" } },
          {
            cliente: {
              is: {
                OR: [
                  { nombre: { contains: "Ana" } },
                  { apellido: { contains: "Ana" } },
                ],
              },
            },
          },
        ],
      },
      include: {
        cliente: { select: { nombre: true, apellido: true, telefono: true } },
      },
      orderBy: [{ placa: "desc" }, { id: "asc" }],
    });
    expect(mocks.findMany.mock.calls[0]?.[0]).not.toHaveProperty("take");
  });
});
