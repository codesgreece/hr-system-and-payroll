import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC = ["/login"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("nexus_session")?.value;
  const isPublic =
    PUBLIC.some((p) => pathname === p) || pathname.startsWith("/api/auth/login");

  if (pathname.startsWith("/api/auth/logout")) {
    return NextResponse.next();
  }

  // Never bounce /login based on cookie alone — stale cookies cause redirect loops.
  // The login page validates the session server-side.
  if (pathname === "/login") {
    return NextResponse.next();
  }

  if (!token && !isPublic && !pathname.startsWith("/_next") && pathname !== "/favicon.ico") {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    if (pathname !== "/") {
      url.searchParams.set("next", pathname);
    }
    const res = NextResponse.redirect(url);
    // Drop any stale session cookie on the way to login
    res.cookies.set("nexus_session", "", { httpOnly: true, path: "/", maxAge: 0 });
    return res;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|uploads).*)"],
};
