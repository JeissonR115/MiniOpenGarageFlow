import { getDashboardData } from "@/lib/dashboard";

export const dynamic = "force-dynamic";

const dateFormatter = new Intl.DateTimeFormat("es-CO", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "America/Bogota",
});

export default async function Home() {
  const { pendingCount, inProgressCount, completedTodayCount, activeOrders } =
    await getDashboardData();

  return (
    <main>
      <p className="eyebrow">PANEL DEL TALLER</p>
      <h1>Pedidos del taller</h1>
      <p className="page-intro">Un resumen rápido del trabajo pendiente y en curso.</p>

      <section aria-label="Resumen de pedidos" className="dashboard-stats">
        <article className="stat-card">
          <span>Pendientes</span>
          <strong>{pendingCount}</strong>
        </article>
        <article className="stat-card">
          <span>En proceso</span>
          <strong>{inProgressCount}</strong>
        </article>
        <article className="stat-card">
          <span>Terminados hoy</span>
          <strong>{completedTodayCount}</strong>
        </article>
      </section>

      <section className="panel dashboard-orders">
        <div className="section-heading">
          <div>
            <p className="eyebrow">TRABAJO ACTUAL</p>
            <h2>Pedidos activos</h2>
          </div>
          <span>{activeOrders.length} pedidos</span>
        </div>
        {activeOrders.length === 0 ? (
          <p>Aún no hay pedidos pendientes o en proceso.</p>
        ) : (
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th scope="col">Cliente</th>
                  <th scope="col">Vehículo</th>
                  <th scope="col">Descripción</th>
                  <th scope="col">Estado</th>
                  <th scope="col">Fecha</th>
                </tr>
              </thead>
              <tbody>
                {activeOrders.map((order) => (
                  <tr key={order.id}>
                    <td>{order.vehiculo.cliente.nombre} {order.vehiculo.cliente.apellido}</td>
                    <td>{order.vehiculo.placa}</td>
                    <td>{order.descripcion}</td>
                    <td>
                      <span className={`order-status status-${order.estado}`}>
                        {order.estado.replace("_", " ")}
                      </span>
                    </td>
                    <td>{dateFormatter.format(order.fechaCreacion)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}
