import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import type { PrismaClient } from "@prisma/client";
import { getBogotaDayRange, getDashboardData } from "./dashboard";
import { createCustomer } from "./customers";
import { createOrder } from "./orders";
import { createVehicle } from "./vehicles";
import { createPrismaTestDatabase } from "@/test/prisma-test-db";

let db: PrismaClient;
let cleanup: () => Promise<void>;

beforeAll(() => {
  const testDatabase = createPrismaTestDatabase("opengarageflow-dashboard-");
  db = testDatabase.db;
  cleanup = testDatabase.cleanup;
});

beforeEach(async () => {
  await db.servicio.deleteMany();
  await db.pedido.deleteMany();
  await db.vehiculo.deleteMany();
  await db.cliente.deleteMany();
});

afterAll(async () => {
  await cleanup?.();
});

describe("work order dashboard data", () => {
  it("calculates the Colombia calendar day boundaries in UTC", () => {
    const { start, end } = getBogotaDayRange(
      new Date("2026-11-05T04:59:59.999Z"),
    );
    expect(start.toISOString()).toBe("2026-11-04T05:00:00.000Z");
    expect(end.toISOString()).toBe("2026-11-05T05:00:00.000Z");
  });

  it("returns zero totals and empty registration data for a new workshop", async () => {
    await expect(
      getDashboardData(db, new Date("2026-11-05T12:00:00.000Z")),
    ).resolves.toMatchObject({
      customerCount: 0,
      vehicleCount: 0,
      lastRegistration: null,
      vehiclesByBrand: [],
      customerRegistrationsByMonth: [],
    });
  });

  it("counts clients and vehicles, selects the latest registration, and groups brands", async () => {
    const firstCustomer = await createCustomer(
      { nombre: "Ana", apellido: "Ríos", telefono: "123", correo: undefined },
      db,
    );
    const secondCustomer = await createCustomer(
      { nombre: "Luis", apellido: "Paz", telefono: "456", correo: undefined },
      db,
    );
    const firstVehicle = await createVehicle(
      {
        clienteId: firstCustomer.id,
        placa: "ABC123",
        marca: "Toyota",
        modelo: "Corolla",
        anio: 2020,
        color: undefined,
      },
      db,
    );
    const secondVehicle = await createVehicle(
      {
        clienteId: secondCustomer.id,
        placa: "XYZ789",
        marca: "Toyota",
        modelo: "Yaris",
        anio: 2021,
        color: undefined,
      },
      db,
    );
    await db.cliente.update({
      where: { id: firstCustomer.id },
      data: { fechaRegistro: new Date("2026-02-01T04:30:00.000Z") },
    });
    await db.cliente.update({
      where: { id: secondCustomer.id },
      data: { fechaRegistro: new Date("2026-02-01T05:30:00.000Z") },
    });
    const latestVehicleRegistration = new Date("2026-03-01T00:00:00.000Z");
    await db.vehiculo.update({
      where: { id: firstVehicle.id },
      data: { fechaRegistro: new Date("2026-02-15T00:00:00.000Z") },
    });
    await db.vehiculo.update({
      where: { id: secondVehicle.id },
      data: { fechaRegistro: latestVehicleRegistration },
    });

    await expect(
      getDashboardData(db, new Date("2026-11-05T12:00:00.000Z")),
    ).resolves.toMatchObject({
      customerCount: 2,
      vehicleCount: 2,
      lastRegistration: { type: "vehículo", date: latestVehicleRegistration },
      vehiclesByBrand: [{ marca: "Toyota", count: 2 }],
      customerRegistrationsByMonth: [
        { month: "2026-01", count: 1 },
        { month: "2026-02", count: 1 },
      ],
    });
  });

  it("counts states, includes completed orders only within today, and sorts active orders", async () => {
    const owner = await createCustomer(
      { nombre: "Ana", apellido: "Ríos", telefono: "123", correo: undefined },
      db,
    );
    const vehicle = await createVehicle(
      {
        clienteId: owner.id,
        placa: "ABC123",
        marca: "Toyota",
        modelo: "Corolla",
        anio: 2020,
        color: undefined,
      },
      db,
    );
    const now = new Date("2026-11-05T12:00:00.000Z");
    const { start, end } = getBogotaDayRange(now);
    const activeOlder = await createOrder(
      {
        vehiculoId: vehicle.id,
        descripcion: "Pedido activo anterior",
        estado: "pendiente",
      },
      db,
    );
    const activeNewer = await createOrder(
      {
        vehiculoId: vehicle.id,
        descripcion: "Pedido activo reciente",
        estado: "en_proceso",
      },
      db,
    );
    const completedBeforeDay = await createOrder(
      {
        vehiculoId: vehicle.id,
        descripcion: "Terminado antes",
        estado: "terminado",
      },
      db,
    );
    const completedAtStart = await createOrder(
      {
        vehiculoId: vehicle.id,
        descripcion: "Terminado al inicio",
        estado: "terminado",
      },
      db,
    );
    const completedBeforeEnd = await createOrder(
      {
        vehiculoId: vehicle.id,
        descripcion: "Terminado hoy",
        estado: "terminado",
      },
      db,
    );
    const completedAtEnd = await createOrder(
      {
        vehiculoId: vehicle.id,
        descripcion: "Terminado al final",
        estado: "terminado",
      },
      db,
    );

    await Promise.all([
      db.pedido.update({
        where: { id: activeOlder.id },
        data: { fechaCreacion: new Date("2026-11-04T10:00:00Z") },
      }),
      db.pedido.update({
        where: { id: activeNewer.id },
        data: { fechaCreacion: new Date("2026-11-04T11:00:00Z") },
      }),
      db.pedido.update({
        where: { id: completedBeforeDay.id },
        data: { fechaTerminacion: new Date(start.getTime() - 1) },
      }),
      db.pedido.update({
        where: { id: completedAtStart.id },
        data: { fechaTerminacion: start },
      }),
      db.pedido.update({
        where: { id: completedBeforeEnd.id },
        data: { fechaTerminacion: new Date(end.getTime() - 1) },
      }),
      db.pedido.update({
        where: { id: completedAtEnd.id },
        data: { fechaTerminacion: end },
      }),
    ]);

    const dashboard = await getDashboardData(db, now);
    expect(dashboard).toMatchObject({
      pendingCount: 1,
      inProgressCount: 1,
      completedTodayCount: 2,
      activeOrders: [
        {
          id: activeNewer.id,
          vehiculo: {
            placa: "ABC123",
            cliente: { nombre: "Ana", apellido: "Ríos" },
          },
        },
        { id: activeOlder.id },
      ],
    });
  });
});
