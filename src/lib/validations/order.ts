import { z } from "zod";

export const orderStatuses = ["pendiente", "en_proceso", "terminado"] as const;

const orderFields = {
  vehiculoId: z.coerce.number().int().positive("Selecciona un vehículo."),
  descripcion: z.string().trim().min(1, "La descripción es obligatoria.").max(2000),
  estado: z.enum(orderStatuses),
};

export const orderSchema = z.object(orderFields);
export const orderUpdateSchema = orderSchema.extend({
  id: z.coerce.number().int().positive(),
});

export type OrderInput = z.infer<typeof orderSchema>;
export type OrderUpdateInput = z.infer<typeof orderUpdateSchema>;
