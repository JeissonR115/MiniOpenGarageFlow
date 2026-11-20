import Link from "next/link";
import { Download, Filter, RotateCcw } from "lucide-react";
import { listCustomers } from "@/lib/customers";
import {
  listVehicleBrands,
  listVehiclesPage,
  type VehicleListOptions,
} from "@/lib/vehicles";
import { DeleteVehicleForm } from "./delete-vehicle-form";
import { VehicleForm } from "./vehicle-form";
import { getExistingCustomerId } from "./selection";
import { getCurrentUser } from "@/lib/current-user";
import { hasRolePermission } from "@/lib/authorization";

export const dynamic = "force-dynamic";

type SearchParams = Record<string, string | string[] | undefined>;

function firstParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function isVehicleSort(
  value: string | undefined,
): value is NonNullable<VehicleListOptions["sort"]> {
  return (
    value === "placa" ||
    value === "marca" ||
    value === "modelo" ||
    value === "cliente"
  );
}

function pageNumber(value: string | undefined): number {
  const page = Number(value);
  return Number.isSafeInteger(page) && page > 0 ? page : 1;
}

function vehicleListUrl(
  page: number,
  search: string,
  marca: string,
  clienteId: string,
  sort: VehicleListOptions["sort"],
  direction: "asc" | "desc",
): string {
  const params = new URLSearchParams();
  if (search) params.set("q", search);
  if (marca) params.set("marca", marca);
  if (clienteId) params.set("clienteId", clienteId);
  if (sort) params.set("sort", sort);
  params.set("direction", direction);
  params.set("page", String(page));
  return `/vehicles?${params.toString()}`;
}

function vehicleExportUrl(
  search: string,
  marca: string,
  clienteId: string,
  sort: VehicleListOptions["sort"],
  direction: "asc" | "desc",
): string {
  const params = new URLSearchParams();
  if (search) params.set("q", search);
  if (marca) params.set("marca", marca);
  if (clienteId) params.set("clienteId", clienteId);
  if (sort) params.set("sort", sort);
  params.set("direction", direction);
  return `/api/exports/vehicles?${params.toString()}`;
}

