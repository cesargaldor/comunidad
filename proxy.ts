import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { ROUTES_PATHS } from "./constants/routes";

export async function proxy(request: NextRequest) {
  const res = await fetch(`${request.nextUrl.origin}/api/auth/get-session`, {
    headers: {
      cookie: request.headers.get("cookie") ?? "",
    },
  });

  const data = await res.json();

  if (
    !request.nextUrl.pathname.includes(ROUTES_PATHS.LOGIN) &&
    !data?.session
  ) {
    return NextResponse.redirect(new URL(ROUTES_PATHS.LOGIN, request.url));
  }

  if (
    (request.nextUrl.pathname === "/" ||
      request.nextUrl.pathname.includes(ROUTES_PATHS.LOGIN)) &&
    data?.session
  ) {
    return NextResponse.redirect(new URL(ROUTES_PATHS.AGORA_CLUB, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|.*\\.png$).*)"],
};
