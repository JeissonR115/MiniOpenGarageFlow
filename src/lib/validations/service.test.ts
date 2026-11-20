import { describe, expect, it } from "vitest";
import { serviceSchema, serviceUpdateSchema } from "./service";

const validService = {
  vehiculoId: "1",
  fecha: "2026-01-15",
  descripcion: "Cambio de aceite",
  costo: "120.50",
};

describe("serviceSchema", () => {
  it("validates and transforms a service record", () => {
    expect(serviceSchema.parse(validService)).toMatchObject({
      vehiculoId: 1,
      fecha: new Date("2026-01-15"),
      descripcion: "Cambio de aceite",
      costo: 120.5,
    });
  });

  it("rejects missing dates, empty descriptions, missing costs, and negative costs", () => {
    expect(
      serviceSchema.safeParse({ ...validService, fecha: "" }).success,
    ).toBe(false);
    expect(
      serviceSchema.safeParse({ ...validService, descripcion: "  " }).success,
    ).toBe(false);
    expect(
      serviceSchema.safeParse({ ...validService, costo: "" }).success,
    ).toBe(false);
    expect(
      serviceSchema.safeParse({ ...validService, costo: "-0.01" }).success,
    ).toBe(false);
  });

  it("accepts a zero cost and requires a positive id for updates", () => {
    expect(
      serviceSchema.safeParse({ ...validService, costo: "0" }).success,
    ).toBe(true);
    expect(
      serviceUpdateSchema.safeParse({ ...validService, id: "2" }).success,
    ).toBe(true);
    expect(
      serviceUpdateSchema.safeParse({ ...validService, id: "0" }).success,
    ).toBe(false);
  });
});
