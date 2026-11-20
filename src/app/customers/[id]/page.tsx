import Link from "next/link";
import { notFound } from "next/navigation";
import { getCustomerWithVehicles } from "@/lib/customers";
import { History, Plus } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function CustomerDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: rawId } = await params;
  const id = Number(rawId);
  if (!Number.isSafeInteger(id) || id < 1) notFound();

  const customer = await getCustomerWithVehicles(id);
  if (!customer) notFound();

  return (
    <main>
      <p className="eyebrow">DETALLE DEL CLIENTE</p>
      <h1>
        {customer.nombre} {customer.apellido}
      </h1>
      <section className="panel">
        <h2>Información de contacto</h2>
        <p>Teléfono: {customer.telefono}</p>
        <p>Correo: {customer.correo ?? "Sin correo"}</p>
        <p>Registrado: {customer.fechaRegistro.toLocaleDateString("es-CO")}</p>
      </section>
      <section className="panel">
        <div className="section-heading">
          <h2>Vehículos</h2>
          <Link href={`/vehicles?clienteId=${customer.id}`}>
            <Plus aria-hidden="true" className="action-icon" />
            Agregar vehículo
          </Link>
        </div>
        {customer.vehiculos.length === 0 ? (
          <p>Este cliente aún no tiene vehículos registrados.</p>
        ) : (
          <div className="records">
            {customer.vehiculos.map((vehicle) => (
              <article className="record" key={vehicle.id}>
                <h3>
                  {vehicle.marca} {vehicle.modelo} · {vehicle.placa}
                </h3>
                <p>
                  {vehicle.anio ?? "Año no especificado"}
                  {vehicle.color ? ` · ${vehicle.color}` : ""}
                </p>
                <Link href={`/vehicles/${vehicle.id}/services`}>
                  <History aria-hidden="true" className="action-icon" />
                  Historial de servicios
                </Link>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
