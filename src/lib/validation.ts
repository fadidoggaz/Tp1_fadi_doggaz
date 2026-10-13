import { z } from "zod";

const email = z.string().trim().toLowerCase().email("Email invalide");
const password = z.string().min(8, "Mot de passe : 8 caractères minimum")
  .refine(value => new TextEncoder().encode(value).length <= 72, "Mot de passe : 72 octets maximum");
export const registerSchema = z.object({
  name: z.string().trim().min(2, "Nom : 2 caractères minimum").max(80, "Nom : 80 caractères maximum"),
  email,
  password,
});
export const loginSchema = z.object({ email, password: z.string().min(1, "Mot de passe requis").refine(value => new TextEncoder().encode(value).length <= 72, "Mot de passe trop long") });
export type RegisterInput = z.infer<typeof registerSchema>;
export type AuthState = { error: string };
