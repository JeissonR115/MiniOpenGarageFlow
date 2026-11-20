import { Prisma, PrismaClient } from "@prisma/client";
import { CustomerInput, CustomerUpdateInput } from "@/lib/validations/customer";
import { prisma } from "@/lib/prisma";

export type CustomerListOptions = {
  search?: string;
  page?: number;
  pageSize?: number;
  sort?: "nombre" | "apellido" | "fechaRegistro";
  direction?: "asc" | "desc";
};

function customerOrderBy(
  sort: CustomerListOptions["sort"],
  direction: "asc" | "desc",
): Prisma.ClienteOrderByWithRelationInput[] {
  switch (sort) {
    case "nombre":
      return [{ nombre: direction }, { id: "asc" }];
    case "fechaRegistro":
      return [{ fechaRegistro: direction }, { id: "asc" }];
    case "apellido":
      return [{ apellido: direction }, { nombre: direction }, { id: "asc" }];
    default:
      return [{ apellido: "asc" }, { nombre: "asc" }, { id: "asc" }];
  }
}

function customerWhere(search?: string): Prisma.ClienteWhereInput {
  const term = search?.trim();
  return term
    ? {
        OR: [
          { nombre: { contains: term } },
          { apellido: { contains: term } },
          { telefono: { contains: term } },
        ],
      }
    : {};
}

export async function listCustomersPage(
  options: CustomerListOptions = {},
  db: PrismaClient = prisma,
) {
  const where = customerWhere(options.search);
  const requestedPageSize = options.pageSize;
  const pageSize =
    Number.isSafeInteger(requestedPageSize) && (requestedPageSize ?? 0) > 0
      ? Math.min(100, requestedPageSize ?? 10)
      : 10;
  const requestedPage =
    Number.isSafeInteger(options.page) && (options.page ?? 0) > 0
      ? (options.page ?? 1)
      : 1;
  const totalCount = await db.cliente.count({ where });
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const page = Math.min(requestedPage, totalPages);
  const direction = options.direction === "desc" ? "desc" : "asc";
  const records = await db.cliente.findMany({
    where,
    orderBy: customerOrderBy(options.sort, direction),
    skip: (page - 1) * pageSize,
    take: pageSize,
  });

  return { records, page, pageSize, totalCount, totalPages };
}

export function listCustomersForExport(
  options: Pick<CustomerListOptions, "search" | "sort" | "direction"> = {},
  db: PrismaClient = prisma,
) {
  const direction = options.direction === "desc" ? "desc" : "asc";
  return db.cliente.findMany({
    where: customerWhere(options.search),
    orderBy: customerOrderBy(options.sort, direction),
  });
}

export class CustomerHasVehiclesError extends Error {
  constructor() {
    super("No se puede eliminar un cliente que tiene vehículos asociados.");
    this.name = "CustomerHasVehiclesError";
  }
}

export function listCustomers(db: PrismaClient = prisma) {
  return db.cliente.findMany({
    orderBy: [{ apellido: "asc" }, { nombre: "asc" }],
  });
}

export function getCustomerWithVehicles(id: number, db: PrismaClient = prisma) {
  return db.cliente.findUnique({
    where: { id },
    include: {
      vehiculos: {
        orderBy: { placa: "asc" },
      },
    },
  });
}

export function createCustomer(data: CustomerInput, db: PrismaClient = prisma) {
  return db.cliente.create({
    data: {
      ...data,
      correo: data.correo || null,
    },
  });
}

export function updateCustomer(
  data: CustomerUpdateInput,
  db: PrismaClient = prisma,
) {
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
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2003"
    ) {
      throw new CustomerHasVehiclesError();
    }

    throw error;
  }
}
