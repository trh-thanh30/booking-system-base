const publicAuthRoutes = new Set([
  "login",
  "verify-email",
  "forgot-password",
  "reset-password",
  "invitations",
  "onboarding",
]);
const dashboardRoutes = new Set([
  "dashboard",
  "businesses",
  "users",
  "bookings",
  "system",
  "settings",
]);

export function stripAuthLocale(pathname: string) {
  return pathname.replace(/^\/(vi|en)(?=\/|$)/, "") || "/";
}

export function isPublicAuthRoute(pathname: string) {
  return publicAuthRoutes.has(stripAuthLocale(pathname).split("/")[1] ?? "");
}

export function getSafeReturnTo(value: string | null | undefined): string {
  if (
    !value ||
    !value.startsWith("/") ||
    /[\\\s%]/.test(value.split("?")[0] ?? "")
  ) {
    return "/dashboard";
  }
  try {
    const url = new URL(value, "https://admin.local");
    const pathname = stripAuthLocale(url.pathname);
    if (
      url.origin !== "https://admin.local" ||
      !dashboardRoutes.has(pathname.split("/")[1] ?? "")
    ) {
      return "/dashboard";
    }
    return `${pathname}${url.search}${url.hash}`;
  } catch {
    return "/dashboard";
  }
}

export function getLoginUrl(returnTo: string) {
  return `/login?returnTo=${encodeURIComponent(getSafeReturnTo(returnTo))}`;
}
