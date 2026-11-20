import { z } from "zod";

const serviceFields = {
  vehiculoId: z.coerce.number().int().positive("Selecciona un vehículo."),
  fecha: z.preprocess(
    (value) => (value === "" || value === undefined ? undefined : value),
    z.coerce.date(),
  ),
  descripcion: z
    .string()
    .trim()
    .min(1, "La descripción es obligatoria.")
    .max(2000),
  costo: z.preprocess(
    (value) =>
      typeof value === "string" && value.trim() === "" ? undefined : value,
    z.coerce.number().finite().min(0, "El costo no puede ser negativo."),
  ),
};

export const serviceSchema = z.object(serviceFields);
export const serviceUpdateSchema = serviceSchema.extend({
  id: z.coerce.number().int().positive(),
});

export type ServiceInput = z.infer<typeof serviceSchema>;
export type ServiceUpdateInput = z.infer<typeof serviceUpdateSchema>;
