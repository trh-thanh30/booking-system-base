import createMiddleware from "next-intl/middleware";
import { NextResponse, type NextRequest } from "next/server";
import { routing } from "@/src/i18n/routing";

const intlMiddleware = createMiddleware(routing);

function resolveLocale(pathname: string) {
  const segment = pathname.split("/").filter(Boolean)[0];
  return routing.locales.includes(segment as (typeof routing.locales)[number])
    ? segment
    : routing.defaultLocale;
}

function resolveRouteSegment(pathname: string) {
  return pathname.split("/").filter(Boolean)[1];
}

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const locale = resolveLocale(pathname);
  const routeSegment = resolveRouteSegment(pathname);
  const hasRefreshCookie = Boolean(
    request.cookies.get("platform_has_rt")?.value,
  );
  const isAuthRoute = routeSegment === "login";
  const isPlatformRoute = routeSegment && !isAuthRoute;

  if (isPlatformRoute && !hasRefreshCookie) {
    return NextResponse.redirect(new URL(`/${locale}/login`, request.url));
  }

  if (isAuthRoute && hasRefreshCookie) {
    return NextResponse.redirect(new URL(`/${locale}/dashboard`, request.url));
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: "/((?!api|trpc|_next|_vercel|.*\\..*).*)",
};
