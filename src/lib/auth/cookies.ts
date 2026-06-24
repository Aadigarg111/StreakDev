import { cookies } from "next/headers";
import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";

const sessionCookieName = "devlingo_session";
const stateCookieName = "devlingo_oauth_state";
const sessionMaxAgeSeconds = 60 * 60 * 24 * 30;
const stateMaxAgeSeconds = 60 * 10;

export type GitHubSessionUser = {
  githubId: string;
  username: string;
  avatarUrl: string | null;
};

function getSecret() {
  if (process.env.NODE_ENV === "production" && !process.env.SESSION_SECRET) {
    throw new Error("SESSION_SECRET must be configured in production.");
  }

  return process.env.SESSION_SECRET || "dev-only-insecure-session-secret";
}

function base64UrlEncode(value: string) {
  return Buffer.from(value).toString("base64url");
}

function base64UrlDecode(value: string) {
  return Buffer.from(value, "base64url").toString("utf8");
}

function sign(value: string) {
  return createHmac("sha256", getSecret()).update(value).digest("base64url");
}

function safeEqual(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  return (
    leftBuffer.length === rightBuffer.length &&
    timingSafeEqual(leftBuffer, rightBuffer)
  );
}

export function randomToken(bytes = 32) {
  return randomBytes(bytes).toString("base64url");
}

export function createSignedSession(user: GitHubSessionUser) {
  const payload = JSON.stringify({
    ...user,
    expiresAt: Date.now() + sessionMaxAgeSeconds * 1000,
  });
  const encoded = base64UrlEncode(payload);

  return `${encoded}.${sign(encoded)}`;
}

export function readSignedSession(token?: string): GitHubSessionUser | null {
  if (!token) {
    return null;
  }

  const [encoded, signature] = token.split(".");
  if (!encoded || !signature || !safeEqual(signature, sign(encoded))) {
    return null;
  }

  try {
    const parsed = JSON.parse(base64UrlDecode(encoded)) as GitHubSessionUser & {
      expiresAt?: number;
    };

    if (!parsed.expiresAt || parsed.expiresAt < Date.now()) {
      return null;
    }

    return {
      avatarUrl: parsed.avatarUrl ?? null,
      githubId: parsed.githubId,
      username: parsed.username,
    };
  } catch {
    return null;
  }
}

export function setOAuthStateCookie(state: string) {
  cookies().set(stateCookieName, state, {
    httpOnly: true,
    maxAge: stateMaxAgeSeconds,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
}

export function getOAuthStateCookie() {
  return cookies().get(stateCookieName)?.value ?? null;
}

export function clearOAuthStateCookie() {
  cookies().delete(stateCookieName);
}

export function setSessionCookie(token: string) {
  cookies().set(sessionCookieName, token, {
    httpOnly: true,
    maxAge: sessionMaxAgeSeconds,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
}

export function getSessionCookie() {
  return cookies().get(sessionCookieName)?.value ?? null;
}

export function clearSessionCookie() {
  cookies().delete(sessionCookieName);
}
