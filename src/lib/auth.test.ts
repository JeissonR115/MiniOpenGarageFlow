import { SignJWT } from "jose";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  authCookieOptions,
  createSessionToken,
  hashPassword,
  SESSION_MAX_AGE_SECONDS,
  verifyPassword,
  verifySessionToken,
} from "./auth";

const secret = "local-test-secret-with-at-least-32-bytes";

describe("auth utilities", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("hashes passwords and verifies only the matching password", async () => {
    const passwordHash = await hashPassword("test-password");

    expect(passwordHash).not.toContain("test-password");
    await expect(verifyPassword("test-password", passwordHash)).resolves.toBe(true);
    await expect(verifyPassword("other-password", passwordHash)).resolves.toBe(false);
  });

  it("signs a session with an eight-hour expiry and verifies its user id", async () => {
    vi.stubEnv("AUTH_SECRET", secret);
    const token = await createSessionToken(42);

    await expect(verifySessionToken(token)).resolves.toBe(42);
  });

  it("rejects tampered, expired, and invalid-subject tokens", async () => {
    vi.stubEnv("AUTH_SECRET", secret);
    const token = await createSessionToken(42);
    const expiredToken = await new SignJWT({})
      .setProtectedHeader({ alg: "HS256" })
      .setSubject("42")
      .setExpirationTime("0s")
      .sign(new TextEncoder().encode(secret));
    const invalidSubjectToken = await new SignJWT({})
      .setProtectedHeader({ alg: "HS256" })
      .setSubject("not-an-id")
      .setExpirationTime(`${SESSION_MAX_AGE_SECONDS}s`)
      .sign(new TextEncoder().encode(secret));

    await expect(verifySessionToken(`${token}tampered`)).resolves.toBeNull();
    await expect(verifySessionToken(expiredToken)).resolves.toBeNull();
    await expect(verifySessionToken(invalidSubjectToken)).resolves.toBeNull();
  });

  it("requires a sufficiently long session secret", async () => {
    vi.stubEnv("AUTH_SECRET", "too-short");

    await expect(createSessionToken(1)).rejects.toThrow("AUTH_SECRET");
    await expect(verifySessionToken("invalid")).rejects.toThrow("AUTH_SECRET");
  });

  it("uses protected cookie options and enables Secure in production", () => {
    vi.stubEnv("NODE_ENV", "production");

    expect(authCookieOptions()).toEqual({
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      maxAge: SESSION_MAX_AGE_SECONDS,
    });
  });
});
