import { NextResponse } from "next/server";
import { clearSessionCookie, getSessionToken } from "@/lib/auth/session";
import { getDb } from "@/lib/db/mongo";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const token = getSessionToken(request);

  if (token) {
    const db = await getDb();
    await db.collection("sessions").deleteOne({ token });
  }

  clearSessionCookie();

  return NextResponse.json({ success: true });
}
