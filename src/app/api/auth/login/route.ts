import { NextResponse } from "next/server";
import { randomToken, setOAuthStateCookie } from "@/lib/auth/cookies";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const clientId = process.env.GITHUB_CLIENT_ID;
  const appUrl = process.env.APP_URL ?? new URL(request.url).origin;

  if (!clientId) {
    return NextResponse.json(
      { error: "GITHUB_CLIENT_ID is not configured." },
      { status: 503 },
    );
  }

  const state = randomToken();
  setOAuthStateCookie(state);

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: `${appUrl}/api/auth/callback/github`,
    scope: "read:user",
    state,
  });

  return NextResponse.redirect(
    `https://github.com/login/oauth/authorize?${params.toString()}`,
  );
}
