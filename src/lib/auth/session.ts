import { cookies } from "next/headers";
import { ObjectId } from "mongodb";
import { randomBytes } from "node:crypto";
import { getDb } from "@/lib/db/mongo";

export const sessionCookieName = "devlingo_session";
export const sessionMaxAgeSeconds = 60 * 60 * 24 * 30;

export function randomToken(bytes = 32) {
  return randomBytes(bytes).toString("base64url");
}

export async function createSession(userId: ObjectId) {
  const db = await getDb();
  const token = randomToken();
  const expiresAt = new Date(Date.now() + sessionMaxAgeSeconds * 1000);

  await db.collection("sessions").insertOne({
    token,
    userId,
    expiresAt,
  });

  return token;
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

export function getSessionToken(request?: Request) {
  if (request) {
    const cookieHeader = request.headers.get("cookie") ?? "";
    const match = cookieHeader
      .split(";")
      .map((cookie) => cookie.trim())
      .find((cookie) => cookie.startsWith(`${sessionCookieName}=`));

    if (match) {
      return decodeURIComponent(match.slice(sessionCookieName.length + 1));
    }
  }

  return cookies().get(sessionCookieName)?.value ?? null;
}

export function clearSessionCookie() {
  cookies().delete(sessionCookieName);
}

export async function getSessionUser(request?: Request) {
  const token = getSessionToken(request);

  if (!token) {
    return null;
  }

  const db = await getDb();
  const session = await db.collection("sessions").findOne({
    token,
    expiresAt: { $gt: new Date() },
  });

  if (!session) {
    return null;
  }

  const user = await db.collection("users").findOne({ _id: session.userId });

  if (!user) {
    return null;
  }

  return { session, token, user };
}
