import { Prisma, PrismaClient } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { VehicleInput, VehicleUpdateInput } from "@/lib/validations/vehicle";

export class VehiclePlateConflictError extends Error {
  constructor() {
    super("Ya existe un vehículo con esa placa.");
    this.name = "VehiclePlateConflictError";
  }
}

export class VehicleCustomerNotFoundError extends Error {
  constructor() {
    super("El cliente seleccionado no existe.");
    this.name = "VehicleCustomerNotFoundError";
  }
}

function mapVehicleError(error: unknown): never {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") throw new VehiclePlateConflictError();
    if (error.code === "P2003") throw new VehicleCustomerNotFoundError();
  }

  throw error;
}

export function listVehicles(db: PrismaClient = prisma) {
  return db.vehiculo.findMany({
    include: { cliente: { select: { nombre: true, apellido: true } } },
    orderBy: { placa: "asc" },
  });
}

export async function createVehicle(data: VehicleInput, db: PrismaClient = prisma) {
  try {
    return await db.vehiculo.create({ data });
  } catch (error) {
    return mapVehicleError(error);
  }
}

export async function updateVehicle(data: VehicleUpdateInput, db: PrismaClient = prisma) {
  const { id, ...fields } = data;
  try {
    return await db.vehiculo.update({ where: { id }, data: fields });
  } catch (error) {
    return mapVehicleError(error);
  }
}

export function deleteVehicle(id: number, db: PrismaClient = prisma) {
  return db.vehiculo.delete({ where: { id } });
}
