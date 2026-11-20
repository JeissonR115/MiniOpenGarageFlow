import { CustomerForm } from "./customer-form";
import { DeleteCustomerForm } from "./delete-customer-form";
import Link from "next/link";
import { Download, Filter, RotateCcw } from "lucide-react";
import { listCustomersPage, type CustomerListOptions } from "@/lib/customers";
import { getCurrentUser } from "@/lib/current-user";
import { hasRolePermission } from "@/lib/authorization";

export const dynamic = "force-dynamic";

type SearchParams = Record<string, string | string[] | undefined>;

function firstParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function isCustomerSort(
  value: string | undefined,
): value is NonNullable<CustomerListOptions["sort"]> {
  return (
    value === "apellido" || value === "nombre" || value === "fechaRegistro"
  );
}

function pageNumber(value: string | undefined): number {
  const page = Number(value);
  return Number.isSafeInteger(page) && page > 0 ? page : 1;
}

function customerListUrl(
  page: number,
  search: string,
  sort: CustomerListOptions["sort"],
  direction: "asc" | "desc",
): string {
  const params = new URLSearchParams();
  if (search) params.set("q", search);
  if (sort) params.set("sort", sort);
  params.set("direction", direction);
  params.set("page", String(page));
  return `/customers?${params.toString()}`;
}

function customerExportUrl(
  search: string,
  sort: CustomerListOptions["sort"],
  direction: "asc" | "desc",
): string {
  const params = new URLSearchParams();
  if (search) params.set("q", search);
  if (sort) params.set("sort", sort);
  params.set("direction", direction);
  return `/api/exports/customers?${params.toString()}`;
}

export default async function CustomersPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const search = firstParam(params.q)?.trim() ?? "";
  const sortValue = firstParam(params.sort);
  const sort = isCustomerSort(sortValue) ? sortValue : undefined;
  const direction = firstParam(params.direction) === "desc" ? "desc" : "asc";
  const requestedPage = pageNumber(firstParam(params.page));
  const [{ records: customers, page, totalCount, totalPages }, user] =
    await Promise.all([
      listCustomersPage({ search, page: requestedPage, sort, direction }),
      getCurrentUser(),
    ]);
  const canCreate = hasRolePermission(user?.rol, "create");
  const canEdit = hasRolePermission(user?.rol, "update");
  const canDelete = hasRolePermission(user?.rol, "delete");

  return (
    <main>
      <p className="eyebrow">GESTIÓN DEL TALLER</p>
      <h1>Clientes</h1>
      {canCreate && (
        <section className="panel">
          <h2>Registrar cliente</h2>
          <CustomerForm />
        </section>
      )}
      <section className="panel">
        <div className="section-heading">
          <div>
            <h2>Clientes registrados</h2>
            <p>
              {totalCount} resultados · página {page} de {totalPages}
            </p>
          </div>
        </div>
        <form
          className="list-filters"
          key={`${search}-${sort ?? "apellido"}-${direction}-${page}`}
          method="get"
        >
          <label>
            Buscar por nombre o teléfono
            <input defaultValue={search} name="q" type="search" />
          </label>
          <label>
            Ordenar por
            <select defaultValue={sort ?? "apellido"} name="sort">
              <option value="apellido">Apellido</option>
              <option value="nombre">Nombre</option>
              <option value="fechaRegistro">Fecha de registro</option>
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
            <Link href="/customers">
              <RotateCcw aria-hidden="true" className="action-icon" />
              Limpiar
            </Link>
            <a href={customerExportUrl(search, sort, direction)}>
              <Download aria-hidden="true" className="action-icon" />
              Exportar CSV
            </a>
          </div>
        </form>
        {customers.length === 0 ? (
          <p>
            {search
              ? "No hay resultados para los criterios seleccionados."
              : "Aún no hay clientes registrados."}
          </p>
        ) : (
          <div className="records">
            {customers.map((customer) => (
              <article className="record" key={customer.id}>
                <h3>
                  <Link href={`/customers/${customer.id}`}>
                    {customer.nombre} {customer.apellido}
                  </Link>
                </h3>
                <p>
                  {customer.telefono} · {customer.correo ?? "Sin correo"}
                </p>
                <p>
                  Registrado:{" "}
                  {customer.fechaRegistro.toLocaleDateString("es-CO")}
                </p>
                {canEdit && <CustomerForm customer={customer} />}
                {canDelete && <DeleteCustomerForm customerId={customer.id} />}
              </article>
            ))}
          </div>
        )}
        {totalPages > 1 && (
          <nav aria-label="Paginación de clientes" className="pagination">
            {page > 1 && (
              <Link href={customerListUrl(page - 1, search, sort, direction)}>
                Anterior
              </Link>
            )}
            <span>
              Página {page} de {totalPages}
            </span>
            {page < totalPages && (
              <Link href={customerListUrl(page + 1, search, sort, direction)}>
                Siguiente
              </Link>
            )}
          </nav>
        )}
      </section>
    </main>
  );
}
