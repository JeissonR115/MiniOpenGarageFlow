import { z } from "zod";

const optionalYear = z.preprocess(
  (value) => (value === "" || value === undefined ? undefined : Number(value)),
  z
    .number()
    .int("El año debe ser un número entero")
    .min(1886, "El año debe ser 1886 o posterior")
    .max(new Date().getFullYear() + 1, "El año no puede superar el próximo año calendario")
    .optional(),
);

const optionalText = z.preprocess(
  (value) => (value === "" ? undefined : value),
  z.string().trim().optional(),
);

export const vehicleSchema = z.object({
  clienteId: z.coerce.number().int().positive("Selecciona un cliente"),
  placa: z
    .string()
    .trim()
    .min(1, "La placa es obligatoria")
    .transform((plate) => plate.toUpperCase()),
  marca: z.string().trim().min(1, "La marca es obligatoria"),
  modelo: z.string().trim().min(1, "El modelo es obligatorio"),
  anio: optionalYear,
  color: optionalText,
});

export const vehicleUpdateSchema = vehicleSchema.extend({
  id: z.coerce.number().int().positive(),
});

export type VehicleInput = z.infer<typeof vehicleSchema>;
export type VehicleUpdateInput = z.infer<typeof vehicleUpdateSchema>;
