"use server";

import { redirect } from "next/navigation";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import {
  clearSessionCookie,
  getSession,
  setSessionCookie,
} from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { ensureDefaultRulesForUser } from "@/lib/rules/actions";

export type AuthState = {
  error?: string;
};

function safeNextPath(next: string): string {
  if (next.startsWith("/") && !next.startsWith("//")) {
    return next;
  }
  return "/";
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function validateEmail(email: string): string | null {
  if (!email) return "メールアドレスを入力してください";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return "メールアドレスの形式が正しくありません";
  }
  return null;
}

function validatePassword(password: string): string | null {
  if (!password) return "パスワードを入力してください";
  if (password.length < 8) {
    return "パスワードは8文字以上にしてください";
  }
  return null;
}

function dbErrorMessage(): AuthState {
  return {
    error:
      "データベースに接続できません。Vercel の DATABASE_URL（PostgreSQL）を確認してください。",
  };
}

async function completeSignIn(userId: string, next: string): Promise<AuthState> {
  try {
    await setSessionCookie(userId);
  } catch {
    return {
      error:
        "サーバー設定が不完全です。Vercel の AUTH_SECRET（16文字以上）を設定してください。",
    };
  }

  try {
    await ensureDefaultRulesForUser(userId);
  } catch (error) {
    console.error("ensureDefaultRulesForUser failed", error);
    return dbErrorMessage();
  }

  redirect(safeNextPath(next));
}

export async function loginAction(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const email = normalizeEmail(String(formData.get("email") ?? ""));
  const password = String(formData.get("password") ?? "");
  const next = String(formData.get("next") ?? "/").trim();

  const emailError = validateEmail(email);
  if (emailError) return { error: emailError };

  const passwordError = validatePassword(password);
  if (passwordError) return { error: passwordError };

  let user;
  try {
    user = await prisma.user.findUnique({ where: { email } });
  } catch (error) {
    console.error("login findUnique failed", error);
    return dbErrorMessage();
  }

  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    return { error: "メールアドレスまたはパスワードが正しくありません" };
  }

  return completeSignIn(user.id, next);
}

export async function registerAction(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const email = normalizeEmail(String(formData.get("email") ?? ""));
  const password = String(formData.get("password") ?? "");
  const passwordConfirm = String(formData.get("passwordConfirm") ?? "");
  const next = String(formData.get("next") ?? "/").trim();

  const emailError = validateEmail(email);
  if (emailError) return { error: emailError };

  const passwordError = validatePassword(password);
  if (passwordError) return { error: passwordError };

  if (password !== passwordConfirm) {
    return { error: "パスワード（確認）が一致しません" };
  }

  try {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return { error: "このメールアドレスは既に登録されています" };
    }

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash: await hashPassword(password),
      },
    });

    return completeSignIn(user.id, next);
  } catch (error) {
    console.error("register failed", error);
    return dbErrorMessage();
  }
}

export async function logoutAction(): Promise<void> {
  await clearSessionCookie();
  redirect("/login");
}

export async function isAuthenticated(): Promise<boolean> {
  return getSession();
}
