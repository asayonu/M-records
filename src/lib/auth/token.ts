export const COOKIE_NAME = "mahjong_session";
export const MAX_AGE_SEC = 60 * 60 * 24 * 30;

export type SessionPayload = {
  userId: string;
  exp: number;
};

function getSecret(): string {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 16) {
    throw new Error("AUTH_SECRET must be set (16+ characters)");
  }
  return secret;
}

async function hmacSign(message: string, secret: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(message));
  return Buffer.from(sig).toString("base64url");
}

export async function createSessionToken(userId: string): Promise<string> {
  const exp = Math.floor(Date.now() / 1000) + MAX_AGE_SEC;
  const payload = JSON.stringify({ userId, exp });
  const encoded = Buffer.from(payload).toString("base64url");
  const signature = await hmacSign(encoded, getSecret());
  return `${encoded}.${signature}`;
}

export async function verifySessionToken(
  token: string | undefined,
): Promise<SessionPayload | null> {
  if (!token) return null;

  try {
    const secret = process.env.AUTH_SECRET;
    if (!secret || secret.length < 16) return null;

    const dot = token.indexOf(".");
    if (dot <= 0) return null;

    const encoded = token.slice(0, dot);
    const signature = token.slice(dot + 1);
    if (!signature) return null;

    const expected = await hmacSign(encoded, secret);
    if (expected !== signature) return null;

    const parsed = JSON.parse(
      Buffer.from(encoded, "base64url").toString("utf8"),
    ) as { userId?: string; exp?: number };

    if (
      typeof parsed.userId !== "string" ||
      typeof parsed.exp !== "number" ||
      parsed.exp <= Math.floor(Date.now() / 1000)
    ) {
      return null;
    }

    return { userId: parsed.userId, exp: parsed.exp };
  } catch {
    return null;
  }
}
