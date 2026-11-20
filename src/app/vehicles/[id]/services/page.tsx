import Link from "next/link";
import { notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/current-user";
import { hasRolePermission } from "@/lib/authorization";
import { listServicesForVehicle } from "@/lib/services";
import { getVehicleWithCustomer } from "@/lib/vehicles";
import { DeleteServiceForm, ServiceForm } from "./service-form";
import { ArrowLeft } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function VehicleServicesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: rawId } = await params;
  const id = Number(rawId);
  if (!Number.isSafeInteger(id) || id < 1) notFound();

  const [vehicle, services, user] = await Promise.all([
    getVehicleWithCustomer(id),
    listServicesForVehicle(id),
    getCurrentUser(),
  ]);
  if (!vehicle) notFound();

  const canCreate = hasRolePermission(user?.rol, "create");
  const canEdit = hasRolePermission(user?.rol, "update");
  const canDelete = hasRolePermission(user?.rol, "delete");

  return (
    <main>
      <p className="eyebrow">HISTORIAL DEL VEHÍCULO</p>
      <h1>
        {vehicle.marca} {vehicle.modelo} · {vehicle.placa}
      </h1>
      <p>
        Propietario: {vehicle.cliente.nombre} {vehicle.cliente.apellido}
      </p>
      <p>
        <Link href="/vehicles">
          <ArrowLeft aria-hidden="true" className="action-icon" />
          Volver a vehículos
        </Link>
      </p>

      {canCreate && (
        <section className="panel">
          <h2>Registrar servicio</h2>
          <ServiceForm vehicleId={vehicle.id} />
        </section>
      )}

      <section className="panel">
        <h2>Servicios realizados</h2>
        {services.length === 0 ? (
          <p>Este vehículo aún no tiene servicios registrados.</p>
        ) : (
          <div className="records">
            {services.map((service) => (
              <article className="record" key={service.id}>
                <h3>{service.fecha.toLocaleDateString("es-CO")}</h3>
                <p>{service.descripcion}</p>
                <p>
                  Costo:{" "}
                  {service.costo.toLocaleString("es-CO", {
                    style: "currency",
                    currency: "COP",
                  })}
                </p>
                {canEdit && (
                  <ServiceForm vehicleId={vehicle.id} service={service} />
                )}
                {canDelete && <DeleteServiceForm serviceId={service.id} />}
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
