import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/session";
import { ensureProgress } from "@/lib/progress";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const sessionUser = await getSessionUser(request);

  if (!sessionUser) {
    return NextResponse.json({ authenticated: false, quests: [] }, { status: 401 });
  }

  const progress = await ensureProgress(sessionUser.user._id);

  return NextResponse.json({
    authenticated: true,
    dailyQuests: progress.dailyQuests,
  });
}
