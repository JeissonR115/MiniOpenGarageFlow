import { PrismaClient } from "@prisma/client";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { createCustomer, deleteCustomer, listCustomers, updateCustomer } from "./customers";
import { createPrismaTestDatabase } from "@/test/prisma-test-db";

let db: PrismaClient;
let cleanup: () => Promise<void>;

beforeAll(() => {
  const testDatabase = createPrismaTestDatabase("opengarageflow-customer-");
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

describe("customer CRUD", () => {
  it("creates and lists a customer with an automatic registration date", async () => {
    const created = await createCustomer(
      { nombre: "María", apellido: "López", telefono: "+57 300 123 4567", correo: "maria@example.com" },
      db,
    );

    expect(created.fechaRegistro).toBeInstanceOf(Date);
    await expect(listCustomers(db)).resolves.toMatchObject([
      { id: created.id, nombre: "María", apellido: "López", correo: "maria@example.com" },
    ]);
  });

  it("updates customer fields", async () => {
    const customer = await createCustomer(
      { nombre: "María", apellido: "López", telefono: "123", correo: undefined },
      db,
    );

    await updateCustomer(
      { id: customer.id, nombre: "Mariana", apellido: "López", telefono: "456", correo: undefined },
      db,
    );

    await expect(listCustomers(db)).resolves.toMatchObject([
      { id: customer.id, nombre: "Mariana", telefono: "456", correo: null },
    ]);
  });

  it("deletes a customer without vehicles", async () => {
    const customer = await createCustomer(
      { nombre: "María", apellido: "López", telefono: "123", correo: undefined },
      db,
    );

    await expect(deleteCustomer(customer.id, db)).resolves.toBeUndefined();
    await expect(listCustomers(db)).resolves.toHaveLength(0);
  });

  it("prevents deleting a customer who has vehicles", async () => {
    const customer = await createCustomer(
      { nombre: "María", apellido: "López", telefono: "123", correo: undefined },
      db,
    );
    await db.vehiculo.create({
      data: { clienteId: customer.id, placa: "ABC123", marca: "Toyota", modelo: "Corolla" },
    });

    await expect(deleteCustomer(customer.id, db)).rejects.toThrow(
      "No se puede eliminar un cliente que tiene vehículos asociados.",
    );
    await expect(listCustomers(db)).resolves.toHaveLength(1);
  });
});
