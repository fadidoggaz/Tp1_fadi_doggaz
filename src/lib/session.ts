import { randomUUID } from "node:crypto";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { prisma } from "./prisma";

export const COOKIE_NAME = "session";
const MAX_AGE = 60 * 60 * 2;
function getSecret() {
  const secret = process.env.AUTH_SECRET;
  if (!secret || new TextEncoder().encode(secret).length < 32) {
    throw new Error("AUTH_SECRET doit contenir au moins 32 octets.");
  }
  return new TextEncoder().encode(secret);
}
export async function createSession(userId: number) {
  const id = randomUUID();
  const expiresAt = new Date(Date.now() + MAX_AGE * 1000);
  const token = await new SignJWT({ userId }).setProtectedHeader({ alg: "HS256" })
    .setJti(id).setIssuedAt().setExpirationTime(Math.floor(expiresAt.getTime() / 1000)).sign(getSecret());
  await prisma.session.create({ data: { id, userId, expiresAt } });
  (await cookies()).set(COOKIE_NAME, token, {
    httpOnly: true, secure: process.env.NODE_ENV === "production",
    sameSite: "lax", path: "/", maxAge: MAX_AGE, expires: expiresAt,
  });
}
export async function getSession(): Promise<{ userId: number; id: string } | null> {
  const token = (await cookies()).get(COOKIE_NAME)?.value;
  if (!token) return null;
  const secret = getSecret();
  let payload;
  try {
    ({ payload } = await jwtVerify(token, secret, { algorithms: ["HS256"] }));
  } catch { return null; }
  if (typeof payload.userId !== "number" || !Number.isSafeInteger(payload.userId) || payload.userId <= 0 || !payload.jti) return null;
  const session = await prisma.session.findUnique({ where: { id: payload.jti } });
  if (!session || session.userId !== payload.userId || session.expiresAt <= new Date()) return null;
  return { userId: session.userId, id: session.id };
}
export async function destroySession() {
  const session = await getSession();
  if (session) await prisma.session.deleteMany({ where: { id: session.id } });
  (await cookies()).delete(COOKIE_NAME);
}
