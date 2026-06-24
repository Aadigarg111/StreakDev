import { NextResponse } from "next/server";
import {
  clearOAuthStateCookie,
  createSignedSession,
  getOAuthStateCookie,
  setSessionCookie,
} from "@/lib/auth/cookies";

export const runtime = "nodejs";

type GitHubUser = {
  id: number;
  login: string;
  avatar_url?: string;
};

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const savedState = getOAuthStateCookie();
  const appUrl = process.env.APP_URL ?? url.origin;

  if (!code || !state || !savedState || state !== savedState) {
    return NextResponse.json(
      { error: "Invalid GitHub OAuth callback state." },
      { status: 400 },
    );
  }

  clearOAuthStateCookie();

  const clientId = process.env.GITHUB_CLIENT_ID;
  const clientSecret = process.env.GITHUB_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    return NextResponse.json(
      { error: "GitHub OAuth credentials are not configured." },
      { status: 503 },
    );
  }

  const tokenResponse = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      code,
    }),
  });
  const tokenData = (await tokenResponse.json()) as { access_token?: string };

  if (!tokenData.access_token) {
    return NextResponse.json(
      { error: "GitHub did not return an access token." },
      { status: 401 },
    );
  }

  const userResponse = await fetch("https://api.github.com/user", {
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${tokenData.access_token}`,
      "User-Agent": "Devlingo",
    },
  });
  const githubUser = (await userResponse.json()) as GitHubUser;

  if (!githubUser.id || !githubUser.login) {
    return NextResponse.json(
      { error: "Could not read GitHub user profile." },
      { status: 401 },
    );
  }

  const sessionToken = createSignedSession({
    avatarUrl: githubUser.avatar_url ?? null,
    githubId: String(githubUser.id),
    username: githubUser.login,
  });
  setSessionCookie(sessionToken);

  return NextResponse.redirect(appUrl);
}
