import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/session";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const sessionUser = await getSessionUser(request);

  return NextResponse.json({
    authenticated: Boolean(sessionUser),
    user: sessionUser
      ? {
          id: sessionUser.user._id.toString(),
          email: sessionUser.user.email,
          displayName: sessionUser.user.displayName,
          avatarSeed: sessionUser.user.avatarSeed,
        }
      : null,
  });
}
