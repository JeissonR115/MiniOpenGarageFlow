import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  cookies: vi.fn(),
  createSessionToken: vi.fn(),
  findUnique: vi.fn(),
  redirect: vi.fn((path: string) => {
    throw new Error(`NEXT_REDIRECT:${path}`);
  }),
  set: vi.fn(),
  delete: vi.fn(),
  verifyPassword: vi.fn(),
}));

vi.mock("next/headers", () => ({
  cookies: mocks.cookies,
}));

vi.mock("next/navigation", () => ({
  redirect: mocks.redirect,
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    usuario: {
      findUnique: mocks.findUnique,
    },
  },
}));

vi.mock("@/lib/auth", () => ({
  AUTH_COOKIE_NAME: "opengarageflow_session",
  authCookieOptions: () => ({ httpOnly: true }),
  createSessionToken: mocks.createSessionToken,
  verifyPassword: mocks.verifyPassword,
}));

import { loginAction, logoutAction } from "./auth-actions";

function loginForm(correo = "admin@example.com", password = "secret-password") {
  const formData = new FormData();
  formData.set("correo", correo);
  formData.set("password", password);
  return formData;
}

describe("authentication actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.cookies.mockResolvedValue({ set: mocks.set, delete: mocks.delete });
  });

  it("uses the same generic error for invalid credentials", async () => {
    mocks.findUnique.mockResolvedValue(null);

    await expect(loginAction({}, loginForm())).resolves.toEqual({
      error: "Correo o contraseña inválidos.",
    });
    expect(mocks.verifyPassword).not.toHaveBeenCalled();
    expect(mocks.set).not.toHaveBeenCalled();
  });

  it("does not reveal malformed login input", async () => {
    await expect(loginAction({}, loginForm("invalid", ""))).resolves.toEqual({
      error: "Correo o contraseña inválidos.",
    });
    expect(mocks.findUnique).not.toHaveBeenCalled();
  });

  it("sets a protected session cookie and redirects after valid credentials", async () => {
    const user = { id: 8, passwordHash: "hashed-password" };
    mocks.findUnique.mockResolvedValue(user);
    mocks.verifyPassword.mockResolvedValue(true);
    mocks.createSessionToken.mockResolvedValue("signed-session-token");

    await expect(loginAction({}, loginForm())).rejects.toThrow("NEXT_REDIRECT:/");
    expect(mocks.set).toHaveBeenCalledWith(
      "opengarageflow_session",
      "signed-session-token",
      { httpOnly: true },
    );
  });

  it("deletes the session cookie and redirects to login on logout", async () => {
    await expect(logoutAction()).rejects.toThrow("NEXT_REDIRECT:/login");
    expect(mocks.delete).toHaveBeenCalledWith("opengarageflow_session");
  });
});
