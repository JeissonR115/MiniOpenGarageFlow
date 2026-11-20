import { Prisma, PrismaClient } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { VehicleInput, VehicleUpdateInput } from "@/lib/validations/vehicle";

export type VehicleListOptions = {
  search?: string;
  marca?: string;
  clienteId?: number;
  page?: number;
  pageSize?: number;
  sort?: "placa" | "marca" | "modelo" | "cliente";
  direction?: "asc" | "desc";
};

function vehicleOrderBy(
  sort: VehicleListOptions["sort"],
  direction: "asc" | "desc",
): Prisma.VehiculoOrderByWithRelationInput[] {
  switch (sort) {
    case "marca":
      return [{ marca: direction }, { placa: "asc" }, { id: "asc" }];
    case "modelo":
      return [{ modelo: direction }, { placa: "asc" }, { id: "asc" }];
    case "cliente":
      return [
        { cliente: { apellido: direction } },
        { cliente: { nombre: direction } },
        { placa: "asc" },
        { id: "asc" },
      ];
    case "placa":
      return [{ placa: direction }, { id: "asc" }];
    default:
      return [{ placa: "asc" }, { id: "asc" }];
  }
}

function vehicleWhere(
  options: Pick<VehicleListOptions, "search" | "marca" | "clienteId">,
): Prisma.VehiculoWhereInput {
  const search = options.search?.trim();
  const marca = options.marca?.trim();
  return {
    ...(marca ? { marca } : {}),
    ...(Number.isSafeInteger(options.clienteId) && (options.clienteId ?? 0) > 0
      ? { clienteId: options.clienteId }
      : {}),
    ...(search
      ? {
          OR: [
            { placa: { contains: search } },
            { marca: { contains: search } },
            { modelo: { contains: search } },
            {
              cliente: {
                is: {
                  OR: [
                    { nombre: { contains: search } },
                    { apellido: { contains: search } },
                  ],
                },
              },
            },
          ],
        }
      : {}),
  };
}

export async function listVehiclesPage(
  options: VehicleListOptions = {},
  db: PrismaClient = prisma,
) {
  const where = vehicleWhere(options);
  const requestedPageSize = options.pageSize;
  const pageSize =
    Number.isSafeInteger(requestedPageSize) && (requestedPageSize ?? 0) > 0
      ? Math.min(100, requestedPageSize ?? 10)
      : 10;
  const requestedPage =
    Number.isSafeInteger(options.page) && (options.page ?? 0) > 0
      ? (options.page ?? 1)
      : 1;
  const totalCount = await db.vehiculo.count({ where });
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const page = Math.min(requestedPage, totalPages);
  const direction = options.direction === "desc" ? "desc" : "asc";
  const records = await db.vehiculo.findMany({
    where,
    include: { cliente: { select: { nombre: true, apellido: true } } },
    orderBy: vehicleOrderBy(options.sort, direction),
    skip: (page - 1) * pageSize,
    take: pageSize,
  });

  return { records, page, pageSize, totalCount, totalPages };
}

export function listVehiclesForExport(
  options: Pick<
    VehicleListOptions,
    "search" | "marca" | "clienteId" | "sort" | "direction"
  > = {},
  db: PrismaClient = prisma,
) {
  const direction = options.direction === "desc" ? "desc" : "asc";
  return db.vehiculo.findMany({
    where: vehicleWhere(options),
    include: {
      cliente: { select: { nombre: true, apellido: true, telefono: true } },
    },
    orderBy: vehicleOrderBy(options.sort, direction),
  });
}

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

export class VehicleHasOrdersError extends Error {
  constructor() {
    super("No se puede eliminar el vehículo mientras tenga pedidos asociados.");
    this.name = "VehicleHasOrdersError";
  }
}

export class VehicleHasServicesError extends Error {
  constructor() {
    super(
      "No se puede eliminar el vehículo mientras tenga servicios asociados.",
    );
    this.name = "VehicleHasServicesError";
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

export function getVehicleWithCustomer(id: number, db: PrismaClient = prisma) {
  return db.vehiculo.findUnique({
    where: { id },
    include: { cliente: { select: { nombre: true, apellido: true } } },
  });
}

export function listVehicleBrands(db: PrismaClient = prisma) {
  return db.vehiculo.findMany({
    distinct: ["marca"],
    select: { marca: true },
    orderBy: { marca: "asc" },
  });
}

export async function createVehicle(
  data: VehicleInput,
  db: PrismaClient = prisma,
) {
  try {
    return await db.vehiculo.create({ data });
  } catch (error) {
    return mapVehicleError(error);
  }
}

export async function updateVehicle(
  data: VehicleUpdateInput,
  db: PrismaClient = prisma,
) {
  const { id, ...fields } = data;
  try {
    return await db.vehiculo.update({ where: { id }, data: fields });
  } catch (error) {
    return mapVehicleError(error);
  }
}

export async function deleteVehicle(id: number, db: PrismaClient = prisma) {
  if (await db.servicio.count({ where: { vehiculoId: id } })) {
    throw new VehicleHasServicesError();
  }

  try {
    return await db.vehiculo.delete({ where: { id } });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2003"
    ) {
      if (await db.servicio.count({ where: { vehiculoId: id } })) {
        throw new VehicleHasServicesError();
      }
      throw new VehicleHasOrdersError();
    }
    throw error;
  }
}
