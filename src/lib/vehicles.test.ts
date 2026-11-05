import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { createCustomer } from "./customers";
import {
  createVehicle,
  deleteVehicle,
  listVehicles,
  updateVehicle,
  VehicleCustomerNotFoundError,
  VehiclePlateConflictError,
} from "./vehicles";
import { createPrismaTestDatabase } from "@/test/prisma-test-db";
import type { PrismaClient } from "@prisma/client";

let db: PrismaClient;
let cleanup: () => Promise<void>;

beforeAll(() => {
  const testDatabase = createPrismaTestDatabase("opengarageflow-vehicle-");
  db = testDatabase.db;
  cleanup = testDatabase.cleanup;
});

beforeEach(async () => {
  await db.vehiculo.deleteMany();
  await db.cliente.deleteMany();
});

afterAll(async () => {
  await cleanup?.();
});

describe("vehicle CRUD", () => {
  it("creates and lists multiple vehicles with their owners", async () => {
    const firstOwner = await createCustomer(
      { nombre: "María", apellido: "López", telefono: "123", correo: undefined },
      db,
    );
    const secondOwner = await createCustomer(
      { nombre: "Carlos", apellido: "Pérez", telefono: "456", correo: undefined },
      db,
    );
    await createVehicle(
      { clienteId: firstOwner.id, placa: "ABC123", marca: "Toyota", modelo: "Corolla", anio: 2020, color: undefined },
      db,
    );
    await createVehicle(
      { clienteId: firstOwner.id, placa: "XYZ789", marca: "Mazda", modelo: "3", anio: undefined, color: undefined },
      db,
    );
    await createVehicle(
      { clienteId: secondOwner.id, placa: "DEF456", marca: "Honda", modelo: "Civic", anio: undefined, color: undefined },
      db,
    );

    await expect(listVehicles(db)).resolves.toMatchObject([
      { placa: "ABC123", cliente: { nombre: "María", apellido: "López" } },
      { placa: "DEF456", cliente: { nombre: "Carlos", apellido: "Pérez" } },
      { placa: "XYZ789", cliente: { nombre: "María", apellido: "López" } },
    ]);
  });

  it("rejects duplicate plates and references to unknown customers", async () => {
    const owner = await createCustomer(
      { nombre: "María", apellido: "López", telefono: "123", correo: undefined },
      db,
    );
    const vehicle = {
      clienteId: owner.id,
      placa: "ABC123",
      marca: "Toyota",
      modelo: "Corolla",
      anio: undefined,
      color: undefined,
    };
    await createVehicle(vehicle, db);

    await expect(createVehicle(vehicle, db)).rejects.toBeInstanceOf(VehiclePlateConflictError);
    await expect(createVehicle({ ...vehicle, clienteId: 9999, placa: "NEW999" }, db)).rejects.toBeInstanceOf(
      VehicleCustomerNotFoundError,
    );
  });

  it("updates and deletes a vehicle without deleting its owner", async () => {
    const owner = await createCustomer(
      { nombre: "María", apellido: "López", telefono: "123", correo: undefined },
      db,
    );
    const created = await createVehicle(
      { clienteId: owner.id, placa: "ABC123", marca: "Toyota", modelo: "Corolla", anio: 2020, color: undefined },
      db,
    );

    await updateVehicle(
      {
        id: created.id,
        clienteId: owner.id,
        placa: "XYZ789",
        marca: "Toyota",
        modelo: "Yaris",
        anio: undefined,
        color: undefined,
      },
      db,
    );
    const updated = (await listVehicles(db))[0];
    expect(updated).toMatchObject({ placa: "XYZ789", modelo: "Yaris" });

    await deleteVehicle(created.id, db);
    await expect(db.cliente.findUnique({ where: { id: owner.id } })).resolves.not.toBeNull();
    await expect(listVehicles(db)).resolves.toHaveLength(0);
  });
});
