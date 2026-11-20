import type { DashboardRegistration } from "@/lib/dashboard";

type DashboardInsightsProps = {
  customerCount: number;
  vehicleCount: number;
  lastRegistration: DashboardRegistration | null;
  vehiclesByBrand: Array<{ marca: string; count: number }>;
  customerRegistrationsByMonth: Array<{
    month: string;
    label: string;
    count: number;
  }>;
};

const dateFormatter = new Intl.DateTimeFormat("es-CO", {
  dateStyle: "medium",
  timeZone: "America/Bogota",
});

export function DashboardInsights({
  customerCount,
  vehicleCount,
  lastRegistration,
  vehiclesByBrand,
  customerRegistrationsByMonth,
}: DashboardInsightsProps) {
  const maxVehicles = Math.max(1, ...vehiclesByBrand.map(({ count }) => count));
  const maxCustomers = Math.max(
    1,
    ...customerRegistrationsByMonth.map(({ count }) => count),
  );

  return (
    <>
      <section aria-label="Indicadores del taller" className="dashboard-stats">
        <article className="stat-card">
          <span>Total de clientes</span>
          <strong>{customerCount}</strong>
        </article>
        <article className="stat-card">
          <span>Total de vehículos</span>
          <strong>{vehicleCount}</strong>
        </article>
        <article className="stat-card">
          <span>Último registro</span>
          {lastRegistration ? (
            <strong className="last-registration">
              <span>
                {lastRegistration.type === "cliente" ? "Cliente" : "Vehículo"}
              </span>
              <span>{dateFormatter.format(lastRegistration.date)}</span>
            </strong>
          ) : (
            <strong className="last-registration">Sin registros</strong>
          )}
        </article>
      </section>

      <section aria-label="Gráficos del taller" className="dashboard-insights">
        <article className="panel dashboard-chart-panel">
          <h2>Vehículos por marca</h2>
          {vehiclesByBrand.length === 0 ? (
            <p>Aún no hay vehículos para mostrar.</p>
          ) : (
            <ul className="dashboard-chart">
              {vehiclesByBrand.map(({ marca, count }) => (
                <li
                  aria-label={`${marca}: ${count} vehículos`}
                  className="dashboard-chart-row"
                  key={marca}
                >
                  <span>{marca}</span>
                  <span aria-hidden="true" className="dashboard-chart-track">
                    <span
                      className="dashboard-chart-bar"
                      style={{ width: `${(count / maxVehicles) * 100}%` }}
                    />
                  </span>
                  <strong>{count}</strong>
                </li>
              ))}
            </ul>
          )}
        </article>
        <article className="panel dashboard-chart-panel">
          <h2>Clientes por mes</h2>
          {customerRegistrationsByMonth.length === 0 ? (
            <p>Aún no hay clientes para mostrar.</p>
          ) : (
            <ul className="dashboard-chart">
              {customerRegistrationsByMonth.map(({ month, label, count }) => (
                <li
                  aria-label={`${label}: ${count} clientes`}
                  className="dashboard-chart-row"
                  key={month}
                >
                  <span>{label}</span>
                  <span aria-hidden="true" className="dashboard-chart-track">
                    <span
                      className="dashboard-chart-bar"
                      style={{ width: `${(count / maxCustomers) * 100}%` }}
                    />
                  </span>
                  <strong>{count}</strong>
                </li>
              ))}
            </ul>
          )}
        </article>
      </section>
    </>
  );
}
