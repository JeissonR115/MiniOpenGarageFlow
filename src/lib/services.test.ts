import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import type { PrismaClient } from "@prisma/client";
import { createCustomer } from "./customers";
import {
  createService,
  deleteService,
  listServicesForVehicle,
  ServiceVehicleNotFoundError,
  updateService,
} from "./services";
import {
  createVehicle,
  deleteVehicle,
  VehicleHasServicesError,
} from "./vehicles";
import { createPrismaTestDatabase } from "@/test/prisma-test-db";

let db: PrismaClient;
let cleanup: () => Promise<void>;

beforeAll(() => {
  const testDatabase = createPrismaTestDatabase("opengarageflow-service-");
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

async function createTestVehicle() {
  const customer = await createCustomer(
    { nombre: "Lucía", apellido: "Gómez", telefono: "123", correo: undefined },
    db,
  );
  return createVehicle(
    {
      clienteId: customer.id,
      placa: "ABC123",
      marca: "Toyota",
      modelo: "Corolla",
      anio: 2020,
      color: undefined,
    },
    db,
  );
}

describe("vehicle service history", () => {
  it("creates and lists services in descending date order", async () => {
    const vehicle = await createTestVehicle();
    const older = await createService(
      {
        vehiculoId: vehicle.id,
        fecha: new Date("2025-01-01T00:00:00.000Z"),
        descripcion: "Cambio de aceite",
        costo: 80,
      },
      db,
    );
    const newer = await createService(
      {
        vehiculoId: vehicle.id,
        fecha: new Date("2025-03-01T00:00:00.000Z"),
        descripcion: "Revisión de frenos",
        costo: 0,
      },
      db,
    );

    await expect(listServicesForVehicle(vehicle.id, db)).resolves.toMatchObject(
      [
        { id: newer.id, descripcion: "Revisión de frenos", costo: 0 },
        { id: older.id, descripcion: "Cambio de aceite", costo: 80 },
      ],
    );
  });

  it("updates and deletes a service without deleting its vehicle", async () => {
    const vehicle = await createTestVehicle();
    const service = await createService(
      {
        vehiculoId: vehicle.id,
        fecha: new Date("2025-01-01T00:00:00.000Z"),
        descripcion: "Cambio de aceite",
        costo: 80,
      },
      db,
    );

    await updateService(
      {
        id: service.id,
        vehiculoId: vehicle.id + 999,
        fecha: new Date("2025-02-01T00:00:00.000Z"),
        descripcion: "Servicio actualizado",
        costo: 120,
      },
      db,
    );
    await expect(
      db.servicio.findUnique({ where: { id: service.id } }),
    ).resolves.toMatchObject({
      vehiculoId: vehicle.id,
      fecha: new Date("2025-02-01T00:00:00.000Z"),
      descripcion: "Servicio actualizado",
      costo: 120,
    });

    await deleteService(service.id, db);
    await expect(listServicesForVehicle(vehicle.id, db)).resolves.toHaveLength(
      0,
    );
    await expect(
      db.vehiculo.findUnique({ where: { id: vehicle.id } }),
    ).resolves.not.toBeNull();
  });

  it("rejects unknown vehicles and prevents deleting a vehicle with services", async () => {
    await expect(
      createService(
        {
          vehiculoId: 9999,
          fecha: new Date("2025-01-01T00:00:00.000Z"),
          descripcion: "Revisión",
          costo: 10,
        },
        db,
      ),
    ).rejects.toBeInstanceOf(ServiceVehicleNotFoundError);

    const vehicle = await createTestVehicle();
    const service = await createService(
      {
        vehiculoId: vehicle.id,
        fecha: new Date("2025-01-01T00:00:00.000Z"),
        descripcion: "Revisión",
        costo: 10,
      },
      db,
    );

    await expect(deleteVehicle(vehicle.id, db)).rejects.toBeInstanceOf(
      VehicleHasServicesError,
    );
    await expect(
      db.vehiculo.findUnique({ where: { id: vehicle.id } }),
    ).resolves.not.toBeNull();
    await expect(
      db.servicio.findUnique({ where: { id: service.id } }),
    ).resolves.not.toBeNull();
  });
});
