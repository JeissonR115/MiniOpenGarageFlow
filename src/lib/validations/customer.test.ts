import { describe, expect, it } from "vitest";
import { customerSchema, customerUpdateSchema } from "./customer";

describe("customerSchema", () => {
  it("accepts required fields and a valid email", () => {
    expect(
      customerSchema.safeParse({
        nombre: " María ",
        apellido: "López",
        telefono: "+57 300 123 4567",
        correo: "maria@example.com",
      }).success,
    ).toBe(true);
  });

  it("accepts an omitted or empty optional email", () => {
    const requiredFields = {
      nombre: "María",
      apellido: "López",
      telefono: "123",
    };

    expect(customerSchema.safeParse(requiredFields).success).toBe(true);
    expect(customerSchema.safeParse({ ...requiredFields, correo: "" }).success).toBe(true);
  });

  it("rejects missing required fields and malformed email", () => {
    expect(
      customerSchema.safeParse({
        nombre: "",
        apellido: "López",
        telefono: " ",
        correo: "not-an-email",
      }).success,
    ).toBe(false);
  });

  it("requires a positive integer id when updating", () => {
    expect(
      customerUpdateSchema.safeParse({
        id: "1",
        nombre: "María",
        apellido: "López",
        telefono: "123",
      }).success,
    ).toBe(true);
    expect(
      customerUpdateSchema.safeParse({
        id: "0",
        nombre: "María",
        apellido: "López",
        telefono: "123",
      }).success,
    ).toBe(false);
  });
});
