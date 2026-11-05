import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import type { PrismaClient } from "@prisma/client";
import { createCustomer } from "./customers";
import { createOrder, deleteOrder, listOrders, OrderVehicleNotFoundError, updateOrder } from "./orders";
import { createVehicle, deleteVehicle, VehicleHasOrdersError } from "./vehicles";
import { orderSchema, orderStatuses } from "./validations/order";
import { createPrismaTestDatabase } from "@/test/prisma-test-db";

let db: PrismaClient;
let cleanup: () => Promise<void>;

beforeAll(() => {
  const testDatabase = createPrismaTestDatabase("opengarageflow-order-");
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

describe("work order CRUD", () => {
  it("accepts only supported states and requires a description and vehicle", () => {
    expect(orderStatuses).toEqual(["pendiente", "en_proceso", "terminado"]);
    expect(orderSchema.safeParse({ vehiculoId: "1", descripcion: "Revisión", estado: "pendiente" }).success).toBe(true);
    expect(orderSchema.safeParse({ vehiculoId: "1", descripcion: " ", estado: "pendiente" }).success).toBe(false);
    expect(orderSchema.safeParse({ vehiculoId: "1", descripcion: "Revisión", estado: "abierto" }).success).toBe(false);
    expect(orderSchema.safeParse({ vehiculoId: "0", descripcion: "Revisión", estado: "pendiente" }).success).toBe(false);
  });

  it("creates and lists orders with vehicles and their owners, newest first", async () => {
    const owner = await createCustomer(
      { nombre: "Lucía", apellido: "Gómez", telefono: "123", correo: undefined },
      db,
    );
    const vehicle = await createVehicle(
      { clienteId: owner.id, placa: "ABC123", marca: "Toyota", modelo: "Corolla", anio: 2020, color: undefined },
      db,
    );
    const older = await createOrder(
      { vehiculoId: vehicle.id, descripcion: "Cambio de aceite", estado: "pendiente" },
      db,
    );
    const newer = await createOrder(
      { vehiculoId: vehicle.id, descripcion: "Revisión de frenos", estado: "en_proceso" },
      db,
    );
    await db.pedido.update({
      where: { id: older.id },
      data: { fechaCreacion: new Date("2020-01-01T00:00:00.000Z") },
    });
    await db.pedido.update({
      where: { id: newer.id },
      data: { fechaCreacion: new Date("2021-01-01T00:00:00.000Z") },
    });

    await expect(listOrders(db)).resolves.toMatchObject([
      {
        id: newer.id,
        descripcion: "Revisión de frenos",
        vehiculo: {
          placa: "ABC123",
          cliente: { nombre: "Lucía", apellido: "Gómez" },
        },
      },
      { id: older.id },
    ]);
  });

  it("updates and deletes orders while preserving their vehicles", async () => {
    const owner = await createCustomer(
      { nombre: "Lucía", apellido: "Gómez", telefono: "123", correo: undefined },
      db,
    );
    const vehicle = await createVehicle(
      { clienteId: owner.id, placa: "ABC123", marca: "Toyota", modelo: "Corolla", anio: 2020, color: undefined },
      db,
    );
    const order = await createOrder(
      { vehiculoId: vehicle.id, descripcion: "Cambio de aceite", estado: "pendiente" },
      db,
    );

    await updateOrder(
      { id: order.id, vehiculoId: vehicle.id, descripcion: "Revisión completa", estado: "terminado" },
      db,
    );
    await expect(db.pedido.findUnique({ where: { id: order.id } })).resolves.toMatchObject({
      descripcion: "Revisión completa",
      estado: "terminado",
      fechaTerminacion: expect.any(Date),
    });

    await updateOrder(
      { id: order.id, vehiculoId: vehicle.id, descripcion: "Pedido reactivado", estado: "en_proceso" },
      db,
    );
    await expect(db.pedido.findUnique({ where: { id: order.id } })).resolves.toMatchObject({
      estado: "en_proceso",
      fechaTerminacion: null,
    });

    await deleteOrder(order.id, db);
    await expect(db.vehiculo.findUnique({ where: { id: vehicle.id } })).resolves.not.toBeNull();
    await expect(listOrders(db)).resolves.toHaveLength(0);
  });

  it("rejects orders for unknown vehicles and prevents deleting vehicles with orders", async () => {
    await expect(
      createOrder({ vehiculoId: 9999, descripcion: "Reparación", estado: "pendiente" }, db),
    ).rejects.toBeInstanceOf(OrderVehicleNotFoundError);

    const owner = await createCustomer(
      { nombre: "Lucía", apellido: "Gómez", telefono: "123", correo: undefined },
      db,
    );
    const vehicle = await createVehicle(
      { clienteId: owner.id, placa: "ABC123", marca: "Toyota", modelo: "Corolla", anio: 2020, color: undefined },
      db,
    );
    await createOrder(
      { vehiculoId: vehicle.id, descripcion: "Reparación", estado: "pendiente" },
      db,
    );

    await expect(deleteVehicle(vehicle.id, db)).rejects.toBeInstanceOf(VehicleHasOrdersError);
    await expect(db.vehiculo.findUnique({ where: { id: vehicle.id } })).resolves.not.toBeNull();
    await expect(listOrders(db)).resolves.toHaveLength(1);
  });
});
