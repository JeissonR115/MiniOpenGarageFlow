import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  queryRaw: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: { $queryRaw: mocks.queryRaw },
}));

import { GET } from "./route";

describe("health route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("reports healthy only after the database query succeeds", async () => {
    mocks.queryRaw.mockResolvedValue([{ 1: 1 }]);

    const response = await GET();

    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(await response.json()).toEqual({ status: "ok" });
    expect(mocks.queryRaw).toHaveBeenCalledOnce();
  });

  it("returns an unhealthy status when the database query fails", async () => {
    const logError = vi.spyOn(console, "error").mockImplementation(() => {});
    mocks.queryRaw.mockRejectedValue(new Error("database unavailable"));

    const response = await GET();

    expect(response.status).toBe(503);
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(await response.json()).toEqual({
      status: "unhealthy",
      dependency: "database",
    });
    expect(logError).toHaveBeenCalledWith(
      "Health check failed: database is unavailable.",
    );
    expect(mocks.queryRaw).toHaveBeenCalledOnce();
  });
});
