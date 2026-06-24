import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { createSession, setSessionCookie } from "@/lib/auth/session";
import { checkRateLimit, clearRateLimit } from "@/lib/auth/rate-limit";
import { getDb } from "@/lib/db/mongo";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const { email, password } = await request.json().catch(() => ({}));
  const normalizedEmail = String(email || "").trim().toLowerCase();

  if (!normalizedEmail || !password) {
    return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
  }

  const rateLimitOk = await checkRateLimit(normalizedEmail, request);

  if (!rateLimitOk) {
    return NextResponse.json({ error: "Too many attempts. Try again later." }, { status: 429 });
  }

  const db = await getDb();
  const user = await db.collection("users").findOne({ email: normalizedEmail });

  if (!user || !(await bcrypt.compare(String(password), user.passwordHash))) {
    return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
  }

  await clearRateLimit(normalizedEmail, request);
  await db.collection("users").updateOne(
    { _id: user._id },
    { $set: { lastActiveAt: new Date() } },
  );

  const token = await createSession(user._id);
  setSessionCookie(token);

  return NextResponse.json({ success: true });
}
