import "dotenv/config";
import { Faker, en, es } from "@faker-js/faker";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "@prisma/client";

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
  await prisma.vehiculo.deleteMany();
  await prisma.cliente.deleteMany();

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

  const [customerCount, vehicleCount] = await Promise.all([
    prisma.cliente.count(),
    prisma.vehiculo.count(),
  ]);
  console.log(`Seed completado: ${customerCount} clientes y ${vehicleCount} vehículos.`);
}

main()
  .catch((error: unknown) => {
    console.error("Error al cargar los datos de prueba:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
