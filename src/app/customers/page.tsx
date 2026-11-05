import Link from "next/link";
import { CustomerForm } from "./customer-form";
import { DeleteCustomerForm } from "./delete-customer-form";
import { listCustomers } from "@/lib/customers";

export const dynamic = "force-dynamic";

export default async function CustomersPage() {
  const customers = await listCustomers();

  return (
    <main>
      <nav className="navigation">
        <Link href="/">Inicio</Link>
        <Link href="/vehicles">Vehículos</Link>
      </nav>
      <h1>Clientes</h1>
      <section className="panel">
        <h2>Registrar cliente</h2>
        <CustomerForm />
      </section>
      <section className="panel">
        <h2>Clientes registrados</h2>
        {customers.length === 0 ? (
          <p>Aún no hay clientes registrados.</p>
        ) : (
          <div className="records">
            {customers.map((customer) => (
              <article className="record" key={customer.id}>
                <h3>{customer.nombre} {customer.apellido}</h3>
                <p>{customer.telefono} · {customer.correo ?? "Sin correo"}</p>
                <p>Registrado: {customer.fechaRegistro.toLocaleDateString("es-CO")}</p>
                <CustomerForm customer={customer} />
                <DeleteCustomerForm customerId={customer.id} />
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
