import createMiddleware from "next-intl/middleware";
import { routing } from "@/src/i18n/routing";
import { NextResponse, type NextRequest } from "next/server";
import {
  getLoginUrl,
  isAdminRoute,
  isPublicAuthRoute,
} from "@/src/lib/admin/auth-routing";

const intlMiddleware = createMiddleware(routing);

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const segment = pathname.split("/")[1];
  const locale = segment === "en" ? "en" : "vi";
  if (
    isAdminRoute(pathname) &&
    !isPublicAuthRoute(pathname) &&
    request.cookies.get("admin_has_rt")?.value !== "1"
  ) {
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
