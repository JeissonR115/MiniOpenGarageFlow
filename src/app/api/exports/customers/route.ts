import { hasPermission } from "@/lib/authorization";
import {
  listCustomersForExport,
  type CustomerListOptions,
} from "@/lib/customers";
import { toCsv } from "@/lib/csv";

function customerSort(value: string | null): CustomerListOptions["sort"] {
  if (value === "nombre" || value === "apellido" || value === "fechaRegistro")
    return value;
  return undefined;
}

export async function GET(request: Request): Promise<Response> {
  if (!(await hasPermission("read"))) {
    return Response.json(
      { error: "No tienes permiso para exportar estos datos." },
      { status: 403 },
    );
  }

  const params = new URL(request.url).searchParams;
  const customers = await listCustomersForExport({
    search: params.get("q") ?? undefined,
    sort: customerSort(params.get("sort")),
    direction: params.get("direction") === "desc" ? "desc" : "asc",
  });
  const content = toCsv(
    ["ID", "Nombre", "Apellido", "Teléfono", "Correo", "Fecha de registro"],
    customers.map((customer) => [
      customer.id,
      customer.nombre,
      customer.apellido,
      customer.telefono,
      customer.correo,
      customer.fechaRegistro.toISOString(),
    ]),
  );

  return new Response(content, {
    headers: {
      "Cache-Control": "no-store",
      "Content-Disposition": 'attachment; filename="clientes.csv"',
      "Content-Type": "text/csv; charset=utf-8",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