export default async function VehiclesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const search = firstParam(params.q)?.trim() ?? "";
  const marca = firstParam(params.marca)?.trim() ?? "";
  const rawCustomerId = firstParam(params.clienteId);
  const parsedCustomerId = Number(rawCustomerId);
  const clienteId =
    Number.isSafeInteger(parsedCustomerId) && parsedCustomerId > 0
      ? parsedCustomerId
      : undefined;
  const sortValue = firstParam(params.sort);
  const sort = isVehicleSort(sortValue) ? sortValue : undefined;
  const direction = firstParam(params.direction) === "desc" ? "desc" : "asc";
  const requestedPage = pageNumber(firstParam(params.page));
  const [customers, brandOptions, vehiclePage, user] = await Promise.all([
    listCustomers(),
    listVehicleBrands(),
    listVehiclesPage({
      search,
      marca,
      clienteId,
      page: requestedPage,
      sort,
      direction,
    }),
    getCurrentUser(),
  ]);
  const { records: vehicles, page, totalCount, totalPages } = vehiclePage;
  const selectedCustomerId = getExistingCustomerId(
    customers.map((customer) => customer.id),
    clienteId,
  );
  const selectedCustomerIdValue = selectedCustomerId
    ? String(selectedCustomerId)
    : "";
  const canCreate = hasRolePermission(user?.rol, "create");
  const canEdit = hasRolePermission(user?.rol, "update");
  const canDelete = hasRolePermission(user?.rol, "delete");

  return (
    <main>
      <p className="eyebrow">GESTIÓN DEL TALLER</p>
      <h1>Vehículos</h1>
      {canCreate && (
        <section className="panel">
          <h2>Registrar vehículo</h2>
          {customers.length === 0 ? (
            <p>Registra un cliente antes de añadir vehículos.</p>
          ) : (
            <VehicleForm
              customers={customers}
              defaultCustomerId={selectedCustomerId}
            />
          )}
        </section>
      )}
      <section className="panel">
        <div className="section-heading">
          <div>
            <h2>Vehículos registrados</h2>
            <p>
              {totalCount} resultados · página {page} de {totalPages}
            </p>
          </div>
        </div>
        <form
          className="list-filters"
          key={`${search}-${marca}-${selectedCustomerIdValue}-${sort ?? "placa"}-${direction}-${page}`}
          method="get"
        >
          <label>
            Buscar placa, marca, modelo o propietario
            <input defaultValue={search} name="q" type="search" />
          </label>
          <label>
            Marca
            <select defaultValue={marca} name="marca">
              <option value="">Todas las marcas</option>
              {brandOptions.map(({ marca: brand }) => (
                <option key={brand} value={brand}>
                  {brand}
                </option>
              ))}
            </select>
          </label>
          <label>
            Propietario
            <select defaultValue={selectedCustomerId ?? ""} name="clienteId">
              <option value="">Todos los clientes</option>
              {customers.map((customer) => (
                <option key={customer.id} value={customer.id}>
                  {customer.nombre} {customer.apellido}
                </option>
              ))}
            </select>
          </label>
          <label>
            Ordenar por
            <select defaultValue={sort ?? "placa"} name="sort">
              <option value="placa">Placa</option>
              <option value="marca">Marca</option>
              <option value="modelo">Modelo</option>
              <option value="cliente">Propietario</option>
            </select>
          </label>
          <label>
            Dirección
            <select defaultValue={direction} name="direction">
              <option value="asc">Ascendente</option>
              <option value="desc">Descendente</option>
            </select>
          </label>
          <div className="filter-actions">
            <button type="submit">
              <Filter aria-hidden="true" className="action-icon" />
              Aplicar
            </button>
            <Link href="/vehicles">
              <RotateCcw aria-hidden="true" className="action-icon" />
              Limpiar
            </Link>
            <a
              href={vehicleExportUrl(
                search,
                marca,
                selectedCustomerIdValue,
                sort,
                direction,
              )}
            >
              <Download aria-hidden="true" className="action-icon" />
              Exportar CSV
            </a>
          </div>
        </form>
        {vehicles.length === 0 ? (
          <p>
            {search || marca || selectedCustomerId
              ? "No hay resultados para los criterios seleccionados."
              : "Aún no hay vehículos registrados."}
          </p>
        ) : (
          <div className="records">
            {vehicles.map((vehicle) => (
              <article className="record" key={vehicle.id}>
                <h3>
                  {vehicle.marca} {vehicle.modelo} · {vehicle.placa}
                </h3>
                <p>
                  Propietario:{" "}
                  <Link href={`/customers/${vehicle.clienteId}`}>
                    {vehicle.cliente.nombre} {vehicle.cliente.apellido}
                  </Link>
                </p>
                <p>
                  {vehicle.anio ?? "Año no especificado"}
                  {vehicle.color ? ` · ${vehicle.color}` : ""}
                </p>
                <Link href={`/vehicles/${vehicle.id}/services`}>
                  Historial de servicios
                </Link>
                {canEdit && (
                  <VehicleForm customers={customers} vehicle={vehicle} />
                )}
                {canDelete && <DeleteVehicleForm vehicleId={vehicle.id} />}
              </article>
            ))}
          </div>
        )}
        {totalPages > 1 && (
          <nav aria-label="Paginación de vehículos" className="pagination">
            {page > 1 && (
              <Link
                href={vehicleListUrl(
                  page - 1,
                  search,
                  marca,
                  selectedCustomerIdValue,
                  sort,
                  direction,
                )}
              >
                Anterior
              </Link>
            )}
            <span>
              Página {page} de {totalPages}
            </span>
            {page < totalPages && (
              <Link
                href={vehicleListUrl(
                  page + 1,
                  search,
                  marca,
                  selectedCustomerIdValue,
                  sort,
                  direction,
                )}
              >
                Siguiente
              </Link>
            )}
          </nav>
        )}
      </section>
    </main>
  );
}
