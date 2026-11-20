import { describe, expect, it } from "vitest";
import { hasRolePermission, type Permission } from "./authorization";

describe("role permissions", () => {
  it("allows administrators all operations", () => {
    const permissions: Permission[] = [
      "read",
      "create",
      "update",
      "delete",
      "manage_users",
    ];

    for (const permission of permissions) {
      expect(hasRolePermission("administrador", permission)).toBe(true);
    }
  });

  it("limits reception to reading and creating records", () => {
    expect(hasRolePermission("recepcion", "read")).toBe(true);
    expect(hasRolePermission("recepcion", "create")).toBe(true);
    expect(hasRolePermission("recepcion", "update")).toBe(false);
    expect(hasRolePermission("recepcion", "delete")).toBe(false);
    expect(hasRolePermission("recepcion", "manage_users")).toBe(false);
  });

  it("denies unknown roles and unauthenticated users", () => {
    expect(hasRolePermission("unknown", "read")).toBe(false);
    expect(hasRolePermission(null, "create")).toBe(false);
    expect(hasRolePermission(undefined, "manage_users")).toBe(false);
  });
});
