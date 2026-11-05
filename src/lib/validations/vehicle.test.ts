import { describe, expect, it } from "vitest";
import { vehicleSchema, vehicleUpdateSchema } from "./vehicle";

const validVehicle = {
  clienteId: "1",
  placa: " abc123 ",
  marca: "Toyota",
  modelo: "Corolla",
  anio: "2020",
  color: "",
};

describe("vehicleSchema", () => {
  it("requires a client and normalizes the plate", () => {
    expect(vehicleSchema.parse(validVehicle)).toMatchObject({
      clienteId: 1,
      placa: "ABC123",
      marca: "Toyota",
      modelo: "Corolla",
      anio: 2020,
      color: undefined,
    });
  });

  it("allows optional year and color", () => {
    expect(
      vehicleSchema.safeParse({
        clienteId: "1",
        placa: "ABC123",
        marca: "Toyota",
        modelo: "Corolla",
        anio: "",
        color: "",
      }).success,
    ).toBe(true);
  });

  it("rejects missing required fields, invalid years, and absent clients", () => {
    const invalidYear = { ...validVehicle, anio: "1885" };
    const missingClient = { ...validVehicle, clienteId: "" };
    const missingRequired = { ...validVehicle, marca: " " };

    expect(vehicleSchema.safeParse(invalidYear).success).toBe(false);
    expect(vehicleSchema.safeParse(missingClient).success).toBe(false);
    expect(vehicleSchema.safeParse(missingRequired).success).toBe(false);
    expect(
      vehicleSchema.safeParse({ ...validVehicle, anio: String(new Date().getFullYear() + 2) }).success,
    ).toBe(false);
  });

  it("requires a positive integer id when updating", () => {
    expect(vehicleUpdateSchema.safeParse({ ...validVehicle, id: "4" }).success).toBe(true);
    expect(vehicleUpdateSchema.safeParse({ ...validVehicle, id: "0" }).success).toBe(false);
  });
});
