import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/session";
import { ensureUserLeague } from "@/lib/leagues";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const sessionUser = await getSessionUser(request);

  if (!sessionUser) {
    return NextResponse.json({ authenticated: false, leaderboard: [] }, { status: 401 });
  }

  const league = await ensureUserLeague({
    _id: sessionUser.user._id,
    displayName: sessionUser.user.displayName,
    avatarSeed: sessionUser.user.avatarSeed,
  });
  const members = [...(league?.members ?? [])]
    .sort((left, right) => Number(right.weeklyXp ?? 0) - Number(left.weeklyXp ?? 0))
    .map((member, index) => ({
      rank: index + 1,
      userId: member.userId.toString(),
      displayName: member.displayName,
      avatarSeed: member.avatarSeed,
      weeklyXp: member.weeklyXp,
      isCurrentUser: member.userId.toString() === sessionUser.user._id.toString(),
    }));
  const currentUser = members.find((member) => member.isCurrentUser);
  const rank = currentUser?.rank ?? null;
  const zone = rank === null ? "safe" : rank <= 10 ? "promotion" : rank > Math.max(0, members.length - 5) ? "demotion" : "safe";
  const weekEnd = new Date(`${league?.weekEndDate}T23:59:59.999Z`);

  return NextResponse.json({
    authenticated: true,
    league: league
      ? {
          id: league._id.toString(),
          tier: league.tier,
          weekStartDate: league.weekStartDate,
          weekEndDate: league.weekEndDate,
        }
      : null,
    leaderboard: members,
    rank,
    zone,
    timeRemainingMs: Number.isNaN(weekEnd.getTime())
      ? 0
      : Math.max(0, weekEnd.getTime() - Date.now()),
  });
}
