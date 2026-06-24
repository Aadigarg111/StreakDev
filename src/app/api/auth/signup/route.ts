import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { MongoServerError } from "mongodb";
import { createSession, setSessionCookie } from "@/lib/auth/session";
import { getDb } from "@/lib/db/mongo";
import { createInitialProgress } from "@/lib/progress";

export const runtime = "nodejs";

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(request: Request) {
  const { email, password, displayName } = await request.json().catch(() => ({}));
  const normalizedEmail = String(email || "").trim().toLowerCase();
  const cleanDisplayName = String(displayName || "").trim();

  if (!isValidEmail(normalizedEmail) || String(password || "").length < 8) {
    return NextResponse.json(
      { error: "Use a valid email and a password of at least 8 characters." },
      { status: 400 },
    );
  }

  const db = await getDb();
  const existing = await db.collection("users").findOne({ email: normalizedEmail });

  if (existing) {
    return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(String(password), 12);

  try {
    const result = await db.collection("users").insertOne({
      email: normalizedEmail,
      passwordHash,
      displayName: cleanDisplayName || normalizedEmail.split("@")[0],
      avatarSeed: normalizedEmail,
      emailVerified: false,
      createdAt: new Date(),
      lastActiveAt: new Date(),
    });

    await db.collection("progress").insertOne(createInitialProgress(result.insertedId));

    const token = await createSession(result.insertedId);
    setSessionCookie(token);

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof MongoServerError && error.code === 11000) {
      return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 });
    }

    throw error;
  }
}
