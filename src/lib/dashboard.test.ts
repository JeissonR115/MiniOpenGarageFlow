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
  await db.pedido.deleteMany();
  await db.vehiculo.deleteMany();
  await db.cliente.deleteMany();
});

afterAll(async () => {
  await cleanup?.();
});

describe("work order dashboard data", () => {
  it("calculates the Colombia calendar day boundaries in UTC", () => {
    const { start, end } = getBogotaDayRange(new Date("2026-11-05T04:59:59.999Z"));
    expect(start.toISOString()).toBe("2026-11-04T05:00:00.000Z");
    expect(end.toISOString()).toBe("2026-11-05T05:00:00.000Z");
  });

  it("counts states, includes completed orders only within today, and sorts active orders", async () => {
    const owner = await createCustomer(
      { nombre: "Ana", apellido: "Ríos", telefono: "123", correo: undefined },
      db,
    );
    const vehicle = await createVehicle(
      { clienteId: owner.id, placa: "ABC123", marca: "Toyota", modelo: "Corolla", anio: 2020, color: undefined },
      db,
    );
    const now = new Date("2026-11-05T12:00:00.000Z");
    const { start, end } = getBogotaDayRange(now);
    const activeOlder = await createOrder(
      { vehiculoId: vehicle.id, descripcion: "Pedido activo anterior", estado: "pendiente" },
      db,
    );
    const activeNewer = await createOrder(
      { vehiculoId: vehicle.id, descripcion: "Pedido activo reciente", estado: "en_proceso" },
      db,
    );
    const completedBeforeDay = await createOrder(
      { vehiculoId: vehicle.id, descripcion: "Terminado antes", estado: "terminado" },
      db,
    );
    const completedAtStart = await createOrder(
      { vehiculoId: vehicle.id, descripcion: "Terminado al inicio", estado: "terminado" },
      db,
    );
    const completedBeforeEnd = await createOrder(
      { vehiculoId: vehicle.id, descripcion: "Terminado hoy", estado: "terminado" },
      db,
    );
    const completedAtEnd = await createOrder(
      { vehiculoId: vehicle.id, descripcion: "Terminado al final", estado: "terminado" },
      db,
    );

    await Promise.all([
      db.pedido.update({ where: { id: activeOlder.id }, data: { fechaCreacion: new Date("2026-11-04T10:00:00Z") } }),
      db.pedido.update({ where: { id: activeNewer.id }, data: { fechaCreacion: new Date("2026-11-04T11:00:00Z") } }),
      db.pedido.update({ where: { id: completedBeforeDay.id }, data: { fechaTerminacion: new Date(start.getTime() - 1) } }),
      db.pedido.update({ where: { id: completedAtStart.id }, data: { fechaTerminacion: start } }),
      db.pedido.update({ where: { id: completedBeforeEnd.id }, data: { fechaTerminacion: new Date(end.getTime() - 1) } }),
      db.pedido.update({ where: { id: completedAtEnd.id }, data: { fechaTerminacion: end } }),
    ]);

    const dashboard = await getDashboardData(db, now);
    expect(dashboard).toMatchObject({
      pendingCount: 1,
      inProgressCount: 1,
      completedTodayCount: 2,
      activeOrders: [
        {
          id: activeNewer.id,
          vehiculo: { placa: "ABC123", cliente: { nombre: "Ana", apellido: "Ríos" } },
        },
        { id: activeOlder.id },
      ],
    });
  });
});
