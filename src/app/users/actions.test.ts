import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  create: vi.fn(),
  getCurrentUser: vi.fn(),
  hashPassword: vi.fn(),
  revalidatePath: vi.fn(),
}));

vi.mock("next/cache", () => ({
  revalidatePath: mocks.revalidatePath,
}));

vi.mock("@/lib/auth", () => ({
  hashPassword: mocks.hashPassword,
}));

vi.mock("@/lib/current-user", () => ({
  getCurrentUser: mocks.getCurrentUser,
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    usuario: {
      create: mocks.create,
    },
  },
}));

import { createReceptionistAction } from "./actions";

function receptionistForm(
  nombre = "Recepción",
  correo = "reception@example.com",
  password = "secure-password",
) {
  const formData = new FormData();
  formData.set("nombre", nombre);
  formData.set("correo", correo);
  formData.set("password", password);
  return formData;
}

describe("receptionist account action", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getCurrentUser.mockResolvedValue({ id: 1, rol: "administrador" });
    mocks.hashPassword.mockResolvedValue("hashed-password");
    mocks.create.mockResolvedValue({ id: 2 });
  });

  it("creates a receptionist with a normalized email and a password hash", async () => {
    await expect(
      createReceptionistAction(
        {},
        receptionistForm("Recepción", "Reception@Example.com"),
      ),
    ).resolves.toEqual({ success: "Cuenta de Recepción creada." });

    expect(mocks.create).toHaveBeenCalledWith({
      data: {
        nombre: "Recepción",
        correo: "reception@example.com",
        passwordHash: "hashed-password",
        rol: "recepcion",
      },
    });
    expect(mocks.hashPassword).toHaveBeenCalledWith("secure-password");
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/users");
  });

  it("rejects account creation by unauthenticated users and reception users", async () => {
    mocks.getCurrentUser.mockResolvedValueOnce(null).mockResolvedValueOnce({
      id: 2,
      rol: "recepcion",
    });

    await expect(
      createReceptionistAction({}, receptionistForm()),
    ).resolves.toEqual({ error: "No tienes permiso para crear cuentas." });
    await expect(
      createReceptionistAction({}, receptionistForm()),
    ).resolves.toEqual({ error: "No tienes permiso para crear cuentas." });

    expect(mocks.hashPassword).not.toHaveBeenCalled();
    expect(mocks.create).not.toHaveBeenCalled();
  });

  it("rejects invalid input without writing a user", async () => {
    await expect(
      createReceptionistAction({}, receptionistForm("", "invalid", "short")),
    ).resolves.toEqual({ error: "Ingresa un nombre." });

    expect(mocks.create).not.toHaveBeenCalled();
  });

  it("reports duplicate email without exposing a database error", async () => {
    mocks.create.mockRejectedValue({ code: "P2002" });

    await expect(
      createReceptionistAction({}, receptionistForm()),
    ).resolves.toEqual({ error: "Ya existe una cuenta con ese correo." });
  });
});
