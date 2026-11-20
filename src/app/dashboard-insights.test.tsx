import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { DashboardInsights } from "./dashboard-insights";

describe("dashboard insights", () => {
  it("renders workshop totals, the latest registration, and chart values", () => {
    const markup = renderToStaticMarkup(
      <DashboardInsights
        customerCount={4}
        vehicleCount={6}
        lastRegistration={{
          type: "vehículo",
          date: new Date("2026-03-01T00:00:00.000Z"),
        }}
        vehiclesByBrand={[{ marca: "Toyota", count: 6 }]}
        customerRegistrationsByMonth={[
          { month: "2026-02", label: "feb 2026", count: 4 },
        ]}
      />,
    );

    expect(markup).toContain("Total de clientes");
    expect(markup).toContain(">4</strong>");
    expect(markup).toContain("Total de vehículos");
    expect(markup).toContain(">6</strong>");
    expect(markup).toContain("Vehículo");
    expect(markup).toContain("Toyota: 6 vehículos");
    expect(markup).toContain("feb 2026: 4 clientes");
  });

  it("renders explicit empty states for a workshop without customers or vehicles", () => {
    const markup = renderToStaticMarkup(
      <DashboardInsights
        customerCount={0}
        vehicleCount={0}
        lastRegistration={null}
        vehiclesByBrand={[]}
        customerRegistrationsByMonth={[]}
      />,
    );

    expect(markup).toContain("Sin registros");
    expect(markup).toContain("Aún no hay vehículos para mostrar.");
    expect(markup).toContain("Aún no hay clientes para mostrar.");
  });
});
