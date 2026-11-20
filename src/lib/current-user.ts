import { cookies } from "next/headers";
import { AUTH_COOKIE_NAME, verifySessionToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function getCurrentUser() {
  const token = (await cookies()).get(AUTH_COOKIE_NAME)?.value;
  const userId = token ? await verifySessionToken(token) : null;
  if (!userId) return null;

  return prisma.usuario.findUnique({
    where: { id: userId },
    select: { id: true, rol: true },
  });
}
