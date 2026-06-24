import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { randomToken } from "@/lib/auth/session";
import { getDb } from "@/lib/db/mongo";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const { email } = await request.json().catch(() => ({}));
  const normalizedEmail = String(email || "").trim().toLowerCase();
  const db = await getDb();
  const user = await db.collection("users").findOne({ email: normalizedEmail });

  if (user?._id instanceof ObjectId) {
    await db.collection("password_reset_tokens").insertOne({
      userId: user._id,
      token: randomToken(),
      expiresAt: new Date(Date.now() + 60 * 60 * 1000),
      used: false,
      createdAt: new Date(),
    });
  }

  return NextResponse.json({
    success: true,
    message: "If an account exists, reset instructions will be available once email delivery is configured.",
  });
}
