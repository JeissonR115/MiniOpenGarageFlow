import { z } from "zod";

export const loginSchema = z.object({
  correo: z.string().trim().email("Ingresa un correo válido.").transform((value) => value.toLowerCase()),
  password: z.string().min(1, "Ingresa tu contraseña."),
});

export const administratorSchema = z.object({
  correo: z.string().trim().email().transform((value) => value.toLowerCase()),
  password: z.string().min(8),
});
