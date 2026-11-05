import Link from "next/link";
import { listCustomers } from "@/lib/customers";
import { listVehicles } from "@/lib/vehicles";
import { DeleteVehicleForm } from "./delete-vehicle-form";
import { VehicleForm } from "./vehicle-form";

export const dynamic = "force-dynamic";

export default async function VehiclesPage() {
  const [customers, vehicles] = await Promise.all([listCustomers(), listVehicles()]);

  return (
    <main>
      <nav className="navigation">
        <Link href="/">Inicio</Link>
        <Link href="/customers">Clientes</Link>
      </nav>
      <h1>Vehículos</h1>
      <section className="panel">
        <h2>Registrar vehículo</h2>
        {customers.length === 0 ? (
          <p>Registra un cliente antes de añadir vehículos.</p>
        ) : (
          <VehicleForm customers={customers} />
        )}
      </section>
      <section className="panel">
        <h2>Vehículos registrados</h2>
        {vehicles.length === 0 ? (
          <p>Aún no hay vehículos registrados.</p>
        ) : (
          <div className="records">
            {vehicles.map((vehicle) => (
              <article className="record" key={vehicle.id}>
                <h3>{vehicle.marca} {vehicle.modelo} · {vehicle.placa}</h3>
                <p>Propietario: {vehicle.cliente.nombre} {vehicle.cliente.apellido}</p>
                <p>
                  {vehicle.anio ?? "Año no especificado"}
                  {vehicle.color ? ` · ${vehicle.color}` : ""}
                </p>
                <VehicleForm customers={customers} vehicle={vehicle} />
                <DeleteVehicleForm vehicleId={vehicle.id} />
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
