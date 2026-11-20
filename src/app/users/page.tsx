import { notFound } from "next/navigation";
import { hasRolePermission } from "@/lib/authorization";
import { getCurrentUser } from "@/lib/current-user";
import { ReceptionistForm } from "./receptionist-form";

export const dynamic = "force-dynamic";

export default async function UsersPage() {
  const user = await getCurrentUser();
  if (!hasRolePermission(user?.rol, "manage_users")) notFound();

  return (
    <main>
      <p className="eyebrow">ADMINISTRACIÓN</p>
      <h1>Usuarios</h1>
      <section className="panel">
        <h2>Crear cuenta de Recepción</h2>
        <p>
          La cuenta podrá registrar y consultar información, pero no editar ni
          eliminar registros.
        </p>
        <ReceptionistForm />
      </section>
    </main>
  );
}
