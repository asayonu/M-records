import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  COOKIE_NAME,
  MAX_AGE_SEC,
  createSessionToken,
  verifySessionToken,
} from "@/lib/auth/token";
import { prisma } from "@/lib/db/prisma";

export async function getSessionUser(): Promise<{ userId: string } | null> {
  const token = (await cookies()).get(COOKIE_NAME)?.value;
  const payload = await verifySessionToken(token);
  if (!payload) return null;
  return { userId: payload.userId };
}

export async function getSession(): Promise<boolean> {
  return (await getSessionUser()) !== null;
}

export async function getCurrentUser() {
  const session = await getSessionUser();
  if (!session) return null;

  return prisma.user.findUnique({
    where: { id: session.userId },
    select: { id: true, email: true },
  });
}

export async function requireUserId(): Promise<string> {
  const session = await getSessionUser();
  if (!session) {
    redirect("/login");
  }
  return session.userId;
}

/** @deprecated use requireUserId */
export async function requireAuth(): Promise<void> {
  await requireUserId();
}

export async function setSessionCookie(userId: string): Promise<void> {
  const token = await createSessionToken(userId);
  (await cookies()).set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: MAX_AGE_SEC,
    path: "/",
  });
}

export async function clearSessionCookie(): Promise<void> {
  (await cookies()).delete(COOKIE_NAME);
}
