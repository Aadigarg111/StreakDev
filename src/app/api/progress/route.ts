import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/session";
import { applyLessonCompletion, ensureProgress, serializeProgress } from "@/lib/progress";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const sessionUser = await getSessionUser(request);

  if (!sessionUser) {
    return NextResponse.json({ authenticated: false, progress: null }, { status: 401 });
  }

  const progress = await ensureProgress(sessionUser.user._id);

  return NextResponse.json({ authenticated: true, progress: serializeProgress(progress) });
}

export async function POST(request: Request) {
  const sessionUser = await getSessionUser(request);

  if (!sessionUser) {
    return NextResponse.json({ authenticated: false, error: "Sign in to sync progress." }, { status: 401 });
  }

  const payload = await request.json();
  const result = await applyLessonCompletion(
    {
      _id: sessionUser.user._id,
      displayName: sessionUser.user.displayName,
      avatarSeed: sessionUser.user.avatarSeed,
    },
    payload,
  );

  return NextResponse.json({ success: true, ...result });
}
