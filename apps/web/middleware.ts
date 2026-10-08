import createMiddleware from "next-intl/middleware";
import { routing } from "@/src/i18n/routing";
import { NextResponse, type NextRequest } from "next/server";
import {
  getLoginUrl,
  isAdminRoute,
  isPublicAuthRoute,
} from "@/src/lib/admin/auth-routing";
import { isAdminWorkspaceHostname } from "@/src/lib/admin/admin-workspace-url";
import { siteConfig } from "@/src/config/site.config";

const intlMiddleware = createMiddleware(routing);

function getRequestHostname(request: NextRequest) {
  const host = request.headers.get("host");
  if (!host) return request.nextUrl.hostname;
  try {
    return new URL(`http://${host}`).hostname;
  } catch {
    return request.nextUrl.hostname;
  }
}

export function handleMiddleware(
  request: NextRequest,
  adminWorkspaceUrl: string,
) {
  const { pathname } = request.nextUrl;
  const segment = pathname.split("/")[1];
  const locale = segment === "en" ? "en" : "vi";
  const isWorkspaceHost = isAdminWorkspaceHostname(
    getRequestHostname(request),
    adminWorkspaceUrl,
  );
  if (
    isAdminRoute(pathname) &&
    !isPublicAuthRoute(pathname) &&
    !isWorkspaceHost &&
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

export default function middleware(request: NextRequest) {
  return handleMiddleware(request, siteConfig.adminWorkspaceUrl);
}

export const config = {
  matcher: "/((?!api|trpc|_next|_vercel|.*\\..*).*)",
};
