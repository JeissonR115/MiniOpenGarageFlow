import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return Response.json(
      { status: "ok" },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    console.error("Health check failed: database is unavailable.");
    return Response.json(
      { status: "unhealthy", dependency: "database" },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }
}
