import { z } from "zod";

const optionalEmail = z.preprocess(
  (value) => (value === "" ? undefined : value),
  z.string().trim().email("Ingresa un correo válido").optional(),
);

export const customerSchema = z.object({
  nombre: z.string().trim().min(1, "El nombre es obligatorio"),
  apellido: z.string().trim().min(1, "El apellido es obligatorio"),
  telefono: z.string().trim().min(1, "El teléfono es obligatorio"),
  correo: optionalEmail,
});

export const customerUpdateSchema = customerSchema.extend({
  id: z.coerce.number().int().positive(),
});

export type CustomerInput = z.infer<typeof customerSchema>;
export type CustomerUpdateInput = z.infer<typeof customerUpdateSchema>;
