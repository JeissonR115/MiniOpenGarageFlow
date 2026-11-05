import { Prisma, PrismaClient } from "@prisma/client";
import { CustomerInput, CustomerUpdateInput } from "@/lib/validations/customer";
import { prisma } from "@/lib/prisma";

export class CustomerHasVehiclesError extends Error {
  constructor() {
    super("No se puede eliminar un cliente que tiene vehículos asociados.");
    this.name = "CustomerHasVehiclesError";
  }
}

export function listCustomers(db: PrismaClient = prisma) {
  return db.cliente.findMany({ orderBy: [{ apellido: "asc" }, { nombre: "asc" }] });
}

export function createCustomer(data: CustomerInput, db: PrismaClient = prisma) {
  return db.cliente.create({
    data: {
      ...data,
      correo: data.correo || null,
    },
  });
}

export function updateCustomer(data: CustomerUpdateInput, db: PrismaClient = prisma) {
  const { id, ...fields } = data;
  return db.cliente.update({
    where: { id },
    data: {
      ...fields,
      correo: fields.correo || null,
    },
  });
}

export async function deleteCustomer(id: number, db: PrismaClient = prisma) {
  try {
    await db.cliente.delete({ where: { id } });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2003") {
      throw new CustomerHasVehiclesError();
    }

    throw error;
  }
}
