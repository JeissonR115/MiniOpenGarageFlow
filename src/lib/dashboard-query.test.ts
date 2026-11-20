import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  activeOrders: vi.fn(),
  customerCount: vi.fn(),
  customerDates: vi.fn(),
  latestCustomer: vi.fn(),
  latestVehicle: vi.fn(),
  orderCount: vi.fn(),
  vehicleBrands: vi.fn(),
  vehicleCount: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    pedido: { count: mocks.orderCount, findMany: mocks.activeOrders },
    cliente: {
      count: mocks.customerCount,
      findFirst: mocks.latestCustomer,
      findMany: mocks.customerDates,
    },
    vehiculo: {
      count: mocks.vehicleCount,
      findFirst: mocks.latestVehicle,
      groupBy: mocks.vehicleBrands,
    },
  },
}));

import { getDashboardData } from "./dashboard";

describe("workshop dashboard aggregates", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.orderCount.mockResolvedValue(0);
    mocks.activeOrders.mockResolvedValue([]);
    mocks.customerCount.mockResolvedValue(0);
    mocks.vehicleCount.mockResolvedValue(0);
    mocks.latestCustomer.mockResolvedValue(null);
    mocks.latestVehicle.mockResolvedValue(null);
    mocks.vehicleBrands.mockResolvedValue([]);
    mocks.customerDates.mockResolvedValue([]);
  });

  it("returns empty registration metrics and preserves zero states", async () => {
    await expect(getDashboardData()).resolves.toMatchObject({
      customerCount: 0,
      vehicleCount: 0,
      lastRegistration: null,
      vehiclesByBrand: [],
      customerRegistrationsByMonth: [],
    });
  });

  it("returns totals, the latest registration, brand totals, and monthly customer groups", async () => {
    const customerDate = new Date("2026-02-01T04:30:00.000Z");
    const vehicleDate = new Date("2026-03-01T00:00:00.000Z");
    mocks.orderCount
      .mockResolvedValueOnce(2)
      .mockResolvedValueOnce(1)
      .mockResolvedValueOnce(3);
    mocks.customerCount.mockResolvedValue(4);
    mocks.vehicleCount.mockResolvedValue(6);
    mocks.latestCustomer.mockResolvedValue({ fechaRegistro: customerDate });
    mocks.latestVehicle.mockResolvedValue({ fechaRegistro: vehicleDate });
    mocks.vehicleBrands.mockResolvedValue([
      { marca: "Honda", _count: { _all: 2 } },
      { marca: "Toyota", _count: { _all: 4 } },
    ]);
    mocks.customerDates.mockResolvedValue([
      { fechaRegistro: customerDate },
      { fechaRegistro: new Date("2026-02-01T05:30:00.000Z") },
    ]);

    await expect(
      getDashboardData(undefined, new Date("2026-11-05T12:00:00.000Z")),
    ).resolves.toMatchObject({
      pendingCount: 2,
      inProgressCount: 1,
      completedTodayCount: 3,
      customerCount: 4,
      vehicleCount: 6,
      lastRegistration: { type: "vehículo", date: vehicleDate },
      vehiclesByBrand: [
        { marca: "Honda", count: 2 },
        { marca: "Toyota", count: 4 },
      ],
      customerRegistrationsByMonth: [
        { month: "2026-01", count: 1 },
        { month: "2026-02", count: 1 },
      ],
    });
  });
});
