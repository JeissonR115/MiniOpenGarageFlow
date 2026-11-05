import { hash } from "bcryptjs";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";

const administratorSchema = z.object({
  correo: z.string().trim().email().transform((value) => value.toLowerCase()),
  password: z.string().min(8),
});

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error("DATABASE_URL must be configured.");

const prisma = new PrismaClient({
  adapter: new PrismaBetterSqlite3({ url: databaseUrl }),
});

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

  const existingUser = await prisma.usuario.findFirst({ select: { id: true } });
  if (existingUser) {
    console.log("An initial user already exists; administrator bootstrap skipped.");
    return;
  }

  await prisma.usuario.create({
    data: {
      nombre: "Administrador",
      correo: admin.data.correo,
      passwordHash: await hash(admin.data.password, 12),
    },
  });
  console.log("Initial administrator created from environment variables.");
}

main()
  .catch((error: unknown) => {
    console.error("Error bootstrapping the initial administrator:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
