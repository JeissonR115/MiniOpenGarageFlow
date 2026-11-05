import { PrismaClient } from "@prisma/client";
import { prisma } from "@/lib/prisma";

const TIME_ZONE = "America/Bogota";
const DAY_IN_MILLISECONDS = 24 * 60 * 60 * 1000;

function zonedDateParts(date: Date) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const values = Object.fromEntries(parts.map(({ type, value }) => [type, value]));
  return {
    year: Number(values.year),
    month: Number(values.month),
    day: Number(values.day),
  };
}

function timeZoneOffset(date: Date): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  const values = Object.fromEntries(parts.map(({ type, value }) => [type, value]));
  const representedAsUtc = Date.UTC(
    Number(values.year),
    Number(values.month) - 1,
    Number(values.day),
    Number(values.hour),
    Number(values.minute),
    Number(values.second),
  );
  return representedAsUtc - date.getTime();
}

export function getBogotaDayRange(date: Date): { start: Date; end: Date } {
  const { year, month, day } = zonedDateParts(date);
  const localStartAsUtc = Date.UTC(year, month - 1, day);
  const localEndAsUtc = localStartAsUtc + DAY_IN_MILLISECONDS;
  const start = new Date(localStartAsUtc - timeZoneOffset(new Date(localStartAsUtc)));
  const end = new Date(localEndAsUtc - timeZoneOffset(new Date(localEndAsUtc)));
  return { start, end };
}

export async function getDashboardData(
  db: PrismaClient = prisma,
  now: Date = new Date(),
) {
  const { start, end } = getBogotaDayRange(now);
  const [pendingCount, inProgressCount, completedTodayCount, activeOrders] = await Promise.all([
    db.pedido.count({ where: { estado: "pendiente" } }),
    db.pedido.count({ where: { estado: "en_proceso" } }),
    db.pedido.count({
      where: {
        estado: "terminado",
        fechaTerminacion: { gte: start, lt: end },
      },
    }),
    db.pedido.findMany({
      where: { estado: { in: ["pendiente", "en_proceso"] } },
      include: {
        vehiculo: {
          include: {
            cliente: { select: { nombre: true, apellido: true } },
          },
        },
      },
      orderBy: { fechaCreacion: "desc" },
    }),
  ]);

  return { pendingCount, inProgressCount, completedTodayCount, activeOrders };
}
