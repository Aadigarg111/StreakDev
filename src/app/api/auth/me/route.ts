import { NextResponse } from "next/server";
import { getSessionCookie, readSignedSession } from "@/lib/auth/cookies";

export const runtime = "nodejs";

export async function GET() {
  const user = readSignedSession(getSessionCookie() ?? undefined);

  return NextResponse.json({
    authenticated: Boolean(user),
    user,
  });
}
