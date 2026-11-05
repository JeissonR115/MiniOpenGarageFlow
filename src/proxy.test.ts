import { NextRequest } from "next/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AUTH_COOKIE_NAME, createSessionToken } from "@/lib/auth";
import { proxy } from "./proxy";

describe("route protection proxy", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("redirects unauthenticated visitors to login", async () => {
    const response = await proxy(new NextRequest("http://localhost/customers"));

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("http://localhost/login");
  });

  it("allows login without a session", async () => {
    const response = await proxy(new NextRequest("http://localhost/login"));

    expect(response.headers.get("x-middleware-next")).toBe("1");
  });

  it("allows authenticated requests and redirects authenticated login visits", async () => {
    vi.stubEnv("AUTH_SECRET", "local-test-secret-with-at-least-32-bytes");
    const token = await createSessionToken(42);
    const request = new NextRequest("http://localhost/customers", {
      headers: { cookie: `${AUTH_COOKIE_NAME}=${token}` },
    });
    const loginRequest = new NextRequest("http://localhost/login", {
      headers: { cookie: `${AUTH_COOKIE_NAME}=${token}` },
    });

    const response = await proxy(request);
    const loginResponse = await proxy(loginRequest);

    expect(response.headers.get("x-middleware-next")).toBe("1");
    expect(loginResponse.status).toBe(307);
    expect(loginResponse.headers.get("location")).toBe("http://localhost/");
  });

  it("redirects requests with invalid or expired sessions", async () => {
    vi.stubEnv("AUTH_SECRET", "local-test-secret-with-at-least-32-bytes");
    const request = new NextRequest("http://localhost/vehicles", {
      headers: { cookie: `${AUTH_COOKIE_NAME}=invalid-token` },
    });
    const response = await proxy(request);

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("http://localhost/login");
  });
});
