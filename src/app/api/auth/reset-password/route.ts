import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { getDb } from "@/lib/db/mongo";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const { token, password } = await request.json().catch(() => ({}));

  if (!token || String(password || "").length < 8) {
    return NextResponse.json(
      { error: "Invalid or expired reset token." },
      { status: 400 },
    );
  }

  const db = await getDb();
  const resetToken = await db.collection("password_reset_tokens").findOne({
    token: String(token),
    used: false,
    expiresAt: { $gt: new Date() },
  });

  if (!resetToken) {
    return NextResponse.json({ error: "Invalid or expired reset token." }, { status: 400 });
  }

  const passwordHash = await bcrypt.hash(String(password), 12);

  await db.collection("users").updateOne(
    { _id: resetToken.userId },
    { $set: { passwordHash, lastActiveAt: new Date() } },
  );
  await db.collection("password_reset_tokens").updateOne(
    { _id: resetToken._id },
    { $set: { used: true, usedAt: new Date() } },
  );
  await db.collection("sessions").deleteMany({ userId: resetToken.userId });

  return NextResponse.json({ success: true });
}
