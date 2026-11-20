"use server";

import { revalidatePath } from "next/cache";
import { hashPassword } from "@/lib/auth";
import { hasPermission } from "@/lib/authorization";
import { prisma } from "@/lib/prisma";
import { receptionistSchema } from "@/lib/validations/auth";

export type UserActionState = {
  error?: string;
  success?: string;
};

function isUniqueConstraintViolation(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "P2002"
  );
}

export async function createReceptionistAction(
  _previousState: UserActionState,
  formData: FormData,
): Promise<UserActionState> {
  if (!(await hasPermission("manage_users"))) {
    return { error: "No tienes permiso para crear cuentas." };
  }

  const parsed = receptionistSchema.safeParse({
    nombre: formData.get("nombre"),
    correo: formData.get("correo"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  }

  try {
    await prisma.usuario.create({
      data: {
        nombre: parsed.data.nombre,
        correo: parsed.data.correo,
        passwordHash: await hashPassword(parsed.data.password),
        rol: "recepcion",
      },
    });
  } catch (error) {
    if (isUniqueConstraintViolation(error)) {
      return { error: "Ya existe una cuenta con ese correo." };
    }
    throw error;
  }

  revalidatePath("/users");
  return { success: "Cuenta de Recepción creada." };
}
