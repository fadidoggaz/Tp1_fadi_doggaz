"use server";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { registerUser } from "@/lib/register";
import { loginSchema, type AuthState } from "@/lib/validation";
import { createSession, destroySession } from "@/lib/session";

export async function register(_state: AuthState, formData: FormData): Promise<AuthState> {
  const result = await registerUser(Object.fromEntries(formData));
  if ("error" in result) return { error: result.error };
  redirect("/login?registered=1");
}
export async function login(_state: AuthState, formData: FormData): Promise<AuthState> {
  const parsed = loginSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  try {
    const user = await prisma.user.findUnique({ where: { email: parsed.data.email } });
    if (!user || !(await bcrypt.compare(parsed.data.password, user.passwordHash))) {
      return { error: "Identifiants invalides" };
    }
    await createSession(user.id);
  } catch {
    return { error: "Connexion indisponible. Réessayez plus tard." };
  }
  redirect("/dashboard");
}
export async function logout() {
  await destroySession();
  redirect("/login");
}
