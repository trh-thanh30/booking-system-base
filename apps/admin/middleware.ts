import createMiddleware from "next-intl/middleware";
import { NextResponse, type NextRequest } from "next/server";
import { routing } from "@/src/i18n/routing";
import { getLoginUrl, isPublicAuthRoute } from "@/src/lib/auth-routing";

const intlMiddleware = createMiddleware(routing);

function resolveLocale(pathname: string) {
  const segment = pathname.split("/").filter(Boolean)[0];
  return routing.locales.includes(segment as (typeof routing.locales)[number])
    ? segment
    : routing.defaultLocale;
}

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const locale = resolveLocale(pathname);
  const hasRefreshCookie = request.cookies.get("admin_has_rt")?.value === "1";
  const isAuthRoute = isPublicAuthRoute(pathname);
  const isDashboardRoute =
    pathname !== "/" && pathname !== `/${locale}` && !isAuthRoute;

  if (isDashboardRoute && !hasRefreshCookie) {
    return NextResponse.redirect(
      new URL(
        `/${locale}${getLoginUrl(pathname + request.nextUrl.search)}`,
        request.url,
      ),
    );
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: "/((?!api|trpc|_next|_vercel|.*\\..*).*)",
};
