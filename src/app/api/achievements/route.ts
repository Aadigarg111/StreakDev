import { NextResponse } from "next/server";
import { ACHIEVEMENTS } from "@/lib/achievements";
import { getSessionUser } from "@/lib/auth/session";
import { ensureProgress } from "@/lib/progress";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const sessionUser = await getSessionUser(request);

  if (!sessionUser) {
    return NextResponse.json({ authenticated: false, achievements: [] }, { status: 401 });
  }

  const progress = await ensureProgress(sessionUser.user._id);
  const unlocked = new Map(
    (progress.unlockedAchievements ?? []).map((achievement) => [
      achievement.id,
      achievement.unlockedAt,
    ]),
  );

  return NextResponse.json({
    authenticated: true,
    achievements: ACHIEVEMENTS.map((achievement) => ({
      id: achievement.id,
      label: achievement.label,
      description: achievement.description,
      unlocked: unlocked.has(achievement.id),
      unlockedAt: unlocked.get(achievement.id) ?? null,
    })),
  });
}
