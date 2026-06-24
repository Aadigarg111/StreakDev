import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
const sessionCookieName = "devlingo_session";

const appRoutes = ["/learn", "/leaderboard", "/quests", "/profile"];

export function middleware(request: NextRequest) {
  const isAppRoute = appRoutes.some((route) => request.nextUrl.pathname.startsWith(route));

  if (isAppRoute && !request.cookies.get(sessionCookieName)?.value) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/learn/:path*", "/leaderboard/:path*", "/quests/:path*", "/profile/:path*"],
};
