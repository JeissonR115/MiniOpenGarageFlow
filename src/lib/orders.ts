import { Prisma, PrismaClient } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type { OrderInput, OrderUpdateInput } from "@/lib/validations/order";

export class OrderVehicleNotFoundError extends Error {
  constructor() {
    super("El vehículo seleccionado no existe.");
    this.name = "OrderVehicleNotFoundError";
  }
}

export class OrderNotFoundError extends Error {
  constructor() {
    super("El pedido seleccionado no existe.");
    this.name = "OrderNotFoundError";
  }
}

function mapOrderError(error: unknown): never {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2003") throw new OrderVehicleNotFoundError();
    if (error.code === "P2025") throw new OrderNotFoundError();
  }
  throw error;
}

export function listOrders(db: PrismaClient = prisma) {
  return db.pedido.findMany({
    include: {
      vehiculo: {
        include: {
          cliente: { select: { nombre: true, apellido: true } },
        },
      },
    },
    orderBy: { fechaCreacion: "desc" },
  });
}

export async function createOrder(data: OrderInput, db: PrismaClient = prisma) {
  try {
    const fechaTerminacion = data.estado === "terminado" ? new Date() : null;
    return await db.pedido.create({ data: { ...data, fechaTerminacion } });
  } catch (error) {
    return mapOrderError(error);
  }
}

export async function updateOrder(data: OrderUpdateInput, db: PrismaClient = prisma) {
  const { id, ...fields } = data;
  try {
    const current = await db.pedido.findUnique({
      where: { id },
      select: { estado: true, fechaTerminacion: true },
    });
    if (!current) throw new OrderNotFoundError();

    const fechaTerminacion =
      fields.estado !== "terminado"
        ? null
        : current.estado === "terminado"
          ? current.fechaTerminacion
          : new Date();
    return await db.pedido.update({
      where: { id },
      data: { ...fields, fechaTerminacion },
    });
  } catch (error) {
    return mapOrderError(error);
  }
}

export async function deleteOrder(id: number, db: PrismaClient = prisma) {
  try {
    return await db.pedido.delete({ where: { id } });
  } catch (error) {
    return mapOrderError(error);
  }
}
