import { Prisma, PrismaClient } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type {
  ServiceInput,
  ServiceUpdateInput,
} from "@/lib/validations/service";

export class ServiceVehicleNotFoundError extends Error {
  constructor() {
    super("El vehículo seleccionado no existe.");
    this.name = "ServiceVehicleNotFoundError";
  }
}

export class ServiceNotFoundError extends Error {
  constructor() {
    super("El servicio seleccionado no existe.");
    this.name = "ServiceNotFoundError";
  }
}

function mapServiceError(error: unknown): never {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2003") throw new ServiceVehicleNotFoundError();
    if (error.code === "P2025") throw new ServiceNotFoundError();
  }
  throw error;
}

export function listServicesForVehicle(
  vehiculoId: number,
  db: PrismaClient = prisma,
) {
  return db.servicio.findMany({
    where: { vehiculoId },
    orderBy: [{ fecha: "desc" }, { id: "desc" }],
  });
}

export async function createService(
  data: ServiceInput,
  db: PrismaClient = prisma,
) {
  try {
    return await db.servicio.create({ data });
  } catch (error) {
    return mapServiceError(error);
  }
}

export async function updateService(
  data: ServiceUpdateInput,
  db: PrismaClient = prisma,
) {
  const { id, fecha, descripcion, costo } = data;
  try {
    return await db.servicio.update({
      where: { id },
      data: { fecha, descripcion, costo },
    });
  } catch (error) {
    return mapServiceError(error);
  }
}

export async function deleteService(id: number, db: PrismaClient = prisma) {
  try {
    return await db.servicio.delete({ where: { id } });
  } catch (error) {
    return mapServiceError(error);
  }
}
