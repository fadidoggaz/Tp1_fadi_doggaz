import bcrypt from "bcryptjs";
import { Prisma } from "../generated/prisma/client";
import { prisma } from "./prisma";
import { registerSchema } from "./validation";

type RegisterResult = { user: { id: number; name: string; email: string } } | { error: string; status: number };
export async function registerUser(input: unknown): Promise<RegisterResult> {
  const parsed = registerSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0].message, status: 400 } as const;
  const { name, email, password } = parsed.data;
  try {
    const passwordHash = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: { name, email, passwordHash },
      select: { id: true, name: true, email: true },
    });
    return { user } as const;
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return { error: "Cet email est déjà utilisé", status: 409 } as const;
    }
    return { error: "Inscription indisponible. Réessayez plus tard.", status: 500 } as const;
  }
}
