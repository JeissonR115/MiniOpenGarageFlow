export type Permission =
  "read" | "create" | "update" | "delete" | "manage_users";

export function hasRolePermission(
  role: string | null | undefined,
  permission: Permission,
): boolean {
  if (role === "administrador") return true;
  return (
    role === "recepcion" && (permission === "read" || permission === "create")
  );
}

export async function hasPermission(permission: Permission): Promise<boolean> {
  const { getCurrentUser } = await import("@/lib/current-user");
  const user = await getCurrentUser();
  return hasRolePermission(user?.rol, permission);
}
