import { hasPermission } from "@/lib/authorization";
import { listVehiclesForExport, type VehicleListOptions } from "@/lib/vehicles";
import { toCsv } from "@/lib/csv";

function vehicleSort(value: string | null): VehicleListOptions["sort"] {
  if (
    value === "placa" ||
    value === "marca" ||
    value === "modelo" ||
    value === "cliente"
  ) {
    return value;
  }
  return undefined;
}

function positiveInteger(value: string | null): number | undefined {
  if (!value) return undefined;
  const parsed = Number(value);
  return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : undefined;
}

export async function GET(request: Request): Promise<Response> {
  if (!(await hasPermission("read"))) {
    return Response.json(
      { error: "No tienes permiso para exportar estos datos." },
      { status: 403 },
    );
  }

  const params = new URL(request.url).searchParams;
  const vehicles = await listVehiclesForExport({
    search: params.get("q") ?? undefined,
    marca: params.get("marca") ?? undefined,
    clienteId: positiveInteger(params.get("clienteId")),
    sort: vehicleSort(params.get("sort")),
    direction: params.get("direction") === "desc" ? "desc" : "asc",
  });
  const content = toCsv(
    [
      "ID",
      "Placa",
      "Marca",
      "Modelo",
      "Año",
      "Color",
      "Propietario",
      "Teléfono del propietario",
    ],
    vehicles.map((vehicle) => [
      vehicle.id,
      vehicle.placa,
      vehicle.marca,
      vehicle.modelo,
      vehicle.anio,
      vehicle.color,
      `${vehicle.cliente.nombre} ${vehicle.cliente.apellido}`,
      vehicle.cliente.telefono,
    ]),
  );

  return new Response(content, {
    headers: {
      "Cache-Control": "no-store",
      "Content-Disposition": 'attachment; filename="vehiculos.csv"',
      "Content-Type": "text/csv; charset=utf-8",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
