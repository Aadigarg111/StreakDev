import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/session";
import { mergeClientProgress, serializeProgress } from "@/lib/progress";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const sessionUser = await getSessionUser(request);

  if (!sessionUser) {
    return NextResponse.json({ authenticated: false, progress: null }, { status: 401 });
  }

  const snapshot = await request.json().catch(() => ({}));
  const progress = await mergeClientProgress(sessionUser.user._id, snapshot);

  return NextResponse.json({
    authenticated: true,
    progress: serializeProgress(progress),
  });
}
