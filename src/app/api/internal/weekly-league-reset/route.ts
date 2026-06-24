import { NextResponse } from "next/server";
import { runWeeklyLeagueReset } from "@/lib/leagues";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const expectedSecret = process.env.CRON_SECRET;
  const providedSecret = request.headers.get("x-cron-secret");
  const authorization = request.headers.get("authorization");

  if (
    !expectedSecret ||
    (providedSecret !== expectedSecret && authorization !== `Bearer ${expectedSecret}`)
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await runWeeklyLeagueReset();

  return NextResponse.json({ success: true });
}
