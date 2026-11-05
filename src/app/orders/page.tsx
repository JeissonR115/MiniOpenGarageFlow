import { listVehicles } from "@/lib/vehicles";
import { listOrders } from "@/lib/orders";
import { DeleteOrderForm } from "./delete-order-form";
import { OrderForm } from "./order-form";

export const dynamic = "force-dynamic";

export default async function OrdersPage() {
  const [vehicles, orders] = await Promise.all([listVehicles(), listOrders()]);

  return (
    <main>
      <p className="eyebrow">GESTIÓN DEL TALLER</p>
      <h1>Pedidos</h1>
      <section className="panel">
        <h2>Registrar pedido</h2>
        {vehicles.length === 0 ? (
          <p>Registra un vehículo antes de crear pedidos.</p>
        ) : (
          <OrderForm vehicles={vehicles} />
        )}
      </section>
      <section className="panel">
        <h2>Pedidos registrados</h2>
        {orders.length === 0 ? (
          <p>Aún no hay pedidos registrados.</p>
        ) : (
          <div className="records">
            {orders.map((order) => (
              <article className="record" key={order.id}>
                <h3>{order.vehiculo.placa} · {order.descripcion}</h3>
                <p>
                  {order.vehiculo.marca} {order.vehiculo.modelo} · Propietario:{" "}
                  {order.vehiculo.cliente.nombre} {order.vehiculo.cliente.apellido}
                </p>
                <p>
                  Estado: <span className={`order-status status-${order.estado}`}>{order.estado.replace("_", " ")}</span>
                  {" · "}Creado: {order.fechaCreacion.toLocaleDateString("es-CO")}
                </p>
                <OrderForm order={order} vehicles={vehicles} />
                <DeleteOrderForm orderId={order.id} />
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
