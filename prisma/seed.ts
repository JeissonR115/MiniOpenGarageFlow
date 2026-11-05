import "dotenv/config";
import { Faker, en, es } from "@faker-js/faker";
import { hash } from "bcryptjs";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "@prisma/client";
import { spawnSync } from "node:child_process";
import { createRequire } from "node:module";
import { z } from "zod";

const require = createRequire(import.meta.url);
const migration = spawnSync(
  process.execPath,
  [require.resolve("prisma/build/index.js"), "migrate", "deploy"],
  { stdio: "inherit" },
);
if (migration.error) throw migration.error;
if (migration.status !== 0) {
  throw new Error(`Prisma migrate deploy failed with exit code ${migration.status ?? "unknown"}.`);
}

const administratorSchema = z.object({
  correo: z.string().trim().email().transform((value) => value.toLowerCase()),
  password: z.string().min(8),
});
const orderStatuses = ["pendiente", "en_proceso", "terminado"] as const;

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error("DATABASE_URL must be configured.");

const faker = new Faker({ locale: [es, en] });
faker.seed(20261105);
const now = new Date();

const prisma = new PrismaClient({
  adapter: new PrismaBetterSqlite3({ url: databaseUrl }),
});

function createPhoneNumber(): string {
  return `+57 3${faker.string.numeric(2)} ${faker.string.numeric(3)} ${faker.string.numeric(4)}`;
}

function createPlate(usedPlates: Set<string>): string {
  let plate: string;
  do {
    plate = `${faker.string.alpha({ length: 3, casing: "upper" })}${faker.string.numeric(3)}`;
  } while (usedPlates.has(plate));
  usedPlates.add(plate);
  return plate;
}

async function main() {
  const admin = administratorSchema.safeParse({
    correo: process.env.ADMIN_EMAIL,
    password: process.env.ADMIN_PASSWORD,
  });
  if (!admin.success) {
    throw new Error("ADMIN_EMAIL must be valid and ADMIN_PASSWORD must contain at least 8 characters.");
  }
  const authSecret = process.env.AUTH_SECRET;
  if (!authSecret || new TextEncoder().encode(authSecret).length < 32) {
    throw new Error("AUTH_SECRET must contain at least 32 bytes.");
  }

  await prisma.pedido.deleteMany();
  await prisma.vehiculo.deleteMany();
  await prisma.cliente.deleteMany();

  const passwordHash = await hash(admin.data.password, 12);
  await prisma.usuario.upsert({
    where: { correo: admin.data.correo },
    update: {
      nombre: "Administrador",
      passwordHash,
    },
    create: {
      nombre: "Administrador",
      correo: admin.data.correo,
      passwordHash,
    },
  });

  if (process.env.NODE_ENV !== "production") {
    for (const demoUser of [
      { nombre: "Administrador de prueba", correo: "admin@opengarageflow.local", password: "admin" },
      { nombre: "Usuario de prueba", correo: "user1@opengarageflow.local", password: "user1" },
    ]) {
      await prisma.usuario.upsert({
        where: { correo: demoUser.correo },
        update: {
          nombre: demoUser.nombre,
          passwordHash: await hash(demoUser.password, 12),
        },
        create: {
          nombre: demoUser.nombre,
          correo: demoUser.correo,
          passwordHash: await hash(demoUser.password, 12),
        },
      });
    }
  }

  const usedPlates = new Set<string>();

  for (let index = 0; index < 10; index += 1) {
    const nombre = faker.person.firstName();
    const apellido = faker.person.lastName();
    const cliente = await prisma.cliente.create({
      data: {
        nombre,
        apellido,
        telefono: createPhoneNumber(),
        correo: faker.datatype.boolean({ probability: 0.7 })
          ? `${faker.string.alphanumeric({ length: 10, casing: "lower" })}@example.com`
          : null,
        fechaRegistro: faker.date.between({
          from: new Date(now.getFullYear() - 2, 0, 1),
          to: now,
        }),
      },
    });

    const vehicleCount = index < 3 ? faker.number.int({ min: 2, max: 3 }) : faker.number.int({ min: 1, max: 3 });
    for (let vehicleIndex = 0; vehicleIndex < vehicleCount; vehicleIndex += 1) {
      await prisma.vehiculo.create({
        data: {
          clienteId: cliente.id,
          placa: createPlate(usedPlates),
          marca: faker.vehicle.manufacturer(),
          modelo: faker.vehicle.model(),
          anio: faker.number.int({ min: 2000, max: 2025 }),
          color: faker.datatype.boolean({ probability: 0.75 }) ? faker.vehicle.color() : null,
        },
      });
    }
  }

  const vehicles = await prisma.vehiculo.findMany({ select: { id: true } });
  const descriptions = [
    "Mantenimiento preventivo",
    "Cambio de aceite y filtros",
    "Revisión de frenos",
    "Diagnóstico de motor",
    "Alineación y balanceo",
    "Revisión general",
  ];
  for (const [index, vehicle] of vehicles.entries()) {
    await prisma.pedido.create({
      data: {
        vehiculoId: vehicle.id,
        descripcion: faker.helpers.arrayElement(descriptions),
        estado: orderStatuses[index % orderStatuses.length],
        fechaCreacion: faker.date.recent({ refDate: now, days: 14 }),
        fechaTerminacion: orderStatuses[index % orderStatuses.length] === "terminado" ? now : null,
      },
    });
  }

  const [customerCount, vehicleCount, orderCount] = await Promise.all([
    prisma.cliente.count(),
    prisma.vehiculo.count(),
    prisma.pedido.count(),
  ]);
  const userCount = await prisma.usuario.count();
  console.log(
    `Seed completado: ${userCount} usuarios, ${customerCount} clientes, ${vehicleCount} vehículos y ${orderCount} pedidos.`,
  );
  if (process.env.NODE_ENV !== "production") {
    console.log("Usuarios de prueba: admin@opengarageflow.local / admin; user1@opengarageflow.local / user1.");
  }
}

main()
  .catch((error: unknown) => {
    console.error("Error al cargar los datos de prueba:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
